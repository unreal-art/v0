import { Client } from "$/supabase/client";
import { Like } from "$/types/data.types";

export const getPostLikes = async (
  postId: number,
  client: Client,
): Promise<Like[] | null> => {
  const { data, error } = await client
    .from("likes")
    .select("*")
    .eq("post_id", postId);

  if (error) {
    console.error("Error fetching likes:", error);
    return null;
  }

  return data;
};
