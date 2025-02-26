import doesUserFollow from "@/queries/user/doesUserFollows";
import { useQuery } from "@tanstack/react-query";

export const useDoesUserFollow = (followerId: string, followeeId: string) => {
  return useQuery({
    queryKey: ["doesUserFollow", followerId, followeeId], // Unique query key
    queryFn: () => doesUserFollow(followerId, followeeId),
    enabled: !!followerId && !!followeeId, // Prevents running on empty values
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
  });
};
