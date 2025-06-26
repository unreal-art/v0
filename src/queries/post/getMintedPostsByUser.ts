import { SupabaseClient as Client } from "@supabase/supabase-js"
import { Post, UploadResponse } from "$/types/data.types"
import { logError } from "@/utils"
import { LIST_LIMIT } from "@/app/libs/constants"

/**
 * Get minted posts by user ID
 * @param client Supabase client
 * @param start Pagination start
 * @param user_id User ID
 * @param mode "minted_by" Shows posts minted BY the user | "minted_posts" Shows user's posts that were minted
 */
export async function getMintedPostsByUser(
  client: Client,
  start = 0,
  user_id?: string,
  mode: "minted_by" | "minted_posts" = "minted_by"
): Promise<Post[]> {
  // If no ID is provided, retrieve the authenticated user's ID
  if (!user_id) {
    const { error: userError, data: userData } = await client.auth.getUser()
    if (userError) {
      logError("Error fetching user for minted posts", userError)
      throw new Error("Failed to retrieve authenticated user.")
    }
    user_id = userData?.user?.id
    if (!user_id) {
      throw new Error("User ID is undefined.")
    }
  }

  try {
    // First get the minted post IDs based on mode
    let mintQuery = (client as any).from("post_mints")

    if (mode === "minted_by") {
      // Get posts minted BY the user
      mintQuery = mintQuery
        .select("post_id")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false, foreignTable: "post_mints" })
        .limit(LIST_LIMIT)
        .range(start * LIST_LIMIT, (start + 1) * LIST_LIMIT - 1)
    } else {
      // Get user's posts that have been minted (by anyone)
      mintQuery = mintQuery
        .select("post_id, count(*) as mint_count")
        .eq("posts.user_id", user_id)
        .join("posts", {
          foreignTable: "posts",
          localColumn: "post_id",
          foreignColumn: "id",
        })
        .group("post_id")
        .order("count", { ascending: false })
        .limit(LIST_LIMIT)
        .range(start * LIST_LIMIT, (start + 1) * LIST_LIMIT - 1)
    }

    const { data: mintData, error: mintError } = await mintQuery

    if (mintError || !mintData) {
      logError(
        "Error fetching minted post IDs",
        mintError || new Error("No data found")
      )
      throw new Error("Failed to fetch minted post IDs")
    }

    // Extract the post IDs
    const postIds = mintData.map((item: any) => item.post_id)

    if (postIds.length === 0) {
      return []
    }

    // Then fetch the actual posts
    const { data, error } = await client
      .from("posts")
      .select("*")
      .in("id", postIds)
      .eq("isPrivate", false)
      .eq("isDraft", false)

    if (error) {
      logError("Supabase error fetching minted posts", error)
      throw new Error(error.message)
    }

    if (!Array.isArray(data)) {
      logError("Unexpected response from Supabase", { data })
      return []
    }

    // Process the posts to ensure consistent format
    return data.map((post) => ({
      ...post,
      author: post?.author ?? "", // Ensure author is always a string
      category: post?.category ?? null, // Ensure category is string or null
      ipfsImages: Array.isArray(post?.ipfsImages)
        ? (post.ipfsImages as UploadResponse[]) // Already an array
        : typeof post?.ipfsImages === "string"
        ? (JSON.parse(post.ipfsImages) as UploadResponse[]) // Parse string
        : null, // Set to null if neither
    }))
  } catch (error) {
    // Fallback to a simpler approach if there were any errors
    logError("Error with subquery approach, using fallback", error)

    try {
      // First get the minted post IDs with a fallback approach
      let mintQuery = (client as any).from("post_mints")

      if (mode === "minted_by") {
        // Get posts minted BY the user (simpler fallback)
        mintQuery = mintQuery
          .select("post_id")
          .eq("user_id", user_id)
          .order("created_at", { ascending: false, foreignTable: "post_mints" })
          .limit(LIST_LIMIT)
          .offset(start * LIST_LIMIT)
      } else {
        // Get user's posts that have been minted (simpler fallback)
        const { data: userPosts, error: userPostsError } = await client
          .from("posts")
          .select("id")
          .eq("user_id", user_id)
          .eq("isPrivate", false)
          .eq("isDraft", false)

        if (userPostsError || !userPosts) {
          logError(
            "Error fetching user posts for minted query",
            userPostsError || new Error("No user posts found")
          )
          return []
        }

        const postIds = userPosts.map((post) => post.id)
        if (postIds.length === 0) return []

        mintQuery = mintQuery
          .select("post_id, count(*) as mint_count")
          .in("post_id", postIds)
          .group("post_id")
          .order("count", { ascending: false })
          .limit(LIST_LIMIT)
          .offset(start * LIST_LIMIT)
      }

      const { data: mintData, error: mintError } = await mintQuery

      if (mintError || !mintData) {
        logError(
          "Error fetching minted post IDs",
          mintError || new Error("No data found")
        )
        return []
      }

      // Extract the post IDs
      const postIds = mintData.map((item: any) => item.post_id)

      if (postIds.length === 0) {
        return []
      }

      // Then fetch the actual posts
      const { data: postsData, error: postsError } = await client
        .from("posts")
        .select("*")
        .in("id", postIds)
        .eq("isPrivate", false)
        .eq("isDraft", false)

      if (postsError || !postsData) {
        logError(
          "Error fetching posts by IDs",
          postsError || new Error("No data found")
        )
        return []
      }

      // Process the posts
      return postsData.map((post: any) => ({
        ...post,
        author: post?.author ?? "", // Ensure author is always a string
        category: post?.category ?? null, // Ensure category is string or null
        ipfsImages: Array.isArray(post?.ipfsImages)
          ? (post.ipfsImages as UploadResponse[]) // Already an array
          : typeof post?.ipfsImages === "string"
          ? (JSON.parse(post.ipfsImages) as UploadResponse[]) // Parse string
          : null, // Set to null if neither
      }))
    } catch (finalError) {
      logError("All attempts to fetch minted posts failed", finalError)
      return []
    }
  }
}

/**
 * Helper function to process ipfsImages field which could be an array, string, or null
 */
function processIpfsImages(ipfsImages: any): UploadResponse[] | null {
  if (Array.isArray(ipfsImages)) {
    return ipfsImages as UploadResponse[]
  } else if (typeof ipfsImages === "string") {
    try {
      return JSON.parse(ipfsImages) as UploadResponse[]
    } catch {
      return null
    }
  }
  return null
}
