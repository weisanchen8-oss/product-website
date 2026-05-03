/**
 * 文件作用：
 * 后台管理系统的统一布局入口。
 * 在这里进行管理员权限校验，确保只有管理员可以访问 /admin 下的所有页面。
 */

import { ReactNode } from "react";
import { requireAdminPage } from "@/lib/auth";

export default async function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminPage();

  return <>{children}</>;
}