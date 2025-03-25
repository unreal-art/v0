import { Client } from "$/supabase/client";
import { ExtendedUser } from "$/types/data.types";
import { logError } from "@/utils/sentryUtils";

// Get user by ID with error handling
export const getUserById = async (
  userId: string,
  client: Client
): Promise<Partial<ExtendedUser> | null> => {
  if (!userId) return null;

  try {
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      logError(`Error fetching user profile with ID: ${userId}`, error);
      return null;
    }

    if (!data) return null;

    // Return processed user data
    return {
      id: data.id,
      wallet: data.wallet as WalletObject | undefined,
      bio: data.bio as string,
      location: data.location as string,
      creditBalance: data.credit_balance as number,
      full_name: data.full_name as string,
      username: data.display_name || data.full_name,
      avatar_url: data.avatar_url as string,
    };
  } catch (error) {
    logError("Unexpected error", error);
    return null;
  }
};
