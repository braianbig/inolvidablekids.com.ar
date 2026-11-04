import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/consulta", destination: "/consultas", permanent: true }];
  },
};

export default nextConfig;
