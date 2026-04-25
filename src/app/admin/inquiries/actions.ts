/**
 * 文件作用：
 * 定义后台询单管理相关服务端动作。
 * 当前阶段负责更新询单状态，并记录状态变更日志。
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function updateInquiryStatusAction(formData: FormData) {
  const inquiryId = Number(formData.get("inquiryId"));
  const newStatus = String(formData.get("status") ?? "");
  const noteValue = formData.get("note");

  const note =
    typeof noteValue === "string" ? noteValue.trim() : "";

  if (!inquiryId || Number.isNaN(inquiryId)) {
    throw new Error("无效的询单 ID。");
  }

  // 先查旧状态
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    select: { status: true },
  });

  if (!inquiry) {
    throw new Error("询单不存在。");
  }

  const oldStatus = inquiry.status;

  // 更新状态
  await prisma.inquiry.update({
    where: { id: inquiryId },
    data: {
      status: newStatus,
    },
  });

  // 写日志（重点）
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
  const inquiryIdValue = formData.get("inquiryId");
  const adminNoteValue = formData.get("adminNote");

  const inquiryId = Number(inquiryIdValue);
  const adminNote =
    typeof adminNoteValue === "string" ? adminNoteValue.trim() : "";

  if (!inquiryId || Number.isNaN(inquiryId)) {
    throw new Error("无效的询单 ID。");
  }

  await prisma.inquiry.update({
    where: { id: inquiryId },
    data: {
      adminNote,
    },
  });

  await prisma.inquiryLog.create({
    data: {
      inquiryId,
      status: "note_updated",
      note: adminNote || "清空了内部备注。",
      operatorName: "后台工作人员",
    },
  });

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);

  redirect(`/admin/inquiries/${inquiryId}?success=note-updated`);
}