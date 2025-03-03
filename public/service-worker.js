/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Use IndexedDB or a safer storage for build version persistence
let buildVersion = null;

self.addEventListener("message", (event) => {
  if (event.data?.type === "SET_BUILD_VERSION") {
    buildVersion = event.data.version;
  }
});

// Utility to wait for build version
const waitForBuildVersion = async () => {
  return Promise.race([
    new Promise((resolve) => {
      const check = setInterval(() => {
        if (buildVersion) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    }),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Timeout waiting for build version")),
        10000
      )
    ),
  ]);
};

// Static assets to cache
const STATIC_ASSETS = ["/", "/app/global.css"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      self.skipWaiting(); // Activate new SW immediately

      try {
        await waitForBuildVersion();
      } catch (error) {
        console.warn(error);
        return;
      }

      const CACHE_NAME = `cache-${buildVersion}`;
      const cache = await caches.open(CACHE_NAME);

      await cache.addAll(
        STATIC_ASSETS.map((url) => `${url}?v=${buildVersion}`)
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
        console.warn(error);
        return;
      }

      const cacheKeys = await caches.keys();
      const CURRENT_CACHE = `cache-${self.NEXT_PUBLIC_BUILD_VERSION}`;

      await Promise.all(
        cacheKeys.map((key) => {
          if (key !== CURRENT_CACHE) {
            console.log(`[SW] Deleting old cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (!(event.request.url.match("^(http|https)://"))) return;


  event.respondWith(
    (async () => {
      try {
        await waitForBuildVersion();
      } catch (error) {
        console.warn("Build version missing, skipping cache.");
        return fetch(event.request); // Fetch from network if build version is missing
      }

      const CACHE_NAME = `cache-${self.NEXT_PUBLIC_BUILD_VERSION}`;
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);

      // Try network first
      try {
        const networkResponse = await fetch(event.request);

        // Only cache successful responses
        if (networkResponse && networkResponse.ok) {
          cache.put(event.request, networkResponse.clone());
        }

        return networkResponse;
      } catch (err) {
        console.warn("[SW] Network fetch failed, serving cache if available.");

        // Serve cache as a fallback
        return cachedResponse || new Response("Offline", { status: 503 });
      }
    })()
  );
});
