/**
 * 文件作用：
 * 定义后台产品管理相关的服务端写入动作。
 * 当前阶段负责新增产品和编辑产品，并支持 slug 自动生成、推荐/热销配置和成功反馈。
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import fs from "node:fs/promises";
import path from "node:path";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getUniqueProductSlug(baseSlug: string, currentId?: number) {
  const slug = baseSlug || `product-${Date.now()}`;
  let finalSlug = slug;
  let index = 1;

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug: finalSlug },
    });

    if (!existing || existing.id === currentId) {
      return finalSlug;
    }

    index += 1;
    finalSlug = `${slug}-${index}`;
  }
}

async function getNextFeaturedSort() {
  const maxSort = await prisma.product.aggregate({
    _max: { featuredSort: true },
  });

  return (maxSort._max.featuredSort ?? 0) + 1;
}

async function getNextManualHotSort() {
  const maxSort = await prisma.product.aggregate({
    _max: { manualHotSort: true },
  });

  return (maxSort._max.manualHotSort ?? 0) + 1;
}

function getNumberOrZero(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return 0;
  }

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? 0 : numberValue;
}

function buildSpecsJsonFromFormData(formData: FormData) {
  const keys = formData.getAll("specKey");
  const values = formData.getAll("specValue");

  const specs: Record<string, string> = {};

  keys.forEach((keyItem, index) => {
    const valueItem = values[index];

    const key = typeof keyItem === "string" ? keyItem.trim() : "";
    const value = typeof valueItem === "string" ? valueItem.trim() : "";

    if (key && value) {
      specs[key] = value;
    }
  });

  if (Object.keys(specs).length === 0) {
    return JSON.stringify({
      型号: "待补充",
      规格: "待补充",
      适用场景: "待补充",
    });
  }

  return JSON.stringify(specs);
}

async function getProductPayload(formData: FormData, currentId?: number) {
  const nameValue = formData.get("name");
  const slugValue = formData.get("slug");
  const categoryIdValue = formData.get("categoryId");
  const shortDescValue = formData.get("shortDesc");
  const fullDescValue = formData.get("fullDesc");
  const keywordsValue = formData.get("keywords");
  const priceTextValue = formData.get("priceText");

  const salesCountValue = formData.get("salesCount");
  const featuredSortValue = formData.get("featuredSort");
  const manualHotSortValue = formData.get("manualHotSort");
  const isActiveValue = formData.get("isActive");
  const isFeaturedValue = formData.get("isFeatured");
  const isManualHotValue = formData.get("isManualHot");

  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const slugRaw = typeof slugValue === "string" ? slugValue.trim() : "";
  const categoryId = Number(categoryIdValue);
  const shortDesc = typeof shortDescValue === "string" ? shortDescValue.trim() : "";
  const fullDesc = typeof fullDescValue === "string" ? fullDescValue.trim() : "";
  const keywords = typeof keywordsValue === "string" ? keywordsValue.trim() : "";
  const priceText = typeof priceTextValue === "string" ? priceTextValue.trim() : "";

  const salesCount = getNumberOrZero(salesCountValue);
  const isActive = isActiveValue === "on";
  const isFeatured = isFeaturedValue === "on";
  const isManualHot = isManualHotValue === "on";
  const specsJson = buildSpecsJsonFromFormData(formData);

  if (!name) {
    throw new Error("missing-name");
  }

  if (!categoryId || Number.isNaN(categoryId)) {
    throw new Error("missing-category");
  }

  if (!shortDesc) {
    throw new Error("missing-short-desc");
  }

  if (!priceText) {
    throw new Error("missing-price");
  }

  const baseSlug = normalizeSlug(slugRaw || name) || `product-${Date.now()}`;
  const slug = await getUniqueProductSlug(baseSlug, currentId);

  let featuredSort = 0;
  if (isFeatured) {
    const manualSort = getNumberOrZero(featuredSortValue);
    featuredSort = manualSort || (await getNextFeaturedSort());
  }

  let manualHotSort = 0;
  if (isManualHot) {
    const manualSort = getNumberOrZero(manualHotSortValue);
    manualHotSort = manualSort || (await getNextManualHotSort());
  }

  return {
    name,
    slug,
    categoryId,
    shortDesc,
    fullDesc,
    keywords,
    priceText,
    specsJson,
    salesCount,
    isActive,
    isFeatured,
    featuredSort,
    isManualHot,
    manualHotSort,
  };
}

function getCreateErrorRedirect(error: unknown) {
  if (error instanceof Error) {
    return `/admin/products/new?error=${error.message}`;
  }

  return "/admin/products/new?error=create-failed";
}

function getUpdateErrorRedirect(id: number, error: unknown) {
  if (error instanceof Error) {
    return `/admin/products/${id}?error=${error.message}`;
  }

  return `/admin/products/${id}?error=update-failed`;
}

export async function createProductAction(formData: FormData) {
  let payload: Awaited<ReturnType<typeof getProductPayload>>;

  try {
    payload = await getProductPayload(formData);
  } catch (error) {
    redirect(getCreateErrorRedirect(error));
  }

  try {
    await prisma.product.create({
      data: payload,
    });
  } catch {
    redirect("/admin/products/new?error=create-failed");
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  redirect("/admin/products?success=created");
}

export async function updateProductAction(formData: FormData) {
  const idValue = formData.get("id");
  const id = Number(idValue);

  if (!id || Number.isNaN(id)) {
    throw new Error("无效的产品 ID。");
  }

  let payload: Awaited<ReturnType<typeof getProductPayload>>;

  try {
    payload = await getProductPayload(formData, id);
  } catch (error) {
    redirect(getUpdateErrorRedirect(id, error));
  }

  try {
    await prisma.product.update({
      where: { id },
      data: payload,
    });
  } catch {
    redirect(`/admin/products/${id}?error=update-failed`);
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath(`/product/${payload.slug}`);

  redirect(`/admin/products/${id}?success=updated`);
}

export async function uploadProductImageAction(formData: FormData) {
  const productIdValue = formData.get("productId");
  const fileValue = formData.get("image");

  const productId = Number(productIdValue);

  if (!productId || Number.isNaN(productId)) {
    throw new Error("无效的产品 ID。");
  }

  if (!(fileValue instanceof File) || fileValue.size === 0) {
    redirect(`/admin/products/${productId}?error=missing-image`);
  }

  if (!fileValue.type.startsWith("image/")) {
    redirect(`/admin/products/${productId}?error=invalid-image-type`);
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });

  if (!product) {
    redirect("/admin/products?error=product-not-found");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await fs.mkdir(uploadDir, { recursive: true });

  const fileExtension = fileValue.name.split(".").pop() || "png";
  const fileName = `${product.slug}-${Date.now()}.${fileExtension}`;
  const filePath = path.join(uploadDir, fileName);

  const arrayBuffer = await fileValue.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));

  const publicUrl = `/uploads/products/${fileName}`;
  const shouldBeCover = product.images.length === 0;

  await prisma.productImage.create({
    data: {
      productId,
      originalUrl: publicUrl,
      processedUrl: publicUrl,
      isProcessed: true,
      processingStatus: "success",
      logoApplied: false,
      isCover: shouldBeCover,
      sortOrder: product.images.length + 1,
    },
  });

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/product/${product.slug}`);
  revalidatePath("/");

  redirect(`/admin/products/${productId}?success=image-uploaded`);
}

export async function setProductCoverImageAction(formData: FormData) {
  const productIdValue = formData.get("productId");
  const imageIdValue = formData.get("imageId");

  const productId = Number(productIdValue);
  const imageId = Number(imageIdValue);

  if (!productId || Number.isNaN(productId)) {
    throw new Error("无效的产品 ID。");
  }

  if (!imageId || Number.isNaN(imageId)) {
    throw new Error("无效的图片 ID。");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    redirect("/admin/products?error=product-not-found");
  }

  await prisma.$transaction([
    prisma.productImage.updateMany({
      where: { productId },
      data: { isCover: false },
    }),
    prisma.productImage.update({
      where: { id: imageId },
      data: { isCover: true },
    }),
  ]);

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/product/${product.slug}`);
  revalidatePath("/");

  redirect(`/admin/products/${productId}?success=cover-updated`);
}

export async function deleteProductImageAction(formData: FormData) {
  const productIdValue = formData.get("productId");
  const imageIdValue = formData.get("imageId");

  const productId = Number(productIdValue);
  const imageId = Number(imageIdValue);

  if (!productId || Number.isNaN(productId)) {
    throw new Error("无效的产品 ID。");
  }

  if (!imageId || Number.isNaN(imageId)) {
    throw new Error("无效的图片 ID。");
  }

  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    include: {
      product: true,
    },
  });

  if (!image || image.productId !== productId) {
    redirect(`/admin/products/${productId}?error=image-not-found`);
  }

  const wasCover = image.isCover;
  const imageUrl = image.originalUrl;

  await prisma.productImage.delete({
    where: { id: imageId },
  });

  if (imageUrl.startsWith("/uploads/products/")) {
    const filePath = path.join(process.cwd(), "public", imageUrl);

    try {
      await fs.unlink(filePath);
    } catch {
      // 文件可能已不存在，不影响数据库删除结果
    }
  }

  if (wasCover) {
    const nextImage = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    if (nextImage) {
      await prisma.productImage.update({
        where: { id: nextImage.id },
        data: { isCover: true },
      });
    }
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/product/${image.product.slug}`);
  revalidatePath("/");

  redirect(`/admin/products/${productId}?success=image-deleted`);
}