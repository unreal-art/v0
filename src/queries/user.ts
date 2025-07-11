"use server";

import { createClient } from "$/supabase/server";
import { generateEthereumWallet } from "@/utils";
import { Client } from "$/supabase/client";
import { ExtendedUser } from "$/types/data.types";
import { logError } from "@/utils/sentryUtils";

export const getUser = async (
  client?: Client
): Promise<Partial<ExtendedUser> | null> => {
  const supabase = await createClient();

  const authClient = client ?? supabase;
  const { data: userData, error } = await authClient.auth.getUser();

  if (error) {
    logError("Error fetching auth user", error);
    return null;
  }

  //get data from profile data
  const { data: profileData, error: profileError } = await authClient
    .from("profiles")
    .select("*")
    .eq("id", userData?.user?.id);

  if (profileError) {
    logError("Error fetching user profile data", profileError);
    return null;
  }

  //check if user has a wallet
  if (!profileData[0].wallet) {
    const wallet = generateEthereumWallet();

    const { error: walletError } = await authClient
      .from("profiles")
      .update({ wallet }) // Set new wallet
      .eq("id", profileData[0].id) // Where the user_id matches
      .single(); // Ensures only one row is returned

    if (walletError) {
      logError("Error updating user wallet", walletError);
      return null;
    }

    // Refetch the profile data to get the updated wallet
    const { data: updatedProfileData, error: refetchError } = await authClient
      .from("profiles")
      .select("*")
      .eq("id", profileData[0].id);

    if (refetchError) {
      logError(
        "Error refetching user profile data after wallet update",
        refetchError
      );
      return null;
    }

    // Use the updated profile data instead of the original profileData
    const user = {
      ...userData.user,
      wallet: updatedProfileData[0].wallet as WalletObject | undefined,
      bio: updatedProfileData[0].bio as string,
      location: updatedProfileData[0].location as string,
      creditBalance: updatedProfileData[0].credit_balance as number,
      full_name: updatedProfileData[0].full_name as string,
      username:
        updatedProfileData[0].display_name || updatedProfileData[0].full_name,
      avatar_url: updatedProfileData[0].avatar_url as string,
    };
    return user;
  }

  // If we didn't need to update the wallet, use the original profile data
  const user = {
    ...userData.user,
    wallet: profileData[0].wallet as WalletObject | undefined,
    bio: profileData[0].bio as string,
    location: profileData[0].location as string,
    creditBalance: profileData[0].credit_balance as number,
    full_name: profileData[0].full_name as string,
    username: profileData[0].display_name || profileData[0].full_name,
    avatar_url: profileData[0].avatar_url as string,
  };
  return user;
};
