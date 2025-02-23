import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "$/supabase/client";

export const useNotifications = (userId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("realtime_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          queryClient.setQueryData(
            ["notifications", userId],
            (oldData: any) => {
              return oldData ? [payload.new, ...oldData] : [payload.new];
            },
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);

  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        // .neq("sender_id", userId) TODO: uncomment this
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};
