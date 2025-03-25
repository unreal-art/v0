import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "$/supabase/client";
import { normalizeEntity, getEntity } from "@/utils/queryOptimizer";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { log, logError } from "@/utils/sentryUtils";

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
 * performance and better error handling.
 *
 * This hook is primarily for updating the authenticated user's profile,
 * but can also be used to update any profile when appropriate permissions exist.
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
      preserveFields = false,
    }: {
      user: UserData;
      id: string;
      preserveFields?: boolean;
    }): Promise<UserData> => {
      if (!id) throw new Error("User ID is required");

      // Create an update object with only the fields the database expects
      const updates: Partial<UserData> = {};

      // Only include fields the database expects
      const allowedFields = ["full_name", "display_name", "bio"];

      Object.entries(user).forEach(([key, value]) => {
        if (allowedFields.includes(key) && value !== undefined) {
          updates[key] = value;
        }
      });

      // Only send the update if there are actual changes
      if (Object.keys(updates).length === 0) {
        log("No valid fields to update");
        return user; // No changes to make
      }

      log("Final updates to send to API:", updates);

      // Send only the expected fields to the database
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select();

      if (error) throw new Error(error.message);

      // For the return data, preserve all the fields but update the ones from the server
      const returnData = {
        ...user,
        ...(data?.[0] || {}),
      };

      // Map credit_balance to creditBalance for UI if needed
      if (returnData.credit_balance && returnData.credit_balance !== 0) {
        (returnData as any).creditBalance = returnData.credit_balance;
      }

      return returnData;
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

      // Optimistically update all user data in cache - preserve existing data
      queryClient.setQueryData(["user"], (oldData: any) => {
        if (!oldData || !oldData.user) return oldData;

        return {
          ...oldData,
          user: { ...oldData.user, ...user },
        };
      });

      // Update profile data - preserve existing data
      queryClient.setQueryData(["profile_data", id], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          ...user,
        };
      });

      // Update normalized cache - preserve existing data
      if (id) {
        const existingEntity = getEntity("users", id) || {};

        // Log for debugging
        log("Existing entity before update", existingEntity);
        log("Updates being applied", user);

        // Create an enhanced update with only valid fields and field mappings
        const validUpdateFields = ["full_name", "display_name", "bio"];
        const clientCacheUpdate = { ...user };

        // If display_name is being updated, also update username for UI

        clientCacheUpdate.username = user.display_name;

        log("Enhanced client cache update", clientCacheUpdate);

        normalizeEntity("users", {
          ...existingEntity,
          ...clientCacheUpdate,
          id,
        });
      }

      return { previousUser, previousProfile, previousUserData, id };
    },

    onError: (error, { id }, context) => {
      logError("Error updating user details:", error);
      toast.error(`Failed to update profile: ${error.message}`);

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
      // Toast success message
      toast.success("Profile updated successfully");

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
      log("Throttled update called with", { id, updates });

      // If an update is already pending, combine the updates
      if (pendingUpdatesRef.current) {
        log("Existing pending updates", pendingUpdatesRef.current);

        // Before combining, check if we need to preserve the display_name
        const needToPreserveDisplayName =
          (updates.hasOwnProperty("firstname") ||
            updates.hasOwnProperty("lastname")) &&
          !updates.hasOwnProperty("display_name") &&
          pendingUpdatesRef.current.user.display_name;

        // Combine the updates
        pendingUpdatesRef.current = {
          id,
          user: {
            ...pendingUpdatesRef.current.user,
            ...updates,
          },
        };

        // If updating first/last name but not display_name, preserve the existing display_name
        if (needToPreserveDisplayName) {
          log(
            "Preserving display_name when combining updates with first/last name changes"
          );
          pendingUpdatesRef.current.user.display_name =
            pendingUpdatesRef.current.user.display_name;
        }

        log("Combined pending updates", pendingUpdatesRef.current);
        return;
      }

      // Store the current update
      pendingUpdatesRef.current = { user: updates, id };
      log("Stored pending update", pendingUpdatesRef.current);

      // Clear any existing timeout
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }

      // Set a timeout to process the update
      throttleTimeoutRef.current = setTimeout(() => {
        if (pendingUpdatesRef.current) {
          log("Processing throttled update");

          // Get the current data from cache before making the update
          const currentProfileData = queryClient.getQueryData<UserData>([
            "profile_data",
            id,
          ]);
          log("Current profile data from cache", currentProfileData);

          if (currentProfileData) {
            // Create an update object that only includes fields the database expects
            const updateData: Partial<UserData> = {};
            const pendingUpdates = pendingUpdatesRef.current?.user || {};

            // Only include fields the database expects
            const allowedFields = ["full_name", "display_name", "bio"];

            // First check if we're updating first/last name without explicitly updating display_name
            const isUpdatingName =
              (pendingUpdates.hasOwnProperty("firstname") ||
                pendingUpdates.hasOwnProperty("lastname")) &&
              !pendingUpdates.hasOwnProperty("display_name");

            // If we're updating name but not display_name, make sure to preserve the current display_name
            if (isUpdatingName && currentProfileData.display_name) {
              log(
                "Name update detected - explicitly preserving display_name",
                currentProfileData.display_name
              );
              // Include the current display_name in our update to prevent it from being lost
              pendingUpdates.display_name = currentProfileData.display_name;
            }

            // Process each pending update for allowed fields
            Object.entries(pendingUpdates).forEach(([key, value]) => {
              if (allowedFields.includes(key) && value !== undefined) {
                updateData[key] = value;
              }
            });

            // Special handling for first/last name which affect full_name
            if (
              !updateData.full_name &&
              (pendingUpdates.hasOwnProperty("firstname") ||
                pendingUpdates.hasOwnProperty("lastname"))
            ) {
              // This means we're updating firstname or lastname, but not directly full_name
              log("Handling firstname/lastname update");

              // We need to get the current full_name and update it
              const currentFirstName =
                pendingUpdates.firstname ||
                (currentProfileData.full_name
                  ? currentProfileData.full_name.split(" ")[0]
                  : "");

              const currentLastName =
                pendingUpdates.lastname ||
                (currentProfileData.full_name &&
                currentProfileData.full_name.split(" ").length > 1
                  ? currentProfileData.full_name.split(" ").slice(1).join(" ")
                  : "");

              updateData.full_name =
                `${currentFirstName} ${currentLastName}`.trim();
              log(
                "Setting full_name from first/last name",
                updateData.full_name
              );
            }

            // Double-check that display_name is preserved
            if (
              updateData.full_name &&
              !updateData.display_name &&
              currentProfileData.display_name
            ) {
              log("Re-checking display_name is preserved during name update");
              updateData.display_name = currentProfileData.display_name;
            }

            // Skip update if nothing to update
            if (Object.keys(updateData).length === 0) {
              log("No valid fields to update, skipping");
              pendingUpdatesRef.current = null;
              throttleTimeoutRef.current = null;
              return;
            }

            log("Final update data to send to API", updateData);

            // Execute the mutation with only the allowed fields
            mutation.mutate({
              user: updateData,
              id,
              preserveFields: true,
            });
          } else {
            // If we don't have current data, use a safer approach
            log("No current data found, using safer update approach");

            const updateData: Partial<UserData> = {};
            const pendingUpdates = pendingUpdatesRef.current?.user || {};

            // Only include fields the database expects
            const allowedFields = ["full_name", "display_name", "bio"];
            Object.entries(pendingUpdates).forEach(([key, value]) => {
              if (allowedFields.includes(key) && value !== undefined) {
                updateData[key] = value;
              }
            });

            if (Object.keys(updateData).length > 0) {
              mutation.mutate({
                user: updateData,
                id,
                preserveFields: true,
              });
            }
          }

          // Reset state
          pendingUpdatesRef.current = null;
          throttleTimeoutRef.current = null;
        }
      }, 500); // 500ms throttle
    },
    [mutation, queryClient]
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

  // Helper to update a viewed profile (works with useUserData)
  const updateViewedProfile = useCallback(
    (profileId: string, updates: UserData) => {
      // Get the current data from cache to ensure we preserve important fields
      const currentProfileData = queryClient.getQueryData<UserData>([
        "profile_data",
        profileId,
      ]);

      // Create an update object that only includes fields the database expects
      const updateData: Partial<UserData> = {};
      const allowedFields = ["full_name", "display_name", "bio"];

      // Process each update for allowed fields
      Object.entries(updates).forEach(([key, value]) => {
        if (allowedFields.includes(key) && value !== undefined) {
          updateData[key] = value;
        }
      });

      // Ensure display_name is preserved if we're updating full_name
      if (
        updateData.full_name &&
        !updateData.display_name &&
        currentProfileData?.display_name
      ) {
        updateData.display_name = currentProfileData.display_name;
      }

      // This updates both the authenticated user's data (if this is their profile)
      // and the viewed profile data
      return mutation.mutate({
        user: updateData,
        id: profileId,
        preserveFields: true,
      });
    },
    [mutation, queryClient]
  );

  return {
    ...mutation,
    updateUserField,
    throttledUpdateUser: throttledUpdate,
    updateViewedProfile,
  };
};
