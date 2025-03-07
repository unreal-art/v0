import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "$/supabase/client";
import { getLikeStat } from "@/queries/user/getLikeStat";
import { dedupedRequest } from "@/utils/queryOptimizer";
import { useCallback } from "react";

/**
 * Optimized hook for fetching a user's like statistics
 * Includes deduplication, optimized caching, and methods for updating counts
 */
export const useLikeStat = (userId?: string) => {
  const queryClient = useQueryClient();

  const result = useQuery<number>({
    queryKey: ["likeStat", userId], // Unique cache key
    queryFn: async () => {
      if (!userId) return 0;

      // Use request deduplication to prevent duplicate API calls
      return dedupedRequest(`likeStat-${userId}`, () =>
        getLikeStat(userId, supabase)
      );
    },
    enabled: !!userId, // Only fetch if userId exists
    staleTime: 1000 * 60 * 10, // Cache data for 10 minutes for better performance
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });

  // Optimistic update helpers
  const incrementLikeStat = useCallback(() => {
    if (!userId) return;

    queryClient.setQueryData(
      ["likeStat", userId],
      (oldCount: number | undefined) => {
        return (oldCount || 0) + 1;
      }
    );
  }, [userId, queryClient]);

  const decrementLikeStat = useCallback(() => {
    if (!userId) return;

    queryClient.setQueryData(
      ["likeStat", userId],
      (oldCount: number | undefined) => {
        return Math.max(0, (oldCount || 0) - 1);
      }
    );
  }, [userId, queryClient]);

  // Refetch helper (for when you need fresh data)
  const refreshLikeStat = useCallback(() => {
    if (!userId) return;

    queryClient.invalidateQueries({
      queryKey: ["likeStat", userId],
      exact: true,
    });
  }, [userId, queryClient]);

  return {
    ...result,
    // Enhanced API with optimistic update methods
    incrementLikeStat,
    decrementLikeStat,
    refreshLikeStat,
    // Convenience properties
    likeCount: result.data || 0,
  };
};
