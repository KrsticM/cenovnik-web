import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Not permanent: Moji marketi is a dialog for now and may become a page again (maps).
  async redirects() {
    return [
      { source: "/prodavnice", destination: "/proizvodi?moji-marketi=1", permanent: false },
      { source: "/moji-marketi", destination: "/proizvodi?moji-marketi=1", permanent: false },
    ];
  },
};

export default nextConfig;
