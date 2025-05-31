import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import appConfig from "@/config";

// Define your protected routes
const protectedRoutes = ["/home"];
const authRoutes = ["/auth", "/login", "/signup"]; // Routes that authenticated users shouldn't access

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add response headers for debugging (visible in Network tab)
  const headers = new Headers();
  headers.set("x-middleware-pathname", pathname);
  headers.set("x-middleware-timestamp", new Date().toISOString());

  // console.log("🔥 updateSession() called for:", pathname);

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    appConfig.services.supabase.url!,
    appConfig.services.supabase.anonKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get the user session
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // console.log("🔐 Auth status:", {
  //   pathname,
  //   user: user ? "authenticated" : "not authenticated",
  //   userId: user?.id,
  //   error: error?.message,
  // });

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && (!user || error)) {
    // console.log("🚫 Redirecting unauthenticated user to /auth");
    const redirectUrl = new URL("/auth", request.url);
    // redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && user && !error) {
    // console.log("✅ Redirecting authenticated user to /home");
    const redirectUrl = new URL("/home", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Add debug headers to the response
  supabaseResponse.headers.set("x-middleware-pathname", pathname);
  supabaseResponse.headers.set(
    "x-middleware-user",
    user ? "authenticated" : "not-authenticated"
  );
  supabaseResponse.headers.set(
    "x-middleware-protected",
    isProtectedRoute.toString()
  );
  supabaseResponse.headers.set(
    "x-middleware-auth-route",
    isAuthRoute.toString()
  );

  return supabaseResponse;
}
