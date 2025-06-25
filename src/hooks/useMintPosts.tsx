import { supabase } from "$/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { logError } from "@/utils/sentryUtils";

// Fetch minted posts for a user from Supabase
async function getMintPostsByUser(userId: string) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("post_mints")
    .select("post_id, posts:post_id(*)")
    .eq("user_id", userId)
    .order("createdAt", { ascending: false });

  if (error) {
    logError("Error fetching minted posts", error);
    return [];
  }
  // Return the joined post objects
  return data.map((row: any) => row.posts).filter(Boolean);
}

// Enhanced hook for fetching minted posts with optimized caching
export function useMintPosts(userId: string) {
  const queryClient = useQueryClient();

  // Check if we have minted posts in localStorage for immediate display
  useEffect(() => {
    if (!userId) return;
    try {
      const cachedData = localStorage.getItem(`minted-posts-${userId}`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const timestamp = parsedData.timestamp || 0;
        const posts = parsedData.posts || [];
        // Only use cache if it's less than 1 hour old
        if (Date.now() - timestamp < 1000 * 60 * 60) {
          queryClient.setQueryData(["minted-posts", userId], posts);
        }
      }
    } catch (error) {
      logError("Error retrieving cached minted posts", error);
    }
  }, [userId, queryClient]);

  const query = useQuery({
    queryKey: ["minted-posts", userId],
    queryFn: async () => {
      const posts = await getMintPostsByUser(userId);
      // Cache in localStorage for fast reloads
      try {
        localStorage.setItem(
          `minted-posts-${userId}`,
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
