/**
 * 文件作用：
 * 封装公开汇率 API 的读取逻辑。
 * 当前使用 open.er-api.com 免费汇率接口获取指定币种兑人民币汇率。
 * 支持 USD、EUR、GBP 等币种扩展。
 */

type ExchangeRateApiResponse = {
  result?: string;
  time_last_update_utc?: string;
  rates?: Record<string, number>;
};

export type SupportedCurrencyCode = "USD" | "EUR" | "GBP";

const currencyNameMap: Record<SupportedCurrencyCode, string> = {
  USD: "美元",
  EUR: "欧元",
  GBP: "英镑",
};

export function getCurrencyIndicatorName(currency: SupportedCurrencyCode) {
  return `${currencyNameMap[currency]}兑人民币汇率`;
}

export async function fetchCurrencyToCnyRate(currency: SupportedCurrencyCode) {
  const response = await fetch(
    `https://open.er-api.com/v6/latest/${currency}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`获取${currencyNameMap[currency]}汇率失败，状态码：${response.status}`);
  }

  const data = (await response.json()) as ExchangeRateApiResponse;
  const rate = Number(data.rates?.CNY);

  if (!Number.isFinite(rate)) {
    console.error(`${currencyNameMap[currency]}汇率接口返回内容：`, data);
    throw new Error(`${currencyNameMap[currency]}汇率数据格式异常，请查看终端中的接口返回内容`);
  }

  return {
    currency,
    currencyName: currencyNameMap[currency],
    indicatorName: getCurrencyIndicatorName(currency),
    rate,
    date: data.time_last_update_utc || new Date().toISOString(),
  };
}

export async function fetchUsdToCnyRate() {
  return fetchCurrencyToCnyRate("USD");
}