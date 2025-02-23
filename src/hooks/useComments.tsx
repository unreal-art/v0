import { supabase } from "$/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React from "react";

// ✅ Fetch comments
export function useComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/comments?postId=${postId}`);
      return data;
    },
  });
}

// ✅ Post comment
export function usePostComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comment: {
      post_id: string;
      content: string;
      parent_id?: string;
    }) => {
      const { data } = await axios.post("/api/comments", comment);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.post_id],
      });
    },
  });
}

// ✅ Real-time subscription for comments
export function useRealtimeComments(postId: string) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);
}
