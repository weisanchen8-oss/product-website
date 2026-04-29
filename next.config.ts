/**
 * 文件作用：
 * Next.js 项目配置文件。
 * - 保留原有 serverActions 上传限制
 * - 接入 next-intl 国际化插件
 */

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// 原有配置（保留！）
const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

// 包装 next-intl
const withNextIntl = createNextIntlPlugin();

// 导出（关键点）
export default withNextIntl(nextConfig);