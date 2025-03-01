import { Client } from "$/supabase/client";
import { Post, UploadResponse } from "$/types/data.types";
import { getRange } from "$/utils";
import { LIST_LIMIT } from "@/app/libs/constants";

export async function getPostsByUser(
  client: Client,
  start = 0,
  id?: string
): Promise<Post[]> {
  const range = getRange(start, LIST_LIMIT);

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
    .neq("isPrivate", true)
    .neq("isDraft", true)
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

export async function getOtherPostsByUser(
  client: Client,
  start = 0,
  postId: number,
  id?: string
): Promise<Post[]> {
  const range = getRange(start, LIST_LIMIT);

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
    .neq("id", postId)
    .neq("isPrivate", true)
    .neq("isDraft", true)
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

export async function getPrivatePostsByUser(
  client: Client,
  start = 0,
  id?: string
): Promise<Post[]> {
  const range = getRange(start, LIST_LIMIT);

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
    .eq("isPrivate", true)
    .neq("isDraft", true)
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
export async function getPinnedPostsByUser(
  client: Client,
  start = 0,
  id?: string
): Promise<Post[]> {
  const range = getRange(start, LIST_LIMIT);

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
    .from("post_pins")
    .select(
      `
    posts:posts (
      *,
      createdAt
    )
  `
    ) // ✅ Aliases `posts` for better structure
    .eq("user_id", id)
    .filter("posts.isPrivate", "neq", true)
    .filter("posts.isDraft", "neq", true)
    .order("createdAt", { ascending: false }) // ✅ Sort correctly
    .range(range[0], range[1]);

  if (error) {
    console.error("Supabase error:", error.message);
    throw new Error(error.message);
  }

  if (!Array.isArray(data)) {
    console.error("Unexpected response from Supabase:", data);
    throw new Error("Invalid data format received from Supabase.");
  }

  return (
    data?.map(({ posts }) => ({
      ...(posts as Post), // ✅ Explicitly cast `posts` as `Post`
      author: posts?.author ?? "", // Ensure `author` is always a string
      category: posts?.category ?? null, // Ensure `category` is `string | null`
      ipfsImages: Array.isArray(posts?.ipfsImages)
        ? (posts.ipfsImages as UploadResponse[]) // ✅ Already an array
        : typeof posts?.ipfsImages === "string"
        ? (JSON.parse(posts.ipfsImages) as UploadResponse[]) // ✅ Parse string
        : null, // ❌ Set to null if neither
    })) ?? []
  );
}

export async function getIsDraftPostsByUser(
  client: Client,
  start = 0,
  id?: string
): Promise<Post[]> {
  const range = getRange(start, LIST_LIMIT);

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
    .eq("isDraft", true)
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
export async function getOtherIsDraftPostsByUser(
  client: Client,
  start = 0,
  postId: number,
  id?: string
): Promise<Post[]> {
  const range = getRange(start, LIST_LIMIT);

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
    .neq("id", postId)
    .eq("isDraft", true)
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

export async function getUserLikedPosts(
  client: Client,
  start = 0,
  id?: string
): Promise<Post[]> {
  const range = getRange(start, LIST_LIMIT);

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
    .from("likes")
    .select("posts(*),created_at")
    .eq("author", id) // Filter posts by the author_id
    .neq("posts.isPrivate", true)
    .neq("posts.isDraft", true)
    .order("created_at", { ascending: false }) // Order posts by creation date, descending
    .range(range[0], range[1]);

  if (error) {
    console.error("Supabase error:", error.message);
    throw new Error(error.message);
  }

  // console.log("Supabase raw data:", data);
  // Extract posts, filtering out any null values
  const posts = data?.flatMap((like) => (like.posts ? [like.posts] : [])) ?? []; // ✅ Ensure posts exist

  return posts.map((post) => ({
    ...post,
    author: post.author ?? "", // ✅ Ensure `author` is always a string
    ipfsImages: Array.isArray(post.ipfsImages)
      ? (post.ipfsImages as UploadResponse[])
      : typeof post.ipfsImages === "string"
      ? (JSON.parse(post.ipfsImages) as UploadResponse[]) // ✅ Parse string to UploadResponse[]
      : null, // ❌ Set to null if neither
  })) as Post[]; // ✅ Cast the final array as `Post[]`
}
