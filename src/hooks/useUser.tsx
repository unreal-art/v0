import { useQuery } from "@tanstack/react-query";
import { supabase } from "$/supabase/client";
import { ExtendedUser } from "$/types/data.types";

const fetchUser = async (): Promise<{
  userId: string | null;
  user: ExtendedUser | null;
}> => {
  const { data, error } = await supabase.auth.getUser();
  // console.log(data, error);

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

  return { userId, user };
};

// Custom Hook using React Query for fetching authenticated user data
export const useUser = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2, // Retry on failure
  });

  return {
    userId: data?.userId || null,
    loading: isLoading,
    user: data?.user || null,
  };
};
