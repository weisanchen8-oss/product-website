/**
 * 文件作用：
 * 定义后台操作日志相关动作。
 * 当前支持：
 * - 分类编辑 / 启用 / 停用的安全回滚
 * - 询单状态 / 内部备注的安全回滚
 * - 产品编辑 / 上下架 / 推荐 / 热销的安全回滚
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

type InquirySnapshot = {
  id: number;
  inquiryNo: string;
  status: string;
  statusText?: string;
  adminNote: string | null;
  contactName?: string;
  companyName?: string;
  phone?: string;
  email?: string;
};

type ProductSnapshot = {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  shortDesc: string;
  fullDesc: string | null;
  keywords: string | null;
  priceText: string;
  specsJson: string | null;
  salesCount: number;
  isActive: boolean;
  isFeatured: boolean;
  featuredSort: number;
  isManualHot: boolean;
  manualHotSort: number;
};

function parseCategorySnapshot(value: string | null): CategorySnapshot | null {
  if (!value) return null;

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
      parentId: typeof parsed.parentId === "number" ? parsed.parentId : null,
      sortOrder: parsed.sortOrder,
      isActive: parsed.isActive,
    };
  } catch {
    return null;
  }
}

function parseInquirySnapshot(value: string | null): InquirySnapshot | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<InquirySnapshot>;

    if (
      typeof parsed.id !== "number" ||
      typeof parsed.inquiryNo !== "string" ||
      typeof parsed.status !== "string"
    ) {
      return null;
    }

    return {
      id: parsed.id,
      inquiryNo: parsed.inquiryNo,
      status: parsed.status,
      statusText:
        typeof parsed.statusText === "string" ? parsed.statusText : undefined,
      adminNote:
        typeof parsed.adminNote === "string" ? parsed.adminNote : null,
      contactName:
        typeof parsed.contactName === "string" ? parsed.contactName : "",
      companyName:
        typeof parsed.companyName === "string" ? parsed.companyName : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
    };
  } catch {
    return null;
  }
}

function parseProductSnapshot(value: string | null): ProductSnapshot | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<ProductSnapshot>;

    if (
      typeof parsed.id !== "number" ||
      typeof parsed.name !== "string" ||
      typeof parsed.slug !== "string" ||
      typeof parsed.categoryId !== "number" ||
      typeof parsed.shortDesc !== "string" ||
      typeof parsed.priceText !== "string" ||
      typeof parsed.salesCount !== "number" ||
      typeof parsed.isActive !== "boolean" ||
      typeof parsed.isFeatured !== "boolean" ||
      typeof parsed.featuredSort !== "number" ||
      typeof parsed.isManualHot !== "boolean" ||
      typeof parsed.manualHotSort !== "number"
    ) {
      return null;
    }

    return {
      id: parsed.id,
      name: parsed.name,
      slug: parsed.slug,
      categoryId: parsed.categoryId,
      shortDesc: parsed.shortDesc,
      fullDesc: typeof parsed.fullDesc === "string" ? parsed.fullDesc : null,
      keywords: typeof parsed.keywords === "string" ? parsed.keywords : null,
      priceText: parsed.priceText,
      specsJson: typeof parsed.specsJson === "string" ? parsed.specsJson : null,
      salesCount: parsed.salesCount,
      isActive: parsed.isActive,
      isFeatured: parsed.isFeatured,
      featuredSort: parsed.featuredSort,
      isManualHot: parsed.isManualHot,
      manualHotSort: parsed.manualHotSort,
    };
  } catch {
    return null;
  }
}

function getInquiryStatusText(status: string) {
  switch (status) {
    case "pending":
      return "待处理";
    case "contacting":
    case "communicating":
      return "沟通中";
    case "completed":
      return "已完成";
    case "closed":
      return "已关闭";
    default:
      return status || "未知状态";
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

function getInquirySnapshot(inquiry: {
  id: number;
  inquiryNo: string;
  status: string;
  adminNote: string | null;
  contactName: string;
  companyName: string;
  phone: string;
  email: string;
}) {
  return {
    id: inquiry.id,
    inquiryNo: inquiry.inquiryNo,
    status: inquiry.status,
    statusText: getInquiryStatusText(inquiry.status),
    adminNote: inquiry.adminNote,
    contactName: inquiry.contactName,
    companyName: inquiry.companyName,
    phone: inquiry.phone,
    email: inquiry.email,
  };
}

function getProductSnapshot(product: ProductSnapshot) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    shortDesc: product.shortDesc,
    fullDesc: product.fullDesc,
    keywords: product.keywords,
    priceText: product.priceText,
    specsJson: product.specsJson,
    salesCount: product.salesCount,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    featuredSort: product.featuredSort,
    isManualHot: product.isManualHot,
    manualHotSort: product.manualHotSort,
  };
}

export async function rollbackCategoryLogAction(formData: FormData) {
  const logId = Number(formData.get("logId"));

  if (!logId || Number.isNaN(logId)) {
    throw new Error("无效的日志 ID。");
  }

  const log = await prisma.adminLog.findUnique({
    where: { id: logId },
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
    where: { id: beforeData.id },
  });

  if (!currentCategory) {
    redirect(`/admin/logs/${logId}?error=rollback-target-not-found`);
  }

  if (beforeData.parentId === beforeData.id) {
    redirect(`/admin/logs/${logId}?error=rollback-invalid-parent`);
  }

  if (beforeData.parentId) {
    const parentCategory = await prisma.category.findUnique({
      where: { id: beforeData.parentId },
    });

    if (!parentCategory) {
      redirect(`/admin/logs/${logId}?error=rollback-parent-not-found`);
    }
  }

  const sameSlugCategory = await prisma.category.findUnique({
    where: { slug: beforeData.slug },
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
    where: { id: beforeData.id },
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

export async function rollbackInquiryLogAction(formData: FormData) {
  const logId = Number(formData.get("logId"));

  if (!logId || Number.isNaN(logId)) {
    throw new Error("无效的日志 ID。");
  }

  const log = await prisma.adminLog.findUnique({
    where: { id: logId },
  });

  if (!log) {
    redirect("/admin/logs?error=log-not-found");
  }

  if (log.module !== "inquiry") {
    redirect(`/admin/logs/${logId}?error=rollback-unsupported`);
  }

  if (
    !["status_update", "bulk_status_update", "admin_note_update"].includes(
      log.action
    )
  ) {
    redirect(`/admin/logs/${logId}?error=rollback-unsupported`);
  }

  const beforeData = parseInquirySnapshot(log.beforeData);

  if (!beforeData) {
    redirect(`/admin/logs/${logId}?error=rollback-missing-snapshot`);
  }

  const currentInquiry = await prisma.inquiry.findUnique({
    where: { id: beforeData.id },
    select: {
      id: true,
      inquiryNo: true,
      status: true,
      adminNote: true,
      contactName: true,
      companyName: true,
      phone: true,
      email: true,
    },
  });

  if (!currentInquiry) {
    redirect(`/admin/logs/${logId}?error=rollback-target-not-found`);
  }

  const currentSnapshot = getInquirySnapshot(currentInquiry);

  const restoredInquiry = await prisma.inquiry.update({
    where: { id: beforeData.id },
    data: {
      status: beforeData.status,
      adminNote: beforeData.adminNote,
    },
    select: {
      id: true,
      inquiryNo: true,
      status: true,
      adminNote: true,
      contactName: true,
      companyName: true,
      phone: true,
      email: true,
    },
  });

  await prisma.inquiryLog.create({
    data: {
      inquiryId: restoredInquiry.id,
      type: "status",
      fromStatus: currentInquiry.status,
      toStatus: beforeData.status,
      note: `从后台操作日志 #${log.id} 回滚询单状态/备注。`,
      operatorName: "管理员",
    },
  });

  await createAdminLog({
    module: "inquiry",
    action: "rollback",
    targetId: restoredInquiry.id,
    targetName: restoredInquiry.inquiryNo,
    note: `回滚询单操作：${restoredInquiry.inquiryNo}，来源日志 #${log.id}`,
    beforeData: currentSnapshot,
    afterData: getInquirySnapshot(restoredInquiry),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/logs");
  revalidatePath(`/admin/logs/${logId}`);
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${restoredInquiry.id}`);

  redirect(`/admin/logs/${logId}?success=rollback-success`);
}

export async function rollbackProductLogAction(formData: FormData) {
  const logId = Number(formData.get("logId"));

  if (!logId || Number.isNaN(logId)) {
    throw new Error("无效的日志 ID。");
  }

  const log = await prisma.adminLog.findUnique({
    where: { id: logId },
  });

  if (!log) {
    redirect("/admin/logs?error=log-not-found");
  }

  if (log.module !== "product") {
    redirect(`/admin/logs/${logId}?error=rollback-unsupported`);
  }

  if (
    ![
      "update",
      "activate",
      "deactivate",
      "feature",
      "unfeature",
      "hot",
      "unhot",
    ].includes(log.action)
  ) {
    redirect(`/admin/logs/${logId}?error=rollback-unsupported`);
  }

  const beforeData = parseProductSnapshot(log.beforeData);

  if (!beforeData) {
    redirect(`/admin/logs/${logId}?error=rollback-missing-snapshot`);
  }

  const currentProduct = await prisma.product.findUnique({
    where: { id: beforeData.id },
  });

  if (!currentProduct) {
    redirect(`/admin/logs/${logId}?error=rollback-target-not-found`);
  }

  const category = await prisma.category.findUnique({
    where: { id: beforeData.categoryId },
  });

  if (!category) {
    redirect(`/admin/logs/${logId}?error=rollback-category-not-found`);
  }

  const sameSlugProduct = await prisma.product.findUnique({
    where: { slug: beforeData.slug },
  });

  if (sameSlugProduct && sameSlugProduct.id !== beforeData.id) {
    redirect(`/admin/logs/${logId}?error=rollback-slug-conflict`);
  }

  const currentSnapshot = getProductSnapshot({
    id: currentProduct.id,
    name: currentProduct.name,
    slug: currentProduct.slug,
    categoryId: currentProduct.categoryId,
    shortDesc: currentProduct.shortDesc,
    fullDesc: currentProduct.fullDesc,
    keywords: currentProduct.keywords,
    priceText: currentProduct.priceText,
    specsJson: currentProduct.specsJson,
    salesCount: currentProduct.salesCount,
    isActive: currentProduct.isActive,
    isFeatured: currentProduct.isFeatured,
    featuredSort: currentProduct.featuredSort,
    isManualHot: currentProduct.isManualHot,
    manualHotSort: currentProduct.manualHotSort,
  });

  const restoredProduct = await prisma.product.update({
    where: { id: beforeData.id },
    data: {
      name: beforeData.name,
      slug: beforeData.slug,
      categoryId: beforeData.categoryId,
      shortDesc: beforeData.shortDesc,
      fullDesc: beforeData.fullDesc,
      keywords: beforeData.keywords,
      priceText: beforeData.priceText,
      specsJson: beforeData.specsJson,
      salesCount: beforeData.salesCount,
      isActive: beforeData.isActive,
      isFeatured: beforeData.isFeatured,
      featuredSort: beforeData.featuredSort,
      isManualHot: beforeData.isManualHot,
      manualHotSort: beforeData.manualHotSort,
    },
  });

  await createAdminLog({
    module: "product",
    action: "rollback",
    targetId: restoredProduct.id,
    targetName: restoredProduct.name,
    note: `回滚产品操作：${restoredProduct.name}，来源日志 #${log.id}`,
    beforeData: currentSnapshot,
    afterData: getProductSnapshot({
      id: restoredProduct.id,
      name: restoredProduct.name,
      slug: restoredProduct.slug,
      categoryId: restoredProduct.categoryId,
      shortDesc: restoredProduct.shortDesc,
      fullDesc: restoredProduct.fullDesc,
      keywords: restoredProduct.keywords,
      priceText: restoredProduct.priceText,
      specsJson: restoredProduct.specsJson,
      salesCount: restoredProduct.salesCount,
      isActive: restoredProduct.isActive,
      isFeatured: restoredProduct.isFeatured,
      featuredSort: restoredProduct.featuredSort,
      isManualHot: restoredProduct.isManualHot,
      manualHotSort: restoredProduct.manualHotSort,
    }),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/logs");
  revalidatePath(`/admin/logs/${logId}`);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${restoredProduct.id}`);
  revalidatePath("/products");
  revalidatePath(`/product/${currentProduct.slug}`);
  revalidatePath(`/product/${restoredProduct.slug}`);
  revalidatePath("/");

  redirect(`/admin/logs/${logId}?success=rollback-success`);
}

