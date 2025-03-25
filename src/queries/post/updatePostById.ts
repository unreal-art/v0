import { supabase } from "$/supabase/client";
import { Post } from "$/types/data.types";
import { logError } from "@/utils/sentryUtils";

export const updatePostById = async (id: number, data: Partial<Post>) => {
  const { error } = await supabase.from("posts").update(data).eq("id", id);

  if (error) {
    logError("Error updating post", error);
    throw new Error(`Failed to update post: ${error.message}`);
  }

  return true;
};
