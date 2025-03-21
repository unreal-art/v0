import { createClient } from "$/supabase/server";
import { NextResponse } from "next/server";

// ✅ Like a comment
export async function POST(req: Request) {
  const supabase = await createClient();
  const { comment_id } = await req.json();
  const user = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!comment_id)
    return NextResponse.json(
      { error: "Comment ID is required" },
      { status: 400 },
    );

  const { data, error } = await supabase
    .from("comment_likes")
    .insert([
      { comment_id: comment_id, user_id: user.data.user?.id as string },
    ]);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Liked successfully", data });
}

// ✅ Unlike a comment
export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { comment_id } = await req.json();
  const user = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!comment_id)
    return NextResponse.json(
      { error: "Comment ID is required" },
      { status: 400 },
    );

  const { error } = await supabase
    .from("comment_likes")
    .delete()
    .match({
      comment_id: comment_id,
      user_id: user.data.user?.id as string,
    });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Unliked successfully" });
}
