import {withSentryConfig} from "@sentry/nextjs";
import type { NextConfig } from "next";

// Performance optimized config
const nextConfig: NextConfig = {
  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gateway.mesh3.network",
      },
      {
        protocol: "https",
        hostname: "gateway.lighthouse.storage",
      },
      {
        protocol: "https",
        hostname: "assets.react-photo-album.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname:
          "unreal01.61bc404fed98028e594de8e8bed90315.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "pub-bc2d2d9bc6fb490dbb380efd5781048d.r2.dev",
      },
    ],
    // Use higher image quality format
    formats: ["image/avif", "image/webp"],
    // Optimize memory usage
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  // Add environment variables
  env: {
    // Build
    NEXT_PUBLIC_BUILD_VERSION: `1.0.0-${Date.now()}`,

    // Storage URLs for preconnect
    NEXT_PUBLIC_R2_STORAGE_URL:
      "https://unreal01.61bc404fed98028e594de8e8bed90315.r2.cloudflarestorage.com",

    // Lighthouse gateway
    NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY: "https://gateway.lighthouse.storage/ipfs/",

    // Enable debug by default in development
    NEXT_PUBLIC_DEBUG:
      process.env.NODE_ENV === "development" ? "true" : "false",
  },
  // Enable turbopack for faster dev experience
  experimental: {
    turbo: {
      rules: {
        "*.mdx": ["mdx-loader"],
      },
    },
    // Enable optimizations for faster page transitions
    optimizePackageImports: [
      "react-multi-carousel",
      "framer-motion",
      "gsap",
      "lodash",
      "swiper",
      "react-loading-skeleton",
    ],
    // Optimize CSS for faster processing
    optimizeCss: true,
  },
  // Compress responses for faster delivery
  compress: true,
  // Transpile specific packages that need it
  transpilePackages: ["gsap", "three", "react-share"],
  // Improve production performance
  productionBrowserSourceMaps: false,
  // Disable x-powered-by header
  poweredByHeader: false,
  // Enable caching for faster builds
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5,
  },
  // Minification is now enabled by default in Next.js
  // Removing swcMinify as it's causing errors

  // Improve runtime performance
  reactStrictMode: true,
  // Add page caching
  pageExtensions: ["tsx", "ts", "jsx", "js", "mdx"],
};

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://www.npmjs.com/package/@sentry/webpack-plugin#options

org: "unreal-decenterai",
project: "unreal",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
tunnelRoute: "/monitoring",

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,
});