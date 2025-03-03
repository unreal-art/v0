import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "$/supabase/client";
import { Notification } from "$/types/data.types";

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, { previousCount?: number }>({
    mutationFn: async (notificationId) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onMutate: async (notificationId) => {
      // Cancel ongoing queries to avoid race conditions
      await queryClient.cancelQueries({ queryKey: ["unread-notifications"] });

      // Snapshot the previous count before modifying
      const previousCount = queryClient.getQueryData<number>([
        "unread-notifications",
      ]);

      // Optimistically update the count to 0 immediately
      queryClient.setQueryData(["unread-notifications"], 0);

      return { previousCount };
    },
    onError: (error, _, context) => {
      // Rollback to previous count if mutation fails
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(
          ["unread-notifications"],
          context.previousCount,
        );
      }
      console.error("Failed to mark notification as read:", error);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
    },
  });
};
