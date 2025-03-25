import { useMutation, useQueryClient } from "@tanstack/react-query";
import toggleFollow from "@/queries/user/toggleFollow";
import { useCallback } from "react";
import { logError } from "@/utils/sentryUtils";

interface FollowStats {
  followeeCount: number;
  followerCount: number;
}

/**
 * Enhanced hook to toggle follow status with optimistic updates
 * and integration with related queries
 */
export const useToggleFollow = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      followerId,
      followeeId,
      isFollowing,
    }: {
      followerId: string;
      followeeId: string;
      isFollowing?: boolean;
    }) => {
      const result = await toggleFollow(followerId, followeeId);
      return { result, isFollowing };
    },

    onMutate: async ({ followerId, followeeId, isFollowing }) => {
      // Cancel any outgoing refetches
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: ["doesUserFollow", followerId, followeeId],
        }),
        queryClient.cancelQueries({ queryKey: ["followStats", followerId] }),
        queryClient.cancelQueries({ queryKey: ["followStats", followeeId] }),
      ]);

      // Snapshot the previous values for rollback
      const previousFollowStatus = queryClient.getQueryData([
        "doesUserFollow",
        followerId,
        followeeId,
      ]);

      const previousFollowerStats = queryClient.getQueryData<FollowStats>([
        "followStats",
        followerId,
      ]);

      const previousFolloweeStats = queryClient.getQueryData<FollowStats>([
        "followStats",
        followeeId,
      ]);

      // Optimistically update follow status
      queryClient.setQueryData(
        ["doesUserFollow", followerId, followeeId],
        !isFollowing
      );

      // Optimistically update follower stats
      if (previousFollowerStats) {
        queryClient.setQueryData<FollowStats>(["followStats", followerId], {
          ...previousFollowerStats,
          followeeCount: !isFollowing
            ? previousFollowerStats.followeeCount + 1
            : Math.max(0, previousFollowerStats.followeeCount - 1),
        });
      }

      // Optimistically update followee stats
      if (previousFolloweeStats) {
        queryClient.setQueryData<FollowStats>(["followStats", followeeId], {
          ...previousFolloweeStats,
          followerCount: !isFollowing
            ? previousFolloweeStats.followerCount + 1
            : Math.max(0, previousFolloweeStats.followerCount - 1),
        });
      }

      // Return context to be used on rollback
      return {
        previousFollowStatus,
        previousFollowerStats,
        previousFolloweeStats,
      };
    },

    onError: (error, { followerId, followeeId }, context) => {
      logError("Error toggling follow status", error);

      // Rollback to previous values on error
      if (context?.previousFollowStatus !== undefined) {
        queryClient.setQueryData(
          ["doesUserFollow", followerId, followeeId],
          context.previousFollowStatus
        );
      }

      if (context?.previousFollowerStats) {
        queryClient.setQueryData(
          ["followStats", followerId],
          context.previousFollowerStats
        );
      }

      if (context?.previousFolloweeStats) {
        queryClient.setQueryData(
          ["followStats", followeeId],
          context.previousFolloweeStats
        );
      }
    },

    onSuccess: (data, { followerId, followeeId }) => {
      // Refresh data to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["doesUserFollow", followerId, followeeId],
      });

      // Update user profiles
      queryClient.invalidateQueries({
        queryKey: ["user", followerId],
      });

      queryClient.invalidateQueries({
        queryKey: ["user", followeeId],
      });
    },
  });

  // Helper method for better ergonomics
  const toggleFollowUser = useCallback(
    (
      followerId: string,
      followeeId: string,
      isCurrentlyFollowing?: boolean
    ) => {
      return mutation.mutate({
        followerId,
        followeeId,
        isFollowing: isCurrentlyFollowing,
      });
    },
    [mutation]
  );

  return {
    ...mutation,
    toggleFollowUser,
  };
};

export default useToggleFollow;
