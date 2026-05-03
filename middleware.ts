/**
 * 文件作用：
 * 处理前台多语言路由。
 * 注意：
 * - /admin 后台页面不在 middleware 中做权限判断，避免和 next-intl 冲突。
 * - 后台权限统一在 src/lib/auth.ts 的 requireAdminPage / requireAdminAction 中处理。
 * - /api 暂不参与多语言处理。
 */

import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!admin|api|_next|_vercel|.*\\..*).*)"],
};