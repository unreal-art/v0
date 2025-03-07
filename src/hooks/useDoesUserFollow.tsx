import doesUserFollow from "@/queries/user/doesUserFollows";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dedupedRequest } from "@/utils/queryOptimizer";
import { useCallback } from "react";

/**
 * Enhanced hook to check if one user follows another
 * Includes deduplication, optimized caching, and optimistic update methods
 */
export const useDoesUserFollow = (followerId: string, followeeId: string) => {
  const queryClient = useQueryClient();

  const result = useQuery<boolean, Error>({
    queryKey: ["doesUserFollow", followerId, followeeId], // Unique query key
    queryFn: async () => {
      if (!followerId || !followeeId) return false;

      // Use request deduplication to prevent duplicate API calls
      return dedupedRequest(`doesUserFollow-${followerId}-${followeeId}`, () =>
        doesUserFollow(followerId, followeeId)
      );
    },
    enabled: !!followerId && !!followeeId, // Prevents running on empty values
    staleTime: 1000 * 60 * 10, // Cache results for 10 minutes
    gcTime: 1000 * 60 * 30, // Keep unused data for 30 minutes
  });

  // Helper for optimistic updates when following
  const setFollowing = useCallback(
    (isFollowing: boolean) => {
      if (!followerId || !followeeId) return;

      // Update follow status
      queryClient.setQueryData(
        ["doesUserFollow", followerId, followeeId],
        isFollowing
      );

      // Also update related follow stats if they exist in the cache
      if (isFollowing) {
        // Update follower's followees count
        queryClient.setQueryData(["followStats", followerId], (old: any) =>
          old
            ? {
                ...old,
                followeeCount: old.followeeCount + 1,
              }
            : undefined
        );

        // Update followee's followers count
        queryClient.setQueryData(["followStats", followeeId], (old: any) =>
          old
            ? {
                ...old,
                followerCount: old.followerCount + 1,
              }
            : undefined
        );
      } else {
        // Update follower's followees count (decrement)
        queryClient.setQueryData(["followStats", followerId], (old: any) =>
          old
            ? {
                ...old,
                followeeCount: Math.max(0, old.followeeCount - 1),
              }
            : undefined
        );

        // Update followee's followers count (decrement)
        queryClient.setQueryData(["followStats", followeeId], (old: any) =>
          old
            ? {
                ...old,
                followerCount: Math.max(0, old.followerCount - 1),
              }
            : undefined
        );
      }
    },
    [followerId, followeeId, queryClient]
  );

  // Refresh helper
  const refresh = useCallback(() => {
    if (!followerId || !followeeId) return;

    queryClient.invalidateQueries({
      queryKey: ["doesUserFollow", followerId, followeeId],
      exact: true,
    });
  }, [followerId, followeeId, queryClient]);

  return {
    ...result,
    isFollowing: result.data || false,
    setFollowing,
    refresh,
  };
};
