import { useMutation } from "@tanstack/react-query";

import toggleFollow from "@/queries/user/toggleFollow";
import { useQueryClient } from "@tanstack/react-query";

// Hook to toggle follow status
export const useToggleFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      followerId,
      followeeId,
    }: {
      followerId: string;
      followeeId: string;
    }) => toggleFollow(followerId, followeeId),
    onSuccess: (_, { followerId, followeeId }) => {
      // Invalidate query to refresh follow status
      queryClient.invalidateQueries({
        queryKey: ["doesUserFollow", followerId, followeeId],
      });
    },
  });
};

export default useToggleFollow;
