import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "$/supabase/client";
import { ExtendedUser } from "$/types/data.types";
import { dedupedRequest, normalizeEntity } from "@/utils/queryOptimizer";
import { useCallback } from "react";

// Optimized user fetching with deduplication and normalized caching
const fetchUser = async (): Promise<{
  userId: string | null;
  user: ExtendedUser | null;
}> => {
  // Use deduped request to prevent duplicate API calls while auth is being checked
  return dedupedRequest<{ userId: string | null; user: ExtendedUser | null }>(
    "current-user",
    async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) throw new Error("Error fetching user");

      const userId = data?.user?.id || null;

      if (!userId) return { userId: null, user: null };

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId);

      if (profileError || !profileData?.length)
        throw new Error("Error fetching profile");

      const user = {
        ...data.user,
        wallet: profileData[0].wallet as WalletObject | undefined,
        bio: profileData[0].bio as string,
        location: profileData[0].location as string,
        creditBalance: profileData[0].credit_balance as number,
        full_name: profileData[0].full_name as string,
        username: profileData[0].display_name || profileData[0].full_name,
        avatar_url: profileData[0].avatar_url as string,
      };

      // Store in normalized cache for reuse across components
      normalizeEntity("users", {
        ...user,
        id: userId,
      });

      return { userId, user };
    },
  );
};

// Custom Hook using React Query for fetching authenticated user data
export const useUser = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    gcTime: 1000 * 60 * 30, // Keep unused data for 30 minutes
    retry: 1, // Minimal retry for auth
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: false, // Use cached data when component remounts
  });

  // Refetch the user data manually
  const refetchUser = () => {
    console.log("Invalidating and refetching user...");
    queryClient.invalidateQueries({ queryKey: ["user"] });
    refetch();
  };

  // Prefetch wrapper for user profiles
  const prefetchUserProfile = useCallback(
    (userId: string) => {
      if (!userId) return;

      // Don't prefetch if already in cache
      if (queryClient.getQueryData(["user", userId])) return;

      queryClient.prefetchQuery({
        queryKey: ["user", userId],
        queryFn: async () => {
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (error) throw error;

          // Store in normalized cache
          normalizeEntity("users", {
            ...profileData,
            id: userId,
          });

          return profileData;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
    },
    [queryClient],
  );

  return {
    userId: data?.userId || null,
    loading: isLoading,
    user: data?.user || null,
    refetchUser,
    prefetchUserProfile, // Expose prefetch capability
  };
};
