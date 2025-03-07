import { supabase } from "$/supabase/client";
import { CommentWithUser } from "$/types/data.types";
import { axiosInstanceLocal } from "@/lib/axiosInstance";
import { addNotification } from "@/queries/post/addNotification";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useCallback, useState, useEffect } from "react";
import {
  dedupedRequest,
  normalizeEntity,
  updateEntity,
} from "@/utils/queryOptimizer";

// Define extended comment type that includes user data
interface ExtendedComment extends CommentWithUser {
  user?: {
    id: string;
    avatar_url?: string;
    username?: string;
  };
}

// ✅ Fetch comments with optimized caching
export function useComments(postId: string) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const result = useQuery<ExtendedComment[]>({
    queryKey: ["comments", postId, { page, pageSize }],
    queryFn: async () => {
      // Use deduped request to prevent duplicate API calls
      return dedupedRequest(
        `comments-${postId}-${page}-${pageSize}`,
        async () => {
          const { data } = await axiosInstanceLocal.get(
            `/api/comments?postId=${postId}&page=${page}&pageSize=${pageSize}`
          );

          // Store comments in normalized cache
          data?.forEach((comment: ExtendedComment) => {
            normalizeEntity("comments", comment);

            // Also store user data if available
            if (comment.user) {
              normalizeEntity("users", comment.user);
            }
          });

          return data || [];
        }
      );
    },
    staleTime: 1000 * 60 * 3, // Cache for 3 minutes
    // Use placeholderData instead of keepPreviousData (TanStack v5)
    placeholderData: (prev) => prev,
  });

  // Helper to load more comments
  const loadMoreComments = useCallback(() => {
    if (!result.isLoading && !result.isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [result.isLoading, result.isFetching]);

  // Helper to prefetch the next page of comments
  const prefetchNextPage = useCallback(() => {
    if (!result.isLoading && !result.isFetching) {
      queryClient.prefetchQuery({
        queryKey: ["comments", postId, { page: page + 1, pageSize }],
        queryFn: async () => {
          const { data } = await axiosInstanceLocal.get(
            `/api/comments?postId=${postId}&page=${
              page + 1
            }&pageSize=${pageSize}`
          );
          return data || [];
        },
      });
    }
  }, [
    queryClient,
    postId,
    page,
    pageSize,
    result.isLoading,
    result.isFetching,
  ]);

  // Automatically prefetch next page when close to end
  useEffect(() => {
    if (Array.isArray(result.data) && result.data.length === pageSize) {
      prefetchNextPage();
    }
  }, [result.data, prefetchNextPage, pageSize]);

  return {
    ...result,
    loadMoreComments,
    prefetchNextPage,
    page,
    hasMore: Array.isArray(result.data) && result.data.length === pageSize,
  };
}

// Fetch replies with optimized caching
export function useReplies(parentId: string) {
  return useQuery<ExtendedComment[]>({
    queryKey: ["replies", parentId],
    queryFn: async () => {
      return dedupedRequest(`replies-${parentId}`, async () => {
        const { data } = await axiosInstanceLocal.get(
          `/api/comments/replies?parentId=${parentId}`
        );

        // Store replies in normalized cache
        data?.forEach((reply: ExtendedComment) => {
          normalizeEntity("comments", reply);

          // Also store user data if available
          if (reply.user) {
            normalizeEntity("users", reply.user);
          }
        });

        return data || [];
      });
    },
    staleTime: 1000 * 60 * 3, // Cache for 3 minutes
  });
}

// ✅ Post comment with optimistic updates
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
          postId: parseInt(comment.post_id), // Convert string to number
          type: "comment",
          senderId: comment.senderId,
        });
      }

      return data;
    },

    onMutate: async (newComment) => {
      // Get the post ID and parent ID (if it's a reply)
      const postId = newComment.post_id;
      const parentId = newComment.parent_id;

      // Cancel any outgoing refetches to prevent them overwriting our optimistic update
      if (parentId) {
        await queryClient.cancelQueries({ queryKey: ["replies", parentId] });
      } else {
        await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      }

      // Snapshot previous data
      const previousData = parentId
        ? queryClient.getQueryData(["replies", parentId])
        : queryClient.getQueryData(["comments", postId]);

      // Create optimistic comment
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        content: newComment.content,
        created_at: new Date().toISOString(),
        author: newComment.author,
        post_id: postId,
        parent_id: parentId || null,
        likes: 0,
      };

      // Add optimistic comment to cache
      if (parentId) {
        queryClient.setQueryData(["replies", parentId], (old: any) => {
          return old ? [optimisticComment, ...old] : [optimisticComment];
        });
      } else {
        queryClient.setQueryData(["comments", postId], (old: any) => {
          return old ? [optimisticComment, ...old] : [optimisticComment];
        });
      }

      // Return context for potential rollback
      return { previousData, postId, parentId };
    },

    onError: (err, newComment, context) => {
      // Rollback on error
      if (context?.parentId) {
        queryClient.setQueryData(
          ["replies", context.parentId],
          context.previousData
        );
      } else if (context?.postId) {
        queryClient.setQueryData(
          ["comments", context.postId],
          context.previousData
        );
      }
    },

    onSuccess: (data, variables) => {
      // Get the post ID and parent ID (if it's a reply)
      const postId = variables.post_id;
      const parentId = variables.parent_id;

      // Add new comment to normalized cache
      normalizeEntity("comments", data);

      // Update comment count on the post
      queryClient.setQueryData(["post", parseInt(postId)], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          comment_count: (old.comment_count || 0) + 1,
        };
      });

      // Update optimistic comment with real data
      if (parentId) {
        queryClient.invalidateQueries({ queryKey: ["replies", parentId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      }
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
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comment_likes" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        }
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
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comment_likes" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["replies", parentId] });
        }
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
              : comment
          );
        }
      );

      return { previousComments };
    },
    onError: (_err, _commentId, context) => {
      console.log(_err, "error");
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["comments", postId],
          context.previousComments
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
              : comment
          );
        }
      );

      return { previousComments };
    },
    onError: (_err, _commentId, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["comments", postId],
          context.previousComments
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
              : comment
          );
        }
      );

      return { previousComments };
    },
    onError: (_err, _commentId, context) => {
      console.log(_err, "error");
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["replies", parentId],
          context.previousComments
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
              : comment
          );
        }
      );

      return { previousComments };
    },
    onError: (_err, _commentId, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["replies", parentId],
          context.previousComments
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["replies", parentId] });
    },
  });
}
