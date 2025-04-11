import { supabase } from "$/supabase/client";
import { getUserById } from "@/queries/user/getUserById";
import { useQuery, useQueryClient, QueryClient } from "@tanstack/react-query";
import {
  dedupedRequest,
  normalizeEntity,
  getEntity,
} from "@/utils/queryOptimizer";
import { useCallback, useMemo } from "react";
import { useUser } from "./useUser";
import { log, startSpan } from "@/utils/sentryUtils";

// Define the user type to make the hook more type-safe
export interface UserData {
  id: string;
  wallet?: any;
  bio?: string | null;
  location?: string | null;
  likesReceived?: number;
  creditBalance?: number;
  full_name?: string | null;
  avatar_url?: string | null;
  username?: string | null;
  display_name?: string | null;
  [key: string]: any; // For flexibility
}

/**
 * Enhanced hook for fetching data about a profile being viewed.
 *
 * This hook is specifically for getting data about any user profile (which could
 * be the current user or another user), while useUser is for the authenticated user.
 */
export default function useUserData(profileId: string | undefined | null) {
  const queryClient = useQueryClient();
  // Get authenticated user information to determine if viewing own profile
  const { userId: currentUserId } = useUser();

  const result = useQuery<UserData | null>({
    queryKey: ["profile_data", profileId],
    queryFn: async () => {
      if (!profileId) return null;

      // Start tracking performance
      const finishSpan = startSpan("getUserData", "data-fetching", {
        profileId,
      });

      try {
        // Try to get from normalized entity cache first
        const cachedUser = getEntity("users", profileId);
        if (cachedUser) {
          finishSpan();
          return cachedUser as UserData;
        }

        // Use request deduplication to prevent duplicate API calls
        const userData = await dedupedRequest(
          `user-profile-${profileId}`,
          async () => {
            const fetchSpan = startSpan("getUserById", "database-query", {
              profileId,
            });
            const result = await getUserById(profileId, supabase);
            fetchSpan();
            return result;
          },
        );

        if (userData) {
          // Store in normalized cache for efficient reuse across components
          normalizeEntity("users", {
            ...userData,
            id: profileId,
          });
        }

        finishSpan();
        return userData as UserData;
      } catch (error) {
        // Make sure we finish the span even if there's an error
        finishSpan();
        throw error;
      }
    },
    enabled: !!profileId, // Ensures query only runs if profileId exists
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    retry: 1, // Retry once on failure
  });

  // Refetch the user data manually
  const refetchUser = () => {
    if (!profileId) {
      console.error("profileId is required to refetch user data");
      return;
    }
    console.log("Invalidating and refetching user...");

    // Invalidate queries with correct key
    queryClient.invalidateQueries({ queryKey: ["profile_data", profileId] });

    // Refetch the query
    result.refetch();
  };

  // Helper function to update user data optimistically
  const updateUserDataOptimistically = useCallback(
    (updates: Partial<UserData>) => {
      if (!profileId) return;

      const finishSpan = startSpan(
        "updateUserDataOptimistically",
        "client-update",
        {
          profileId,
          updateFields: Object.keys(updates),
        },
      );

      // Log current data and updates for debugging
      log(
        "Current data in cache",
        queryClient.getQueryData(["profile_data", profileId]),
      );
      log("Applying updates", updates);

      // Filter updates to only include valid database fields plus UI fields
      const validDatabaseFields = ["full_name", "display_name", "bio"];
      const enhancedUpdates: Partial<UserData> = {};

      // Copy only valid fields from updates
      Object.entries(updates).forEach(([key, value]) => {
        if (
          validDatabaseFields.includes(key) ||
          key === "display_name" ||
          key === "firstname" ||
          key === "lastname"
        ) {
          enhancedUpdates[key] = value;
        }
      });

      // Update the cache with new data
      queryClient.setQueryData(
        ["profile_data", profileId],
        (oldData: UserData | null | undefined) => {
          if (!oldData) return oldData;

          // If display_name is being updated, also update username
          if (enhancedUpdates.display_name) {
            enhancedUpdates.username = enhancedUpdates.display_name;
          }

          // Merge updates with existing data rather than replacing
          const newData = {
            ...oldData,
            ...enhancedUpdates,
          };

          log("New data after merge", newData);

          // Update normalized entity cache too
          normalizeEntity("users", {
            ...newData,
            id: profileId,
          });

          return newData;
        },
      );

      finishSpan();
    },
    [profileId, queryClient],
  );

  // Check if the profile being viewed is the current user's profile
  const isOwnProfile = useMemo(() => {
    return !!currentUserId && currentUserId === profileId;
  }, [currentUserId, profileId]);

  return {
    ...result,
    updateUserDataOptimistically,
    isOwnProfile,
    refetchUser,
    profileId, // Include the profileId for reference
  };
}

/**
 * Prefetch a user's profile data to improve UX when navigating
 * @param queryClient - The QueryClient instance
 * @param userId - The ID of the user to prefetch
 */
export const prefetchUserData = async (
  queryClient: QueryClient,
  userId: string,
) => {
  if (!userId) return;

  const finishSpan = startSpan("prefetchUserData", "prefetching", { userId });

  // Don't prefetch if already in cache
  if (queryClient.getQueryData(["profile_data", userId])) {
    finishSpan();
    return;
  }

  return queryClient.prefetchQuery({
    queryKey: ["profile_data", userId],
    queryFn: async () => {
      return dedupedRequest(`user-profile-${userId}`, async () => {
        const fetchSpan = startSpan("getUserById", "database-query", {
          userId,
        });
        const userData = await getUserById(userId, supabase);
        fetchSpan();

        if (userData) {
          // Store in normalized cache
          normalizeEntity("users", {
            ...userData,
            id: userId,
          });
        }

        finishSpan();
        return userData as UserData;
      });
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
