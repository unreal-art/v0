import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "$/supabase/client";
import { normalizeEntity } from "@/utils/queryOptimizer";
import { useCallback, useRef } from "react";

// Enhanced interface for user data
interface UserData {
  full_name?: string | null;
  bio?: string | null;
  display_name?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  credit_balance?: number;
  email?: string | null;
  follower_count?: number;
  following_count?: number;
  [key: string]: any; // Allow additional fields for flexibility
}

/**
 * Enhanced hook for updating user profile details with optimized
 * performance and better error handling
 */
export const useUpdateUserDetails = () => {
  const queryClient = useQueryClient();

  // For throttling rapid updates
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<{ user: UserData; id: string } | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      user,
      id,
    }: {
      user: UserData;
      id: string;
    }): Promise<UserData> => {
      if (!id) throw new Error("User ID is required");

      // Filter out undefined values to perform a partial update
      const updates: UserData = {};
      Object.entries(user).forEach(([key, value]) => {
        if (value !== undefined) {
          updates[key] = value;
        }
      });

      // Only send the update if there are actual changes
      if (Object.keys(updates).length === 0) {
        return user; // No changes to make
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select();

      if (error) throw new Error(error.message);

      // Return the updated data for cache integration
      return data?.[0] || user;
    },

    onMutate: async ({ user, id }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["user"] }),
        queryClient.cancelQueries({ queryKey: ["profile_data", id] }),
        queryClient.cancelQueries({ queryKey: ["user", id] }),
      ]);

      // Snapshot the previous values
      const previousUser = queryClient.getQueryData<{
        user: any;
        userId: string;
      }>(["user"]);

      const previousProfile = queryClient.getQueryData<UserData>([
        "profile_data",
        id,
      ]);

      const previousUserData = queryClient.getQueryData(["user", id]);

      // Optimistically update all user data in cache
      queryClient.setQueryData(["user"], (oldData: any) => {
        if (!oldData || !oldData.user) return oldData;

        return {
          ...oldData,
          user: { ...oldData.user, ...user },
        };
      });

      queryClient.setQueryData(["profile_data", id], (oldData: any) => ({
        ...oldData,
        ...user,
      }));

      // Update normalized cache
      if (id) {
        normalizeEntity("users", {
          id,
          ...user,
        });
      }

      return { previousUser, previousProfile, previousUserData, id };
    },

    onError: (error, { id }, context) => {
      console.error("Error updating user details:", error);

      // Revert all optimistic updates
      if (context?.previousUser) {
        queryClient.setQueryData(["user"], context.previousUser);
      }

      if (context?.previousProfile) {
        queryClient.setQueryData(["profile_data", id], context.previousProfile);
      }

      if (context?.previousUserData) {
        queryClient.setQueryData(["user", id], context.previousUserData);
      }
    },

    onSuccess: (data, { id }) => {
      // Update all related queries for consistency

      // Add updated data to normalized cache
      normalizeEntity("users", {
        id,
        ...data,
      });

      // Only invalidate if absolutely necessary
      // Most updates should be handled by setQueryData already
      if (data.avatar_url) {
        // Avatar changes need a full refresh
        queryClient.invalidateQueries({ queryKey: ["user"] });
        queryClient.invalidateQueries({ queryKey: ["profile_data", id] });
        queryClient.invalidateQueries({ queryKey: ["user", id] });
      }
    },
  });

  // Helper to throttle rapid consecutive updates
  const throttledUpdate = useCallback(
    (id: string, updates: UserData) => {
      // If an update is already pending, combine the updates
      if (pendingUpdatesRef.current) {
        pendingUpdatesRef.current = {
          id,
          user: {
            ...pendingUpdatesRef.current.user,
            ...updates,
          },
        };
        return;
      }

      // Store the current update
      pendingUpdatesRef.current = { user: updates, id };

      // Clear any existing timeout
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }

      // Set a timeout to process the update
      throttleTimeoutRef.current = setTimeout(() => {
        if (pendingUpdatesRef.current) {
          // Process the update
          mutation.mutate(pendingUpdatesRef.current);

          // Reset state
          pendingUpdatesRef.current = null;
          throttleTimeoutRef.current = null;
        }
      }, 500); // 500ms throttle
    },
    [mutation]
  );

  // Helper for field-by-field updates
  const updateUserField = useCallback(
    (id: string, field: string, value: any) => {
      return mutation.mutate({
        user: { [field]: value },
        id,
      });
    },
    [mutation]
  );

  return {
    ...mutation,
    updateUserField,
    throttledUpdateUser: throttledUpdate,
  };
};
