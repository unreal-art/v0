// import { supabase } from "$/supabase/client";
// import { ExtendedUser } from "$/types/data.types";
// import { useEffect, useState } from "react";

// export const useUser = () => {
//   const [userId, setUserId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState<ExtendedUser | null>(null);

//   useEffect(() => {
//     const fetchUser = async () => {
//       const { data, error } = await supabase.auth.getUser();
//       if (error) {
//         console.error("Error fetching user:", error);
//         setUserId(null);
//       } else {
//         //get data from profile data
//         const { data: profileData, error: profileError } = await supabase
//           .from("profiles")
//           .select("*")
//           .eq("id", data?.user?.id);

//         if (profileError) {
//           return null;
//         }
//         const userData = {
//           ...data.user,
//           wallet: profileData[0].wallet
//             ? (profileData[0].wallet as WalletObject)
//             : undefined, // Safely cast
//           bio: profileData[0].bio,

//           location: profileData[0].location,

//           creditBalance: profileData[0].credit_balance,
//           full_name: profileData[0].full_name,
//           avatar_url: profileData[0].avatar_url,
//         };

//         setUserId(data.user?.id || null);
//         setUser(userData as ExtendedUser);
//       }
//       setLoading(false);
//     };

//     fetchUser();
//   }, []);

//   return { userId, loading, user };
// };

import { useQuery } from "@tanstack/react-query";
import { supabase } from "$/supabase/client";
import { ExtendedUser } from "$/types/data.types";

const fetchUser = async (): Promise<{
  userId: string | null;
  user: ExtendedUser | null;
}> => {
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
