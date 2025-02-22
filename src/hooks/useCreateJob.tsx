"use client";

import { sendJobRequest } from "@/queries/post/sendJobRequest";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useCreateJob() {
  const router = useRouter();

  return useMutation({
    mutationFn: sendJobRequest,
    onSuccess: (data) => {
      //TODO: the post id should be among the data returned
      console.log("Job created successfully:", data);
      router.push(`/home/generation?id=${data.id}`); // Navigate after success
    },
    onError: (error) => {
      console.error("Error creating job:", error);
    },
  });
}
