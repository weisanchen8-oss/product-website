/**
 * 文件作用：
 * 定义应用的全局根布局，统一挂载全站字体、页面基础结构和全局样式。
 */

import type { Metadata } from "next";
import "./globals.css";
import "./styles/public-layout.css";
import "./styles/public-products.css";
import "./styles/admin-layout.css";
import "./styles/admin-common.css";
import "./styles/admin-dashboard.css";
import "./styles/admin-products.css";
import "./styles/admin-inquiries.css";
import "./styles/admin-customers.css";
import "./styles/admin-logs.css";
import "./styles/admin-promotions.css";
import "./styles/admin-analytics.css";

export const metadata: Metadata = {
  title: "B2B 产品展示与询单平台",
  description: "用于企业产品展示、搜索、推荐和询单管理的 B2B 网站。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}