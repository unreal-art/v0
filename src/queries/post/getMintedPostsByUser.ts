import { Client } from "$/supabase/client";
import { Post, UploadResponse } from "$/types/data.types";
import { getRange } from "@/utils";
import { LIST_LIMIT } from "@/app/libs/constants";
import { logError } from "@/utils/sentryUtils";

/**
 * Get all posts minted by a specific user
 * @param client Supabase client
 * @param start Starting point for pagination
 * @param id User ID to fetch minted posts for
 * @returns Array of Post objects
 */
export async function getMintedPostsByUser(
  client: Client,
  start = 0,
  id?: string
): Promise<Post[]> {
  const range = getRange(start, LIST_LIMIT);

  // If no ID is provided, retrieve the authenticated user's ID
  if (!id) {
    const { error: userError, data: userData } = await client.auth.getUser();
    if (userError) {
      logError("Error fetching user for minted posts", userError);
      throw new Error("Failed to retrieve authenticated user.");
    }
    id = userData?.user?.id;
    if (!id) {
      throw new Error("User ID is undefined.");
    }
  }

  try {
    // Use raw SQL query to avoid TypeScript definition issues with post_mints table
    const query = `
      SELECT p.* 
      FROM posts p
      JOIN post_mints pm ON p.id = pm.post_id
      WHERE pm.user_id = $1
      AND p."isPrivate" = false
      AND p."isDraft" = false
      ORDER BY pm.created_at DESC
      LIMIT $2
      OFFSET $3
    `;

    // Execute query using the PostgreSQL raw query function
    // We use 'as any' to bypass TypeScript restrictions
    const { data: rawData, error: rawError } = await (client as any)
      .rpc('execute', { query, params: [id, LIST_LIMIT, start] })
      .single();

    if (rawError) {
      logError("Supabase error fetching minted posts", rawError);
      throw new Error(rawError.message);
    }

    // Make sure rawData exists and is an array before processing
    if (!rawData || !rawData.result || !Array.isArray(rawData.result)) {
      return [];
    }

    const postsData = rawData.result as any[];

    // Process the result posts
    return postsData.map(post => ({
      ...post,
      author: post?.author || "",
      category: post?.category || null,
      ipfsImages: processIpfsImages(post?.ipfsImages),
    }));
  } catch (e) {
    // Fallback to a direct SQL approach bypassing type systems
    logError("Error fetching minted posts, trying direct query", e);
    
    try {
      // Use a simple SQL query to get post IDs first
      const mintQuery = `
        SELECT post_id FROM post_mints 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `;
      
      const { data: mintResult, error: mintError } = await (client as any)
        .rpc('execute', { query: mintQuery, params: [id, LIST_LIMIT, start] })
        .single();

      if (mintError || !mintResult || !mintResult.result) {
        logError("Error fetching post_mints", mintError || new Error("No data found"));
        return [];
      }

      // Extract post IDs
      const postIds = (mintResult.result as any[]).map(item => item.post_id);
      
      if (postIds.length === 0) {
        return [];
      }

      // Then get the actual posts
      const { data: postsData, error: postsError } = await client
        .from('posts')
        .select('*')
        .in('id', postIds)
        .eq('isPrivate', false)
        .eq('isDraft', false);

      if (postsError || !postsData) {
        logError("Error fetching posts by IDs", postsError || new Error("No data found"));
        return [];
      }

      // Process the posts
      return postsData.map(post => ({
        ...post,
        author: post?.author || "",
        category: post?.category || null,
        ipfsImages: processIpfsImages(post?.ipfsImages),
      }));
    } catch (finalError) {
      logError("All attempts to fetch minted posts failed", finalError);
      return [];
    }
  }
}

/**
 * Helper function to process ipfsImages field which could be an array, string, or null
 */
function processIpfsImages(ipfsImages: any): UploadResponse[] | null {
  if (Array.isArray(ipfsImages)) {
    return ipfsImages as UploadResponse[];
  } else if (typeof ipfsImages === "string") {
    try {
      return JSON.parse(ipfsImages) as UploadResponse[];
    } catch {
      return null;
    }
  }
  return null;
}
