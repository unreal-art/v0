"use client";

import { supabase } from "$/supabase/client";
import { ExtendedUser } from "$/types/data.types";
import { useGenerationStore } from "@/app/providers/GenerationStoreProvider";
import { sendJobRequest } from "@/queries/post/sendJobRequest";
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logError } from "@/utils/sentryUtils";

interface JobParams {
  prompt: string;
  negative_prompt?: string;
  model?: string;
  numImages?: number;
}

/**
 * Enhanced hook for creating image generation jobs
 * Integrates with the generationStore for state management
 */
export function useCreateJob(user: ExtendedUser | null) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get only the confirmed functions from the store
  const { startGeneration, stopGeneration } = useGenerationStore(
    (state) => state
  );

  // Maintain local state for tracking
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Define mutation with proper error handling and retries
  const mutation = useMutation({
    mutationFn: async (params: JobParams) => {
      const { prompt } = params;

      if (!prompt) throw new Error("Prompt is required");
      if (!user) throw new Error("User must be logged in");

      // Update local state and use the store's function
      setIsGenerating(true);
      setProgress(0);
      startGeneration();

      try {
        // Send job request with only the supported parameters
        await sendJobRequest({
          prompt,
          user,
          stopGeneration,
        });

        // Update progress
        setProgress(100);

        // Return success
        return { success: true };
      } catch (error) {
        // Handle errors gracefully
        setIsGenerating(false);
        stopGeneration();
        throw error;
      }
    },
    onError: (error) => {
      logError("Error creating job", error);
      setIsGenerating(false);
      stopGeneration();

      // Clear stale data if needed
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    // Retry on certain errors, but not on validation errors
    retry: (failureCount, error) => {
      // Don't retry on user errors
      if (
        error.message.includes("Prompt is required") ||
        error.message.includes("User must be logged in")
      ) {
        return false;
      }

      // Retry network errors up to 2 times
      return failureCount < 2;
    },
  });

  // Helper to cancel the job
  const cancelJob = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    stopGeneration();
  }, [stopGeneration]);

  // Watch for new posts where author == user.id
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel("user_posts_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          if (payload.new.author === user.id) {
            // Handle successful generation
            setIsGenerating(false);
            setProgress(100);
            stopGeneration();

            // Prefetch post data
            queryClient.invalidateQueries({ queryKey: ["posts"] });

            // Navigate to the new post
            router.push(
              `/home/photo/${payload.new.id}?a=${payload.new.author}`
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, router, stopGeneration, queryClient]);

  return {
    ...mutation,
    cancelJob,
    isGenerating,
    progress,
    generationState: {
      isGenerating,
      progress,
    },
  };
}

// "use client";

// import { Client } from "$/supabase/client";
// import { ExtendedUser } from "$/types/data.types";
// import { useGenerationStore } from "@/app/providers/GenerationStoreProvider";
// import { sendJobRequest } from "@/queries/post/sendJobRequest";
// import { useMutation } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";

// export function useCreateJob() {
//   const router = useRouter();
//   const { startGeneration, stopGeneration } = useGenerationStore(
//     (state) => state,
//   );

//   return useMutation({
//     mutationFn: async ({
//       prompt,
//       user,
//     }: {
//       prompt: string;
//       user: ExtendedUser | null;
//     }) => {
//       if (!prompt) throw new Error("Prompt is required");
//       startGeneration();
//       return sendJobRequest({ prompt, user });
//     },

//     onSuccess: (data) => {
//       //TODO: the post id should be among the data returned
//       log("Job created successfully", data);
//       stopGeneration();
//       router.push(`/home/photo/${data.data[0].id}?a=${data.data[0].author}`); // Navigate after success
//     },
//     onError: (error) => {
//       stopGeneration();
//       logError("Error creating job", error);
//     },
//   });
// }
