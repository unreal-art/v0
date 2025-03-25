import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "$/supabase/client";
import { Notification } from "$/types/data.types";
import { useUser } from "@/hooks/useUser";
import { log, logError } from "@/utils/sentryUtils";

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { userId } = useUser();

  return useMutation<void, Error, string>({
    mutationFn: async (notificationId) => {
      // log(
      //   "[useMarkNotificationAsRead] Marking notification as read",
      //   { notificationId }
      // );

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) {
        // logError("[useMarkNotificationAsRead] Error", error);
        throw error;
      }

      // log("[useMarkNotificationAsRead] Successfully marked as read");
    },

    onSuccess: () => {
      // log("[useMarkNotificationAsRead] Mutation succeeded");

      // IMPORTANT: Invalidate the notifications count for the current user
      if (userId) {
        // Use the correct query key to match the one in useUnreadNotificationsCount
        // log(
        //   "[useMarkNotificationAsRead] Invalidating count for userId",
        //   { userId }
        // );
        queryClient.invalidateQueries({
          queryKey: ["notificationsCount", userId],
        });
      }

      // Also invalidate the main notifications list
      queryClient.invalidateQueries({
        queryKey: ["notifications", userId],
      });
    },

    onError: (error) => {
      // logError(
      //   "[useMarkNotificationAsRead] Failed to mark notification as read",
      //   error
      // );
    },
  });
};
