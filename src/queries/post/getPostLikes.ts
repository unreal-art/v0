import { Client } from "$/supabase/client";
import { Like } from "$/types/data.types";
import { logError } from "@/utils/sentryUtils";

export const getPostLikes = async (
  postId: number,
  client: Client
): Promise<Like[] | null> => {
  const { data, error } = await client
    .from("likes")
    .select("*")
    .eq("post_id", postId);

  if (error) {
    logError("Error fetching post likes", error);
    return null;
  }

  return data;
};
