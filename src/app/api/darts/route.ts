import { NextRequest, NextResponse } from "next/server";
//import axios from "axios";
import { getUser } from "@/queries/user";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { withEdgeHighlight } from "@/utils/edge-highlight.config";

export const runtime = "edge"; // Use Edge Functions
export const maxDuration = 300; // 5-minute max execution time

export const POST = withEdgeHighlight(async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const private_SRK = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!supabaseUrl || !private_SRK) {
    return NextResponse.json(
      { error: "Missing necessary environment variables." },
      { status: 500 },
    );
  }

  const secretSupabaseClient: SupabaseClient = createClient(
    supabaseUrl,
    private_SRK,
  );

  try {
    // Parse request body
    const requestData = await req.json();

    // Get user details
    const user = await getUser();

    // Return early if the user data is missing or incomplete
    if (!user || !user.creditBalance || !user.wallet?.privateKey) {
      return NextResponse.json(
        { error: "User data is incomplete or missing." },
        { status: 400 },
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add Authorization header only if `creditBalance <= 0`
    if (user.creditBalance <= 0) {
      headers.Authorization = `Bearer ${user.wallet.privateKey}`;
    }

    // Send to queue
    const { error } = await secretSupabaseClient.rpc("send_to_queue", {
      queue_name: "dart_jobs",
      msg: requestData,
    });

    // If there is an error from Supabase function, throw it
    if (error) {
      throw new Error(`Request to Supabase failed: ${error.message}`);
    }

    // Successfully enqueued the job
    return NextResponse.json({ status: true });
  } catch (error: unknown) {
    console.error("Error forwarding request to /darts:", error);

    // if (axios.isAxiosError(error)) {
    //   return NextResponse.json(
    //     { error: error.response?.data || error.message },
    //     { status: error.response?.status || 500 },
    //   );
    // }

    // Handle  errors
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});

// import { NextRequest, NextResponse } from "next/server";
// // import { axiosInstance } from "@/lib/axiosInstance";
// import axios from "axios";
// import { getUser } from "@/queries/user";
// import { createClient, SupabaseClient } from "@supabase/supabase-js";
// import { withEdgeHighlight } from "@/utils/edge-highlight.config";

// export const runtime = "edge"; // Use Edge Functions
// export const maxDuration = 300; // 5-minute max execution time

// export const POST = withEdgeHighlight(async function POST(req: NextRequest) {
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
//   const private_SRK = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

//   const secretSupabaseClient: SupabaseClient = createClient(
//     supabaseUrl,
//     private_SRK,
//   );

//   try {
//     // Parse request body
//     const requestData = await req.json();
//     // console.log("url", process.env.NEXT_PUBLIC_API_URL);
//     //get user
//     const user = await getUser();

//     if (!user || !user.creditBalance || !user.wallet?.privateKey) return;

//     const headers: Record<string, string> = {
//       "Content-Type": "application/json",
//     };

//     // Add Authorization only when `creditBalance <= 0`
//     if (user.creditBalance <= 0) {
//       headers.Authorization = `Bearer ${user.wallet.privateKey}`;
//     }

//     //send to queue.
//     const { error } = await secretSupabaseClient.rpc("send_to_queue", {
//       queue_name: "dart_jobs",
//       msg: requestData,
//       // delay: 0, // No delay
//     });

//     // if (error) throw new Error(`Request failed with status: ${error}`);
//     // const response = await fetch(
//     //   `${process.env.NEXT_PUBLIC_API_URL}/api/  darts`,
//     //   {
//     //     method: "POST",
//     //     headers,
//     //     body: JSON.stringify(requestData),
//     //   },
//     // );

//     if (error) {
//       throw new Error(`Request failed with status: ${error}`);
//     }
//     // if (!response.ok) {
//     //   throw new Error(`Request failed with status: ${response.status}`);
//     // }

//     // const responseData = await response.json();
//     return NextResponse.json({ status: true });
//   } catch (error: unknown) {
//     console.error("Error forwarding request to /darts:", error);

//     if (axios.isAxiosError(error)) {
//       return NextResponse.json(
//         { error: error.response?.data || error.message },
//         { status: error.response?.status || 500 },
//       );
//     }

//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// });
