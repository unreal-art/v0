import { getUser } from "$/queries/user";
import { createClient } from "$/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const encodedRedirectTo = requestUrl.searchParams.get("redirect") || "/home";

  const redirectTo = decodeURIComponent(encodedRedirectTo);

  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  //Do this to generate user wallet
  const user = await getUser();
  return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);
}
