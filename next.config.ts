import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    //TODO: add apple link
    domains: [
      "gateway.mesh3.network",
      "assets.react-photo-album.com",
      "lh3.googleusercontent.com",
      "cdn.discordapp.com",
    ], // ✅ Allow both domains
  },
};

export default nextConfig;
