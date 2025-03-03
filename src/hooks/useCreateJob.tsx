"use client";

import { Client } from "$/supabase/client";
import { useGenerationStore } from "@/app/providers/GenerationStoreProvider";
import { sendJobRequest } from "@/queries/post/sendJobRequest";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useCreateJob() {
  const router = useRouter();
  const { startGeneration, stopGeneration } = useGenerationStore(
    (state) => state,
  );

  return useMutation({
    mutationFn: async ({
      prompt,
      client,
    }: {
      prompt: string;
      client: Client;
    }) => {
      if (!prompt) throw new Error("Prompt is required");
      startGeneration();
      return sendJobRequest({ prompt, client });
    },

    onSuccess: (data) => {
      //TODO: the post id should be among the data returned
      console.log("Job created successfully:", data);
      stopGeneration();
      router.push(`/home/photo/${data.data[0].id}?a=${data.data[0].author}`); // Navigate after success
    },
    onError: (error) => {
      stopGeneration();
      console.error("Error creating job:", error);
    },
  });
}
