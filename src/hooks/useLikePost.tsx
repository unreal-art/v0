import { supabase } from "$/supabase/client";
import { Like } from "$/types/data.types";
import { likePost } from "@/queries/post/likePost";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePostInQueries } from "@/utils/queryOptimizer";
import { useCallback } from "react";
import { logError } from "@/utils/sentryUtils";

export const useLikePost = (
  postId: number,
  userId: string | null,
  postAuthor: string
) => {
  const queryClient = useQueryClient();

  // Memoized like togglers for performance
  const optimisticallyToggleLike = useCallback(
    (isAdding: boolean) => {
      // Update post like count
      updatePostInQueries(queryClient, postId, {
        like_count: (old: any) => {
          const currentCount = old?.like_count || 0;
          return isAdding ? currentCount + 1 : Math.max(0, currentCount - 1);
        },
        // Track if current user has liked
        is_liked_by_user: isAdding,
      });

      // Update likes list for the post
      queryClient.setQueryData(
        ["postLikes", postId],
        (oldLikes: Like[] = []) => {
          if (isAdding) {
            // Don't add duplicate likes
            if (oldLikes.some((like) => like.author === userId)) {
              return oldLikes;
            }
            return [
              ...oldLikes,
              { id: `temp-${Date.now()}`, author: userId, post_id: postId },
            ];
          } else {
            // Remove this user's like
            return oldLikes.filter((like) => like.author !== userId);
          }
        }
      );
    },
    [queryClient, postId, userId]
  );

  return useMutation({
    mutationFn: async () => {
      // If userId is not provided, fetch it
      let effectiveUserId = userId;
      if (!effectiveUserId) {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user?.id) {
          throw new Error("User ID is required to like a post.");
        }
        effectiveUserId = data.user.id; // Assign fetched userId
      }

      return await likePost(postId, effectiveUserId, postAuthor);
    },

    onMutate: async () => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["postLikes", postId] }),
        queryClient.cancelQueries({ queryKey: ["post", postId] }),
      ]);

      // Snapshot previous values for rollback
      const previousLikes = queryClient.getQueryData<Like[]>([
        "postLikes",
        postId,
      ]);
      const previousPost = queryClient.getQueryData(["post", postId]);

      // Check if post is already liked
      const isLiked = previousLikes?.some((like) => like.author === userId);

      // Update optimistically
      optimisticallyToggleLike(!isLiked);

      return { previousLikes, previousPost, isLiked };
    },

    onError: (err, _, context) => {
      logError("Error toggling like", err);

      // Rollback to previous state
      if (context?.previousLikes) {
        queryClient.setQueryData(["postLikes", postId], context.previousLikes);
      }

      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }

      // Roll back our optimistic update
      if (context?.isLiked !== undefined) {
        optimisticallyToggleLike(context.isLiked);
      }
    },

    onSuccess: (result) => {
      // Update with server data to ensure consistency
      // but maintain our optimistic updates for faster UI response

      // Selectively update posts that contain this post
      queryClient.invalidateQueries({
        queryKey: ["post", postId],
        exact: true,
      });

      // Ensure like list is up-to-date
      queryClient.invalidateQueries({
        queryKey: ["postLikes", postId],
        exact: true,
      });
    },
  });
};
