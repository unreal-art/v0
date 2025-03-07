import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "$/supabase/client";
import { getFollowStats } from "@/queries/user/getFollowerStat";
import { dedupedRequest } from "@/utils/queryOptimizer";
import { useCallback } from "react";

interface FollowStats {
  followeeCount: number;
  followerCount: number;
}

/**
 * Optimized hook for fetching follow statistics with advanced caching
 * and optimistic update capabilities
 */
export function useFollowStats(userId?: string) {
  const queryClient = useQueryClient();

  const result = useQuery<FollowStats>({
    queryKey: ["followStats", userId], // Unique cache key per user
    queryFn: async () => {
      if (!userId) return { followeeCount: 0, followerCount: 0 };

      // Use deduplication to prevent duplicate API calls
      return dedupedRequest(`followStats-${userId}`, () =>
        getFollowStats(userId, supabase)
      );
    },
    enabled: !!userId, // Only fetch if userId exists
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });

  // Helper for optimistic updates when following
  const incrementFolloweeCount = useCallback(
    (otherUserId?: string) => {
      if (!userId) return;

      // Update current user's followee count (people I follow)
      queryClient.setQueryData(
        ["followStats", userId],
        (old: FollowStats | undefined) => {
          if (!old) return { followeeCount: 1, followerCount: 0 };
          return {
            ...old,
            followeeCount: old.followeeCount + 1,
          };
        }
      );

      // Update target user's follower count (people following them)
      if (otherUserId) {
        queryClient.setQueryData(
          ["followStats", otherUserId],
          (old: FollowStats | undefined) => {
            if (!old) return { followeeCount: 0, followerCount: 1 };
            return {
              ...old,
              followerCount: old.followerCount + 1,
            };
          }
        );
      }
    },
    [userId, queryClient]
  );

  // Helper for optimistic updates when unfollowing
  const decrementFolloweeCount = useCallback(
    (otherUserId?: string) => {
      if (!userId) return;

      // Update current user's followee count (people I follow)
      queryClient.setQueryData(
        ["followStats", userId],
        (old: FollowStats | undefined) => {
          if (!old) return { followeeCount: 0, followerCount: 0 };
          return {
            ...old,
            followeeCount: Math.max(0, old.followeeCount - 1),
          };
        }
      );

      // Update target user's follower count (people following them)
      if (otherUserId) {
        queryClient.setQueryData(
          ["followStats", otherUserId],
          (old: FollowStats | undefined) => {
            if (!old) return { followeeCount: 0, followerCount: 0 };
            return {
              ...old,
              followerCount: Math.max(0, old.followerCount - 1),
            };
          }
        );
      }
    },
    [userId, queryClient]
  );

  // Helper to refresh stats when needed
  const refreshStats = useCallback(() => {
    if (!userId) return;

    queryClient.invalidateQueries({
      queryKey: ["followStats", userId],
      exact: true,
    });
  }, [userId, queryClient]);

  return {
    ...result,
    // Expose enhanced API
    incrementFolloweeCount,
    decrementFolloweeCount,
    refreshStats,
    // Convenience properties with defaults
    followeeCount: result.data?.followeeCount || 0,
    followerCount: result.data?.followerCount || 0,
  };
}
