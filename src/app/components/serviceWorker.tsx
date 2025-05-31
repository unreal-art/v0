"use client";
import { useEffect, memo, useState } from "react";
import dynamic from "next/dynamic";
import appConfig from "@/config";

// Dynamically import the OfflineAlert component to avoid SSR issues
const OfflineAlert = dynamic(() => import("./offlineAlert"), {
  ssr: false,
});

function ServiceWorker() {
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const sendBuildVersion = async (sw: ServiceWorker | null) => {
      if (!sw) return;

      try {
        sw.postMessage({
          type: "SET_BUILD_VERSION",
          version: appConfig.app.buildVersion,
        });
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Failed to send build version to service worker");
        }
      }
    };

    // Prefetch offline.html to ensure it's in the cache
    const prefetchOfflinePage = async () => {
      try {
        // Create a hidden iframe to load the offline page
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = "/offline.html";
        document.body.appendChild(iframe);

        // Remove after loading
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch (e) {
            // Ignore errors if already removed
          }
        }, 5000);
      } catch (error) {
        // Silently fail
      }
    };

    const idleCallback =
      window.requestIdleCallback || ((cb) => setTimeout(cb, 1));

    const timeoutDelay = setTimeout(() => {
      idleCallback(async () => {
        try {
          // Register service worker
          const registration = await navigator.serviceWorker.register(
            "/service-worker.js",
            {
              scope: "/",
              updateViaCache: "none",
            }
          );

          setIsRegistered(true);

          let sw =
            registration.waiting ||
            registration.active ||
            registration.installing;

          if (!sw || sw.state === "installing") {
            registration.addEventListener("updatefound", () => {
              if (registration.installing) {
                registration.installing.addEventListener("statechange", () => {
                  if (registration.active) {
                    idleCallback(() => {
                      sendBuildVersion(registration.active);
                      prefetchOfflinePage();
                    });
                  }
                });
              }
            });
          } else {
            idleCallback(() => {
              sendBuildVersion(sw);
              prefetchOfflinePage();
            });
          }
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Service Worker registration error:", error);
          }
        }
      });
    }, 2000);

    const onControllerChange = () => {
      if (document.readyState === "complete") {
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );

    return () => {
      clearTimeout(timeoutDelay);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
    };
  }, []);

  return <OfflineAlert />;
}

export default memo(ServiceWorker);
