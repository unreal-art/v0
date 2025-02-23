import { getPostById } from "@/queries/post/getPostById";
import { useQuery } from "@tanstack/react-query";

const usePost = (postId: number | null) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId as number), // Type assertion (safe due to `enabled`)
    enabled: !!postId, // Runs only if postId is valid
  });
};

export default usePost;
