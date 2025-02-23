import { supabase } from "$/supabase/client";

export const getPostById = async (postId: number) => {
  const { data, error } = await supabase
    .from("posts")
    .select("*") // Or specify fields: .select("id, title, content, created_at")
    .eq("id", postId)
    .single(); // Ensures a single result

  if (error) {
    console.error("Error fetching post:", error);
    return null;
  }

  return data;
};
