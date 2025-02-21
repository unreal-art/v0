import { Client } from "$/supabase/client";

export const getLikeStat = async (
  userId: string | undefined,
  client: Client,
): Promise<number> => {
  if (!userId) return 0;
  try {
    // Fetch posts with likes where author matches the specified value
    const { data: posts, error } = await client
      .from("likes")
      .select("posts(*),created_at")
      .eq("author", userId); // Filter posts by the author_id

    if (error) {
      console.error("Error fetching posts with likes:", error);
      return 0;
    }

    return posts.length || 0;
  } catch (err) {
    console.error("Unexpected error:", err);
    return 0;
  }
};
