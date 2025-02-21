import { Client } from "$/supabase/client";
import { getPostLikes } from "@/queries/post/getPostLikes";
import { useQuery } from "@tanstack/react-query";

export const usePostLikes = (postId: number, client: Client) => {
  return useQuery({
    queryKey: ["postLikes", postId],
    queryFn: async () => {
      const likes = await getPostLikes(postId, client);
      if (!likes) throw new Error("Failed to fetch likes");
      return likes;
    },
  });
};
