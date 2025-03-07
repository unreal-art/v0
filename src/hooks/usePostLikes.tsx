import { Client } from "$/supabase/client";
import { getPostLikes } from "@/queries/post/getPostLikes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dedupedRequest } from "@/utils/queryOptimizer";
import { useCallback } from "react";

// Define a local interface for Like to avoid type conflicts
interface PostLike {
  id: string | number;
  post_id: number;
  author: string | null;
  created_at: string;
}

/**
 * Enhanced hook for fetching post likes with optimized caching
 * and support for optimistic updates
 */
export const usePostLikes = (postId: number, client: Client) => {
  const queryClient = useQueryClient();

  const result = useQuery<PostLike[]>({
    queryKey: ["postLikes", postId],
    queryFn: async () => {
      if (!postId) return [];

      // Use request deduplication to prevent duplicate API calls
      const likes = await dedupedRequest(`postLikes-${postId}`, async () => {
        const likesData = await getPostLikes(postId, client);
        if (!likesData) throw new Error("Failed to fetch likes");
        return likesData;
      });

      // Convert to our local interface to ensure type safety
      return likes.map((like) => ({
        id: like.id,
        post_id: postId, // Ensure this is always a number
        author: like.author,
        created_at: like.created_at,
      }));
    },
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    enabled: !!postId,
  });

  // Optimistically add a like
  const addLike = useCallback(
    (userId: string) => {
      if (!postId || !userId) return;

      // Check if already liked to prevent duplicates
      const currentLikes =
        queryClient.getQueryData<PostLike[]>(["postLikes", postId]) || [];
      const alreadyLiked = currentLikes.some((like) => like.author === userId);

      if (alreadyLiked) return;

      // Add optimistic like
      const newLike: PostLike = {
        id: `temp-${Date.now()}`,
        post_id: postId,
        author: userId,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<PostLike[]>(
        ["postLikes", postId],
        (oldLikes = []) => [...oldLikes, newLike]
      );

      // Update like count on the post
      queryClient.setQueryData(["post", postId], (oldPost: any) => {
        if (!oldPost) return oldPost;
        return {
          ...oldPost,
          like_count: (oldPost.like_count || 0) + 1,
          is_liked_by_user: true,
        };
      });
    },
    [postId, queryClient]
  );

  // Optimistically remove a like
  const removeLike = useCallback(
    (userId: string) => {
      if (!postId || !userId) return;

      queryClient.setQueryData<PostLike[]>(
        ["postLikes", postId],
        (oldLikes = []) => oldLikes.filter((like) => like.author !== userId)
      );

      // Update like count on the post
      queryClient.setQueryData(["post", postId], (oldPost: any) => {
        if (!oldPost) return oldPost;
        return {
          ...oldPost,
          like_count: Math.max(0, (oldPost.like_count || 0) - 1),
          is_liked_by_user: false,
        };
      });
    },
    [postId, queryClient]
  );

  // Helper to check if a user has liked the post
  const hasUserLiked = useCallback(
    (userId: string) => {
      const likes = result.data || [];
      return likes.some((like) => like.author === userId);
    },
    [result.data]
  );

  // Refresh likes data
  const refreshLikes = useCallback(() => {
    if (!postId) return;

    queryClient.invalidateQueries({
      queryKey: ["postLikes", postId],
      exact: true,
    });
  }, [postId, queryClient]);

  return {
    ...result,
    likes: result.data || [],
    likesCount: (result.data || []).length,
    addLike,
    removeLike,
    hasUserLiked,
    refreshLikes,
  };
};
