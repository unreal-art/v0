import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  req: NextRequest,
  context: { params: { author: string } },
) {
  const { author } = await context.params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const private_SRK = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  const supabase = createClient(supabaseUrl, private_SRK);

  try {
    const { count, error } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("author", author);

    if (error) {
      console.error("Error fetching post count:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
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
      { status: 500 },
    );
  }
}
