/**
 * 文件作用：
 * 定义前台国际化路由配置。
 * 当前支持中文 zh 和英文 en，默认语言为 zh。
 * 后台 /admin 不参与语言切换。
 */

import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["zh", "en"],
  defaultLocale: "zh",
  localePrefix: "always",
});