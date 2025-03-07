import { Client } from "$/supabase/client";

// Get user profile by ID
export const getUserById = async (id: string, client: Client) => {
  try {
    // Fetch user profile from "profiles" table
    const { data: profileData, error: profileError } = await client
      .from("profiles")
      .select(
        "id, wallet, bio, location, likes_received, credit_balance, full_name, display_name, avatar_url"
      )
      .eq("id", id)
      .single(); // Ensures only one row is returned

    if (profileError || !profileData) {
      console.error(
        "Error fetching profile:",
        profileError?.message || "Profile not found"
      );
      return null;
    }

    return {
      id: profileData.id,
      wallet: profileData.wallet,
      bio: profileData.bio,
      location: profileData.location,
      likesReceived: profileData.likes_received,
      creditBalance: profileData.credit_balance,
      full_name: profileData.full_name,
      avatar_url: profileData.avatar_url,
      username: profileData.display_name || profileData.full_name,
      display_name: profileData.display_name,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return null;
  }
};
