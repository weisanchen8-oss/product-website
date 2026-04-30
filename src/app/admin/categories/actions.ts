/**
 * 文件作用：
 * 定义后台分类管理相关的服务端写入动作。
 * 支持：
 * - 新增分类
 * - 编辑分类
 * - 分类图标地址保存
 * - 分类图标本地上传
 * - 删除当前分类图标
 * - 删除分类安全校验
 * - 批量启用 / 停用分类
 * - 写入后台通用操作日志 AdminLog
 * - 记录 beforeData / afterData 快照
 */

"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminLog } from "@/lib/admin-log";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSafeRedirectPath(value: FormDataEntryValue | null) {
  const redirectTo = String(value ?? "/admin/categories").trim();

  if (redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    return redirectTo;
  }

  return "/admin/categories";
}

function appendSuccessParam(pathValue: string, success: string) {
  const separator = pathValue.includes("?") ? "&" : "?";
  return `${pathValue}${separator}success=${success}`;
}

async function getNextCategorySortOrder() {
  const maxSort = await prisma.category.aggregate({
    _max: {
      sortOrder: true,
    },
  });

  return (maxSort._max.sortOrder ?? 0) + 1;
}

async function getUniqueCategorySlug(baseSlug: string, currentId?: number) {
  const slug = baseSlug || `category-${Date.now()}`;
  let finalSlug = slug;
  let index = 1;

  while (true) {
    const existing = await prisma.category.findUnique({
      where: {
        slug: finalSlug,
      },
    });

    if (!existing || existing.id === currentId) {
      return finalSlug;
    }

    index += 1;
    finalSlug = `${slug}-${index}`;
  }
}

function getFileExtension(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  return extension || ".jpg";
}

async function saveUploadedCategoryImage(file: File) {
  if (!file || file.size <= 0) {
    return "";
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("仅支持 jpg、png、webp、svg 图片。");
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error("图片不能超过 5MB。");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "categories");
  await mkdir(uploadDir, { recursive: true });

  const extension = getFileExtension(file.name);
  const fileName = `category-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}${extension}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await writeFile(path.join(uploadDir, fileName), buffer);

  return `/uploads/categories/${fileName}`;
}

function getCategorySnapshot(category: {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
}) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    parentId: category.parentId,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
  };
}

export async function createCategoryAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrlRaw = String(formData.get("imageUrl") ?? "").trim();
  const imageFileValue = formData.get("imageFile");
  const parentIdValue = formData.get("parentId");
  const sortOrderValue = formData.get("sortOrder");
  const isActive = formData.get("isActive") === "on";
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const descriptionEn = String(formData.get("descriptionEn") ?? "").trim();

  const parentId =
    typeof parentIdValue === "string" && parentIdValue
      ? Number(parentIdValue)
      : null;

  if (!name) {
    redirect("/admin/categories/new?error=missing-name");
  }

  const baseSlug = normalizeSlug(slugRaw || name);
  const slug = await getUniqueCategorySlug(baseSlug);

  let finalImageUrl = imageUrlRaw;

  if (imageFileValue instanceof File && imageFileValue.size > 0) {
    finalImageUrl = await saveUploadedCategoryImage(imageFileValue);
  }

  let sortOrder: number;

  if (typeof sortOrderValue === "string" && sortOrderValue.trim()) {
    const manualSortOrder = Number(sortOrderValue);
    sortOrder = Number.isNaN(manualSortOrder)
      ? await getNextCategorySortOrder()
      : manualSortOrder;
  } else {
    sortOrder = await getNextCategorySortOrder();
  }

  try {
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        imageUrl: finalImageUrl,
        parentId,
        sortOrder,
        isActive,
        nameEn: nameEn || null,
        descriptionEn: descriptionEn || null,
      },
    });

    await createAdminLog({
      module: "category",
      action: "create",
      targetId: category.id,
      targetName: category.name,
      note: `新增分类：${category.name}`,
      beforeData: null,
      afterData: getCategorySnapshot(category),
    });
  } catch {
    redirect("/admin/categories/new?error=create-failed");
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/admin");

  redirect("/admin/categories?success=created");
}

export async function updateCategoryAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrlRaw = String(formData.get("imageUrl") ?? "").trim();
  const imageFileValue = formData.get("imageFile");
  const removeImage = formData.get("removeImage") === "1";
  const parentIdValue = formData.get("parentId");
  const sortOrderValue = formData.get("sortOrder");
  const isActive = formData.get("isActive") === "on";

  const parentId =
    typeof parentIdValue === "string" && parentIdValue
      ? Number(parentIdValue)
      : null;

  const sortOrder =
    typeof sortOrderValue === "string" && sortOrderValue.trim()
      ? Number(sortOrderValue)
      : 0;

  if (!id || Number.isNaN(id)) {
    throw new Error("无效的分类 ID。");
  }

  if (!name) {
    redirect(`/admin/categories/${id}?error=missing-name`);
  }

  if (parentId === id) {
    redirect(`/admin/categories/${id}?error=invalid-parent`);
  }

  const oldCategory = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!oldCategory) {
    redirect("/admin/categories?success=delete-not-found");
  }

  const baseSlug = normalizeSlug(slugRaw || name);
  const slug = await getUniqueCategorySlug(baseSlug, id);

  let finalImageUrl = imageUrlRaw;

  if (removeImage) {
    finalImageUrl = "";
  }

  if (imageFileValue instanceof File && imageFileValue.size > 0) {
    finalImageUrl = await saveUploadedCategoryImage(imageFileValue);
  }

  try {
    const category = await prisma.category.update({
      where: {
        id,
      },
      data: {
        name,
        slug,
        description,
        imageUrl: finalImageUrl,
        parentId,
        sortOrder: Number.isNaN(sortOrder) ? 0 : sortOrder,
        isActive,
      },
    });

    await createAdminLog({
      module: "category",
      action: "update",
      targetId: category.id,
      targetName: category.name,
      note: `编辑分类：${oldCategory.name} → ${category.name}`,
      beforeData: getCategorySnapshot(oldCategory),
      afterData: getCategorySnapshot(category),
    });
  } catch {
    redirect(`/admin/categories/${id}?error=update-failed`);
  }

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}`);
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/admin");

  redirect(`/admin/categories/${id}?success=updated`);
}

export async function deleteCategoryAction(formData: FormData) {
  const id = Number(formData.get("id"));

  if (!id || Number.isNaN(id)) {
    throw new Error("无效的分类 ID。");
  }

  const category = await prisma.category.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
    },
  });

  if (!category) {
    redirect("/admin/categories?success=delete-not-found");
  }

  if (category._count.products > 0) {
    await createAdminLog({
      module: "category",
      action: "delete_blocked",
      targetId: category.id,
      targetName: category.name,
      note: `尝试删除分类失败：${category.name} 下仍有 ${category._count.products} 个产品。`,
      beforeData: getCategorySnapshot(category),
      afterData: getCategorySnapshot(category),
    });

    redirect("/admin/categories?success=delete-has-products");
  }

  if (category._count.children > 0) {
    await createAdminLog({
      module: "category",
      action: "delete_blocked",
      targetId: category.id,
      targetName: category.name,
      note: `尝试删除分类失败：${category.name} 下仍有 ${category._count.children} 个子分类。`,
      beforeData: getCategorySnapshot(category),
      afterData: getCategorySnapshot(category),
    });

    redirect("/admin/categories?success=delete-has-children");
  }

  try {
    await prisma.category.delete({
      where: {
        id,
      },
    });

    await createAdminLog({
      module: "category",
      action: "delete",
      targetId: category.id,
      targetName: category.name,
      note: `删除分类：${category.name}`,
      beforeData: getCategorySnapshot(category),
      afterData: null,
    });
  } catch {
    redirect("/admin/categories?success=delete-failed");
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/admin");

  redirect("/admin/categories?success=deleted");
}

export async function bulkUpdateCategoryStatusAction(formData: FormData) {
  const categoryIdValues = formData.getAll("categoryIds");
  const bulkAction = String(formData.get("bulkAction") ?? "");
  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"));

  const categoryIds = categoryIdValues
    .map((value) => Number(value))
    .filter((id) => id && !Number.isNaN(id));

  if (categoryIds.length === 0) {
    redirect(appendSuccessParam(redirectTo, "bulk-empty"));
  }

  if (!["activate", "deactivate"].includes(bulkAction)) {
    redirect(appendSuccessParam(redirectTo, "bulk-invalid-action"));
  }

  const categories = await prisma.category.findMany({
    where: {
      id: {
        in: categoryIds,
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      parentId: true,
      sortOrder: true,
      isActive: true,
    },
  });

  const nextIsActive = bulkAction === "activate";

  await prisma.category.updateMany({
    where: {
      id: {
        in: categoryIds,
      },
    },
    data: {
      isActive: nextIsActive,
    },
  });

  const actionText = bulkAction === "activate" ? "启用" : "停用";

  await Promise.all(
    categories.map((category) =>
      createAdminLog({
        module: "category",
        action: bulkAction,
        targetId: category.id,
        targetName: category.name,
        note: `批量${actionText}分类：${category.name}`,
        beforeData: getCategorySnapshot(category),
        afterData: {
          ...getCategorySnapshot(category),
          isActive: nextIsActive,
        },
      })
    )
  );

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/admin");

  redirect(appendSuccessParam(redirectTo, "bulk-updated"));
}