/**
 * 文件作用：
 * 定义后台操作日志相关动作。
 * 当前支持：
 * - 分类编辑 / 启用 / 停用的安全回滚
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminLog } from "@/lib/admin-log";

type CategorySnapshot = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
};

function parseCategorySnapshot(value: string | null): CategorySnapshot | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<CategorySnapshot>;

    if (
      typeof parsed.id !== "number" ||
      typeof parsed.name !== "string" ||
      typeof parsed.slug !== "string" ||
      typeof parsed.sortOrder !== "number" ||
      typeof parsed.isActive !== "boolean"
    ) {
      return null;
    }

    return {
      id: parsed.id,
      name: parsed.name,
      slug: parsed.slug,
      description:
        typeof parsed.description === "string" ? parsed.description : null,
      parentId:
        typeof parsed.parentId === "number" ? parsed.parentId : null,
      sortOrder: parsed.sortOrder,
      isActive: parsed.isActive,
    };
  } catch {
    return null;
  }
}

function getCategorySnapshot(category: CategorySnapshot) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parentId: category.parentId,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
  };
}

export async function rollbackCategoryLogAction(formData: FormData) {
  const logId = Number(formData.get("logId"));

  if (!logId || Number.isNaN(logId)) {
    throw new Error("无效的日志 ID。");
  }

  const log = await prisma.adminLog.findUnique({
    where: {
      id: logId,
    },
  });

  if (!log) {
    redirect("/admin/logs?error=log-not-found");
  }

  if (log.module !== "category") {
    redirect(`/admin/logs/${logId}?error=rollback-unsupported`);
  }

  if (!["update", "activate", "deactivate"].includes(log.action)) {
    redirect(`/admin/logs/${logId}?error=rollback-unsupported`);
  }

  const beforeData = parseCategorySnapshot(log.beforeData);

  if (!beforeData) {
    redirect(`/admin/logs/${logId}?error=rollback-missing-snapshot`);
  }

  const currentCategory = await prisma.category.findUnique({
    where: {
      id: beforeData.id,
    },
  });

  if (!currentCategory) {
    redirect(`/admin/logs/${logId}?error=rollback-target-not-found`);
  }

  if (beforeData.parentId === beforeData.id) {
    redirect(`/admin/logs/${logId}?error=rollback-invalid-parent`);
  }

  if (beforeData.parentId) {
    const parentCategory = await prisma.category.findUnique({
      where: {
        id: beforeData.parentId,
      },
    });

    if (!parentCategory) {
      redirect(`/admin/logs/${logId}?error=rollback-parent-not-found`);
    }
  }

  const sameSlugCategory = await prisma.category.findUnique({
    where: {
      slug: beforeData.slug,
    },
  });

  if (sameSlugCategory && sameSlugCategory.id !== beforeData.id) {
    redirect(`/admin/logs/${logId}?error=rollback-slug-conflict`);
  }

  const currentSnapshot = getCategorySnapshot({
    id: currentCategory.id,
    name: currentCategory.name,
    slug: currentCategory.slug,
    description: currentCategory.description,
    parentId: currentCategory.parentId,
    sortOrder: currentCategory.sortOrder,
    isActive: currentCategory.isActive,
  });

  const restoredCategory = await prisma.category.update({
    where: {
      id: beforeData.id,
    },
    data: {
      name: beforeData.name,
      slug: beforeData.slug,
      description: beforeData.description,
      parentId: beforeData.parentId,
      sortOrder: beforeData.sortOrder,
      isActive: beforeData.isActive,
    },
  });

  await createAdminLog({
    module: "category",
    action: "rollback",
    targetId: restoredCategory.id,
    targetName: restoredCategory.name,
    note: `回滚分类操作：${restoredCategory.name}，来源日志 #${log.id}`,
    beforeData: currentSnapshot,
    afterData: getCategorySnapshot({
      id: restoredCategory.id,
      name: restoredCategory.name,
      slug: restoredCategory.slug,
      description: restoredCategory.description,
      parentId: restoredCategory.parentId,
      sortOrder: restoredCategory.sortOrder,
      isActive: restoredCategory.isActive,
    }),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/logs");
  revalidatePath(`/admin/logs/${logId}`);
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${restoredCategory.id}`);
  revalidatePath("/products");
  revalidatePath("/");

  redirect(`/admin/logs/${logId}?success=rollback-success`);
}