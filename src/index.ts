/**
 * Cloudflare Worker entry point for Unreal app
 *
 * This worker handles routing for the Next.js application deployed on Cloudflare
 */
import type { ExecutionContext } from "@cloudflare/workers-types";

// Define the environment bindings interface
interface Env {
  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;

  // API and storage URLs
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY: string;
  NEXT_PUBLIC_R2_STORAGE_URL: string;
  NEXT_PUBLIC_CF_URL: string;

  // ThirdWeb integration
  NEXT_PUBLIC_TW_CLIENT_ID: string;

  // Monitoring and debugging
  NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID: string;
  NEXT_PUBLIC_DEBUG: string;
  NEXT_PUBLIC_BUILD_VERSION: string;

  // R2 bucket binding (if you're using it)
  // UNREAL_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // Log available environment variables (without their values)
    console.log("Available environment variables:", Object.keys(env));

    // Extract URL and method
    const url = new URL(request.url);
    const method = request.method;

    try {
      // Add caching headers for static assets
      if (
        url.pathname.match(
          /\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff2|woff|ttf|otf)$/
        )
      ) {
        const response = await fetch(request);
        const cache = await caches.open("unreal-assets");

        // Clone the response to store in cache
        const responseToCache = response.clone();
        ctx.waitUntil(cache.put(request, responseToCache));

        // Add cache headers
        const headers = new Headers(response.headers);
        headers.set("Cache-Control", "public, max-age=31536000");

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }

      // Handle API requests specifically if needed
      if (url.pathname.startsWith("/api/")) {
        // Forward request with needed environment variables
        return fetch(request);
      }

      // Default case: pass to the Next.js application
      return fetch(request);
    } catch (e) {
      // Report error to Sentry or similar
      console.error(`Worker error: ${e}`);

      // Return a helpful error page
      return new Response(
        `Service temporarily unavailable. Please try again later.`,
        {
          status: 500,
          headers: {
            "Content-Type": "text/plain",
          },
        }
      );
    }
  },
};
