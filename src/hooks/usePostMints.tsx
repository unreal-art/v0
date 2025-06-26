"use client";

import { supabase } from "$/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { dedupedRequest } from "@/utils/queryOptimizer";
import { logError } from "@/utils";

// Type for mint information with user details
export interface MintInfo {
  id: string;
  user_id: string;
  post_id: number;
  created_at: string;
  transaction_hash?: string;
  user_profile?: {
    username?: string;
    avatar_url?: string;
  };
}

// Interface for the mints query result
export interface PostMintsResult {
  mints: MintInfo[];
  count: number;
  uniqueUserCount: number;
}

// Hook to get the count and details of mints for a specific post
export function usePostMints(postId: number) {
  return useQuery({
    queryKey: ["post-mints", postId],
    queryFn: async () => {
      if (!postId) return { mints: [], count: 0, uniqueUserCount: 0 };
      
      // Use deduped request to avoid duplicate calls
      return dedupedRequest(
        `post-mints-${postId}`,
        async () => {
          try {
            // Get all mints for this post with user information
            const { data, error, count } = await supabase
              .from('post_mints')
              .select('*, profiles:user_id(full_name, avatar_url, display_name)', { count: 'exact' })
              .eq('post_id', postId)
              .order('created_at', { ascending: false });
            
            if (error) {
              logError("Error fetching post mints", error);
              throw new Error("Failed to fetch post mints");
            }
            
            // Format the mint data with user profiles
            const formattedMints = (data || []).map((mint: any) => {
              
              const user_profile = mint.profiles || {};

              user_profile.username = user_profile.display_name || user_profile.full_name;
              
              return {
              ...mint,
              user_profile,
            }});
            
            // Calculate unique users who minted this post
            const uniqueUsers = new Set(formattedMints.map((mint: MintInfo) => mint.user_id));
            
            return { 
              mints: formattedMints, 
              count: count || 0,
              uniqueUserCount: uniqueUsers.size
            };
          } catch (error) {
            logError("Error in usePostMints", error);
            return { mints: [], count: 0, uniqueUserCount: 0 };
          }
        }
      );
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
