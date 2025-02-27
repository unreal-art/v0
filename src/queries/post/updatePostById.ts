import { supabase } from "$/supabase/client";
import { Post } from "$/types/data.types";

export async function updatePostById(postId: number, data: Partial<Post>) {
  const { error } = await supabase.from("posts").update(data).eq("id", postId);

  if (error) {
    console.error("Error updating post:", error.message);
    throw new Error(error.message);
  }

  return true; // Return success
}
