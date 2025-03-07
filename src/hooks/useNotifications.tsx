import { useEffect, useState, useCallback, useMemo } from "react";
import {
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { supabase } from "$/supabase/client";
import { Notification } from "$/types/data.types";
import { dedupedRequest, normalizeEntity } from "@/utils/queryOptimizer";

// Define the sender type properly
interface UserProfile {
  id: string;
  avatar_url?: string;
  username?: string;
  [key: string]: any;
}

// Extended notification type with proper sender type
interface NotificationWithSender extends Omit<Notification, "sender"> {
  sender?: UserProfile;
}

// Define the page structure
interface NotificationPage {
  notifications: NotificationWithSender[];
  hasMore: boolean;
  totalCount: number;
}

// Optimized notifications hook with pagination and caching
export const useNotifications = (userId: string | null) => {
  const queryClient = useQueryClient();
  const pageSize = 10;

  // Use infinite query for efficient pagination
  const query = useInfiniteQuery<NotificationPage, Error>({
    queryKey: ["notifications", userId],
    queryFn: async ({ pageParam = 0 }) => {
      const currentPage = typeof pageParam === "number" ? pageParam : 0;

      if (!userId) {
        return {
          notifications: [],
          hasMore: false,
          totalCount: 0,
        };
      }

      // Use request deduplication
      return dedupedRequest(
        `notifications-${userId}-${currentPage}`,
        async () => {
          // Get total count (cached separately)
          const countResponse = await supabase
            .from("notifications")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .neq("sender_id", userId);

          const totalCount = countResponse.count || 0;

          // Get paginated notifications
          const { data, error } = await supabase
            .from("notifications")
            .select("*, sender:profiles!sender_id(*)")
            .eq("user_id", userId)
            .neq("sender_id", userId)
            .order("created_at", { ascending: false })
            .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1);

          if (error) throw error;

          // Handle data safely
          const notificationsWithSenders: NotificationWithSender[] = [];

          if (data && Array.isArray(data)) {
            // Process each notification
            data.forEach((notification) => {
              // Create a safe copy without modifying the original
              const notificationCopy: NotificationWithSender = {
                ...notification,
                // Remove the sender to add it back with the right type
                sender: undefined,
              };

              // Handle sender safely
              if (
                notification.sender &&
                typeof notification.sender === "object" &&
                "id" in notification.sender
              ) {
                const sender = notification.sender as unknown as UserProfile;
                notificationCopy.sender = sender;

                // Store the user data in cache
                normalizeEntity("users", sender);
              }

              // Store the notification in cache (without sender to avoid issues)
              const { sender, ...notificationData } = notificationCopy;
              if (notificationData.id) {
                normalizeEntity(
                  "comments",
                  notificationData as { id: string | number }
                );
              }

              // Add to our processed list
              notificationsWithSenders.push(notificationCopy);
            });
          }

          const hasMore = (currentPage + 1) * pageSize < totalCount;

          return {
            notifications: notificationsWithSenders,
            hasMore,
            totalCount,
          };
        }
      );
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:user:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Selective cache update instead of full invalidation
          if (payload.eventType === "INSERT") {
            // Add new notification to cache
            queryClient.setQueryData(["notifications", userId], (old: any) => {
              if (!old || !old.pages || !old.pages.length) return old;

              // Clone the first page
              const newPages = [...old.pages];
              const firstPage = { ...newPages[0] };

              // Add the new notification
              firstPage.notifications = [
                payload.new as NotificationWithSender,
                ...firstPage.notifications,
              ];

              // Update counts
              firstPage.totalCount = (firstPage.totalCount || 0) + 1;

              // Replace the first page
              newPages[0] = firstPage;

              return {
                ...old,
                pages: newPages,
              };
            });
          } else {
            // For updates and deletes, do a full invalidation
            queryClient.invalidateQueries({
              queryKey: ["notifications", userId],
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  // Flatten paginated data
  const notifications = useMemo(() => {
    if (!query.data) return [];

    // Safely access the notifications from each page
    return query.data.pages.flatMap((page) => page.notifications || []);
  }, [query.data]);

  // Get total unread count
  const totalUnread = useMemo(() => {
    if (!query.data || !query.data.pages.length) return 0;

    // Safely access the totalCount from the first page
    return query.data.pages[0]?.totalCount || 0;
  }, [query.data]);

  // Load more helper
  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  return {
    notifications,
    totalUnread,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    loadMore,
    refetch: query.refetch,
  };
};

// Optimized hook for just counting unread notifications
export const useUnreadNotificationsCount = (userId: string | null) => {
  const queryClient = useQueryClient();

  const query = useQuery<number, Error>({
    queryKey: ["notificationsCount", userId],
    queryFn: async (): Promise<number> => {
      if (!userId) return 0;

      // Use deduplication for count queries
      return dedupedRequest(`notifications-count-${userId}`, async () => {
        const { count, error } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .neq("sender_id", userId)
          .eq("is_read", false);

        if (error) throw error;
        return count || 0;
      });
    },
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true, // Always refresh notification count
    enabled: !!userId,
  });

  return query.data || 0;
};

// Optimized hook for counting share notifications for a specific post
export const useCountShareNotifications = (
  userId: string | null,
  post_id: number | null
) => {
  const queryClient = useQueryClient();

  const query = useQuery<number, Error>({
    queryKey: ["shareNotificationsCount", userId, post_id],
    queryFn: async (): Promise<number> => {
      if (!userId || !post_id) return 0;

      // Use deduplication for count queries
      return dedupedRequest(
        `share-notifications-count-${userId}-${post_id}`,
        async () => {
          const { count, error } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("post_id", post_id)
            .eq("type", "share");

          if (error) throw error;
          return count || 0;
        }
      );
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 15, // Keep in cache for 15 minutes
    refetchOnWindowFocus: false,
    enabled: !!userId && !!post_id,
  });

  // Set up real-time subscription for live updates
  useEffect(() => {
    if (!userId || !post_id) return;

    const channel = supabase
      .channel(`share-notifications-${userId}-${post_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId} AND post_id=eq.${post_id} AND type=eq.share`,
        },
        () => {
          // Optimistic increment for better UX
          queryClient.setQueryData(
            ["shareNotificationsCount", userId, post_id],
            (oldCount: number | undefined) => (oldCount || 0) + 1
          );

          // Still invalidate to get actual data
          queryClient.invalidateQueries({
            queryKey: ["shareNotificationsCount", userId, post_id],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, post_id, queryClient]);

  // Helper for incrementing count optimistically
  const incrementShareCount = useCallback(() => {
    if (!userId || !post_id) return;

    queryClient.setQueryData(
      ["shareNotificationsCount", userId, post_id],
      (oldCount: number | undefined) => (oldCount || 0) + 1
    );
  }, [userId, post_id, queryClient]);

  return {
    shareCount: query.data || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    incrementShareCount,
  };
};
