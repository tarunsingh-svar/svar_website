import type { NextConfig } from "next";

const isMarketingBuild = process.env.MARKETING_BUILD === "1";

const nextConfig: NextConfig = {
  ...(isMarketingBuild
    ? {
        output: "export",
        images: { unoptimized: true },
        typescript: { ignoreBuildErrors: true },
      }
    : {}),
};

export default nextConfig;
