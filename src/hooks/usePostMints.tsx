"use client";

import { supabase } from "$/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { dedupedRequest } from "@/utils/queryOptimizer";
import { logError } from "@/utils";

// Hook to get the count of mints for a specific post
export function usePostMints(postId: number) {
  return useQuery({
    queryKey: ["post-mints", postId],
    queryFn: async () => {
      if (!postId) return [];
      
      // Use deduped request to avoid duplicate calls
      return dedupedRequest(
        `post-mints-${postId}`,
        async () => {
          try {
            const { data, error, count } = await supabase
              .from('post_mints')
              .select('*', { count: 'exact' })
              .eq('post_id', postId);
            
            if (error) {
              logError("Error fetching post mints", error);
              throw new Error("Failed to fetch post mints");
            }
            
            return { 
              mints: data || [], 
              count: count || 0 
            };
          } catch (error) {
            logError("Error in usePostMints", error);
            return { mints: [], count: 0 };
          }
        }
      );
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
