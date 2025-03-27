/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Use memory for build version for faster access
let buildVersion = null;

// Parse URL to get hostname
const getUrlHostname = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
};

// Check if URL is cacheable
const isCacheableUrl = (url) => {
  const urlHostname = getUrlHostname(url);

  // Define external hosts that should be cached
  const CACHEABLE_HOSTS = [
    "gateway.mesh3.network",
    "gateway.lighthouse.storage",
    "assets.react-photo-album.com",
    "lh3.googleusercontent.com",
    "cdn.discordapp.com",
    "unreal01.61bc404fed98028e594de8e8bed90315.r2.cloudflarestorage.com",
    "pub-bc2d2d9bc6fb490dbb380efd5781048d.r2.dev",
  ];

  // Cache all local assets or specific external domains
  return (
    !urlHostname ||
    urlHostname === self.location.hostname ||
    CACHEABLE_HOSTS.includes(urlHostname)
  );
};

self.addEventListener("message", (event) => {
  if (event.data?.type === "SET_BUILD_VERSION") {
    buildVersion = event.data.version;
  }
});

// Faster build version check without interval
const waitForBuildVersion = async () => {
  if (buildVersion) return Promise.resolve();

  return Promise.race([
    new Promise((resolve) => {
      // One-time check for existing buildVersion
      if (buildVersion) {
        resolve();
        return;
      }

      // Otherwise set up a lighter observer
      const check = setInterval(() => {
        if (buildVersion) {
          clearInterval(check);
          resolve();
        }
      }, 50); // Check more frequently
    }),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Timeout waiting for build version")),
        5000, // Shorter timeout
      ),
    ),
  ]);
};

// Critical assets to cache immediately for better FCP/LCP
const CRITICAL_ASSETS = [
  "/",
  "/app/global.css",
  "/Icon-White.png",
  "/logo.png",
  "/whiteLogo.png",
  "/fallback.jpng",
  "/offline.html",
];

// Dynamic asset types to cache
const CACHE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".avif",
  ".css",
  ".js",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      self.skipWaiting(); // Activate new SW immediately

      try {
        await waitForBuildVersion();
      } catch (error) {
        // Silent fail in production
        return;
      }

      const CACHE_NAME = `static-${buildVersion}`;
      const cache = await caches.open(CACHE_NAME);

      // Cache critical assets with version parameter
      await cache.addAll(
        CRITICAL_ASSETS.map((url) => `${url}?v=${buildVersion}`),
      );
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      clients.claim(); // Take control immediately

      try {
        await waitForBuildVersion();
      } catch (error) {
        // Silent fail in production
        return;
      }

      // Clear old caches
      const cacheKeys = await caches.keys();
      const CURRENT_CACHE = `static-${buildVersion}`;
      const IMAGE_CACHE = `images-${buildVersion}`;

      await Promise.all(
        cacheKeys.map((key) => {
          // Keep current version caches only
          if (key !== CURRENT_CACHE && key !== IMAGE_CACHE) {
            return caches.delete(key);
          }
        }),
      );
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  // Ignore non-GET requests
  if (event.request.method !== "GET") return;

  // Only handle HTTP/HTTPS requests
  if (!event.request.url.match("^(http|https)://")) return;

  const url = new URL(event.request.url);

  // Handle auth-related requests when offline
  if (
    url.pathname === "/auth" ||
    url.pathname.includes("/api/auth/") ||
    url.pathname === "/"
  ) {
    // Use a special strategy for authentication paths
    event.respondWith(handleAuthRequest(event.request));
    return;
  }

  // Ignore other API requests
  if (event.request.url.includes("/api/")) return;

  // Use different strategies for different content
  if (
    CRITICAL_ASSETS.some(
      (asset) => url.pathname === asset || url.pathname.endsWith(asset),
    )
  ) {
    // For critical assets: Cache first, network fallback
    event.respondWith(cacheFirstStrategy(event.request));
  } else if (
    isCacheableUrl(event.request.url) &&
    CACHE_EXTENSIONS.some((ext) => url.pathname.endsWith(ext))
  ) {
    // For static assets: Stale-while-revalidate
    event.respondWith(staleWhileRevalidateStrategy(event.request));
  }
  // Let other requests go to the network directly
});

// Cache-first strategy for critical resources
async function cacheFirstStrategy(request) {
  try {
    await waitForBuildVersion();
    const CACHE_NAME = `static-${buildVersion}`;
    const cache = await caches.open(CACHE_NAME);
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/+|\/+$/g, ""); // Remove leading/trailing slashes

    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;

    // Then try network
    try {
      const networkResponse = await fetch(request);
      if (networkResponse && networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (networkError) {
      // Network failed, but we have a cached response
      const cachedFallback = await cache.match(request);
      if (cachedFallback) return cachedFallback;

      // If homepage request fails and we have no cache, serve offline fallback
      if (
        request.url.endsWith("/") ||
        request.url.endsWith("/index.html") ||
        path
      ) {
        // Create offline URL with 'from' parameter
        const offlineUrl = new URL("/offline.html", self.location.origin);

        // Add the source path as a parameter
        if (path && path !== "offline.html") {
          offlineUrl.searchParams.set("from", path);
        }

        const fallbackCache =
          (await cache.match(offlineUrl.toString())) ||
          (await cache.match("/offline.html"));
        if (fallbackCache) return fallbackCache;
      }

      // No fallback available
      throw networkError;
    }
  } catch (error) {
    // For HTML requests, try to serve a specific offline page
    if (request.headers.get("Accept")?.includes("text/html")) {
      try {
        const url = new URL(request.url);
        const path = url.pathname.replace(/^\/+|\/+$/g, "");
        const cache = await caches.open(`static-${buildVersion}`);

        // Create offline URL with 'from' parameter
        const offlineUrl = new URL("/offline.html", self.location.origin);

        // Add the source path as a parameter
        if (path && path !== "offline.html") {
          offlineUrl.searchParams.set("from", path);
        }

        const fallbackResponse =
          (await cache.match(offlineUrl.toString())) ||
          (await cache.match("/offline.html"));
        if (fallbackResponse) return fallbackResponse;
      } catch (fallbackError) {
        // Fallback failed
      }
    }

    // Return a simple offline response for non-HTML requests
    return new Response(
      `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unreal - Offline</title>
          <style>
            body {
              background-color: #050505;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            .message {
              text-align: center;
              padding: 2rem;
              max-width: 90%;
              width: 450px;
              background-color: #191919;
              border-radius: 16px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
              border: 1px solid #232323;
            }
            h1 {
              margin-bottom: 1rem;
              font-weight: 600;
            }
            p {
              margin-bottom: 1.5rem;
              color: #c1c1c1;
            }
            .button {
              display: inline-block;
              background-color: #5d5d5d;
              color: #ffffff;
              text-decoration: none;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              font-weight: 500;
              border: none;
              cursor: pointer;
            }
          </style>
          <script>
            // Redirect to offline page if available
            window.addEventListener('DOMContentLoaded', function() {
              try {
                window.location.href = '/offline.html';
              } catch (e) {
                // Silent fail
              }
            });
          </script>
        </head>
        <body>
          <div class="message">
            <h1>You're Offline</h1>
            <p>We can't connect to Unreal right now. Check your internet connection and try again.</p>
            <button class="button" onclick="window.location.reload()">Retry</button>
          </div>
        </body>
      </html>`,
      {
        status: 503,
        headers: { "Content-Type": "text/html" },
      },
    );
  }
}

// Stale-while-revalidate for regular assets
async function staleWhileRevalidateStrategy(request) {
  try {
    await waitForBuildVersion();
    const isImage = request.url.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i);
    const CACHE_NAME = isImage
      ? `images-${buildVersion}`
      : `static-${buildVersion}`;
    const cache = await caches.open(CACHE_NAME);

    // Return cached version immediately
    const cachedResponse = await cache.match(request);

    // Update cache in background
    const fetchPromise = fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      })
      .catch((error) => {
        // If we have a cached response, return it
        if (cachedResponse) return cachedResponse;
        throw error;
      });

    // Return cached response if available, otherwise wait for network
    return cachedResponse || fetchPromise;
  } catch (error) {
    // If the request is for an HTML page, try to serve the offline page
    if (request.headers.get("Accept")?.includes("text/html")) {
      try {
        const cache = await caches.open(`static-${buildVersion}`);
        const fallbackResponse = await cache.match("/offline.html");
        if (fallbackResponse) return fallbackResponse;
      } catch (fallbackError) {
        // Fallback failed
      }
    }

    // If we have no fallback, attempt the network one more time
    return fetch(request);
  }
}

// Handle auth requests with offline check
async function handleAuthRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/+|\/+$/g, ""); // Remove leading/trailing slashes

  // First check if we're offline, before any network requests
  if (!self.navigator.onLine) {
    return await serveOfflinePage(path);
  }

  // Try the network first for auth requests
  try {
    return await fetch(request);
  } catch (error) {
    // Network error, likely offline
    return await serveOfflinePage(path);
  }
}

// Helper function to serve offline page with path parameter
async function serveOfflinePage(path = "") {
  try {
    // If offline, try to serve offline page with source path
    const cache = await caches.open(`static-${buildVersion}`);
    const offlineUrl = new URL("/offline.html", self.location.origin);

    // Add the 'from' parameter if we have a path
    if (path && path !== "offline.html") {
      offlineUrl.searchParams.set("from", path);
    }

    // Try to get the offline page from cache
    const fallbackResponse =
      (await cache.match(offlineUrl.toString())) ||
      (await cache.match("/offline.html"));

    if (fallbackResponse) {
      return fallbackResponse;
    }
  } catch (error) {
    // Fallback failed, return a basic offline response
  }

  // Return a simple offline response if all else fails
  return new Response(
    `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unreal - Offline</title>
        <style>
          body {
            background-color: #050505;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          .message {
            text-align: center;
            padding: 2rem;
            max-width: 90%;
            width: 450px;
            background-color: #191919;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            border: 1px solid #232323;
          }
          h1 {
            margin-bottom: 1rem;
            font-weight: 600;
          }
          p {
            margin-bottom: 1.5rem;
            color: #c1c1c1;
          }
          .button {
            display: inline-block;
            background-color: #5d5d5d;
            color: #ffffff;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            border: none;
            cursor: pointer;
          }
        </style>
        <script>
          // Redirect to offline page if available
          window.addEventListener('DOMContentLoaded', function() {
            try {
              window.location.href = '/offline.html';
            } catch (e) {
              // Silent fail
            }
          });
        </script>
      </head>
      <body>
        <div class="message">
          <h1>You're Offline</h1>
          <p>We can't connect to Unreal right now. Check your internet connection and try again.</p>
          <button class="button" onclick="window.location.reload()">Retry</button>
        </div>
      </body>
    </html>`,
    {
      status: 503,
      headers: { "Content-Type": "text/html" },
    },
  );
}
