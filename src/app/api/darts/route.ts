import { NextRequest, NextResponse } from "next/server";
// import { axiosInstance } from "@/lib/axiosInstance";
import axios from "axios";
import { getUser } from "@/queries/user";

export const runtime = "edge"; // Use Edge Functions
export const maxDuration = 300; // 5-minute max execution time

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const requestData = await req.json();
    console.log(requestData);
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

    const response = await fetch("https://darts.decenterai.com:8080/darts", {
      method: "POST",
      headers,
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }

    const responseData = await response.json();
    return NextResponse.json(responseData, { status: response.status });
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
