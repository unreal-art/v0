import { Client } from "$/supabase/client";
import { logError } from "@/utils/sentryUtils";

export const getLikeStat = async (
  userId: string | undefined,
  client: Client
): Promise<number> => {
  if (!userId) return 0;

  try {
    const { count, error } = await client
      .from("likes")
      .select("*", { count: "exact" })
      .eq("post_author", userId);

    if (error) {
      logError("Error fetching like count", error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    logError("Unexpected error", err);
    return 0;
  }
};

// export const getLikeStat = async (
//   userId: string | undefined,
//   client: Client
// ): Promise<number> => {
//   if (!userId) return 0;
//   try {
//     // Fetch posts with likes where author matches the specified value
//     const { data: posts, error } = await client
//       .from("likes")
//       .select("posts(*),created_at")
//       .eq("post_author", userId); // Filter posts by the post_author

//     if (error) {
//       logError("Error fetching posts with likes", error);
//       return 0;
//     }

//     return posts.length || 0;
//   } catch (err) {
//     logError("Unexpected error", err);
//     return 0;
//   }
// };
