import { Client } from "$/supabase/client";
import { FollowStats } from "$/types/data.types";

export const getFollowStats = async (
  userId: string | undefined,
  client: Client,
): Promise<FollowStats> => {
  if (!userId) {
    console.warn("⚠️ No userId provided. Returning default stats.");
    return { followeeCount: 0, followerCount: 0 };
  }

  try {
    // Fetch follower count
    const { count: followerCount, error: followerError } = await client
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId);

    if (followerError) {
      console.error("❌ Supabase follower count error:", followerError);
      throw new Error(
        `Error fetching follower count: ${followerError.message}`,
      );
    }

    // Fetch followee count
    const { count: followeeCount, error: followeeError } = await client
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("followee_id", userId);

    if (followeeError) {
      console.error("❌ Supabase followee count error:", followeeError);
      throw new Error(
        `Error fetching followee count: ${followeeError.message}`,
      );
    }

    return {
      followerCount: followerCount || 0,
      followeeCount: followeeCount || 0,
    };
  } catch (error) {
    console.error("❌ Server error in getFollowStats:", error);
    throw error;
  }
};
