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
        5000 // Shorter timeout
      )
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
  "/fallback.jpg",
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
        CRITICAL_ASSETS.map((url) => `${url}?v=${buildVersion}`)
      );
    })()
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
        })
      );
    })()
  );
});

self.addEventListener("fetch", (event) => {
  // Ignore non-GET requests
  if (event.request.method !== "GET") return;

  // Only handle HTTP/HTTPS requests
  if (!event.request.url.match("^(http|https)://")) return;

  // Ignore query API requests
  if (event.request.url.includes("/api/")) return;

  const url = new URL(event.request.url);

  // Use different strategies for different content
  if (
    CRITICAL_ASSETS.some(
      (asset) => url.pathname === asset || url.pathname.endsWith(asset)
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

    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;

    // Then try network
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // Return a fallback or offline page if both cache and network fail
    return new Response("Offline", { status: 503 });
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
      .catch(() => {});

    // Return cached response if available, otherwise wait for network
    return cachedResponse || fetchPromise;
  } catch (error) {
    return fetch(request); // Fallback to network
  }
}
