import { supabase } from "$/supabase/client";
import { logError, log } from "@/utils/sentryUtils";

/**
 * Delete a user account and associated data
 * @param userId The ID of the user to delete
 * @returns Boolean indicating success or failure
 */
// export const deleteAccount = async (userId: string): Promise<boolean> => {
//   if (!userId) {
//     logError("Delete account called with no userId", { userId });
//     return false;
//   }

//   try {
//     // First delete related data from custom tables
//     // This is necessary because Supabase doesn't automatically cascade deletes

//     // Delete follows relationships
//     const { error: followsError } = await supabase
//       .from("follows")
//       .delete()
//       .or(`follower_id.eq.${userId},followee_id.eq.${userId}`);

//     if (followsError) {
//       logError("Error deleting user follow relationships", followsError);
//       return false;
//     }

//     // Delete posts
//     const { error: postsError } = await supabase
//       .from("posts")
//       .delete()
//       .eq("user_id", userId);

//     if (postsError) {
//       logError("Error deleting user posts", postsError);
//       return false;
//     }

//     // Delete likes
//     const { error: likesError } = await supabase
//       .from("likes")
//       .delete()
//       .eq("user_id", userId);

//     if (likesError) {
//       logError("Error deleting user likes", likesError);
//       return false;
//     }

//     // Delete profile
//     const { error: profileError } = await supabase
//       .from("profiles")
//       .delete()
//       .eq("id", userId);

//     if (profileError) {
//       logError("Error deleting user profile", profileError);
//       return false;
//     }

//     // Finally delete the user from auth.users
//     const { error: authError } = await supabase.auth.admin.deleteUser(userId);

//     if (authError) {
//       logError("Error deleting user authentication record", authError);
//       return false;
//     }

//     log("Successfully deleted user account", { userId });
//     return true;
//   } catch (error) {
//     logError("Unexpected error during account deletion", error);
//     return false;
//   }
// };
