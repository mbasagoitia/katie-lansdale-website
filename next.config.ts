import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/images/**",
      },
      {
        pathname: "/images/art/violin-stock.jpg",
        search: "?v=20260929200012",
      },
    ],
    remotePatterns: [
      {protocol: "https", hostname: "cdn.sanity.io"},
      {protocol: "https", hostname: "images.squarespace-cdn.com"},
      {protocol: "https", hostname: "i0.wp.com"},
      {protocol: "https", hostname: "www.hartford.edu"},
    ],
  },
};

export default nextConfig;
