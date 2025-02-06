import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.react-photo-album.com',
        port: '',
        pathname: '/_next/image/**',
        search: '',
      },
    ],
  },
};

export default nextConfig;
