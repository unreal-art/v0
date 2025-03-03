import { Client } from "$/supabase/client";
import { JobSpec } from "$/types/data.types";
import { axiosInstanceLocal } from "@/lib/axiosInstance";
import axios from "axios";
import random from "random";

// Function to send job request
export const sendJobRequest = async ({
  prompt,
  client,
}: {
  prompt: string;
  client: Client;
}) => {
  try {
    // console.log(prompt);
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
      category: "GENERATION",
    };

    const response = await axiosInstanceLocal.post("/api/darts", dto, {
      timeout: 300000,
    });
    return response.data;
  } catch (error: unknown) {
    console.error("Error sending job request:", error);

    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data || error.message);
    }

    throw new Error((error as Error).message || "Internal Server Error");
  }
};
