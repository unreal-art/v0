import { supabase } from "$/supabase/client";

export async function likePost(postId: number, userId: string) {
  try {
    // Check if a like already exists
    const { data: existingLike, error: fetchError } = await supabase
      .from("likes")
      .select("*")
      .eq("author", userId)
      .eq("post_id", postId)
      .single(); // Fetch only one record

    if (fetchError && fetchError.code !== "PGRST116") {
      // Ignore 'not found' errors (code PGRST116 indicates no rows found)
      console.error("Error fetching like:", fetchError);
      return false;
    }

    if (existingLike) {
      // Like exists, delete it
      const { error: deleteError } = await supabase
        .from("likes")
        .delete()
        .eq("id", existingLike.id); // Delete by primary key

      if (deleteError) {
        console.error("Error deleting like:", deleteError);
        return false;
      }

      console.log("Like removed");
    } else {
      // Like does not exist, add it
      const { error: insertError } = await supabase.from("likes").insert([
        {
          author: userId,
          post_id: postId,
        },
      ]);

      if (insertError) {
        console.error("Error adding like:", insertError);
        return false;
      }

      console.log("Like added");
    }

    return true;
  } catch (err) {
    console.error("An unexpected error occurred:", err);
    return false;
  }
}
