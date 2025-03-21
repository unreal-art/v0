import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ServiceWorker from "./components/serviceWorker";
import ProgressBar from "./components/progressBar";
import { HighlightInit } from "@highlight-run/next/client";

const nasalization = localFont({
  src: "./fonts/nasalization/Nasalization Rg.otf",
});

const archivo = localFont({
  src: [
    {
      path: "./fonts/Archivo/Archivo-VariableFont_wdth,wght.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Archivo/Archivo-Italic-VariableFont_wdth,wght.ttf",
      weight: "400",
      style: "italic",
    },
    // {
    //   path: './Roboto-Bold.woff2',
    //   weight: '700',
    //   style: 'normal',
    // },
    // {
    //   path: './Roboto-BoldItalic.woff2',
    //   weight: '700',
    //   style: 'italic',
    // },
  ],
});

export const metadata: Metadata = {
  title: "Unreal Art",
  description: "A place to let your unreal imagination come alive.",
  openGraph: {
    type: "website",
    url: "https://unreal.art",
    title: "Unreal Art",
    description: "A place to let your unreal imagination come alive.",
    siteName: "Unreal",
    images: [
      {
        url: "https://unreal.art/unreal_wordmark.png",
        width: 1200,
        height: 630,
        alt: "unreal art",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    // site: "@YourTwitterHandle",
    // creator: "@YourTwitterHandle",
    title: "Unreal Art",
    description: "A place to let your unreal imagination come alive.",
    images: ["https://unreal.art/unreal_wordmark.png"],
  },
  other: {
    "theme-color": "#191919", // Discord embed color
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`background-color-primary-1 text-primary-11 ${archivo.className} ${nasalization.className}`}
      >
        <ProgressBar />
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
