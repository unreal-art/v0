"use client";
import "../globals.css";

import dynamic from "next/dynamic";
import QueryProvider from "../providers/QueryClientProvider";
import PathnameProvider from "../components/PathnameProvider";
import { Suspense, lazy } from "react";
import AppBase from "../components/appBase";

// Use dynamic imports with explicit settings for better code splitting
const ThirdwebProvider = dynamic(
  () => import("thirdweb/react").then((mod) => mod.ThirdwebProvider),
  { ssr: false }
);

const GenerationStoreProvider = dynamic(
  () =>
    import("../providers/GenerationStoreProvider").then(
      (mod) => mod.GenerationStoreProvider
    ),
  { ssr: true }
);

// Lazy load the GenerationProgress component since it's not critical for initial render
const GenerationProgress = dynamic(
  () => import("./components/generationProgress"),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <PathnameProvider>
        <Suspense fallback={<div className="min-h-screen bg-primary-13"></div>}>
          <ThirdwebProvider>
            <GenerationStoreProvider>
              <>
                <AppBase>{children}</AppBase>
                <GenerationProgress />
              </>
            </GenerationStoreProvider>
          </ThirdwebProvider>
        </Suspense>
      </PathnameProvider>
    </QueryProvider>
  );
}
