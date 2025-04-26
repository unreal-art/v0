// File: app/api/transfer-tokens/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/queries/user";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ethers } from "ethers";

// Define types for request and response
interface TokenTransferRequest {
  owner: string;
  signature: string;
  value: string;
  deadline: number;
  spender: string;
  partnerwallet: string;
  vendor: string;
}

interface TokenTransferResponse {
  message: string;
  transactionhash?: string;
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const private_SRK = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  const secretSupabaseClient: SupabaseClient = createClient(
    supabaseUrl,
    private_SRK
  );

  const user = await getUser();

  try {
    // Extract data from request body
    const body: TokenTransferRequest = await request.json();

    // Check for required fields
    const requiredFields = [
      "owner",
      "signature",
      "value",
      "deadline",
      "spender",
      "partnerwallet",
      "vendor",
    ];
    const missingFields = requiredFields.filter(
      (field) => !body[field as keyof TokenTransferRequest]
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Missing required fields: ${missingFields.join(", ")}`,
          },
        },
        { status: 400 }
      );
    }

    // Prepare the request payload
    const payload = {
      owner: body.owner,
      signature: body.signature,
      value: body.value,
      deadline: body.deadline,
      spender: body.spender,
      partnerwallet: body.partnerwallet,
      vendor: body.vendor,
    };

    // Make the API request to ODP Partner Wallet API
    const response = await fetch(
      "https://hi6socfuab.execute-api.ap-southeast-1.amazonaws.com/engagepoints",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ODP_API_KEY as string,
        },
        body: JSON.stringify(payload),
      }
    );

    // Parse the response
    const data = await response.json();

    // Handle different status codes
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: { message: "Transfer failed" } },
        { status: 404 }
      );
    }

    //update user credit balance
    const rate = Number(process.env.NEXT_PUBLIC_RATE);
    const formattedValue = ethers.formatUnits(payload.value, 18);
    const addedBalance =
      Number(formattedValue) / Number(ethers.formatUnits(rate.toString(), 18));
    const newBalance = (user?.creditBalance || 0) + addedBalance;

    const { error } = await secretSupabaseClient
      .from("profiles")
      .update({ credit_balance: newBalance })
      .eq("id", user?.id);

    if (error) {
      return NextResponse.json(
        { success: false, error: { message: "Token transfer failed" } },
        { status: 500 }
      );
    }
    // Return successful response
    return NextResponse.json(data as TokenTransferResponse);
  } catch (error) {
    console.error("Token transfer error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
