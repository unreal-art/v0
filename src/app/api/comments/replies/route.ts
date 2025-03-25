import { createClient } from "$/supabase/server";
import { NextResponse } from "next/server";
import { logError, logWarning } from "@/utils/sentryUtils";

// ✅ Fetch replies for a specific comment
export async function GET(req: Request) {
  const supabase = await createClient();

  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId");

    if (!parentId) {
      logWarning("Replies GET request missing parentId");
      return NextResponse.json({ error: "Missing parentId" }, { status: 400 });
    }

    const user = await supabase.auth.getUser();

    const { data, error } = await supabase.rpc("get_replies_with_likes", {
      given_parent_id: parentId,
      current_user_id: user?.data?.user?.id as string,
    });

    if (error) {
      logError("Error fetching comment replies", {
        error,
        parentId,
        userId: user?.data?.user?.id,
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    logError("Unexpected error in replies GET", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
