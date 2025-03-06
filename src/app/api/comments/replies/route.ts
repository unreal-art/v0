import { createClient } from "$/supabase/server";
import { NextResponse } from "next/server";

// ✅ Fetch replies for a specific comment
export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get("parentId");

  if (!parentId)
    return NextResponse.json({ error: "Missing parentId" }, { status: 400 });

  const user = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("get_replies_with_likes", {
    given_parent_id: parentId,
    current_user_id: user?.data?.user?.id as string,
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// ✅ Post a reply to a comment
// export async function POST(req: Request) {
//   const supabase = await createClient();
//   const { post_id, content, parent_id } = await req.json();
//   const { data: user } = await supabase.auth.getUser();

//   if (!user)
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   if (!parent_id)
//     return NextResponse.json({ error: "Missing parent_id" }, { status: 400 });

//   const { data, error } = await supabase
//     .from("comments")
//     .insert([{ post_id, user_id: user.user?.id as string, content, parent_id }])
//     .select();

//   if (error)
//     return NextResponse.json({ error: error.message }, { status: 500 });

//   return NextResponse.json(data);
// }
