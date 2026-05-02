/**
 * 文件作用：
 * 前台语言切换按钮。
 * 切换语言时保留当前浏览页面路径，不再跳回首页。
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FrontendLocale } from "@/lib/frontend-i18n";
import { getLocaleLabel, getOppositeLocale } from "@/lib/frontend-i18n";

export function LanguageSwitcher({ locale }: { locale: FrontendLocale }) {
  const pathname = usePathname();
  const targetLocale = getOppositeLocale(locale);

  const targetPath = pathname.startsWith(`/${locale}`)
    ? pathname.replace(`/${locale}`, `/${targetLocale}`)
    : `/${targetLocale}`;

  return (
    <Link href={targetPath} className="ghost-button">
      {getLocaleLabel(targetLocale)}
    </Link>
  );
}