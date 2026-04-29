/**
 * 文件作用：
 * 前台多语言布局文件。
 * 根据 URL 中的 locale 手动加载对应语言包。
 * 只作用于 /zh 和 /en，后台 /admin 不受影响。
 */

import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

async function getLocaleMessages(locale: string) {
  if (locale === "en") {
    return (await import("../../../messages/en.json")).default;
  }

  if (locale === "zh") {
    return (await import("../../../messages/zh.json")).default;
  }

  return null;
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getLocaleMessages(locale);

  if (!messages) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}