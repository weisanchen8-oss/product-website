/**
 * 文件作用：
 * 定义后台内容管理相关的服务端写入动作。
 * 负责更新单条 SiteContent 内容项。
 * 支持：
 * - 标题更新
 * - 正文更新
 * - 图片地址更新
 * - Vercel Blob 图片上传更新
 * - 附加 JSON 配置校验
 */

"use server";

import path from "path";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function normalizeTextValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidJsonText(value: string) {
  if (!value) return true;

  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

function getFileExtension(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  return extension || ".jpg";
}

async function saveUploadedContentImage(file: File) {
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

  const extension = getFileExtension(file.name);
  const fileName = `content/content-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}${extension}`;

  const blob = await put(fileName, file, {
    access: "public",
    contentType: file.type || "application/octet-stream",
  });

  return blob.url;
}

export async function updateSiteContentAction(formData: FormData) {
  const idValue = formData.get("id");
  const titleValue = formData.get("title");
  const contentValue = formData.get("content");
  const imageUrlValue = formData.get("imageUrl");
  const imageFileValue = formData.get("imageFile");
  const extraJsonValue = formData.get("extraJson");
  const titleEnValue = formData.get("titleEn");
  const contentEnValue = formData.get("contentEn");
  const extraJsonEnValue = formData.get("extraJsonEn");

  const id = Number(idValue);

  if (!id || Number.isNaN(id)) {
    throw new Error("无效的内容项 ID。");
  }

  const title = normalizeTextValue(titleValue);
  const content = normalizeTextValue(contentValue);
  const manualImageUrl = normalizeTextValue(imageUrlValue);
  const extraJson = normalizeTextValue(extraJsonValue);
  const titleEn = normalizeTextValue(titleEnValue);
  const contentEn = normalizeTextValue(contentEnValue);
  const extraJsonEn = normalizeTextValue(extraJsonEnValue);

  if (!isValidJsonText(extraJson) || !isValidJsonText(extraJsonEn)) {
    redirect(`/admin/content/${id}?error=invalid-json`);
  }

  let finalImageUrl = manualImageUrl;

  if (imageFileValue instanceof File && imageFileValue.size > 0) {
    finalImageUrl = await saveUploadedContentImage(imageFileValue);
  }

  await prisma.siteContent.update({
    where: { id },
    data: {
      title,
      titleEn,
      content,
      contentEn,
      imageUrl: finalImageUrl,
      extraJson,
      extraJsonEn,
    },
  });

  revalidatePath("/");
  revalidatePath("/zh");
  revalidatePath("/en");
  revalidatePath("/admin");
  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${id}`);

  redirect(`/admin/content/${id}?saved=1`);
}