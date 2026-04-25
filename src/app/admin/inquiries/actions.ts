/**
 * 文件作用：
 * 定义后台询单管理相关服务端动作。
 * 支持：
 * - 更新询单状态
 * - 保存内部备注
 * - 新增跟进记录
 * - 标记 / 取消重点客户
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function updateInquiryStatusAction(formData: FormData) {
  const inquiryId = Number(formData.get("inquiryId"));
  const newStatus = String(formData.get("status") ?? "");
  const noteValue = formData.get("note");
  const note = typeof noteValue === "string" ? noteValue.trim() : "";

  if (!inquiryId || Number.isNaN(inquiryId)) {
    throw new Error("无效的询单 ID。");
  }

  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    select: { status: true },
  });

  if (!inquiry) {
    throw new Error("询单不存在。");
  }

  const oldStatus = inquiry.status;

  await prisma.inquiry.update({
    where: { id: inquiryId },
    data: { status: newStatus },
  });

  await prisma.inquiryLog.create({
    data: {
      inquiryId,
      type: "status",
      fromStatus: oldStatus,
      toStatus: newStatus,
      note: note || null,
      operatorName: "管理员",
    },
  });

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);

  redirect(`/admin/inquiries/${inquiryId}?success=status-updated`);
}

export async function updateInquiryAdminNoteAction(formData: FormData) {
  const inquiryId = Number(formData.get("inquiryId"));
  const adminNoteValue = formData.get("adminNote");
  const adminNote =
    typeof adminNoteValue === "string" ? adminNoteValue.trim() : "";

  if (!inquiryId || Number.isNaN(inquiryId)) {
    throw new Error("无效的询单 ID。");
  }

  await prisma.inquiry.update({
    where: { id: inquiryId },
    data: { adminNote },
  });

  await prisma.inquiryLog.create({
    data: {
      inquiryId,
      type: "note",
      status: "note_updated",
      note: adminNote || "清空了内部备注。",
      operatorName: "管理员",
    },
  });

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);

  redirect(`/admin/inquiries/${inquiryId}?success=note-updated`);
}

export async function addInquiryFollowAction(formData: FormData) {
  const inquiryId = Number(formData.get("inquiryId"));
  const contentValue = formData.get("content");
  const content =
    typeof contentValue === "string" ? contentValue.trim() : "";

  if (!inquiryId || Number.isNaN(inquiryId)) {
    throw new Error("无效的询单 ID。");
  }

  if (!content) {
    redirect(`/admin/inquiries/${inquiryId}?error=follow-empty`);
  }

  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    select: { id: true },
  });

  if (!inquiry) {
    throw new Error("询单不存在。");
  }

  await prisma.inquiryLog.create({
    data: {
      inquiryId,
      type: "follow",
      note: content,
      operatorName: "管理员",
    },
  });

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);

  redirect(`/admin/inquiries/${inquiryId}?success=follow-added`);
}

export async function toggleImportantCustomerAction(formData: FormData) {
  const inquiryId = Number(formData.get("inquiryId"));
  const userId = Number(formData.get("userId"));
  const nextImportant = String(formData.get("nextImportant") ?? "") === "true";

  if (!inquiryId || Number.isNaN(inquiryId)) {
    throw new Error("无效的询单 ID。");
  }

  if (!userId || Number.isNaN(userId)) {
    throw new Error("无效的客户 ID。");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      isImportant: nextImportant,
    },
  });

  await prisma.inquiryLog.create({
    data: {
      inquiryId,
      type: "customer",
      note: nextImportant ? "已将该客户标记为重点客户。" : "已取消该客户的重点标记。",
      operatorName: "管理员",
    },
  });

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);

  redirect(
    `/admin/inquiries/${inquiryId}?success=${
      nextImportant ? "customer-important" : "customer-normal"
    }`
  );
}