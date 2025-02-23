import { supabase } from "$/supabase/client";
import { getAuthorUserName } from "@/queries/post/getAuthorUserName";
import { useQuery } from "@tanstack/react-query";

/** Custom Hook using React Query */
export default function useAuthorUsername(authorId: string | undefined | null) {
  return useQuery({
    queryKey: ["authorUsername", authorId],
    queryFn: async () => {
      return getAuthorUserName(authorId, supabase);
    },
    enabled: !!authorId, // Ensures query only runs if authorId exists
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
