import { supabase } from "$/supabase/client";

const doesUserFollow = async (followerId: string, followeeId: string) => {
  if (!followerId || !followeeId) return false; // Prevent unnecessary calls

  const { data, error } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", followerId)
    .eq("followee_id", followeeId)
    .single(); // Retrieve a single record

  if (error) {
    if (error.code === "PGRST116") return false; // No follow relationship found
    console.error("Error checking follow relationship:", error.message);
    return false;
  }

  return !!data; // Return true if follow relationship exists
};

export default doesUserFollow;
