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
  const inquiryIdValue = formData.get("inquiryId");
  const statusValue = formData.get("status");
  const noteValue = formData.get("note");

  const inquiryId = Number(inquiryIdValue);
  const status = typeof statusValue === "string" ? statusValue : "";
  const note = typeof noteValue === "string" ? noteValue.trim() : "";

  const allowedStatuses = ["pending", "communicating", "completed", "closed"];

  if (!inquiryId || Number.isNaN(inquiryId)) {
    throw new Error("无效的询单 ID。");
  }

  if (!allowedStatuses.includes(status)) {
    redirect(`/admin/inquiries/${inquiryId}?error=invalid-status`);
  }

  await prisma.inquiry.update({
    where: { id: inquiryId },
    data: { status },
  });

  await prisma.inquiryLog.create({
    data: {
      inquiryId,
      status,
      note: note || "后台更新询单状态。",
      operatorName: "后台工作人员",
    },
  });

  revalidatePath("/admin");
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