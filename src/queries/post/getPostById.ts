import { supabase } from "$/supabase/client";
import { logError } from "@/utils/sentryUtils";

export const getPostById = async (postId: number) => {
  const { data, error } = await supabase
    .from("posts")
    .select("*") // Or specify fields: .select("id, title, content, created_at")
    .eq("id", postId)
    .single(); // Ensures a single result

  if (error) {
    logError("Error fetching post by ID", error);
    return null;
  }

  return data;
};
