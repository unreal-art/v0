import { supabase } from "$/supabase/client";
import { ExtendedUser } from "$/types/data.types";
import { useEffect, useState } from "react";

export const useUser = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<ExtendedUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        setUserId(null);
      } else {
        //get data from profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data?.user?.id);

        if (profileError) {
          return null;
        }
        const userData = {
          ...data.user,
          wallet: profileData[0].wallet
            ? (profileData[0].wallet as WalletObject)
            : undefined, // Safely cast
          bio: profileData[0].bio,
          // followerCount: profileData[0].follower_count,
          // followingCount: profileData[0].following_count,
          location: profileData[0].location,
          // likesReceived: profileData[0].likes_received,
          creditBalance: profileData[0].credit_balance,
          full_name: profileData[0].full_name,
          avatar_url: profileData[0].avatar_url,
        };

        setUserId(data.user?.id || null);
        setUser(userData as ExtendedUser);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  return { userId, loading, user };
};
