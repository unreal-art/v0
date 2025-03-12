import { NextRequest, NextResponse } from "next/server";
// import { axiosInstance } from "@/lib/axiosInstance";
import axios from "axios";
import { getUser } from "@/queries/user";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const runtime = "edge"; // Use Edge Functions
export const maxDuration = 300; // 5-minute max execution time

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const private_SRK = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  const secretSupabaseClient: SupabaseClient = createClient(
    supabaseUrl,
    private_SRK,
  );

  try {
    // Parse request body
    const requestData = await req.json();
    // console.log("url", process.env.NEXT_PUBLIC_API_URL);
    //get user
    const user = await getUser();

    if (!user || !user.creditBalance || !user.wallet?.privateKey) return;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add Authorization only when `creditBalance <= 0`
    if (user.creditBalance <= 0) {
      headers.Authorization = `Bearer ${user.wallet.privateKey}`;
    }

    //send to queue.
    const { error } = await secretSupabaseClient.rpc("send_to_queue", {
      queue_name: "dart_jobs",
      msg: requestData,
      // delay: 0, // No delay
    });

    // if (error) throw new Error(`Request failed with status: ${error}`);
    // const response = await fetch(
    //   `${process.env.NEXT_PUBLIC_API_URL}/api/  darts`,
    //   {
    //     method: "POST",
    //     headers,
    //     body: JSON.stringify(requestData),
    //   },
    // );

    if (error) {
      throw new Error(`Request failed with status: ${error}`);
    }
    // if (!response.ok) {
    //   throw new Error(`Request failed with status: ${response.status}`);
    // }

    // const responseData = await response.json();
    return NextResponse.json({ status: true });
  } catch (error: unknown) {
    console.error("Error forwarding request to /darts:", error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data || error.message },
        { status: error.response?.status || 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
