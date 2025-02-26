import { supabase } from "$/supabase/client";

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
    console.error("Error fetching follow relationship:", error.message);
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
      console.error("Error deleting follow relationship:", deleteError.message);
    } else {
      console.log(`Unfollowed: ${followerId} -> ${followeeId}`);
    }
  } else {
    // If not following, follow
    const { error: insertError } = await supabase
      .from("follows")
      .insert([{ follower_id: followerId, followee_id: followeeId }]);

    if (insertError) {
      console.error("Error adding follow relationship:", insertError.message);
    } else {
      console.log(`Followed: ${followerId} -> ${followeeId}`);
    }
  }
};

export default toggleFollow;
