/**
 * 文件作用：
 * 根据当前访问语言加载对应的翻译 JSON 文件。
 * 例如访问 /zh 时加载 messages/zh.json，访问 /en 时加载 messages/en.json。
 */

import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});