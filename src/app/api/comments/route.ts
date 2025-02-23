import { createClient } from "$/supabase/server";
import { NextResponse } from "next/server";

// ✅ Fetch all comments for a post
export async function GET(req: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");

  if (!postId)
    return NextResponse.json({ error: "Missing postId" }, { status: 400 });

  const { data, error } = await supabase.rpc("get_comments_with_users", {
    _post_id: Number(postId),
  });
  console.log(error);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// ✅ Post a new comment
export async function POST(req: Request) {
  const supabase = await createClient();

  const { post_id, content, parent_id } = await req.json();
  const { data: user } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("comments")
    .insert([{ post_id, user_id: user.user?.id as string, content, parent_id }])
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
