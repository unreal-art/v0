import { supabase } from "$/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";

export function usePinnedPosts(userId: string) {
  return useQuery({
    queryKey: ["pinned-posts", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("post_pins")
        .select("posts(*)") // Fetch full post details
        .eq("user_id", userId);

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!userId, // Only fetch if userId is available
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useIsPostPinned(postId: number, userId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["post_pinned", postId, userId],
    queryFn: async () => {
      if (!postId || !userId) return false;

      const { data, error } = await supabase
        .from("post_pins")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking post pin:", error.message);
        return false;
      }

      return !!data;
    },
    enabled: !!postId && !!userId, // Only run if both values exist
  });

  // Realtime subscription
  React.useEffect(() => {
    const channel = supabase
      .channel(`post-pins-${postId}-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_pins" },
        (payload) => {
          if (
            (payload.new &&
              "post_id" in payload.new &&
              "user_id" in payload.new &&
              payload.new.post_id === postId &&
              payload.new.user_id === userId) ||
            (payload.old &&
              "post_id" in payload.old &&
              "user_id" in payload.old &&
              payload.old.post_id === postId &&
              payload.old.user_id === userId)
          ) {
            queryClient.invalidateQueries({
              queryKey: ["post_pinned", postId, userId],
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [postId, userId, queryClient]);

  return query;
}

export function usePinPost(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      const { error } = await supabase
        .from("post_pins")
        .insert([{ user_id: userId, post_id: postId }]);

      if (error) throw new Error(error.message);
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["pinned-posts", userId] });
      await queryClient.cancelQueries({
        queryKey: ["post_pinned", postId, userId],
      });

      const previousPins = queryClient.getQueryData(["pinned-posts", userId]);
      const previousIsPinned = queryClient.getQueryData([
        "post_pinned",
        postId,
        userId,
      ]);

      // Optimistically update pinned posts list
      queryClient.setQueryData(["pinned-posts", userId], (old: any) => [
        ...(old || []),
        { post_id: postId, user_id: userId },
      ]);

      // Optimistically update `useIsPostPinned` cache
      queryClient.setQueryData(["post_pinned", postId, userId], true);

      return { previousPins, previousIsPinned };
    },
    onError: (_err, postId, context) => {
      console.error("Error pinning post:", _err);

      if (context?.previousPins) {
        queryClient.setQueryData(
          ["pinned-posts", userId],
          context.previousPins
        );
      }
      if (context?.previousIsPinned !== undefined) {
        queryClient.setQueryData(
          ["post_pinned", postId, userId],
          context.previousIsPinned
        );
      }
    },
    onSettled: (postId) => {
      queryClient.invalidateQueries({ queryKey: ["pinned-posts", userId] });
      queryClient.invalidateQueries({
        queryKey: ["post_pinned", postId, userId],
      });
    },
  });
}
export function useUnpinPost(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      const { error } = await supabase
        .from("post_pins")
        .delete()
        .eq("user_id", userId)
        .eq("post_id", postId);

      if (error) throw new Error(error.message);
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["pinned-posts", userId] });
      await queryClient.cancelQueries({
        queryKey: ["post_pinned", postId, userId],
      });

      const previousPins = queryClient.getQueryData(["pinned-posts", userId]);
      const previousIsPinned = queryClient.getQueryData([
        "post_pinned",
        postId,
        userId,
      ]);

      // Optimistically remove from pinned posts list
      queryClient.setQueryData(["pinned-posts", userId], (old: any) =>
        (old || []).filter((pin: any) => pin.post_id !== postId)
      );

      // Optimistically update `useIsPostPinned` cache
      queryClient.setQueryData(["post_pinned", postId, userId], false);

      return { previousPins, previousIsPinned };
    },
    onError: (_err, postId, context) => {
      console.error("Error unpinning post:", _err);

      if (context?.previousPins) {
        queryClient.setQueryData(
          ["pinned-posts", userId],
          context.previousPins
        );
      }
      if (context?.previousIsPinned !== undefined) {
        queryClient.setQueryData(
          ["post_pinned", postId, userId],
          context.previousIsPinned
        );
      }
    },
    onSettled: (postId) => {
      queryClient.invalidateQueries({ queryKey: ["pinned-posts", userId] });
      queryClient.invalidateQueries({
        queryKey: ["post_pinned", postId, userId],
      });
    },
  });
}
