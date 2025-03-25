import { createClient } from "$/supabase/server";
import { NextResponse } from "next/server";
import { logError, logWarning } from "@/utils/sentryUtils";



// ✅ Fetch comments with like count
export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    logWarning("Comments GET request missing postId");
    return NextResponse.json({ error: "Missing postId" }, { status: 400 });
  }

  const user = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("get_comments_with_likes", {
    post_uuid: Number(postId), // Ensure it's parsed correctly
    current_user_id: user?.data?.user?.id as string,
  });

  if (error) {
    logError("Error fetching comments with likes", {
      error,
      postId,
      userId: user?.data?.user?.id,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ✅ Post a new comment
export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    const { post_id, content, parent_id } = await req.json();
    const { data: user } = await supabase.auth.getUser();

    if (!user || !user.user) {
      logWarning("Unauthorized comment POST attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!post_id) {
      logWarning("Comment POST missing post_id", { userId: user.user.id });
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("comments")
      .insert([{ post_id, user_id: user.user.id, content, parent_id }])
      .select();

    if (error) {
      logError("Error creating comment", {
        error,
        post_id,
        user_id: user.user.id,
        parent_id,
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    logError("Unexpected error in comment POST", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
