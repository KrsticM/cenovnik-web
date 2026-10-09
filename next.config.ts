import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/prodavnice", destination: "/moji-marketi", permanent: true }];
  },
};

export default nextConfig;
