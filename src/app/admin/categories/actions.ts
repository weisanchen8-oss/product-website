/**
 * 文件作用：
 * 定义后台分类管理相关的服务端写入动作。
 * 支持：
 * - 新增分类
 * - 编辑分类
 * - 删除分类安全校验
 * - 批量启用 / 停用分类
 * - slug 自动生成
 * - 排序值自动补位
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

export async function createCategoryAction(formData: FormData) {
  const nameValue = formData.get("name");
  const slugValue = formData.get("slug");
  const descriptionValue = formData.get("description");
  const parentIdValue = formData.get("parentId");
  const sortOrderValue = formData.get("sortOrder");
  const isActiveValue = formData.get("isActive");

  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const slugRaw = typeof slugValue === "string" ? slugValue.trim() : "";
  const description =
    typeof descriptionValue === "string" ? descriptionValue.trim() : "";
  const parentId =
    typeof parentIdValue === "string" && parentIdValue
      ? Number(parentIdValue)
      : null;
  const isActive = isActiveValue === "on";

  if (!name) {
    redirect("/admin/categories/new?error=missing-name");
  }

  const baseSlug = normalizeSlug(slugRaw || name);
  const slug = await getUniqueCategorySlug(baseSlug);

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
    await prisma.category.create({
      data: {
        name,
        slug,
        description,
        parentId,
        sortOrder,
        isActive,
      },
    });
  } catch {
    redirect("/admin/categories/new?error=create-failed");
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");

  redirect("/admin/categories?success=created");
}

export async function updateCategoryAction(formData: FormData) {
  const idValue = formData.get("id");
  const nameValue = formData.get("name");
  const slugValue = formData.get("slug");
  const descriptionValue = formData.get("description");
  const parentIdValue = formData.get("parentId");
  const sortOrderValue = formData.get("sortOrder");
  const isActiveValue = formData.get("isActive");

  const id = Number(idValue);
  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const slugRaw = typeof slugValue === "string" ? slugValue.trim() : "";
  const description =
    typeof descriptionValue === "string" ? descriptionValue.trim() : "";
  const parentId =
    typeof parentIdValue === "string" && parentIdValue
      ? Number(parentIdValue)
      : null;
  const sortOrder =
    typeof sortOrderValue === "string" && sortOrderValue.trim()
      ? Number(sortOrderValue)
      : 0;
  const isActive = isActiveValue === "on";

  if (!id || Number.isNaN(id)) {
    throw new Error("无效的分类 ID。");
  }

  if (!name) {
    redirect(`/admin/categories/${id}?error=missing-name`);
  }

  if (parentId === id) {
    redirect(`/admin/categories/${id}?error=invalid-parent`);
  }

  const baseSlug = normalizeSlug(slugRaw || name);
  const slug = await getUniqueCategorySlug(baseSlug, id);

  try {
    await prisma.category.update({
      where: {
        id,
      },
      data: {
        name,
        slug,
        description,
        parentId,
        sortOrder: Number.isNaN(sortOrder) ? 0 : sortOrder,
        isActive,
      },
    });
  } catch {
    redirect(`/admin/categories/${id}?error=update-failed`);
  }

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}`);
  revalidatePath("/products");
  revalidatePath("/");

  redirect(`/admin/categories/${id}?success=updated`);
}

export async function deleteCategoryAction(formData: FormData) {
  const idValue = formData.get("id");
  const id = Number(idValue);

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
    redirect("/admin/categories?success=delete-has-products");
  }

  if (category._count.children > 0) {
    redirect("/admin/categories?success=delete-has-children");
  }

  try {
    await prisma.category.delete({
      where: {
        id,
      },
    });
  } catch {
    redirect("/admin/categories?success=delete-failed");
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");

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

  await prisma.category.updateMany({
    where: {
      id: {
        in: categoryIds,
      },
    },
    data: {
      isActive: bulkAction === "activate",
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");

  redirect(appendSuccessParam(redirectTo, "bulk-updated"));
}