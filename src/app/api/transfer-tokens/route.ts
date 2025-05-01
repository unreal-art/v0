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
  success: boolean;
  data?: any;
  error?: { message: string; details?: string; statusCode?: number };
  warning?: string;
}

// Environment variables validation on startup
const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ODP_API_KEY",
  "ODP_API_ENDPOINT",
  "NEXT_PUBLIC_RATE",
];

const missingEnvVars = REQUIRED_ENV_VARS.filter(
  (varName) => !process.env[varName],
);
if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`,
  );
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<TokenTransferResponse>> {
  // Initialize required configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const privateServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const odpApiKey = process.env.ODP_API_KEY;
  const odpApiEndpoint = process.env.ODP_API_ENDPOINT;
  const rateStr = process.env.NEXT_PUBLIC_RATE;

  // Check configuration
  if (
    !supabaseUrl ||
    !privateServiceRoleKey ||
    !odpApiKey ||
    !odpApiEndpoint ||
    !rateStr
  ) {
    console.error("Missing server configuration");
    return NextResponse.json(
      { success: false, error: { message: "Server configuration error" } },
      { status: 500 },
    );
  }

  // Create Supabase client only once
  const supabase: SupabaseClient = createClient(
    supabaseUrl,
    privateServiceRoleKey,
  );

  try {
    // Authenticate user
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "User authentication failed" } },
        { status: 401 },
      );
    }

    // Parse and validate request body
    let body: TokenTransferRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Request parsing error:", parseError);
      return NextResponse.json(
        { success: false, error: { message: "Invalid request format" } },
        { status: 400 },
      );
    }

    // console.log(body)

    // Validate required fields
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
      (field) => !body[field as keyof TokenTransferRequest],
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Missing required fields: ${missingFields.join(", ")}`,
          },
        },
        { status: 400 },
      );
    }

    // Make API request to ODP Partner Wallet API
    const response = await fetchTokenService(body, odpApiEndpoint, odpApiKey);
    if (!response.ok) {
      const statusCode = response.status;
      const errorData = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));

      console.error(`External API error (${statusCode}):`, errorData);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Transfer failed",
            details: errorData.error || errorData.message || "Unknown error",
            statusCode,
          },
        },
        { status: response.status === 404 ? 404 : 502 },
      );
    }

    // Process successful API response
    const data = await response.json().catch((error) => {
      console.error("Response parsing error:", error);
      throw new Error("Invalid response from token service");
    });

    // Update user credit balance
    try {
      const rate = Number(rateStr);
      const formattedValue = ethers.formatUnits(body.value, 18);
      const addedBalance =
        Number(formattedValue) /
        Number(ethers.formatUnits(rate.toString(), 18));
      const newBalance = (user?.creditBalance || 0) + addedBalance;

      const { error } = await supabase
        .from("profiles")
        .update({ credit_balance: newBalance })
        .eq("id", user?.id);

      if (error) {
        console.error("Supabase update error:", error);
        return NextResponse.json(
          {
            success: true,
            warning: "Token transfer successful but balance update failed",
            data,
          },
          { status: 200 },
        );
      }
    } catch (balanceError) {
      console.error("Balance calculation error:", balanceError);
      return NextResponse.json(
        {
          success: true,
          warning: "Token transfer successful but balance update failed",
          data,
        },
        { status: 200 },
      );
    }

    // Return successful response
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Token transfer unexpected error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 },
    );
  }
}

/**
 * Helper function to make API request to token service
 */
async function fetchTokenService(
  payload: TokenTransferRequest,
  endpoint: string,
  apiKey: string,
): Promise<Response> {
  try {
    return await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Token service fetch error:", error);
    throw new Error("Failed to connect to token service");
  }
}
