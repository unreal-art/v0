import { Client } from "$/supabase/client";
import { FollowStats } from "$/types/data.types";
import { logWarning, logError } from "@/utils/sentryUtils";

export const getFollowStats = async (
  userId: string | undefined,
  client: Client
): Promise<FollowStats> => {
  if (!userId) {
    logWarning("No userId provided. Returning default stats");
    return { followeeCount: 0, followerCount: 0 };
  }

  try {
    // Fetch follower count
    const { count: followerCount, error: followerError } = await client
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId);

    if (followerError) {
      logError("Supabase follower count error", followerError);
      throw new Error(
        `Error fetching follower count: ${followerError.message}`
      );
    }

    // Fetch followee count
    const { count: followeeCount, error: followeeError } = await client
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("followee_id", userId);

    if (followeeError) {
      logError("Supabase followee count error", followeeError);
      throw new Error(
        `Error fetching followee count: ${followeeError.message}`
      );
    }

    return {
      followerCount: followerCount || 0,
      followeeCount: followeeCount || 0,
    };
  } catch (error) {
    logError("Server error in getFollowStats", error);
    throw error;
  }
};
