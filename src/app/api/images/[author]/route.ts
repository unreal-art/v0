import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import appConfig from "@/config";

type Params = Promise<{ author: string }>;

export async function GET(req: Request, segmentData: { params: Params }) {
  try {
    // Extract author parameter
    const { author } = await segmentData.params;

    // Initialize Supabase client once
    const supabaseUrl = appConfig.services.supabase.url;
    const privateKey = appConfig.services.supabase.SRK as string;
    const supabase = createClient(supabaseUrl, privateKey);

    // Get author's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("torus_id", author)
      .single();

    if (profileError) {
      return NextResponse.json(
        { success: false, error: profileError.message },
        { status: profileError.code === "PGRST116" ? 404 : 500 }
      );
    }

    // Count posts by author
    const { count, error: countError } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("author", profile.id);

    if (countError) {
      return NextResponse.json(
        { success: false, error: countError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      authorId: author,
      postCount: count,
    });
  } catch (err: any) {
    console.error("Error counting posts:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
