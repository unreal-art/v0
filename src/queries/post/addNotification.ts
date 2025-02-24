import { supabase } from "$/supabase/client";

export const addNotification = async ({
  userId, // Receiver (post owner)
  senderId, // User who liked/commented/shared
  postId,
  type, // "like", "comment", "share"
}: {
  userId: string;
  senderId: string;
  postId: number; // Ensure this matches BIGINT
  type: "like" | "comment" | "share";
}) => {
  const { error } = await supabase.from("notifications").insert([
    {
      user_id: userId,
      sender_id: senderId,
      post_id: postId,
      type,
    },
  ]);

  if (error) console.error("Error adding notification:", error);
};
