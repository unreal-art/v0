import { supabase } from "$/supabase/client";
import { log, logError } from "@/utils/sentryUtils";

// Toggle follow/unfollow status
const toggleFollow = async (followerId: string, followeeId: string) => {
  if (!followerId || !followeeId || followerId === followeeId) return;

  // Check current follow status
  const { data, error } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", followerId)
    .eq("followee_id", followeeId)
    .single();

  if (error && error.code !== "PGRST116") {
    logError("Error fetching follow relationship", error);
    return;
  }

  if (data) {
    // If already following, unfollow
    const { error: deleteError } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("followee_id", followeeId);

    if (deleteError) {
      logError("Error deleting follow relationship", deleteError);
    } else {
      log("Unfollowed user", { followerId, followeeId });
    }
  } else {
    // If not following, follow
    const { error: insertError } = await supabase
      .from("follows")
      .insert([{ follower_id: followerId, followee_id: followeeId }]);

    if (insertError) {
      logError("Error adding follow relationship", insertError);
    } else {
      log("Followed user", { followerId, followeeId });
    }
  }
};

export default toggleFollow;
