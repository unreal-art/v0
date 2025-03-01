"use client";
import { useEffect } from "react";

export default function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const sendBuildVersion = async (sw: ServiceWorker | null) => {
      if (!sw) return;

      let retries = 5;
      while (retries > 0) {
        try {
          sw.postMessage({
            type: "SET_BUILD_VERSION",
            version: process.env.NEXT_PUBLIC_BUILD_VERSION,
          });
          return;
        } catch (error) {
          console.warn("Retrying to send build version...");
          await new Promise((res) => setTimeout(res, 1000));
          retries--;
        }
      }
    };

    const handleServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          "/service-worker.js"
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
                  sendBuildVersion(registration.active);
                }
              });
            }
          });
        } else {
          sendBuildVersion(sw);
        }
      } catch (error) {
        console.error("Service Worker error:", error);
      }
    };

    handleServiceWorker();

    const onControllerChange = () => window.location.reload();
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
    };
  }, []);

  return null;
}
