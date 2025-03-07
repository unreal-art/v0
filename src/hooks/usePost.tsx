import { Post } from "$/types/data.types";
import { getPostById } from "@/queries/post/getPostById";
import { updatePostById } from "@/queries/post/updatePostById";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { dedupedRequest, updatePostInQueries } from "@/utils/queryOptimizer";
import { toast } from "sonner";

/**
 * Enhanced hook for fetching a post by ID with optimized caching,
 * deduplication, and prefetching capabilities.
 */
export const usePost = (postId: number | null) => {
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      if (!postId) return null;

      // Use request deduplication to prevent duplicate API calls
      return dedupedRequest(`post-${postId}`, async () => {
        const data = await getPostById(postId);
        if (!data) {
          throw new Error(`Post with ID ${postId} not found`);
        }
        return data;
      });
    },
    enabled: !!postId, // Runs only if postId is valid
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    retry: 2, // Retry failed requests twice
  });

  // Optimistic update helper function
  const updatePostOptimistically = useCallback(
    (updates: Partial<Post>) => {
      if (!postId) return;

      // Update the post in the cache
      updatePostInQueries(queryClient, postId, updates);
    },
    [postId, queryClient]
  );

  return {
    ...result,
    updatePostOptimistically,
  };
};

/**
 * Prefetch a post by ID to improve UX when navigating
 * @param queryClient - The QueryClient instance
 * @param postId - The ID of the post to prefetch
 */
export const prefetchPost = async (
  queryClient: QueryClient,
  postId: number
) => {
  return queryClient.prefetchQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      return dedupedRequest(`post-${postId}`, async () => {
        const data = await getPostById(postId);
        return data;
      });
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

/**
 * Enhanced hook for updating a post with optimistic updates
 * and proper error handling.
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      postId,
      data,
    }: {
      postId: number;
      data: Partial<Post>;
    }) => {
      return updatePostById(postId, data);
    },

    onMutate: async ({ postId, data }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData(["post", postId]);

      // Optimistically update the cache
      updatePostInQueries(queryClient, postId, data);

      // Return context with the previous post
      return { previousPost, postId };
    },

    onError: (error, { postId }, context) => {
      // Display error message
      toast.error(`Failed to update post: ${(error as Error).message}`);

      // Revert to the previous value
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
    },

    onSuccess: (_, { postId }) => {
      // Display success message
      toast.success("Post updated successfully");

      // Invalidate the post query to refetch fresh data if needed
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  const updatePost = useCallback(
    async (postId: number, data: Partial<Post>) => {
      try {
        await mutation.mutateAsync({ postId, data });
        return true;
      } catch (error) {
        return false;
      }
    },
    [mutation]
  );

  return {
    updatePost,
    loading: mutation.isPending,
    error: mutation.error ? (mutation.error as Error).message : null,
  };
}
