import { supabase } from "$/supabase/client";
import { CommentWithUser } from "$/types/data.types";
import { axiosInstanceLocal } from "@/lib/axiosInstance";
import { addNotification } from "@/queries/post/addNotification";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React from "react";

// ✅ Fetch comments
export function useComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data } = await axiosInstanceLocal.get(
        `/api/comments?postId=${postId}`,
      );
      return data;
    },
  });
}

// fetch replies
export function useReplies(parentId: string) {
  return useQuery({
    queryKey: ["replies", parentId],
    queryFn: async () => {
      const { data } = await axiosInstanceLocal.get(
        `/api/comments/replies?parentId=${parentId}`,
      );
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
      author: string;
      senderId: string;
    }) => {
      const { data } = await axios.post("/api/comments", comment);

      if (data) {
        addNotification({
          userId: comment.author as string,
          senderId: comment.senderId as string,
          postId: Number(comment.post_id),
          type: "comment",
        });
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.post_id],
      });
    },
  });
}

// ✅ Real-time updates
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
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comment_likes" },
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

// ✅ Real-time updates
export function useRealtimeReplies(parentId: string) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const channel = supabase
      .channel(`replies-${parentId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["replies", parentId] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comment_likes" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["replies", parentId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [parentId, queryClient]);
}

// ✅ Optimistic Like
export function useLikeComment(postId: string) {
  const queryClient = useQueryClient();
  // console.log(postId);
  return useMutation({
    mutationFn: async (commentId: string) => {
      await axios.post("/api/comments/like", { comment_id: commentId });
    },
    onMutate: async (commentId: string) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });

      const previousComments = queryClient.getQueryData(["comments", postId]);
      // console.log(previousComments, "previous");
      queryClient.setQueryData(
        ["comments", postId],
        (oldData: CommentWithUser[]) => {
          if (!oldData) return [];
          return oldData.map((comment: CommentWithUser) =>
            comment.id === commentId
              ? {
                  ...comment,
                  like_count: comment.like_count + 1,
                  user_liked: true,
                }
              : comment,
          );
        },
      );

      return { previousComments };
    },
    onError: (_err, _commentId, context) => {
      console.log(_err, "error");
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["comments", postId],
          context.previousComments,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

// ✅ Optimistic Unlike
export function useUnlikeComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      await axios.delete("/api/comments/like", {
        data: { comment_id: commentId },
      });
    },
    onMutate: async (commentId: string) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });

      const previousComments = queryClient.getQueryData(["comments", postId]);

      queryClient.setQueryData(
        ["comments", postId],
        (oldData: CommentWithUser[]) => {
          if (!oldData) return [];
          return oldData.map((comment: CommentWithUser) =>
            comment.id === commentId
              ? {
                  ...comment,
                  like_count: Math.max(comment.like_count - 1, 0),
                  user_liked: false,
                }
              : comment,
          );
        },
      );

      return { previousComments };
    },
    onError: (_err, _commentId, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["comments", postId],
          context.previousComments,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

// ✅ Optimistic Like
export function useLikeReply(postId: string, parentId: string) {
  const queryClient = useQueryClient();
  // console.log(postId);
  return useMutation({
    //reply is also a comment
    mutationFn: async (commentId: string) => {
      await axios.post("/api/comments/like", { comment_id: commentId });
    },
    onMutate: async (commentId: string) => {
      await queryClient.cancelQueries({ queryKey: ["replies", parentId] });

      const previousComments = queryClient.getQueryData(["replies", parentId]);
      // console.log(previousComments, "previous");
      queryClient.setQueryData(
        ["replies", parentId],
        (oldData: CommentWithUser[]) => {
          if (!oldData) return [];
          return oldData.map((comment: CommentWithUser) =>
            comment.id === commentId
              ? {
                  ...comment,
                  like_count: comment.like_count + 1,
                  user_liked: true,
                }
              : comment,
          );
        },
      );

      return { previousComments };
    },
    onError: (_err, _commentId, context) => {
      console.log(_err, "error");
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["replies", parentId],
          context.previousComments,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["replies", parentId] });
    },
  });
}

// ✅ Optimistic Unlike
export function useUnlikeReply(postId: string, parentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      await axios.delete("/api/comments/like", {
        data: { comment_id: commentId },
      });
    },
    onMutate: async (commentId: string) => {
      await queryClient.cancelQueries({ queryKey: ["replies", parentId] });

      const previousComments = queryClient.getQueryData(["replies", parentId]);

      queryClient.setQueryData(
        ["replies", parentId],
        (oldData: CommentWithUser[]) => {
          if (!oldData) return [];
          return oldData.map((comment: CommentWithUser) =>
            comment.id === commentId
              ? {
                  ...comment,
                  like_count: Math.max(comment.like_count - 1, 0),
                  user_liked: false,
                }
              : comment,
          );
        },
      );

      return { previousComments };
    },
    onError: (_err, _commentId, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["replies", parentId],
          context.previousComments,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["replies", parentId] });
    },
  });
}
