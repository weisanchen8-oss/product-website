"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminLog } from "@/lib/admin-log";

/**
 * 公共：检查日志是否已回滚
 */
async function assertNotRolledBack(logId: number) {
  const log = await prisma.adminLog.findUnique({
    where: { id: logId },
  });

  if (!log) {
    redirect("/admin/logs?error=log-not-found");
  }

  if (log.rolledBackAt) {
    redirect(`/admin/logs/${logId}?error=already-rolled-back`);
  }

  return log;
}

/**
 * 标记原日志为已回滚
 */
async function markLogRolledBack(logId: number) {
  await prisma.adminLog.update({
    where: { id: logId },
    data: {
      rolledBackAt: new Date(),
    },
  });
}

/**
 * =========================
 * 分类回滚
 * =========================
 */
export async function rollbackCategoryLogAction(formData: FormData) {
  const logId = Number(formData.get("logId"));

  const log = await assertNotRolledBack(logId);

  if (log.module !== "category") {
    redirect(`/admin/logs/${logId}?error=rollback-unsupported`);
  }

  const beforeData = log.beforeData ? JSON.parse(log.beforeData) : null;

  if (!beforeData) {
    redirect(`/admin/logs/${logId}?error=rollback-missing-snapshot`);
  }

  const current = await prisma.category.findUnique({
    where: { id: beforeData.id },
  });

  if (!current) {
    redirect(`/admin/logs/${logId}?error=rollback-target-not-found`);
  }

  const restored = await prisma.category.update({
    where: { id: beforeData.id },
    data: beforeData,
  });

  await createAdminLog({
    module: "category",
    action: "rollback",
    targetId: restored.id,
    targetName: restored.name,
    note: `回滚分类（来源日志#${logId}）`,
    beforeData: current,
    afterData: restored,
    rollbackFromLogId: logId,
  });

  await markLogRolledBack(logId);

  revalidatePath("/admin/logs");
  redirect(`/admin/logs/${logId}?success=rollback-success`);
}

/**
 * =========================
 * 询单回滚
 * =========================
 */
export async function rollbackInquiryLogAction(formData: FormData) {
  const logId = Number(formData.get("logId"));

  const log = await assertNotRolledBack(logId);

  if (log.module !== "inquiry") {
    redirect(`/admin/logs/${logId}?error=rollback-unsupported`);
  }

  const beforeData = log.beforeData ? JSON.parse(log.beforeData) : null;

  if (!beforeData) {
    redirect(`/admin/logs/${logId}?error=rollback-missing-snapshot`);
  }

  const current = await prisma.inquiry.findUnique({
    where: { id: beforeData.id },
  });

  if (!current) {
    redirect(`/admin/logs/${logId}?error=rollback-target-not-found`);
  }

  const restored = await prisma.inquiry.update({
    where: { id: beforeData.id },
    data: {
      status: beforeData.status,
      adminNote: beforeData.adminNote,
    },
  });

  await createAdminLog({
    module: "inquiry",
    action: "rollback",
    targetId: restored.id,
    targetName: restored.inquiryNo,
    note: `回滚询单（来源日志#${logId}）`,
    beforeData: current,
    afterData: restored,
    rollbackFromLogId: logId,
  });

  await markLogRolledBack(logId);

  revalidatePath("/admin/logs");
  redirect(`/admin/logs/${logId}?success=rollback-success`);
}

/**
 * =========================
 * 产品回滚
 * =========================
 */
export async function rollbackProductLogAction(formData: FormData) {
  const logId = Number(formData.get("logId"));

  const log = await assertNotRolledBack(logId);

  if (log.module !== "product") {
    redirect(`/admin/logs/${logId}?error=rollback-unsupported`);
  }

  const beforeData = log.beforeData ? JSON.parse(log.beforeData) : null;

  if (!beforeData) {
    redirect(`/admin/logs/${logId}?error=rollback-missing-snapshot`);
  }

  const current = await prisma.product.findUnique({
    where: { id: beforeData.id },
  });

  if (!current) {
    redirect(`/admin/logs/${logId}?error=rollback-target-not-found`);
  }

  const restored = await prisma.product.update({
    where: { id: beforeData.id },
    data: beforeData,
  });

  await createAdminLog({
    module: "product",
    action: "rollback",
    targetId: restored.id,
    targetName: restored.name,
    note: `回滚产品（来源日志#${logId}）`,
    beforeData: current,
    afterData: restored,
    rollbackFromLogId: logId,
  });

  await markLogRolledBack(logId);

  revalidatePath("/admin/logs");
  redirect(`/admin/logs/${logId}?success=rollback-success`);
}