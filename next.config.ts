import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // §AM.3: serve generated assets as AVIF/WebP at ~70 quality.
    formats: ["image/avif", "image/webp"],
    qualities: [70],
  },
};

export default nextConfig;
