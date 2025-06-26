import { supabase } from "$/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { logError } from "@/utils/sentryUtils";
import { getMintedPostsByUser } from "@/queries/post/getMintedPostsByUser";

// Type for the listing mode
export type MintListMode = "minted_by" | "minted_posts";

// Fetch minted posts for a user from Supabase using the internal function
async function getMintPostsByUser(userId: string, mode: MintListMode = "minted_by") {
  if (!userId) return [];
  try {
    // Use the enhanced query function that supports both modes
    const posts = await getMintedPostsByUser(supabase, 0, userId, mode);
    return posts;
  } catch (error) {
    logError("Error fetching minted posts", error);
    return [];
  }
}

// Enhanced hook for fetching minted posts with optimized caching
export function useMintPosts(userId: string, mode: MintListMode = "minted_by") {
  const queryClient = useQueryClient();

  // Check if we have minted posts in localStorage for immediate display
  useEffect(() => {
    if (!userId) return;
    try {
      const cacheKey = `minted-posts-${userId}-${mode}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const timestamp = parsedData.timestamp || 0;
        const posts = parsedData.posts || [];
        // Only use cache if it's less than 1 hour old
        if (Date.now() - timestamp < 1000 * 60 * 60) {
          queryClient.setQueryData(["minted-posts", userId, mode], posts);
        }
      }
    } catch (error) {
      logError("Error retrieving cached minted posts", error);
    }
  }, [userId, mode, queryClient]);

  const query = useQuery({
    queryKey: ["minted-posts", userId, mode],
    queryFn: async () => {
      const posts = await getMintPostsByUser(userId, mode);
      // Cache in localStorage for fast reloads
      try {
        localStorage.setItem(
          `minted-posts-${userId}-${mode}`,
          JSON.stringify({ timestamp: Date.now(), posts })
        );
      } catch (error) {
        logError("Error caching minted posts", error);
      }
      return posts;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });

  return query;
}
