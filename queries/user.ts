"use server";

import { createClient } from "$/supabase/server";
import { generateEthereumWallet } from "$/utils";

export const getUser = async () => {
  const supabase = await createClient();
  const {
    data: { userData },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    return null;
  }

  //get data from profile data
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData?.id);

  if (profileError) {
    return null;
  }

  //check if user has a wallet
  if (!profileData[0].wallet) {
    const wallet = generateEthereumWallet();
    console.log(wallet);

    const { error: walletError } = await supabase
      .from("profiles")
      .update({ wallet }) // Set new wallet
      .eq("id", profileData[0].id) // Where the user_id matches
      .single(); // Ensures only one row is returned

    if (walletError) {
      return null;
    }
  }

  const user = {
    ...userData,
    wallet: profileData[0].wallet,
    bio: profileData[0].bio,
    followerCount: profileData[0].follower_count,
    followingCount: profileData[0].following_count,
    location: profileData[0].location,
    likesReceived: profileData[0].likesReceived,
    creditBalance: profileData[0].credit_balance,
  };
  return user;
};
