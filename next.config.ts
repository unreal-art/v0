import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  },
  env: {
    NEXT_PUBLIC_BUILD_VERSION: `1.0.0-${Date.now()}`,
  },
};

export default nextConfig;

// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     //TODO: add apple link
//     domains: [
//       "gateway.mesh3.network",
//       "gateway.lighthouse.storage",
//       "assets.react-photo-album.com",
//       "lh3.googleusercontent.com",
//       "cdn.discordapp.com",
//     ], // ✅ Allow both domains
//   },
//   env: {
//     NEXT_PUBLIC_BUILD_VERSION: `1.0.0-${Date.now()}`,
//   },
// };

// export default nextConfig;
