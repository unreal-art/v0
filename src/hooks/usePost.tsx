import { Post } from "$/types/data.types";
import { getPostById } from "@/queries/post/getPostById";
import { updatePostById } from "@/queries/post/updatePostById";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const usePost = (postId: number | null) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId as number), // Type assertion (safe due to `enabled`)
    enabled: !!postId, // Runs only if postId is valid
  });
};

export function useUpdatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePost = async (postId: number, data: Partial<Post>) => {
    setLoading(true);
    setError(null);

    try {
      await updatePostById(postId, data);
      setLoading(false);
      return true;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return false;
    }
  };

  return { updatePost, loading, error };
}
