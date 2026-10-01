import type { NextConfig } from "next";

/**
 * Hero images are uploaded to S3 and served from the bucket (or its CDN alias), so
 * next/image needs that host allowlisted. Driven by env rather than hardcoded, since
 * the bucket differs per environment.
 *
 * `NEXT_PUBLIC_IMAGE_HOST` is a bare hostname, e.g.
 *   mitsutama-compro.s3.ap-southeast-1.amazonaws.com
 *   cdn.mitsutama.co.id
 */
const imageHost = process.env.NEXT_PUBLIC_IMAGE_HOST?.trim();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: imageHost
      ? [{ protocol: "https", hostname: imageHost, pathname: "/**" }]
      : [],
  },
};

export default nextConfig;
