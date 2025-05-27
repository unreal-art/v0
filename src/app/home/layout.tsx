"use client";
import "../globals.css";

import dynamic from "next/dynamic";
import QueryProvider from "../providers/QueryClientProvider";
// import PathnameProvider from "../components/PathnameProvider";
import { ThirdwebProvider } from "thirdweb/react";
import { GenerationStoreProvider } from "../providers/GenerationStoreProvider";
import AppBase from "../components/appBase";
// import GenerationProgress from "./components/generationProgress";

const GenerationProgress = dynamic(
  () => import("./components/generationProgress"),
  { ssr: false },
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      {/* <PathnameProvider> */}
      <ThirdwebProvider>
        <GenerationStoreProvider>
          <>
            <AppBase>{children}</AppBase>
            <GenerationProgress />
          </>
        </GenerationStoreProvider>
      </ThirdwebProvider>
      {/* </PathnameProvider> */}
    </QueryProvider>
  );
}
