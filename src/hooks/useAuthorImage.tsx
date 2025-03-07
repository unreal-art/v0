import { supabase } from "$/supabase/client";
import { getAuthorImage } from "@/queries/post/getAuthorImage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  dedupedRequest,
  normalizeEntity,
  getEntity,
} from "@/utils/queryOptimizer";
import { useCallback } from "react";

// User type definition with avatar_url
interface UserWithAvatar {
  id: string;
  avatar_url?: string;
}

/**
 * Optimized hook for fetching author images with caching
 * and normalized storage for better performance
 */
export default function useAuthorImage(authorId: string | undefined | null) {
  const queryClient = useQueryClient();

  // Check if we already have this user in the normalized cache with proper typing
  const cachedUser = authorId
    ? getEntity<UserWithAvatar>("users", authorId)
    : null;
  const cachedImageUrl = cachedUser?.avatar_url;

  const result = useQuery({
    queryKey: ["authorImage", authorId],
    queryFn: async () => {
      if (!authorId) return null;

      // Use request deduplication to prevent duplicate API calls
      return dedupedRequest(`authorImage-${authorId}`, async () => {
        const imageUrl = await getAuthorImage(authorId, supabase);

        // Store in normalized cache for reuse across components
        if (imageUrl) {
          normalizeEntity<UserWithAvatar>("users", {
            id: authorId,
            avatar_url: imageUrl,
          });
        }

        return imageUrl;
      });
    },
    enabled: !!authorId, // Runs only if authorId exists
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    gcTime: 1000 * 60 * 60, // Keep unused data for 60 minutes
    initialData: cachedImageUrl || undefined, // Use normalized cache as initial data
  });

  // Helper to prefetch other author images
  const prefetchAuthorImage = useCallback(
    (id: string) => {
      if (!id) return;

      // Don't prefetch if already in cache and not stale
      const queryState = queryClient.getQueryState(["authorImage", id]);
      if (queryState && "isSuccess" in queryState && queryState.isSuccess)
        return;

      queryClient.prefetchQuery({
        queryKey: ["authorImage", id],
        queryFn: () => getAuthorImage(id, supabase),
        staleTime: 1000 * 60 * 30, // 30 minutes
      });
    },
    [queryClient]
  );

  return {
    ...result,
    prefetchAuthorImage,
  };
}
