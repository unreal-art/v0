import { Client } from "$/supabase/client";
import { JobSpec } from "$/types/data.types";
import { axiosInstance } from "@/lib/axiosInstance";
import random from "random";

// Function to send job request
export const sendJobRequest = async ({
  prompt,
  client,
}: {
  prompt: string;
  client: Client;
}) => {
  console.log(prompt);
  const author = (await client.auth.getUser()).data.user?.id;
  const dto: Partial<JobSpec> = {
    module: "isdxl",
    version: "v1.6.0",
    inputs: {
      Prompt: prompt,
      cpu: 30,
      ram: "34gb",
      Device: "xpu",
      Seed: random.int(1e3, 1e8),
      N: 1,
      Format: "webp",
    },
    author,
    isPrivate: false,
    isPinned: false,
    category: "GENERATION",
  };

  const response = await axiosInstance.post("/darts", dto);
  return response.data;
};
