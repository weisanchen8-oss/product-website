/**
 * 文件作用：
 * 前台多语言内容显示工具。
 * 英文页面优先显示英文字段；如果英文为空，则自动回退中文字段。
 */

import type { FrontendLocale } from "@/lib/frontend-i18n";

export function getLocalizedText(
  locale: FrontendLocale,
  zhText: string | null | undefined,
  enText: string | null | undefined
) {
  if (locale === "en" && enText?.trim()) {
    return enText.trim();
  }

  return zhText?.trim() ?? "";
}