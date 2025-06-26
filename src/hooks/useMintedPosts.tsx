"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "$/supabase/client";
import { getMintedPostsByUser } from "@/queries/post/getMintedPostsByUser";
import { dedupedRequest } from "@/utils/queryOptimizer";


// Hook for fetching minted posts list for a user
export function useMintedPosts(userId: string) {
  const [cachedPosts, setCachedPosts] = useState<any[]>([]);

  // Load cache from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem(`minted-posts-${userId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCachedPosts(parsed);
        }
      } catch (e) {
        console.error("Error parsing cached minted posts", e);
      }
    }
  }, [userId]);

  const query = useQuery({
    queryKey: ["minted-posts", userId],
    queryFn: async () => {
      if (!userId) return [];
      return dedupedRequest(`minted-posts-${userId}`, async () => {
        const posts = await getMintedPostsByUser(supabase, 0, userId);
        try {
          localStorage.setItem(
            `minted-posts-${userId}`,
            JSON.stringify(posts)
          );
        } catch (e) {
          console.error("Error caching minted posts", e);
        }
        return posts;
      });
    },
    initialData: cachedPosts.length > 0 ? cachedPosts : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return query;
}

