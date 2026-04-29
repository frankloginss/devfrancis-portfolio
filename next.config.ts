import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/devfrancis-portfolio",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
