import { getUser } from "$/queries/user";
import { createClient } from "$/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const encodedRedirectTo = requestUrl.searchParams.get("redirect") || "/home";
  // const priceId = decodeURIComponent(
  //   requestUrl.searchParams.get("priceId") || "",
  // );
  // decodeURIComponent(requestUrl.searchParams.get("discountCode") || "");
  const redirectTo = decodeURIComponent(encodedRedirectTo);

  const supabase = await createClient();

  console.log(code);

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
    const userData = await getUser();
    console.log(userData);
    // await getOrCreateUserAvatar(userData);
  }
  // Set session cookie
  // if (priceId && priceId !== "") {
  //   // await createCheckoutSession({ priceId, discountCode });
  // } else {
  return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);
  // }

  // Successful authentication, redirect to the intended page
  // Ensure we're using the correct origin
}
