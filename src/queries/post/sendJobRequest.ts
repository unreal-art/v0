import { ExtendedUser, JobSpec } from "$/types/data.types";
import { axiosInstance, axiosInstanceLocal } from "@/lib/axiosInstance";
import axios from "axios";
import random from "random";
import { toast } from "sonner";
import { logError } from "@/utils/sentryUtils";

// Function to send job request (Fire-and-Forget)
export const sendJobRequest = ({
  prompt,
  user,
  stopGeneration,
}: {
  prompt: string;
  user: ExtendedUser | null;
  stopGeneration: () => void;
}) => {
  if (!user) {
    logError(
      "User is undefined, cannot send job request",
      new Error("No user"),
    );
    return;
  }
  if (!user.wallet?.privateKey) {
    logError(
      "Missing private key, cannot proceed",
      new Error("No private key"),
    );
    return;
  }

  const author = user.id;

  const dto: Partial<JobSpec> = {
    module: "nearai",
    version: "v0.3.0",
    inputs: {
      Prompt: prompt,
      Seed: random.int(1e3, 1e8),
      N: 1, //TODO: we can do multiple images at once
      Format: "webp",
    },
    author,
    category: "GENERATION",
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (user.creditBalance <= 0) {
    headers.Authorization = `Bearer ${user.wallet.privateKey}`;
  }

  // 🚀 Fire-and-Forget: No need to `await`, just send the request
  axiosInstanceLocal.post("/api/darts", dto, { headers }).catch((error) => {
    stopGeneration();
    toast.error(
      "Error sending job request:" + error.response?.data || error.message,
    );
    logError("Error sending job request", error);
  });
};

// import { Client } from "$/supabase/client";
// import { ExtendedUser, JobSpec } from "$/types/data.types";
// import { axiosInstance, axiosInstanceLocal } from "@/lib/axiosInstance";
// import axios from "axios";
// import random from "random";
// import { logError } from "@/utils/sentryUtils";

// // Function to send job request
// export const sendJobRequest = async ({
//   prompt,
//   // client,
//   user,
// }: {
//   prompt: string;
//   // client: Client;
//   user: ExtendedUser | null;
// }) => {
//   try {
//     // console.log(prompt);
//     // const author =     (await client.auth.getUser()).data.user?.id;
//     if (!user) {
//       throw new Error("User is undefined, cannot send job request.");
//     }
//     if (!user.wallet?.privateKey) {
//       throw new Error("Missing private key, cannot proceed.");
//     }

//     const author = user.id;

//     const dto: Partial<JobSpec> = {
//       module: "isdxl",
//       version: "v1.6.0",
//       inputs: {
//         Prompt: prompt,
//         cpu: 30,
//         ram: "34gb",
//         Device: "xpu",
//         Seed: random.int(1e3, 1e8),
//         N: 1,
//         Format: "webp",
//       },
//       author,
//       category: "GENERATION",
//     };

//     const headers: Record<string, string> = {
//       "Content-Type": "application/json",
//     };

//     // Add Authorization only when `creditBalance <= 0`
//     if (user.creditBalance <= 0) {
//       headers.Authorization = `Bearer ${user.wallet.privateKey}`;
//     }
//     const response = await axiosInstance.post("/darts", dto, { headers });
//     // const response = await axiosInstanceLocal.post("/api/darts", dto, {
//     //   timeout: 300000,
//     // });
//     return response.data;
//   } catch (error: unknown) {
//     logError("Error sending job request", error);

//     if (axios.isAxiosError(error)) {
//       throw new Error(error.response?.data || error.message);
//     }

//     throw new Error((error as Error).message || "Internal Server Error");
//   }
// };
