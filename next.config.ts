import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dipakai untuk deploy ke VPS (BUILD_STANDALONE=true npm run build).
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
};

export default nextConfig;
