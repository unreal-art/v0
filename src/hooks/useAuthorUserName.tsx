import { supabase } from "$/supabase/client";
import { getAuthorUserName } from "@/queries/post/getAuthorUserName";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  dedupedRequest,
  normalizeEntity,
  getEntity,
} from "@/utils/queryOptimizer";
import { useCallback } from "react";

// User profile type with username
interface UserWithName {
  id: string;
  username?: string;
  display_name?: string;
  full_name?: string;
}

/**
 * Enhanced hook for fetching author username with improved caching
 * and integration with the entity cache
 */
export default function useAuthorUsername(authorId: string | undefined | null) {
  const queryClient = useQueryClient();

  // Check if we already have this user in the normalized cache
  const cachedUser = authorId
    ? getEntity<UserWithName>("users", authorId)
    : null;
  const cachedUsername =
    cachedUser?.username || cachedUser?.display_name || cachedUser?.full_name;

  const result = useQuery({
    queryKey: ["authorUsername", authorId],
    queryFn: async () => {
      if (!authorId) return null;

      // Use request deduplication to prevent duplicate API calls
      return dedupedRequest(`authorUsername-${authorId}`, async () => {
        const username = await getAuthorUserName(authorId, supabase);

        // Store in normalized cache for reuse across components
        if (username) {
          normalizeEntity<UserWithName>("users", {
            id: authorId,
            username,
          });
        }

        return username;
      });
    },
    enabled: !!authorId, // Ensures query only runs if authorId exists
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    gcTime: 1000 * 60 * 60, // Keep unused data for 60 minutes
    initialData: cachedUsername || undefined, // Use normalized cache as initial data
  });

  // Helper to prefetch other author usernames
  const prefetchUsername = useCallback(
    (id: string) => {
      if (!id) return;

      // Don't prefetch if already in cache and not stale
      const queryState = queryClient.getQueryState(["authorUsername", id]);
      if (queryState && "isSuccess" in queryState && queryState.isSuccess)
        return;

      queryClient.prefetchQuery({
        queryKey: ["authorUsername", id],
        queryFn: () => getAuthorUserName(id, supabase),
        staleTime: 1000 * 60 * 10, // 10 minutes
      });
    },
    [queryClient]
  );

  return {
    ...result,
    username: result.data || "",
    prefetchUsername,
  };
}
