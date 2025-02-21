import { Client } from "$/supabase/client";

// Retrieve a user's profile image by their ID, or return an empty string if not found.
export const getAuthorImage = async (
  authorId: string,
  client: Client,
): Promise<string | null> => {
  if (!authorId) {
    console.warn("Author ID is not provided.");
    return null;
  }

  try {
    // Fetch profile data for the matching ID
    const { data: profile, error } = await client
      .from("profiles")
      .select("avatar_url") // Select only the necessary field
      .eq("id", authorId)
      .single();

    if (error) {
      console.error(
        `Error fetching profile for author ID ${authorId}:`,
        error.message,
      );
      return null;
    }

    return profile?.avatar_url || null; // Ensure safe access to the field
  } catch (err) {
    console.error(
      `Unexpected error fetching profile for author ID ${authorId}:`,
      err,
    );
    return null;
  }
};
