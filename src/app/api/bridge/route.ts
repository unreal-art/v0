import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getUser } from "@/queries/user";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const transferTopic = ethers.id("Transfer(address,address,uint256)");

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const private_SRK = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  const secretSupabaseClient: SupabaseClient = createClient(
    supabaseUrl,
    private_SRK,
  );

  const user = await getUser();

  try {
    const {
      txHash,
      tokenAddress,
      expectedFrom,
      expectedTo,
      expectedAmount,
      decimals,
      chainId,
    } = await req.json();

    const provider = new ethers.JsonRpcProvider(
      chainId == 8192
        ? process.env.MAINNET_RPC_URL
        : process.env.TESTNET_RPC_URL,
    );

    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt || receipt.status !== 1) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Transaction failed or not found" },
        },
        { status: 400 },
      );
    }

    const iface = new ethers.Interface(ERC20_ABI);

    const logs = receipt.logs.filter(
      (log) => log.address.toLowerCase() === tokenAddress.toLowerCase(),
    );

    for (const log of logs) {
      if (log.topics[0] === transferTopic) {
        const parsed = iface.parseLog(log);

        const from = parsed?.args[0];
        const to = parsed?.args[1];
        const value = parsed?.args[2];

        const formattedAmount = ethers.formatUnits(value, decimals || 18);

        const expectedValue = ethers.parseUnits(
          expectedAmount.toString(),
          decimals,
        );

        if (
          from.toLowerCase() === expectedFrom.toLowerCase() &&
          to.toLowerCase() === expectedTo.toLowerCase() &&
          value.toString() === expectedValue.toString()
        ) {
          const userBalance = user?.creditBalance || 0;
          const rate = Number(process.env.NEXT_PUBLIC_RATE);
          const addedBalance =
            Number(formattedAmount) /
            Number(ethers.formatUnits(rate.toString(), decimals));

          const newBalance = userBalance + addedBalance;

          const { error } = await secretSupabaseClient
            .from("profiles")
            .update({ credit_balance: newBalance })
            .eq("id", user?.id);

          if (error) {
            return NextResponse.json(
              { success: false, error: { message: error.message } },
              { status: 500 },
            );
          }

          return NextResponse.json({
            success: true,
            message: "Transfer verified",
          });
        }
      }
    }

    return NextResponse.json(
      { success: false, error: { message: "Matching transfer not found" } },
      { status: 404 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Unknown error" } },
      { status: 500 },
    );
  }
}
