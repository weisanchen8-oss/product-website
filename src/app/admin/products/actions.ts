/**
 * 文件作用：
 * 定义后台产品管理相关的服务端写入动作。
 * 支持产品新增、编辑、图片管理、AI图片优化、文字水印、Logo水印、批量管理，
 * 并写入 AdminLog 操作日志与 beforeData / afterData 快照。
 */

"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminLog } from "@/lib/admin-log";
import { removeBackgroundWithRemoveBg } from "@/lib/ai-image/providers/removebg";
import { createWhiteBackgroundImage } from "@/lib/ai-image/white-background";
import { createTextWatermarkImage } from "@/lib/ai-image/text-watermark";
import { createLogoWatermarkImage } from "@/lib/ai-image/logo-watermark";

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

function getSafeRedirectPath(value: FormDataEntryValue | null) {
  const redirectTo = String(value ?? "/admin/products").trim();

  if (redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    return redirectTo;
  }

  return "/admin/products";
}

function appendSuccessParam(pathValue: string, success: string) {
  const separator = pathValue.includes("?") ? "&" : "?";
  return `${pathValue}${separator}success=${success}`;
}

function getReadableAiError(message: string) {
  if (!message) {
    return "AI 处理失败，请稍后重试。";
  }

  if (message.includes("unknown_foreground")) {
    return "图片主体不清晰，AI 无法识别。建议使用背景简单、主体明显的产品图片。";
  }

  if (message.includes("missing_source")) {
    return "图片读取失败，请重新上传图片后再试。";
  }

  if (message.includes("402") || message.includes("payment_required")) {
    return "AI 服务额度已用完，请联系管理员处理。";
  }

  if (message.includes("401") || message.includes("Invalid API key")) {
    return "AI 服务配置异常，请联系管理员检查 API Key。";
  }

  if (message.includes("network") || message.includes("fetch")) {
    return "网络异常，AI 处理失败，请稍后再试。";
  }

  return "AI 处理失败，请更换图片或稍后重试。";
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
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const categoryId = Number(formData.get("categoryId"));
  const shortDesc = String(formData.get("shortDesc") ?? "").trim();
  const fullDesc = String(formData.get("fullDesc") ?? "").trim();
  const keywords = String(formData.get("keywords") ?? "").trim();
  const priceText = String(formData.get("priceText") ?? "").trim();
  const salesCount = getNumberOrZero(formData.get("salesCount"));
  const isActive = formData.get("isActive") === "on";
  const isFeatured = formData.get("isFeatured") === "on";
  const isManualHot = formData.get("isManualHot") === "on";
  const specsJson = buildSpecsJsonFromFormData(formData);
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const shortDescEn = String(formData.get("shortDescEn") ?? "").trim();
  const fullDescEn = String(formData.get("fullDescEn") ?? "").trim();

  if (!name) throw new Error("missing-name");
  if (!categoryId || Number.isNaN(categoryId)) throw new Error("missing-category");
  if (!shortDesc) throw new Error("missing-short-desc");
  if (!priceText) throw new Error("missing-price");

  const baseSlug = normalizeSlug(slugRaw || name) || `product-${Date.now()}`;
  const slug = await getUniqueProductSlug(baseSlug, currentId);

  let featuredSort = 0;

  if (isFeatured) {
    const manualSort = getNumberOrZero(formData.get("featuredSort"));
    featuredSort = manualSort || (await getNextFeaturedSort());
  }

  let manualHotSort = 0;

  if (isManualHot) {
    const manualSort = getNumberOrZero(formData.get("manualHotSort"));
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
    nameEn: nameEn || null,
    shortDescEn: shortDescEn || null,
    fullDescEn: fullDescEn || null,
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

async function saveUploadedProductImages(options: {
  productId: number;
  productSlug: string;
  files: File[];
  existingImageCount?: number;
}) {
  const validFiles = options.files.filter(
    (file) => file instanceof File && file.size > 0 && file.type.startsWith("image/")
  );

  if (validFiles.length === 0) {
    return [];
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await fs.mkdir(uploadDir, { recursive: true });

  const createdImages = [];

  for (let index = 0; index < validFiles.length; index += 1) {
    const file = validFiles[index];
    const fileExtension = file.name.split(".").pop() || "png";
    const safeFileName = `${options.productSlug}-${Date.now()}-${index}.${fileExtension}`;
    const filePath = path.join(uploadDir, safeFileName);

    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

    const publicUrl = `/uploads/products/${safeFileName}`;
    const sortOrder = (options.existingImageCount ?? 0) + index + 1;

    const image = await prisma.productImage.create({
      data: {
        productId: options.productId,
        originalUrl: publicUrl,
        processedUrl: null,
        isProcessed: false,
        processingStatus: "idle",
        processingError: null,
        logoApplied: false,
        isCover: sortOrder === 1,
        sortOrder,
      },
    });

    createdImages.push(image);
  }

  return createdImages;
}

async function deleteProductUploadFile(imageUrl: string | null) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/products/")) {
    return;
  }

  const filePath = path.join(process.cwd(), "public", imageUrl);

  try {
    await fs.unlink(filePath);
  } catch {
    // 文件可能已不存在，不影响数据库删除结果
  }
}

function revalidateProductPaths(productSlug?: string, productId?: number) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  if (productId) {
    revalidatePath(`/admin/products/${productId}`);
  }

  if (productSlug) {
    revalidatePath(`/product/${productSlug}`);
  }
}

function getProductSnapshot(product: {
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
}) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    shortDesc: product.shortDesc,
    fullDesc: product.fullDesc,
    keywords: product.keywords,
    priceText: product.priceText,
    specsJson: product.specsJson ?? "",
    salesCount: product.salesCount,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    featuredSort: product.featuredSort,
    isManualHot: product.isManualHot,
    manualHotSort: product.manualHotSort,
  };
}

function getImageSnapshot(image: {
  id: number;
  productId: number;
  originalUrl: string;
  processedUrl: string | null;
  watermarkedUrl?: string | null;
  isProcessed: boolean;
  processingStatus: string;
  logoApplied: boolean;
  isCover: boolean;
  sortOrder: number;
}) {
  return {
    id: image.id,
    productId: image.productId,
    originalUrl: image.originalUrl,
    processedUrl: image.processedUrl,
    watermarkedUrl: image.watermarkedUrl ?? null,
    isProcessed: image.isProcessed,
    processingStatus: image.processingStatus,
    logoApplied: image.logoApplied,
    isCover: image.isCover,
    sortOrder: image.sortOrder,
  };
}

export async function createProductAction(formData: FormData) {
  let payload: Awaited<ReturnType<typeof getProductPayload>>;

  try {
    payload = await getProductPayload(formData);
  } catch (error) {
    redirect(getCreateErrorRedirect(error));
  }

  try {
    const product = await prisma.product.create({
      data: payload,
    });

    const imageFiles = formData
      .getAll("images")
      .filter((item): item is File => item instanceof File);

    const createdImages = await saveUploadedProductImages({
      productId: product.id,
      productSlug: product.slug,
      files: imageFiles,
      existingImageCount: 0,
    });

    await createAdminLog({
      module: "product",
      action: "create",
      targetId: product.id,
      targetName: product.name,
      note: `新增产品：${product.name}`,
      beforeData: null,
      afterData: {
        product: getProductSnapshot(product),
        images: createdImages.map(getImageSnapshot),
      },
    });
  } catch {
    redirect("/admin/products/new?error=create-failed");
  }

  revalidateProductPaths(payload.slug);

  redirect("/admin/products?success=created");
}

export async function updateProductAction(formData: FormData) {
  const id = Number(formData.get("id"));

  if (!id || Number.isNaN(id)) {
    throw new Error("无效的产品 ID。");
  }

  const oldProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!oldProduct) {
    redirect("/admin/products?error=product-not-found");
  }

  let payload: Awaited<ReturnType<typeof getProductPayload>>;

  try {
    payload = await getProductPayload(formData, id);
  } catch (error) {
    redirect(getUpdateErrorRedirect(id, error));
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: payload,
    });

    await createAdminLog({
      module: "product",
      action: "update",
      targetId: product.id,
      targetName: product.name,
      note: `编辑产品：${oldProduct.name} → ${product.name}`,
      beforeData: getProductSnapshot(oldProduct),
      afterData: getProductSnapshot(product),
    });
  } catch {
    redirect(`/admin/products/${id}?error=update-failed`);
  }

  revalidateProductPaths(payload.slug, id);

  if (oldProduct.slug !== payload.slug) {
    revalidatePath(`/product/${oldProduct.slug}`);
  }

  redirect(`/admin/products/${id}?success=updated`);
}

export async function uploadProductImageAction(formData: FormData) {
  const productId = Number(formData.get("productId"));
  const fileValue = formData.get("image");
  const autoAiProcess = formData.get("autoAiProcess") === "on";

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

  const image = await prisma.productImage.create({
    data: {
      productId,
      originalUrl: publicUrl,
      processedUrl: null,
      isProcessed: false,
      processingStatus: "idle",
      processingError: null,
      logoApplied: false,
      isCover: shouldBeCover,
      sortOrder: product.images.length + 1,
    },
  });

  let finalImage = image;

  if (autoAiProcess) {
    try {
      await prisma.productImage.update({
        where: { id: image.id },
        data: {
          processingStatus: "processing",
          processingError: null,
        },
      });

      const transparentBuffer = await removeBackgroundWithRemoveBg(filePath);
      const processedBuffer = await createWhiteBackgroundImage(transparentBuffer);

      const processedFileName = `${product.slug}-${Date.now()}-processed.png`;
      const processedFilePath = path.join(uploadDir, processedFileName);
      const processedPublicUrl = `/uploads/products/${processedFileName}`;

      await fs.writeFile(processedFilePath, processedBuffer);

      finalImage = await prisma.productImage.update({
        where: { id: image.id },
        data: {
          processedUrl: processedPublicUrl,
          isProcessed: true,
          processingStatus: "success",
          processingError: null,
          aiProvider: "removebg",
          processedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("上传后自动 AI 处理错误：", error);

      const rawMessage =
        error instanceof Error ? error.message : "AI 图片处理失败。";

      const message = getReadableAiError(rawMessage);

      finalImage = await prisma.productImage.update({
        where: { id: image.id },
        data: {
          isProcessed: false,
          processingStatus: "failed",
          processingError: message,
        },
      });
    }
  }

  await createAdminLog({
    module: "product",
    action: "image_upload",
    targetId: product.id,
    targetName: product.name,
    note: `上传产品图片：${product.name}`,
    beforeData: {
      product: getProductSnapshot(product),
      image: null,
    },
    afterData: {
      product: getProductSnapshot(product),
      image: getImageSnapshot(finalImage),
    },
  });

  revalidateProductPaths(product.slug, productId);

  redirect(`/admin/products/${productId}?success=image-uploaded`);
}

export async function processProductImageWithAiAction(formData: FormData) {
  const productId = Number(formData.get("productId"));
  const imageId = Number(formData.get("imageId"));

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

  const oldImageSnapshot = getImageSnapshot(image);

  try {
    await prisma.productImage.update({
      where: { id: imageId },
      data: {
        processingStatus: "processing",
        processingError: null,
      },
    });

    const originalFilePath = path.join(
      process.cwd(),
      "public",
      image.originalUrl.replace(/^\/+/, "")
    );

    const transparentBuffer = await removeBackgroundWithRemoveBg(originalFilePath);
    const processedBuffer = await createWhiteBackgroundImage(transparentBuffer);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.mkdir(uploadDir, { recursive: true });

    const processedFileName = `${image.product.slug}-${Date.now()}-processed.png`;
    const processedFilePath = path.join(uploadDir, processedFileName);
    const processedPublicUrl = `/uploads/products/${processedFileName}`;

    await fs.writeFile(processedFilePath, processedBuffer);

    const updatedImage = await prisma.productImage.update({
      where: { id: imageId },
      data: {
        processedUrl: processedPublicUrl,
        isProcessed: true,
        processingStatus: "success",
        processingError: null,
        aiProvider: "removebg",
        processedAt: new Date(),
      },
    });

    await createAdminLog({
      module: "product",
      action: "ai_image_process",
      targetId: image.product.id,
      targetName: image.product.name,
      note: `AI 优化产品图片：${image.product.name}`,
      beforeData: {
        product: getProductSnapshot(image.product),
        image: oldImageSnapshot,
      },
      afterData: {
        product: getProductSnapshot(image.product),
        image: getImageSnapshot(updatedImage),
      },
    });

    revalidateProductPaths(image.product.slug, productId);
  } catch (error) {
    console.error("AI处理错误：", error);

    const rawMessage =
      error instanceof Error ? error.message : "AI 图片处理失败。";

    const message = getReadableAiError(rawMessage);

    await prisma.productImage.update({
      where: { id: imageId },
      data: {
        isProcessed: false,
        processingStatus: "failed",
        processingError: message,
      },
    });

    revalidateProductPaths(image.product.slug, productId);

    redirect(`/admin/products/${productId}?error=ai-image-failed`);
  }

  redirect(`/admin/products/${productId}?success=ai-image-processed`);
}

export async function applyTextWatermarkToProductImageAction(formData: FormData) {
  const productId = Number(formData.get("productId"));
  const imageId = Number(formData.get("imageId"));
  const watermarkText = String(formData.get("watermarkText") ?? "").trim();

  if (!productId || Number.isNaN(productId)) {
    throw new Error("无效的产品 ID。");
  }

  if (!imageId || Number.isNaN(imageId)) {
    throw new Error("无效的图片 ID。");
  }

  if (!watermarkText) {
    redirect(`/admin/products/${productId}?error=missing-watermark-text`);
  }

  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    include: { product: true },
  });

  if (!image || image.productId !== productId) {
    redirect(`/admin/products/${productId}?error=image-not-found`);
  }

  const sourceUrl =
    image.watermarkedUrl ?? image.processedUrl ?? image.originalUrl;

  const sourceFilePath = path.join(
    process.cwd(),
    "public",
    sourceUrl.replace(/^\/+/, "")
  );

  try {
    await fs.access(sourceFilePath);

    const watermarkedBuffer = await createTextWatermarkImage({
      inputFilePath: sourceFilePath,
      watermarkText,
    });

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.mkdir(uploadDir, { recursive: true });

    const watermarkedFileName = `${image.product.slug}-${Date.now()}-watermarked.png`;
    const watermarkedFilePath = path.join(uploadDir, watermarkedFileName);
    const watermarkedPublicUrl = `/uploads/products/${watermarkedFileName}`;

    await fs.writeFile(watermarkedFilePath, watermarkedBuffer);

    const updatedImage = await prisma.productImage.update({
      where: { id: imageId },
      data: {
        watermarkedUrl: watermarkedPublicUrl,
        watermarkType: "text",
        watermarkText,
        watermarkAppliedAt: new Date(),
        logoApplied: true,
      },
    });

    await createAdminLog({
      module: "product",
      action: "image_text_watermark",
      targetId: image.product.id,
      targetName: image.product.name,
      note: `添加文字水印：${image.product.name}`,
      beforeData: {
        product: getProductSnapshot(image.product),
        image: getImageSnapshot(image),
      },
      afterData: {
        product: getProductSnapshot(image.product),
        image: getImageSnapshot(updatedImage),
      },
    });

    revalidateProductPaths(image.product.slug, productId);
  } catch (error) {
    console.error("文字水印处理错误：", error);
    redirect(`/admin/products/${productId}?error=watermark-failed`);
  }

  redirect(`/admin/products/${productId}?success=watermark-applied&count=1`);
}

export async function applyTextWatermarkToSelectedProductImagesAction(
  formData: FormData
) {
  const productId = Number(formData.get("productId"));
  const watermarkText = String(formData.get("watermarkText") ?? "").trim();

  const imageIds = formData
    .getAll("imageIds")
    .map((value) => Number(value))
    .filter((id) => id && !Number.isNaN(id));

  if (!productId || Number.isNaN(productId)) {
    throw new Error("无效的产品 ID。");
  }

  if (!watermarkText) {
    redirect(`/admin/products/${productId}?error=missing-watermark-text`);
  }

  if (imageIds.length === 0) {
    redirect(`/admin/products/${productId}?error=missing-selected-images`);
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    redirect("/admin/products?error=product-not-found");
  }

  let processedCount = 0;

  try {
    const images = await prisma.productImage.findMany({
      where: {
        productId,
        id: {
          in: imageIds,
        },
      },
    });

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.mkdir(uploadDir, { recursive: true });

    for (const image of images) {
      const sourceUrl =
        image.watermarkedUrl ?? image.processedUrl ?? image.originalUrl;

      const sourceFilePath = path.join(
        process.cwd(),
        "public",
        sourceUrl.replace(/^\/+/, "")
      );

      await fs.access(sourceFilePath);

      const watermarkedBuffer = await createTextWatermarkImage({
        inputFilePath: sourceFilePath,
        watermarkText,
      });

      const watermarkedFileName = `${product.slug}-${Date.now()}-${image.id}-watermarked.png`;
      const watermarkedFilePath = path.join(uploadDir, watermarkedFileName);
      const watermarkedPublicUrl = `/uploads/products/${watermarkedFileName}`;

      await fs.writeFile(watermarkedFilePath, watermarkedBuffer);

      await prisma.productImage.update({
        where: { id: image.id },
        data: {
          watermarkedUrl: watermarkedPublicUrl,
          watermarkType: "text",
          watermarkText,
          watermarkAppliedAt: new Date(),
          logoApplied: true,
        },
      });

      processedCount += 1;
    }

    revalidateProductPaths(product.slug, productId);
  } catch (error) {
    console.error("批量文字水印处理错误：", error);
    redirect(`/admin/products/${productId}?error=watermark-failed`);
  }

  redirect(`/admin/products/${productId}?success=watermark-applied&count=${processedCount}`);
}

export async function applyLogoWatermarkToProductImageAction(formData: FormData) {
  const productId = Number(formData.get("productId"));
  const imageId = Number(formData.get("imageId"));
  const logoFileValue = formData.get("logoFile");

  if (!productId || Number.isNaN(productId)) {
    throw new Error("无效的产品 ID。");
  }

  if (!imageId || Number.isNaN(imageId)) {
    throw new Error("无效的图片 ID。");
  }

  if (!(logoFileValue instanceof File) || logoFileValue.size === 0) {
    redirect(`/admin/products/${productId}?error=missing-logo-file`);
  }

  if (!logoFileValue.type.startsWith("image/")) {
    redirect(`/admin/products/${productId}?error=invalid-logo-file`);
  }

  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    include: { product: true },
  });

  if (!image || image.productId !== productId) {
    redirect(`/admin/products/${productId}?error=image-not-found`);
  }

  const sourceUrl =
    image.watermarkedUrl ?? image.processedUrl ?? image.originalUrl;

  const sourceFilePath = path.join(
    process.cwd(),
    "public",
    sourceUrl.replace(/^\/+/, "")
  );

  try {
    await fs.access(sourceFilePath);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.mkdir(uploadDir, { recursive: true });

    const logoExtension = logoFileValue.name.split(".").pop() || "png";
    const logoFileName = `${image.product.slug}-${Date.now()}-logo.${logoExtension}`;
    const logoFilePath = path.join(uploadDir, logoFileName);

    const logoArrayBuffer = await logoFileValue.arrayBuffer();
    await fs.writeFile(logoFilePath, Buffer.from(logoArrayBuffer));

    const watermarkedBuffer = await createLogoWatermarkImage({
      inputFilePath: sourceFilePath,
      logoFilePath,
    });

    const watermarkedFileName = `${image.product.slug}-${Date.now()}-logo-watermarked.png`;
    const watermarkedFilePath = path.join(uploadDir, watermarkedFileName);
    const watermarkedPublicUrl = `/uploads/products/${watermarkedFileName}`;

    await fs.writeFile(watermarkedFilePath, watermarkedBuffer);

    const updatedImage = await prisma.productImage.update({
      where: { id: imageId },
      data: {
        watermarkedUrl: watermarkedPublicUrl,
        watermarkType: "logo",
        watermarkText: null,
        watermarkAppliedAt: new Date(),
        logoApplied: true,
      },
    });

    await createAdminLog({
      module: "product",
      action: "image_logo_watermark",
      targetId: image.product.id,
      targetName: image.product.name,
      note: `添加 Logo 水印：${image.product.name}`,
      beforeData: {
        product: getProductSnapshot(image.product),
        image: getImageSnapshot(image),
      },
      afterData: {
        product: getProductSnapshot(image.product),
        image: getImageSnapshot(updatedImage),
      },
    });

    revalidateProductPaths(image.product.slug, productId);
  } catch (error) {
    console.error("Logo 水印处理错误：", error);
    redirect(`/admin/products/${productId}?error=logo-watermark-failed`);
  }

  redirect(`/admin/products/${productId}?success=logo-watermark-applied&count=1`);
}

export async function applyLogoWatermarkToSelectedProductImagesAction(
  formData: FormData
) {
  const productId = Number(formData.get("productId"));
  const logoFileValue = formData.get("logoFile");

  const imageIds = formData
    .getAll("imageIds")
    .map((value) => Number(value))
    .filter((id) => id && !Number.isNaN(id));

  if (!productId || Number.isNaN(productId)) {
    throw new Error("无效的产品 ID。");
  }

  if (imageIds.length === 0) {
    redirect(`/admin/products/${productId}?error=missing-selected-images`);
  }

  if (!(logoFileValue instanceof File) || logoFileValue.size === 0) {
    redirect(`/admin/products/${productId}?error=missing-logo-file`);
  }

  if (!logoFileValue.type.startsWith("image/")) {
    redirect(`/admin/products/${productId}?error=invalid-logo-file`);
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    redirect("/admin/products?error=product-not-found");
  }

  let processedCount = 0;

  try {
    const images = await prisma.productImage.findMany({
      where: {
        productId,
        id: { in: imageIds },
      },
    });

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.mkdir(uploadDir, { recursive: true });

    const logoExtension = logoFileValue.name.split(".").pop() || "png";
    const logoFileName = `${product.slug}-${Date.now()}-batch-logo.${logoExtension}`;
    const logoFilePath = path.join(uploadDir, logoFileName);

    const logoArrayBuffer = await logoFileValue.arrayBuffer();
    await fs.writeFile(logoFilePath, Buffer.from(logoArrayBuffer));

    for (const image of images) {
      const sourceUrl =
        image.watermarkedUrl ?? image.processedUrl ?? image.originalUrl;

      const sourceFilePath = path.join(
        process.cwd(),
        "public",
        sourceUrl.replace(/^\/+/, "")
      );

      await fs.access(sourceFilePath);

      const watermarkedBuffer = await createLogoWatermarkImage({
        inputFilePath: sourceFilePath,
        logoFilePath,
      });

      const watermarkedFileName = `${product.slug}-${Date.now()}-${image.id}-logo-watermarked.png`;
      const watermarkedFilePath = path.join(uploadDir, watermarkedFileName);
      const watermarkedPublicUrl = `/uploads/products/${watermarkedFileName}`;

      await fs.writeFile(watermarkedFilePath, watermarkedBuffer);

      await prisma.productImage.update({
        where: { id: image.id },
        data: {
          watermarkedUrl: watermarkedPublicUrl,
          watermarkType: "logo",
          watermarkText: null,
          watermarkAppliedAt: new Date(),
          logoApplied: true,
        },
      });

      processedCount += 1;
    }

    revalidateProductPaths(product.slug, productId);
  } catch (error) {
    console.error("批量 Logo 水印处理错误：", error);
    redirect(`/admin/products/${productId}?error=logo-watermark-failed`);
  }

  redirect(`/admin/products/${productId}?success=logo-watermark-applied&count=${processedCount}`);
}

export async function setProductCoverImageAction(formData: FormData) {
  const productId = Number(formData.get("productId"));
  const imageId = Number(formData.get("imageId"));

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

  const oldImages = await prisma.productImage.findMany({
    where: { productId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

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

  const newImages = await prisma.productImage.findMany({
    where: { productId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  await createAdminLog({
    module: "product",
    action: "cover_update",
    targetId: product.id,
    targetName: product.name,
    note: `设置产品封面图：${product.name}`,
    beforeData: {
      product: getProductSnapshot(product),
      images: oldImages.map(getImageSnapshot),
    },
    afterData: {
      product: getProductSnapshot(product),
      images: newImages.map(getImageSnapshot),
    },
  });

  revalidateProductPaths(product.slug, productId);

  redirect(`/admin/products/${productId}?success=cover-updated`);
}

export async function deleteProductImageAction(formData: FormData) {
  const productId = Number(formData.get("productId"));
  const imageId = Number(formData.get("imageId"));

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
  const beforeImageSnapshot = getImageSnapshot(image);

  await prisma.productImage.delete({
    where: { id: imageId },
  });

  await deleteProductUploadFile(image.originalUrl);
  await deleteProductUploadFile(image.processedUrl);
  await deleteProductUploadFile(image.watermarkedUrl);

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

  const remainingImages = await prisma.productImage.findMany({
    where: { productId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  await createAdminLog({
    module: "product",
    action: "image_delete",
    targetId: image.product.id,
    targetName: image.product.name,
    note: `删除产品图片：${image.product.name}`,
    beforeData: {
      product: getProductSnapshot(image.product),
      deletedImage: beforeImageSnapshot,
    },
    afterData: {
      product: getProductSnapshot(image.product),
      images: remainingImages.map(getImageSnapshot),
    },
  });

  revalidateProductPaths(image.product.slug, productId);

  redirect(`/admin/products/${productId}?success=image-deleted`);
}

export async function bulkManageProductsAction(formData: FormData) {
  const productIdValues = formData.getAll("productIds");
  const bulkAction = String(formData.get("bulkAction") ?? "");
  const promotionId = Number(formData.get("promotionId"));
  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"));

  const productIds = productIdValues
    .map((value) => Number(value))
    .filter((id) => id && !Number.isNaN(id));

  if (productIds.length === 0) {
    redirect(appendSuccessParam(redirectTo, "bulk-empty"));
  }

  const validActions = [
    "activate",
    "deactivate",
    "feature",
    "unfeature",
    "hot",
    "unhot",
    "add-promotion",
    "delete",
  ];

  if (!validActions.includes(bulkAction)) {
    redirect(appendSuccessParam(redirectTo, "bulk-invalid-action"));
  }

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    include: {
      images: true,
    },
  });

  if (products.length === 0) {
    redirect(appendSuccessParam(redirectTo, "bulk-empty"));
  }

  if (bulkAction === "add-promotion") {
    if (!promotionId || Number.isNaN(promotionId)) {
      redirect(appendSuccessParam(redirectTo, "bulk-invalid-action"));
    }

    const existingRelations = await prisma.promotionProduct.findMany({
      where: {
        promotionId,
        productId: {
          in: productIds,
        },
      },
      select: {
        productId: true,
      },
    });

    const existingProductIds = existingRelations.map((item) => item.productId);

    const newProductIds = productIds.filter(
      (id) => !existingProductIds.includes(id)
    );

    if (newProductIds.length > 0) {
      await prisma.promotionProduct.createMany({
        data: newProductIds.map((productId) => ({
          promotionId,
          productId,
        })),
      });
    }

    await Promise.all(
      products.map((product) =>
        createAdminLog({
          module: "product",
          action: "add-promotion",
          targetId: product.id,
          targetName: product.name,
          note: `批量加入促销活动：${product.name}`,
          beforeData: getProductSnapshot(product),
          afterData: {
            ...getProductSnapshot(product),
            promotionId,
          },
        })
      )
    );

    revalidateProductPaths();

    redirect(appendSuccessParam(redirectTo, "bulk-updated"));
  }

  if (bulkAction === "delete") {
    const imageUrls = products.flatMap((product) =>
      product.images.flatMap((image) => [
        image.originalUrl,
        image.processedUrl,
        image.watermarkedUrl,
      ])
    );

    await prisma.productImage.deleteMany({
      where: {
        productId: {
          in: productIds,
        },
      },
    });

    await prisma.product.deleteMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    await Promise.all(imageUrls.map((url) => deleteProductUploadFile(url)));

    await Promise.all(
      products.map((product) =>
        createAdminLog({
          module: "product",
          action: "delete",
          targetId: product.id,
          targetName: product.name,
          note: `批量删除产品：${product.name}`,
          beforeData: {
            product: getProductSnapshot(product),
            images: product.images.map(getImageSnapshot),
          },
          afterData: null,
        })
      )
    );

    revalidateProductPaths();

    redirect(appendSuccessParam(redirectTo, "bulk-deleted"));
  }

  const actionMap: Record<
    string,
    {
      data: {
        isActive?: boolean;
        isFeatured?: boolean;
        featuredSort?: number;
        isManualHot?: boolean;
        manualHotSort?: number;
      };
      actionText: string;
    }
  > = {
    activate: {
      data: { isActive: true },
      actionText: "批量上架产品",
    },
    deactivate: {
      data: { isActive: false },
      actionText: "批量下架产品",
    },
    feature: {
      data: { isFeatured: true },
      actionText: "批量设为推荐产品",
    },
    unfeature: {
      data: {
        isFeatured: false,
        featuredSort: 0,
      },
      actionText: "批量取消推荐产品",
    },
    hot: {
      data: { isManualHot: true },
      actionText: "批量设为热销产品",
    },
    unhot: {
      data: {
        isManualHot: false,
        manualHotSort: 0,
      },
      actionText: "批量取消热销产品",
    },
  };

  const matchedAction = actionMap[bulkAction];

  await prisma.product.updateMany({
    where: {
      id: {
        in: productIds,
      },
    },
    data: matchedAction.data,
  });

  await Promise.all(
    products.map((product) =>
      createAdminLog({
        module: "product",
        action: bulkAction,
        targetId: product.id,
        targetName: product.name,
        note: `${matchedAction.actionText}：${product.name}`,
        beforeData: getProductSnapshot(product),
        afterData: {
          ...getProductSnapshot(product),
          ...matchedAction.data,
        },
      })
    )
  );

  revalidateProductPaths();

  redirect(appendSuccessParam(redirectTo, "bulk-updated"));
}