import { supabase } from "$/supabase/client";
import { getPinnedPostsByUser } from "@/queries/post/getPostsByUser";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  dedupedRequest,
  normalizeEntity,
  updatePostInQueries,
} from "@/utils/queryOptimizer";
import { useCallback, useEffect } from "react";
import { logError } from "@/utils/sentryUtils";

// Enhanced hook for fetching pinned posts with optimized caching
export function usePinnedPosts(userId: string) {
  const queryClient = useQueryClient();

  // Check if we have pinned posts in localStorage for immediate display
  useEffect(() => {
    if (!userId) return;

    // Try to get cached pinned posts from localStorage for instant display
    try {
      const cachedData = localStorage.getItem(`pinned-posts-${userId}`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const timestamp = parsedData.timestamp || 0;
        const posts = parsedData.posts || [];

        // Only use cache if it's less than 1 hour old
        if (Date.now() - timestamp < 1000 * 60 * 60) {
          queryClient.setQueryData(["pinned-posts", userId], posts);
        }
      }
    } catch (error) {
      logError("Error retrieving cached pinned posts", error);
    }
  }, [userId, queryClient]);

  const query = useQuery({
    queryKey: ["pinned-posts", userId],
    queryFn: async () => {
      if (!userId) return [];

      // Use deduplication to prevent duplicate API calls
      return dedupedRequest(`pinned-posts-${userId}`, async () => {
        const posts = await getPinnedPostsByUser(supabase, 0, userId);

        // Store each post in normalized cache for reuse
        posts?.forEach((post) => {
          normalizeEntity("posts", post);
        });

        // Cache in localStorage for faster initial loading next time
        try {
          localStorage.setItem(
            `pinned-posts-${userId}`,
            JSON.stringify({
              posts: posts || [],
              timestamp: Date.now(),
            })
          );
        } catch (error) {
          logError("Error caching pinned posts", error);
        }

        return posts || [];
      });
    },
    enabled: !!userId, // Only fetch if userId is available
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep unused data for 30 minutes
  });

  // Listen for real-time updates to pinned posts
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`pinned-posts-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_pins",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Invalidate the pinned posts query to refetch
          queryClient.invalidateQueries({
            queryKey: ["pinned-posts", userId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  // Helper for prefetching a user's pinned posts
  const prefetchUserPinnedPosts = useCallback(
    (targetUserId: string) => {
      if (!targetUserId) return;

      queryClient.prefetchQuery({
        queryKey: ["pinned-posts", targetUserId],
        queryFn: () => getPinnedPostsByUser(supabase, 0, targetUserId),
        staleTime: 1000 * 60 * 5,
      });
    },
    [queryClient]
  );

  return {
    ...query,
    pinnedPosts: query.data || [],
    prefetchUserPinnedPosts,
  };
}

// Enhanced hook to check if a post is pinned
export function useIsPostPinned(postId: number, userId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["post_pinned", postId, userId],
    queryFn: async () => {
      if (!postId || !userId) return false;

      // Use deduplication to prevent duplicate API calls
      return dedupedRequest(`post-pinned-${postId}-${userId}`, async () => {
        const { data, error } = await supabase
          .from("post_pins")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          logError("Error checking post pin", error);
          return false;
        }

        return !!data;
      });
    },
    enabled: !!postId && !!userId, // Only run if both values exist
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes (rarely changes)
  });

  // Realtime subscription for immediate updates
  useEffect(() => {
    if (!postId || !userId) return;

    const channel = supabase
      .channel(`post-pins-${postId}-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_pins",
          filter: `post_id=eq.${postId} AND user_id=eq.${userId}`,
        },
        (payload) => {
          // Optimistically update cache based on the event type
          if (payload.eventType === "INSERT") {
            queryClient.setQueryData(["post_pinned", postId, userId], true);
          } else if (payload.eventType === "DELETE") {
            queryClient.setQueryData(["post_pinned", postId, userId], false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, userId, queryClient]);

  // Helper to update pinned status optimistically
  const setPinned = useCallback(
    (isPinned: boolean) => {
      queryClient.setQueryData(["post_pinned", postId, userId], isPinned);
    },
    [postId, userId, queryClient]
  );

  return {
    ...query,
    isPinned: query.data || false,
    setPinned,
  };
}

// Enhanced mutation hook for pinning posts
export function usePinPost(userId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postId: number) => {
      if (!postId || !userId)
        throw new Error("Post ID and User ID are required");

      // First, check if post is already pinned
      const { data: existingPin } = await supabase
        .from("post_pins")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();

      if (existingPin) return { alreadyPinned: true };

      // Insert new pin
      const { data, error } = await supabase
        .from("post_pins")
        .insert({ post_id: postId, user_id: userId })
        .select("id")
        .single();

      if (error) throw error;
      return { id: data.id, success: true };
    },

    onMutate: async (postId) => {
      // Cancel any outgoing refetches to prevent them overwriting our optimistic update
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: ["post_pinned", postId, userId],
        }),
        queryClient.cancelQueries({ queryKey: ["pinned-posts", userId] }),
      ]);

      // Snapshot the previous values
      const previousPinned = queryClient.getQueryData([
        "post_pinned",
        postId,
        userId,
      ]);
      const previousPosts = queryClient.getQueryData(["pinned-posts", userId]);

      // Update is pinned status
      queryClient.setQueryData(["post_pinned", postId, userId], true);

      // Also update post's is_pinned property
      updatePostInQueries(queryClient, postId, { is_pinned: true });

      // Try to get the post to add to pinned list
      const post = queryClient.getQueryData(["post", postId]);
      if (post) {
        queryClient.setQueryData(["pinned-posts", userId], (old: any) =>
          Array.isArray(old) ? [post, ...old] : [post]
        );
      }

      return { previousPinned, previousPosts };
    },

    onError: (err, postId, context) => {
      // Revert optimistic updates
      if (context?.previousPinned !== undefined) {
        queryClient.setQueryData(
          ["post_pinned", postId, userId],
          context.previousPinned
        );
      }

      if (context?.previousPosts !== undefined) {
        queryClient.setQueryData(
          ["pinned-posts", userId],
          context.previousPosts
        );
      }

      // Revert post update
      updatePostInQueries(queryClient, postId, { is_pinned: false });
    },

    onSuccess: () => {
      // Invalidate relevant queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["pinned-posts", userId] });
    },
  });

  return mutation;
}

// Enhanced mutation hook for unpinning posts
export function useUnpinPost(userId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postId: number) => {
      if (!postId || !userId)
        throw new Error("Post ID and User ID are required");

      const { error } = await supabase
        .from("post_pins")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (error) throw error;
      return { success: true };
    },

    onMutate: async (postId) => {
      // Cancel any outgoing refetches to prevent them overwriting our optimistic update
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: ["post_pinned", postId, userId],
        }),
        queryClient.cancelQueries({ queryKey: ["pinned-posts", userId] }),
      ]);

      // Snapshot the previous values
      const previousPinned = queryClient.getQueryData([
        "post_pinned",
        postId,
        userId,
      ]);
      const previousPosts = queryClient.getQueryData(["pinned-posts", userId]);

      // Update is pinned status
      queryClient.setQueryData(["post_pinned", postId, userId], false);

      // Also update post's is_pinned property
      updatePostInQueries(queryClient, postId, { is_pinned: false });

      // Remove from pinned list
      queryClient.setQueryData(["pinned-posts", userId], (old: any) =>
        Array.isArray(old) ? old.filter((post: any) => post.id !== postId) : []
      );

      return { previousPinned, previousPosts };
    },

    onError: (err, postId, context) => {
      // Revert optimistic updates
      if (context?.previousPinned !== undefined) {
        queryClient.setQueryData(
          ["post_pinned", postId, userId],
          context.previousPinned
        );
      }

      if (context?.previousPosts !== undefined) {
        queryClient.setQueryData(
          ["pinned-posts", userId],
          context.previousPosts
        );
      }

      // Revert post update
      updatePostInQueries(queryClient, postId, { is_pinned: true });
    },

    onSuccess: () => {
      // Invalidate relevant queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["pinned-posts", userId] });
    },
  });

  return mutation;
}
