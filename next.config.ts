/**
 * 文件作用：
 * Next.js 项目配置文件。
 * 当前设置 Server Actions 上传体积限制，支持后台产品图片基础上传。
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;