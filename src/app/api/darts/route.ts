import { NextRequest, NextResponse } from "next/server";
import { axiosInstance } from "@/lib/axiosInstance";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const requestData = await req.json();
    console.log(requestData);
    // Forward the request to the /darts endpoint
    const response = await axiosInstance.post(
      "https://darts.decenterai.com:8080/darts",
      requestData,
    );

    // Return the response data
    return NextResponse.json(response.data, { status: response.status });
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
