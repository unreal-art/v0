import appConfig from "@/config"
import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { postId, userId, transactionHash, chainId } = await request.json()

    // Validate required data
    if (!postId || !userId || !transactionHash || !chainId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const supabaseUrl = appConfig.services.supabase.url
    const privateKey = appConfig.services.supabase.SRK as string
    const supabase = createClient(supabaseUrl, privateKey)

    // Check if the post is already minted by this user
    const { data: existingMint, error: checkError } = await supabase
      .from("post_mints")
      .select()
      .eq("transaction_hash", transactionHash)
      // .select()
      // .eq("post_id", postId)
      // .eq("user_id", userId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      console.error("Error checking existing mint:", checkError)
      return NextResponse.json(
        { error: "Error checking existing mint" },
        { status: 500 }
      )
    }

    if (existingMint) {
      return NextResponse.json(
        { error: "Post already minted by this user" },
        { status: 400 }
      )
    }

    // Record the mint in the database
    const { data: mintData, error: mintError } = await supabase
      .from("post_mints")
      .insert({
        post_id: postId,
        user_id: userId,
        transaction_hash: transactionHash,
        chain_id: chainId,
      })
      .select()
      .single()

    if (mintError) {
      console.error("Error creating mint:", mintError)
      return NextResponse.json(
        { error: "Failed to record mint transaction" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Post minted successfully",
      data: mintData,
    })
  } catch (error: any) {
    console.error("Mint API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
