import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "$/supabase/client";
import { getMintedPostsByUser } from "@/queries/post/getMintedPostsByUser";
import { logError } from "@/utils/sentryUtils";

export type MintListMode = "minted_by" | "minted_posts";

// Fetch minted posts for a user with support for different listing modes
async function getMintPostsByUser(userId: string, mode: MintListMode = "minted_by") {
  if (!userId) return [];
  try {
    const posts = await getMintedPostsByUser(supabase, 0, userId, mode);
    return posts;
  } catch (error) {
    logError("Error fetching minted posts", error);
    return [];
  }
}

// Hook to fetch minted posts for a user, with localStorage cache
export function useMintPosts(userId: string, mode: MintListMode = "minted_by") {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    try {
      const cacheKey = `minted-posts-${userId}-${mode}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const timestamp = parsedData.timestamp || 0;
        const posts = parsedData.posts || [];
        if (Date.now() - timestamp < 1000 * 60 * 60) {
          queryClient.setQueryData(["minted-posts", userId, mode], posts);
        }
      }
    } catch (error) {
      logError("Error retrieving cached minted posts", error);
    }
  }, [userId, mode, queryClient]);

  return useQuery({
    queryKey: ["minted-posts", userId, mode],
    queryFn: async () => {
      const posts = await getMintPostsByUser(userId, mode);
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
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 15,
  });
}
