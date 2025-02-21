import { supabase } from "$/supabase/client";
import { getAuthorImage } from "@/queries/post/getAuthorImage";
import { useQuery } from "@tanstack/react-query";

/** Custom Hook using React Query */
export default function useAuthorImage(authorId: string | undefined) {
  return useQuery({
    queryKey: ["authorImage", authorId],
    queryFn: async () => {
      if (!authorId) return null;
      return getAuthorImage(authorId, supabase);
    },
    enabled: !!authorId, // Ensures query only runs if authorId exists
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
