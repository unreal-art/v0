import { supabase } from "$/supabase/client";
import { logError } from "@/utils/sentryUtils";

// Check if one user follows another
const doesUserFollow = async (
  followerId: string,
  followeeId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("follows")
      .select("*")
      .eq("follower_id", followerId)
      .eq("followee_id", followeeId)
      .single();

    if (error && error.code !== "PGRST116") {
      logError("Error checking follow relationship", error);
      return false;
    }

    return !!data;
  } catch (error) {
    logError("Error in doesUserFollow", error);
    return false;
  }
};

export default doesUserFollow;
