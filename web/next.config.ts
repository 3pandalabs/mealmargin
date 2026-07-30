import type { NextConfig } from "next";

// Unlike the other 3PandaLabs apps there is no NEXT_PUBLIC_API_URL assertion
// here, because there is no API: every price, fee, coupon and recommendation is
// computed in the browser from the dataset in src/lib/data. If a backend is
// ever added, copy the build-time assertion from evitevault/web/next.config.ts
// verbatim — NEXT_PUBLIC_* is inlined at build time, so an unset value compiles
// a localhost fallback into the bundle instead of failing the build.
const nextConfig: NextConfig = {
  images: { unoptimized: true },
};

export default nextConfig;
