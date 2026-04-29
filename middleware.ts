/**
 * 文件作用：
 * 处理前台多语言路由。
 * 访问 / 会自动进入默认语言 /zh。
 * /admin、/api、/_next、静态文件不参与多语言处理。
 */

import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!admin|api|_next|_vercel|.*\\..*).*)"],
};