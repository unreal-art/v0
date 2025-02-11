import { Client } from "$/supabase/client";
import { Post, UploadResponse } from "$/types/data.types";
import { getRange } from "$/utils";

// export async function getPosts(client: Client): Promise<{ data: Post[] }> {
//   const { data, error } = await client
//     .from("posts")
//     .select("*")
//     .order("createdAt", { ascending: false })
//     .range(0, 9);

//   if (error) {
//     throw new Error(error.message);
//   }

//   // Ensure ipfsImages is correctly typed
//   const typedData: Post[] = data.map((post) => ({
//     ...post,
//     ipfsImages: post.ipfsImages
//       ? (JSON.parse(post.ipfsImages as unknown as string) as UploadResponse[])
//       : null,
//   }));
//   console.log("typedData");
//   return { data: typedData };
// }

export async function getPosts(client: Client, start = 0): Promise<Post[]> {
  const range = getRange(start, 20);

  const { data, error } = await client
    .from("posts")
    .select("*")
    .order("createdAt", { ascending: false })
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
