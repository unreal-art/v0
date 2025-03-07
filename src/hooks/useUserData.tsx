import { supabase } from "$/supabase/client";
import { getUserById } from "@/queries/user/getUserById";
import { useQuery, useQueryClient, QueryClient } from "@tanstack/react-query";
import {
  dedupedRequest,
  normalizeEntity,
  getEntity,
} from "@/utils/queryOptimizer";
import { useCallback } from "react";

// Define the user type to make the hook more type-safe
interface UserData {
  id: string;
  wallet?: any;
  bio?: string | null;
  location?: string | null;
  likesReceived?: number;
  creditBalance?: number;
  full_name?: string | null;
  avatar_url?: string | null;
  username?: string | null;
  [key: string]: any; // For flexibility
}

/**
 * Enhanced hook for fetching user data with optimized caching,
 * deduplication, and prefetching capabilities.
 */
export default function useUserData(authorId: string | undefined | null) {
  const queryClient = useQueryClient();

  const result = useQuery<UserData | null>({
    queryKey: ["profile_data", authorId],
    queryFn: async () => {
      if (!authorId) return null;

      // Try to get from normalized entity cache first
      const cachedUser = getEntity("users", authorId);
      if (cachedUser) return cachedUser as UserData;

      // Use request deduplication to prevent duplicate API calls
      return dedupedRequest(`user-profile-${authorId}`, async () => {
        const userData = await getUserById(authorId, supabase);

        if (userData) {
          // Store in normalized cache for efficient reuse across components
          normalizeEntity("users", {
            ...userData,
            id: authorId,
          });
        }

        return userData;
      });
    },
    enabled: !!authorId, // Ensures query only runs if authorId exists
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    retry: 1, // Retry once on failure
  });

  // Helper function to update user data optimistically
  const updateUserDataOptimistically = useCallback(
    (updates: Partial<UserData>) => {
      if (!authorId) return;

      // Update the cache with new data
      queryClient.setQueryData(["profile_data", authorId], (oldData: any) => {
        if (!oldData) return oldData;

        const newData = { ...oldData, ...updates };

        // Update normalized entity cache too
        normalizeEntity("users", {
          ...newData,
          id: authorId,
        });

        return newData;
      });
    },
    [authorId, queryClient]
  );

  return {
    ...result,
    updateUserDataOptimistically,
  };
}

/**
 * Prefetch a user's profile data to improve UX when navigating
 * @param queryClient - The QueryClient instance
 * @param userId - The ID of the user to prefetch
 */
export const prefetchUserData = async (
  queryClient: QueryClient,
  userId: string
) => {
  if (!userId) return;

  // Don't prefetch if already in cache
  if (queryClient.getQueryData(["profile_data", userId])) return;

  return queryClient.prefetchQuery({
    queryKey: ["profile_data", userId],
    queryFn: async () => {
      return dedupedRequest(`user-profile-${userId}`, async () => {
        const userData = await getUserById(userId, supabase);

        if (userData) {
          // Store in normalized cache
          normalizeEntity("users", {
            ...userData,
            id: userId,
          });
        }

        return userData;
      });
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
