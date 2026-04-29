/**
 * 文件作用：
 * 定义行业风险监控模块的后台操作方法。
 * 当前负责新增、更新、启用/停用和删除监控指标，
 * 并在操作完成后刷新或跳转回行业风险监控页面。
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  fetchCurrencyToCnyRate,
  SupportedCurrencyCode,
} from "@/lib/exchange-rate";

function calculateRiskLevel(
  currentValue: number,
  warningThreshold: number,
  dangerThreshold: number,
  compareMode: string
) {
  if (compareMode === "lte") {
    if (currentValue <= dangerThreshold) return "danger";
    if (currentValue <= warningThreshold) return "warning";
    return "normal";
  }

  if (currentValue >= dangerThreshold) return "danger";
  if (currentValue >= warningThreshold) return "warning";
  return "normal";
}

function readIndicatorFormData(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "other");
  const currentValue = Number(formData.get("currentValue"));
  const warningThreshold = Number(formData.get("warningThreshold"));
  const dangerThreshold = Number(formData.get("dangerThreshold"));
  const compareMode = String(formData.get("compareMode") || "gte");
  const unit = String(formData.get("unit") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const isActive = formData.get("isActive") === "on";

  if (!name) {
    throw new Error("指标名称不能为空");
  }

  if (
    Number.isNaN(currentValue) ||
    Number.isNaN(warningThreshold) ||
    Number.isNaN(dangerThreshold)
  ) {
    throw new Error("当前值、预警阈值和高风险阈值必须是数字");
  }

  const riskLevel = calculateRiskLevel(
    currentValue,
    warningThreshold,
    dangerThreshold,
    compareMode
  );

  return {
    name,
    type,
    currentValue,
    warningThreshold,
    dangerThreshold,
    compareMode,
    unit: unit || null,
    description: description || null,
    isActive,
    riskLevel,
  };
}

export async function createMarketMonitorIndicator(formData: FormData) {
  const data = readIndicatorFormData(formData);

  await prisma.marketMonitorIndicator.create({
    data,
  });

  redirect("/admin/market-monitor");
}

export async function updateMarketMonitorIndicator(
  id: string,
  formData: FormData
) {
  const data = readIndicatorFormData(formData);

  await prisma.marketMonitorIndicator.update({
    where: {
      id,
    },
    data,
  });

  redirect("/admin/market-monitor");
}

export async function toggleMarketMonitorIndicator(id: string) {
  const indicator = await prisma.marketMonitorIndicator.findUnique({
    where: {
      id,
    },
  });

  if (!indicator) {
    throw new Error("监控指标不存在");
  }

  await prisma.marketMonitorIndicator.update({
    where: {
      id,
    },
    data: {
      isActive: !indicator.isActive,
    },
  });

  revalidatePath("/admin/market-monitor");
}

export async function deleteMarketMonitorIndicator(id: string) {
  await prisma.marketMonitorIndicator.delete({
    where: {
      id,
    },
  });

  revalidatePath("/admin/market-monitor");
}

async function upsertCurrencyIndicator(currency: SupportedCurrencyCode) {
  const { rate, date, indicatorName } = await fetchCurrencyToCnyRate(currency);

  const existingIndicator = await prisma.marketMonitorIndicator.findFirst({
    where: {
      type: "exchange_rate",
      name: indicatorName,
    },
  });

  if (!existingIndicator) {
    await prisma.marketMonitorIndicator.create({
      data: {
        name: indicatorName,
        type: "exchange_rate",
        currentValue: rate,
        warningThreshold: currency === "USD" ? 7.3 : currency === "EUR" ? 8.0 : 9.0,
        dangerThreshold: currency === "USD" ? 7.4 : currency === "EUR" ? 8.2 : 9.3,
        compareMode: "gte",
        unit: "CNY",
        description: `系统自动获取汇率，数据日期：${date}`,
        isActive: true,
        riskLevel:
          rate >= (currency === "USD" ? 7.4 : currency === "EUR" ? 8.2 : 9.3)
            ? "danger"
            : rate >= (currency === "USD" ? 7.3 : currency === "EUR" ? 8.0 : 9.0)
              ? "warning"
              : "normal",
      },
    });

    return;
  }

  await prisma.marketMonitorIndicator.update({
    where: {
      id: existingIndicator.id,
    },
    data: {
      currentValue: rate,
      description: `系统自动获取汇率，数据日期：${date}`,
      riskLevel:
        rate >= existingIndicator.dangerThreshold
          ? "danger"
          : rate >= existingIndicator.warningThreshold
            ? "warning"
            : "normal",
    },
  });
}

export async function updateUsdToCnyRateFromApi() {
  await upsertCurrencyIndicator("USD");

  revalidatePath("/admin/market-monitor");
  revalidatePath("/admin/dashboard");
}

export async function updateAllCurrencyRatesFromApi() {
  const currencies: SupportedCurrencyCode[] = ["USD", "EUR", "GBP"];

  for (const currency of currencies) {
    await upsertCurrencyIndicator(currency);
  }

  revalidatePath("/admin/market-monitor");
  revalidatePath("/admin/dashboard");
}