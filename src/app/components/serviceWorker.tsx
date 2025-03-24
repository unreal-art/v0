"use client";
import { useEffect, memo } from "react";

function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const sendBuildVersion = async (sw: ServiceWorker | null) => {
      if (!sw) return;

      try {
        sw.postMessage({
          type: "SET_BUILD_VERSION",
          version: process.env.NEXT_PUBLIC_BUILD_VERSION,
        });
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Failed to send build version to service worker");
        }
      }
    };

    const idleCallback =
      window.requestIdleCallback || ((cb) => setTimeout(cb, 1));

    const timeoutDelay = setTimeout(() => {
      idleCallback(async () => {
        try {
          const registration = await navigator.serviceWorker.register(
            "/service-worker.js",
            {
              scope: "/",
              updateViaCache: "none",
            }
          );

          let sw =
            registration.waiting ||
            registration.active ||
            registration.installing;

          if (!sw || sw.state === "installing") {
            registration.addEventListener("updatefound", () => {
              if (registration.installing) {
                registration.installing.addEventListener("statechange", () => {
                  if (registration.active) {
                    idleCallback(() => sendBuildVersion(registration.active));
                  }
                });
              }
            });
          } else {
            idleCallback(() => sendBuildVersion(sw));
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

  return null;
}

export default memo(ServiceWorker);
