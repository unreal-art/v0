import { Client } from "$/supabase/client";
import { Post, UploadResponse } from "$/types/data.types";
import { getRange } from "$/utils";

export async function getPostsByUser(
  client: Client,
  start = 0,
  id?: string,
): Promise<Post[]> {
  const range = getRange(start, 20);

  // If no ID is provided, retrieve the authenticated user's ID
  if (!id) {
    const { error: userError, data: userData } = await client.auth.getUser();
    if (userError) {
      console.error("Error fetching user:", userError.message);
      throw new Error("Failed to retrieve authenticated user.");
    }
    id = userData?.user?.id;
    if (!id) {
      throw new Error("User ID is undefined.");
    }
  }

  const { data, error } = await client
    .from("posts")
    .select("*")
    .eq("author", id) // Filter posts by the author_id
    .order("createdAt", { ascending: false }) // Order posts by creation date, descending
    .range(range[0], range[1]);

  if (error) {
    console.error("Supabase error:", error.message);
    throw new Error(error.message);
  }

  // console.log("Supabase raw data:", data);

  return data.map((post) => ({
    ...post,
    ipfsImages: Array.isArray(post.ipfsImages)
      ? (post.ipfsImages as UploadResponse[]) // ✅ If already an array, cast it
      : typeof post.ipfsImages === "string"
        ? (JSON.parse(post.ipfsImages) as UploadResponse[]) // ✅ Parse string to UploadResponse[]
        : null, // ❌ Set to null if neither
  }));
}
