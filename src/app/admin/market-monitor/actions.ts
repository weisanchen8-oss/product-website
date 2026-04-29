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