/**
 * 文件作用：
 * 定义后台内容管理相关的服务端写入动作。
 * 当前阶段负责更新单条 SiteContent 内容项，并在写入后刷新相关页面缓存。
 * 保存成功后重定向回编辑页，并附带成功提示参数。
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function updateSiteContentAction(formData: FormData) {
  const idValue = formData.get("id");
  const titleValue = formData.get("title");
  const contentValue = formData.get("content");
  const imageUrlValue = formData.get("imageUrl");
  const extraJsonValue = formData.get("extraJson");

  const id = Number(idValue);

  if (!id || Number.isNaN(id)) {
    throw new Error("无效的内容项 ID。");
  }

  await prisma.siteContent.update({
    where: { id },
    data: {
      title: typeof titleValue === "string" ? titleValue.trim() : "",
      content: typeof contentValue === "string" ? contentValue.trim() : "",
      imageUrl: typeof imageUrlValue === "string" ? imageUrlValue.trim() : "",
      extraJson: typeof extraJsonValue === "string" ? extraJsonValue.trim() : "",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${id}`);
  revalidatePath("/");

  redirect(`/admin/content/${id}?saved=1`);
}