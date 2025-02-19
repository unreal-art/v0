import { useQuery } from "@tanstack/react-query";
import { supabase } from "$/supabase/client";
import { getFollowStats } from "$/queries/user/getFollowerStat";

export function useFollowStats(userId?: string) {
  return useQuery({
    queryKey: ["followStats", userId], // ✅ Unique cache key per user
    queryFn: async () => {
      if (!userId) return { followeeCount: 0, followerCount: 0 }; // ✅ Prevent API call if userId is missing
      return await getFollowStats(userId, supabase);
    },
    enabled: !!userId, // ✅ Only fetch if userId exists
    staleTime: 1000 * 60 * 1, // ✅ Cache for 1 minute
  });
}
