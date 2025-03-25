import { createClient } from "$/supabase/server";
import { NextResponse } from "next/server";
import { logError, logWarning } from "@/utils/sentryUtils";

// ✅ Like a comment
export async function POST(req: Request) {
  const supabase = await createClient();
  try {
    const { comment_id } = await req.json();
    const user = await supabase.auth.getUser();

    if (!user || !user.data.user) {
      logWarning("Unauthorized comment like attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (!comment_id) {
      logWarning("Comment like missing comment_id", { userId: user.data.user.id });
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("comment_likes")
      .insert([
        { comment_id: comment_id, user_id: user.data.user.id },
      ]);

    if (error) {
      logError("Error liking comment", {
        error,
        comment_id,
        user_id: user.data.user.id
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Liked successfully", data });
  } catch (error: any) {
    logError("Unexpected error in comment like", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ Unlike a comment
export async function DELETE(req: Request) {
  const supabase = await createClient();
  try {
    const { comment_id } = await req.json();
    const user = await supabase.auth.getUser();

    if (!user || !user.data.user) {
      logWarning("Unauthorized comment unlike attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (!comment_id) {
      logWarning("Comment unlike missing comment_id", { userId: user.data.user.id });
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("comment_likes")
      .delete()
      .match({
        comment_id: comment_id,
        user_id: user.data.user.id,
      });

    if (error) {
      logError("Error unliking comment", {
        error,
        comment_id,
        user_id: user.data.user.id
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Unliked successfully" });
  } catch (error: any) {
    logError("Unexpected error in comment unlike", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
