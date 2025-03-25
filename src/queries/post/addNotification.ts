import { supabase } from "$/supabase/client";
import { logError } from "@/utils/sentryUtils";

// Add notification
export const addNotification = async ({
  userId,
  postId,
  type,
  senderId,
}: {
  userId: string; // User to receive the notification
  postId: number; // The post the notification is about
  type: "like" | "comment" | "follow" | "share"; // Notification type
  senderId: string; // User who performed the action
}) => {
  // Don't add notification if user is sending to self
  if (userId === senderId) return;

  const { data, error } = await supabase.from("notifications").insert([
    {
      user_id: userId,
      post_id: postId,
      type,
      sender_id: senderId,
    },
  ]);

  if (error) logError("Error adding notification", error);
  return data;
};
