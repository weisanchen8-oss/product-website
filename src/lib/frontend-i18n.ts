/**
 * 文件作用：
 * 前台国际化工具函数。
 * 统一处理语言判断、语言包读取和前台链接生成。
 * 后台 /admin 不使用该文件。
 */

export type FrontendLocale = "zh" | "en";

export const frontendLocales: FrontendLocale[] = ["zh", "en"];

export function isFrontendLocale(locale: string): locale is FrontendLocale {
  return frontendLocales.includes(locale as FrontendLocale);
}

export function getOppositeLocale(locale: FrontendLocale): FrontendLocale {
  return locale === "zh" ? "en" : "zh";
}

export function getLocaleLabel(locale: FrontendLocale) {
  return locale === "zh" ? "中文" : "English";
}

export function getFrontendPath(locale: FrontendLocale, path = "") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${cleanPath === "/" ? "" : cleanPath}`;
}

export async function getFrontendMessages(locale: FrontendLocale) {
  if (locale === "en") {
    return (await import("../../messages/en.json")).default;
  }

  return (await import("../../messages/zh.json")).default;
}