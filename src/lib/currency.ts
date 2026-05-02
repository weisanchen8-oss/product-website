/**
 * 文件作用：
 * 前台多货币显示工具。
 * 当前以 CNY 为基础价格，英文页面显示 USD 估算价。
 * 如果价格文本无法解析为数字，则原样显示。
 */

import type { FrontendLocale } from "@/lib/frontend-i18n";

const CNY_TO_USD_RATE = 0.142;

function extractNumberFromPriceText(priceText: string | null | undefined) {
  if (!priceText) return null;

  const matched = priceText.replace(/,/g, "").match(/\d+(\.\d+)?/);

  if (!matched) return null;

  const value = Number(matched[0]);

  if (Number.isNaN(value)) return null;

  return value;
}

export function formatLocalizedPrice(
  locale: FrontendLocale,
  priceText: string | null | undefined
) {
  const cnyValue = extractNumberFromPriceText(priceText);

  if (cnyValue === null) {
    return priceText || "";
  }

  if (locale === "en") {
    const usdValue = cnyValue * CNY_TO_USD_RATE;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usdValue);
  }

  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cnyValue);
}