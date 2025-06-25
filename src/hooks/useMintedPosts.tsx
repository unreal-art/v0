"use client";

import { supabase } from "$/supabase/client";
import { getMintedPostsByUser } from "@/queries/post/getMintedPostsByUser";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  dedupedRequest,
  updatePostInQueries,
} from "@/utils/queryOptimizer";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Hook for fetching minted posts
export function useMintedPosts(userId: string) {
  const queryClient = useQueryClient();
  const [cachedPosts, setCachedPosts] = useState<any[]>([]);

  // Fetch cached posts from localStorage on mount
  useEffect(() => {
    const cachedData = localStorage.getItem(`minted-posts-${userId}`);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCachedPosts(parsed);
        }
      } catch (e) {
        console.error("Error parsing cached minted posts", e);
      }
    }
  }, [userId]);

  const query = useQuery({
    queryKey: ["minted-posts", userId],
    queryFn: async ({ signal }) => {
      if (!userId) return [];
      
      // Use deduped request to avoid duplicate calls
      return dedupedRequest(
        `minted-posts-${userId}`,
        async () => {
          const posts = await getMintedPostsByUser(supabase, 0, userId);
          // Update cache in localStorage
          try {
            localStorage.setItem(`minted-posts-${userId}`, JSON.stringify(posts));
          } catch (e) {
            console.error("Error caching minted posts", e);
          }
          return posts;
        },
        { priority: "normal" }
      );
    },
    initialData: cachedPosts.length > 0 ? cachedPosts : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return query;
}

// Hook to check if a post is minted
export function useIsPostMinted(postId: number, userId: string) {
  const queryClient = useQueryClient();
  const [isMinted, setIsMinted] = useState<boolean | undefined>(undefined);

  const query = useQuery({
    queryKey: ["post_minted", postId, userId],
    queryFn: async () => {
      if (!postId || !userId) return false;

      const { data, error } = await supabase
        .from("post_mints")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking if post is minted:", error);
      }

      return !!data;
    },
    enabled: !!postId && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set local state when query data changes
  useEffect(() => {
    if (query.data !== undefined) {
      setIsMinted(query.data);
    }
  }, [query.data]);

  return {
    ...query,
    isMinted: query.data || false,
    setMinted: setIsMinted,
  };
}

// Mutation hook for minting posts
export function useMintPost(userId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postId: number) => {
      if (!postId || !userId)
        throw new Error("Post ID and User ID are required");

      // First, check if post is already minted
      const { data: existingMint } = await supabase
        .from("post_mints")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();

      if (existingMint) return { alreadyMinted: true };

      // Insert new mint
      const { data, error } = await supabase
        .from("post_mints")
        .insert({ post_id: postId, user_id: userId })
        .select("id")
        .single();

      if (error) throw error;
      return { id: data.id, success: true };
    },

    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: ["post_minted", postId, userId],
        }),
        queryClient.cancelQueries({ queryKey: ["minted-posts", userId] }),
      ]);

      // Snapshot the previous values
      const previousMinted = queryClient.getQueryData([
        "post_minted",
        postId,
        userId,
      ]);
      const previousPosts = queryClient.getQueryData(["minted-posts", userId]);

      // Update is minted status
      queryClient.setQueryData(["post_minted", postId, userId], true);

      // Update post's is_minted property
      updatePostInQueries(queryClient, postId, { is_minted: true });

      // Try to get the post to add to minted list
      const post = queryClient.getQueryData(["post", postId]);
      if (post) {
        queryClient.setQueryData(["minted-posts", userId], (old: any) =>
          Array.isArray(old) ? [post, ...old] : [post]
        );
      }

      return { previousMinted, previousPosts };
    },

    onError: (err, postId, context) => {
      // Revert optimistic updates
      if (context?.previousMinted !== undefined) {
        queryClient.setQueryData(
          ["post_minted", postId, userId],
          context.previousMinted
        );
      }

      if (context?.previousPosts !== undefined) {
        queryClient.setQueryData(
          ["minted-posts", userId],
          context.previousPosts
        );
      }

      // Revert post update
      updatePostInQueries(queryClient, postId, { is_minted: false });
    },

    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["minted-posts", userId] });
      toast.success("Post minted successfully!");
    },
  });

  return mutation;
}

// Mutation hook for unminting posts
export function useUnmintPost(userId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postId: number) => {
      if (!postId || !userId)
        throw new Error("Post ID and User ID are required");

      const { error } = await supabase
        .from("post_mints")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (error) throw error;
      return { success: true };
    },

    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: ["post_minted", postId, userId],
        }),
        queryClient.cancelQueries({ queryKey: ["minted-posts", userId] }),
      ]);

      // Snapshot the previous values
      const previousMinted = queryClient.getQueryData([
        "post_minted",
        postId,
        userId,
      ]);
      const previousPosts = queryClient.getQueryData(["minted-posts", userId]);

      // Update is minted status
      queryClient.setQueryData(["post_minted", postId, userId], false);

      // Update post's is_minted property
      updatePostInQueries(queryClient, postId, { is_minted: false });

      // Remove from minted posts list
      queryClient.setQueryData(["minted-posts", userId], (old: any[]) => {
        if (!Array.isArray(old)) return [];
        return old.filter((p: any) => p.id !== postId);
      });

      return { previousMinted, previousPosts };
    },

    onError: (err, postId, context) => {
      // Revert optimistic updates
      if (context?.previousMinted !== undefined) {
        queryClient.setQueryData(
          ["post_minted", postId, userId],
          context.previousMinted
        );
      }

      if (context?.previousPosts !== undefined) {
        queryClient.setQueryData(
          ["minted-posts", userId],
          context.previousPosts
        );
      }

      // Revert post update
      updatePostInQueries(queryClient, postId, { is_minted: true });
    },

    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["minted-posts", userId] });
      toast.success("Post unminted successfully!");
    },
  });

  return mutation;
}
