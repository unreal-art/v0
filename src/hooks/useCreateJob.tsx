"use client";

import { Client, supabase } from "$/supabase/client";
import { ExtendedUser } from "$/types/data.types";
import { useGenerationStore } from "@/app/providers/GenerationStoreProvider";
import { sendJobRequest } from "@/queries/post/sendJobRequest";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";

export function useCreateJob(user: ExtendedUser | null) {
  const router = useRouter();
  const { startGeneration, stopGeneration } = useGenerationStore(
    (state) => state,
  );

  // 🔥 Fire-and-Forget Mutation
  const mutation = useMutation({
    mutationFn: async ({ prompt }: { prompt: string }) => {
      if (!prompt) throw new Error("Prompt is required");
      startGeneration();
      sendJobRequest({ prompt, user }); // Fire-and-forget!
    },
  });

  // 👀 Watch for new posts where author == user.id
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel("user_posts_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          if (payload.new.author === user.id) {
            console.log("New post detected for user:", payload.new);

            stopGeneration();
            router.push(
              `/home/photo/${payload.new.id}?a=${payload.new.author}`,
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, router, stopGeneration]);

  return mutation;
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
//       console.log("Job created successfully:", data);
//       stopGeneration();
//       router.push(`/home/photo/${data.data[0].id}?a=${data.data[0].author}`); // Navigate after success
//     },
//     onError: (error) => {
//       stopGeneration();
//       console.error("Error creating job:", error);
//     },
//   });
// }
