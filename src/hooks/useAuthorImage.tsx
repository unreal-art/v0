import { supabase } from "$/supabase/client";
import { getAuthorImage } from "@/queries/post/getAuthorImage";
import { useQuery } from "@tanstack/react-query";

/** Custom Hook using React Query */
export default function useAuthorImage(authorId: string | undefined | null) {
  return useQuery({
    queryKey: ["authorImage", authorId],
    queryFn: async () => (authorId ? getAuthorImage(authorId, supabase) : null),
    enabled: !!authorId, // Runs only if authorId exists
    staleTime: 1000 * 60 * 5, // Remove if global config is enough
  });
}
