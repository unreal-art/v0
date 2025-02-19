import { useQuery } from "@tanstack/react-query";
import { supabase } from "$/supabase/client";
import { getLikeStat } from "$/queries/user/getLikeStat";

export const useLikeStat = (userId?: string) => {
  return useQuery<number>({
    queryKey: ["likeStat", userId], // Unique cache key
    queryFn: () => getLikeStat(userId, supabase), // Fetch function
    enabled: !!userId, // Only fetch if userId exists
    staleTime: 1000 * 60 * 1, // Cache data for 1 minutes
  });
};
