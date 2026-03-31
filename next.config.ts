import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Treat CJS-only server packages as externals — prevents Turbopack ESM bundling errors
  serverExternalPackages: ['pdf-parse', 'mammoth'],

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'resume-track-tailor.vercel.app' }],
        destination: 'https://resume-aiagent.vercel.app/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;