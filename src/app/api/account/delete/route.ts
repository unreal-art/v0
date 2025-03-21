import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "", // Service role key (used ONLY in backend)
);

export async function DELETE(req: Request) {
  try {
    const { userId, token } = await req.json();

    if (!userId || !token) {
      return NextResponse.json(
        { error: "User ID and token are required" },
        { status: 400 },
      );
    }

    // Ensure token belongs to user
    const supabaseAuthClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    );

    const { data: user, error: authError } =
      await supabaseAuthClient.auth.getUser();

    if (authError || user?.user?.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete user-related data from your database (optional)
    await supabaseAdmin.from("comments").delete().eq("user_id", userId);
    await supabaseAdmin.from("comment_likes").delete().eq("user_id", userId);
    await supabaseAdmin.from("follows").delete().eq("follower_id", userId);
    await supabaseAdmin.from("follows").delete().eq("followee_id", userId);
    await supabaseAdmin.from("likes").delete().eq("author", userId);
    await supabaseAdmin.from("likes").delete().eq("post_author", userId);
    await supabaseAdmin.from("notifications").delete().eq("sender_id", userId);
    await supabaseAdmin.from("notifications").delete().eq("user_id", userId);
    await supabaseAdmin.from("post_pins").delete().eq("user_id", userId);
    await supabaseAdmin.from("posts").delete().eq("author", userId);
    await supabaseAdmin.from("posts_with_rank").delete().eq("author", userId);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // Delete the user from Supabase Auth
    const { error: deleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
