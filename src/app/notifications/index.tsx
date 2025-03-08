"use client";
import { ReactNode, useEffect, useRef, useState, useCallback } from "react";
import Notification from "./notification";
import { CloseIcon, ScrollTopIcon } from "../components/icons";
import { useUser } from "@/hooks/useUser";
import {
  useNotifications,
  useUnreadNotificationsCount,
} from "@/hooks/useNotifications";
import NotificationSkeleton from "./components/notificationSkeleton";
import { Notification as NotificationType } from "$/types/data.types";
import { supabase } from "$/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface INotificationProps {
  children: ReactNode;
}

// const dummy = [1, 2, 3, 4, 5, 6, 8, 1, 2, 3, 4, 5, 6, 8];

export default function Notifications({ children }: INotificationProps) {
  const { userId } = useUser();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // The hook returns the flattened notifications directly
  const { notifications, isLoading, isError, error, refetch } =
    useNotifications(userId);

  const unreadCount = useUnreadNotificationsCount(userId);

  // Enhanced debugging
  useEffect(() => {
    // console.log("[Notifications] userId:", userId);
    // console.log("[Notifications] unreadCount:", unreadCount);
    // console.log("[Notifications] notifications length:", notifications?.length);
  }, [userId, notifications, unreadCount]);

  // Refetch notifications when panel opens
  useEffect(() => {
    if (open) {
      // console.log("[Notifications] Panel opened, refetching data");
      refetch();

      // Also refetch the unread count after a delay to ensure it's up to date
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["notificationsCount", userId],
        });
      }, 1000);
    }
  }, [open, refetch, queryClient, userId]);

  // Function to manually invalidate the count
  const refreshCount = useCallback(() => {
    // console.log("[Notifications] Manually refreshing count");
    queryClient.invalidateQueries({
      queryKey: ["notificationsCount", userId],
    });
  }, [queryClient, userId]);

  function scrollTop() {
    if (ref.current) {
      ref.current.scrollTop = 0;
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          // Refresh count when opening the panel
          refreshCount();
        }}
        className="relative"
      >
        {children}
        {unreadCount > 0 && (
          <span className="absolute -top-2 right-1 md:top-4 md:right-12 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed z-50  top-0 left-0 h-screen w-full bg-gray-950/50"
          ></div>
          <div className="absolute w-full max-w-[528px] h-[90vh] z-50 top-2 md:top-[5vh] left-0 md:left-60 border-primary-8 border-[1px] bg-primary-12 rounded-xl p-4">
            <div className="flex justify-between text-primary-3 px-4">
              <p className="nasalization text-2xl">
                Notification {unreadCount > 0 && `(${unreadCount})`}
              </p>

              <div className="flex gap-1 md:gap-2">
                <div
                  className="flex justify-center items-center w-[120px] h-9 border-[1px] border-primary-11 rounded-[20px] gap-2 cursor-pointer"
                  onClick={scrollTop}
                >
                  <ScrollTopIcon width={16} height={16} color="#8F8F8F" />
                  <p>To the top</p>
                </div>

                <button
                  onClick={() => {
                    setOpen(false);
                    // Refresh count when closing the panel
                    setTimeout(refreshCount, 500);
                  }}
                >
                  <CloseIcon color="#FDFDFD" />
                </button>
              </div>
            </div>

            <div ref={ref} className="overflow-y-auto h-[82vh] !scroll-smooth">
              {isLoading && <NotificationSkeleton />}

              {isError && (
                <div className="text-red-500 p-4">
                  Error loading notifications:{" "}
                  {error?.message || "Unknown error"}
                </div>
              )}

              {!isLoading && !isError && notifications.length === 0 && (
                <div className="text-center p-8 text-primary-6">
                  No notifications yet
                </div>
              )}

              {notifications.map(
                (notification: NotificationType, index: number) => (
                  <Notification
                    key={notification.id || index}
                    notification={notification}
                  />
                )
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
