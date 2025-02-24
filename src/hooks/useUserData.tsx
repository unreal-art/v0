import { supabase } from "$/supabase/client";
import { getUserById } from "@/queries/user/getUserById";
import { useQuery } from "@tanstack/react-query";

/** Custom Hook using React Query */
export default function useUserData(authorId: string | undefined | null) {
  return useQuery({
    queryKey: ["profile_data", authorId],
    queryFn: async () => {
      return getUserById(authorId as string, supabase);
    },
    enabled: !!authorId, // Ensures query only runs if authorId exists
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
