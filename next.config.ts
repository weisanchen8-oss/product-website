import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // ✅ 关键：允许加载 Vercel Blob 图片
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oq47zyadbt4jkg4l.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);