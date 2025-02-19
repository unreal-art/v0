import { createClient } from "$/supabase/server";
// import { generateEthereumWallet } from "$/utils";
import { Client } from "$/supabase/client";

//client user getter , no wallet gen
export const fetchUser = async (client?: Client) => {
  const supabase = await createClient();

  const authClient = client ?? supabase;
  const { data: userData, error } = await authClient.auth.getUser();

  if (error) {
    return null;
  }

  //get data from profile data
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData?.user?.id);

  if (profileError) {
    return null;
  }

  // //check if user has a wallet
  // if (!profileData[0].wallet) {
  //   const wallet = generateEthereumWallet();
  //   console.log(wallet);

  //   const { error: walletError } = await supabase
  //     .from("profiles")
  //     .update({ wallet }) // Set new wallet
  //     .eq("id", profileData[0].id) // Where the user_id matches
  //     .single(); // Ensures only one row is returned

  //   if (walletError) {
  //     return null;
  //   }
  // }

  const user = {
    ...userData,
    wallet: profileData[0].wallet,
    bio: profileData[0].bio,
    // followerCount: profileData[0].follower_count,
    // followingCount: profileData[0].following_count,
    location: profileData[0].location,
    likesReceived: profileData[0].likes_received,
    creditBalance: profileData[0].credit_balance,
  };
  return user;
};
