import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["gateway.mesh3.network", "assets.react-photo-album.com"], // ✅ Allow both domains
  },
};

export default nextConfig;
