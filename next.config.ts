import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Treat CJS-only server packages as externals — prevents Turbopack ESM bundling errors
  serverExternalPackages: ['pdf-parse', 'mammoth'],
};

export default nextConfig;
