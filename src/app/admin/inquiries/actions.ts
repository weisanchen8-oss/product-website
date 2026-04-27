/**
 * 文件作用：
 * 定义后台询单管理相关服务端动作。
 * 支持：
 * - 单条更新询单状态
 * - 批量更新询单状态
 * - 保存内部备注
 * - 新增跟进记录
 * - 标记 / 取消重点客户
 * - 写入后台通用操作日志 AdminLog
 * - 记录 beforeData / afterData 快照
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminLog } from "@/lib/admin-log";

const VALID_INQUIRY_STATUSES = ["pending", "contacting", "completed", "closed"];

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

function getSafeRedirectPath(value: FormDataEntryValue | null) {
  const redirectTo = String(value ?? "/admin/inquiries").trim();

  if (redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    return redirectTo;
  }

  return "/admin/inquiries";
}

function appendSuccessParam(path: string, success: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}success=${success}`;
}

function getInquirySnapshot(inquiry: {
  id: number;
  inquiryNo: string;
  status: string;
  adminNote?: string | null;
  contactName?: string;
  companyName?: string;
  phone?: string;
  email?: string;
}) {
  return {
    id: inquiry.id,
    inquiryNo: inquiry.inquiryNo,
    status: inquiry.status,
    statusText: getInquiryStatusText(inquiry.status),
    adminNote: inquiry.adminNote ?? null,
    contactName: inquiry.contactName ?? "",
    companyName: inquiry.companyName ?? "",
    phone: inquiry.phone ?? "",
    email: inquiry.email ?? "",
  };
}

export async function updateInquiryStatusAction(formData: FormData) {
  const inquiryId = Number(formData.get("inquiryId"));
  const newStatus = String(formData.get("status") ?? "");
  const noteValue = formData.get("note");
  const note = typeof noteValue === "string" ? noteValue.trim() : "";

  if (!inquiryId || Number.isNaN(inquiryId)) {
    throw new Error("无效的询单 ID。");
  }

  if (!VALID_INQUIRY_STATUSES.includes(newStatus)) {
    redirect(`/admin/inquiries/${inquiryId}?error=invalid-status`);
  }

  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
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

  if (!inquiry) {
    throw new Error("询单不存在。");
  }

  const oldStatus = inquiry.status;

  const updatedInquiry = await prisma.inquiry.update({
    where: { id: inquiryId },
    data: { status: newStatus },
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
      inquiryId,
      type: "status",
      fromStatus: oldStatus,
      toStatus: newStatus,
      note: note || null,
      operatorName: "管理员",
    },
  });

  await createAdminLog({
    module: "inquiry",
    action: "status_update",
    targetId: inquiry.id,
    targetName: inquiry.inquiryNo,
    note: `更新询单状态：${inquiry.inquiryNo}，${getInquiryStatusText(
      oldStatus
    )} → ${getInquiryStatusText(newStatus)}${note ? `。说明：${note}` : ""}`,
    beforeData: getInquirySnapshot(inquiry),
    afterData: getInquirySnapshot(updatedInquiry),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);

  redirect(`/admin/inquiries/${inquiryId}?success=status-updated`);
}

export async function bulkUpdateInquiryStatusAction(formData: FormData) {
  const inquiryIdValues = formData.getAll("inquiryIds");
  const newStatus = String(formData.get("status") ?? "");
  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"));

  const inquiryIds = inquiryIdValues
    .map((value) => Number(value))
    .filter((id) => id && !Number.isNaN(id));

  if (inquiryIds.length === 0) {
    redirect(appendSuccessParam(redirectTo, "bulk-empty"));
  }

  if (!VALID_INQUIRY_STATUSES.includes(newStatus)) {
    redirect(appendSuccessParam(redirectTo, "bulk-invalid-status"));
  }

  const inquiries = await prisma.inquiry.findMany({
    where: {
      id: {
        in: inquiryIds,
      },
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

  if (inquiries.length === 0) {
    redirect(appendSuccessParam(redirectTo, "bulk-empty"));
  }

  await prisma.inquiry.updateMany({
    where: {
      id: {
        in: inquiries.map((item) => item.id),
      },
    },
    data: {
      status: newStatus,
    },
  });

  await prisma.inquiryLog.createMany({
    data: inquiries.map((item) => ({
      inquiryId: item.id,
      type: "status",
      fromStatus: item.status,
      toStatus: newStatus,
      note: `批量更新状态为：${getInquiryStatusText(newStatus)}`,
      operatorName: "管理员",
    })),
  });

  await Promise.all(
    inquiries.map((item) =>
      createAdminLog({
        module: "inquiry",
        action: "bulk_status_update",
        targetId: item.id,
        targetName: item.inquiryNo,
        note: `批量更新询单状态：${item.inquiryNo}，${getInquiryStatusText(
          item.status
        )} → ${getInquiryStatusText(newStatus)}`,
        beforeData: getInquirySnapshot(item),
        afterData: getInquirySnapshot({
          ...item,
          status: newStatus,
        }),
      })
    )
  );

  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");

  inquiries.forEach((item) => {
    revalidatePath(`/admin/inquiries/${item.id}`);
  });

  redirect(appendSuccessParam(redirectTo, "bulk-status-updated"));
}

export async function updateInquiryAdminNoteAction(formData: FormData) {
  const inquiryId = Number(formData.get("inquiryId"));
  const adminNoteValue = formData.get("adminNote");
  const adminNote =
    typeof adminNoteValue === "string" ? adminNoteValue.trim() : "";

  if (!inquiryId || Number.isNaN(inquiryId)) {
    throw new Error("无效的询单 ID。");
  }

  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
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

  if (!inquiry) {
    throw new Error("询单不存在。");
  }

  const updatedInquiry = await prisma.inquiry.update({
    where: { id: inquiryId },
    data: { adminNote },
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
      inquiryId,
      type: "note",
      status: "note_updated",
      note: adminNote || "清空了内部备注。",
      operatorName: "管理员",
    },
  });

  await createAdminLog({
    module: "inquiry",
    action: "admin_note_update",
    targetId: inquiry.id,
    targetName: inquiry.inquiryNo,
    note: adminNote
      ? `更新询单内部备注：${inquiry.inquiryNo}`
      : `清空询单内部备注：${inquiry.inquiryNo}`,
    beforeData: getInquirySnapshot(inquiry),
    afterData: getInquirySnapshot(updatedInquiry),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);

  redirect(`/admin/inquiries/${inquiryId}?success=note-updated`);
}

export async function addInquiryFollowAction(formData: FormData) {
  const inquiryId = Number(formData.get("inquiryId"));
  const contentValue = formData.get("content");
  const content = typeof contentValue === "string" ? contentValue.trim() : "";

  if (!inquiryId || Number.isNaN(inquiryId)) {
    throw new Error("无效的询单 ID。");
  }

  if (!content) {
    redirect(`/admin/inquiries/${inquiryId}?error=follow-empty`);
  }

  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
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

  await createAdminLog({
    module: "inquiry",
    action: "follow_create",
    targetId: inquiry.id,
    targetName: inquiry.inquiryNo,
    note: `新增询单跟进记录：${inquiry.inquiryNo}。内容：${content}`,
    beforeData: getInquirySnapshot(inquiry),
    afterData: {
      ...getInquirySnapshot(inquiry),
      followNote: content,
    },
  });

  revalidatePath("/admin");
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

  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    select: {
      id: true,
      inquiryNo: true,
      contactName: true,
      companyName: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
          phone: true,
          isImportant: true,
        },
      },
    },
  });

  if (!inquiry) {
    throw new Error("询单不存在。");
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
      note: nextImportant
        ? "已将该客户标记为重点客户。"
        : "已取消该客户的重点标记。",
      operatorName: "管理员",
    },
  });

  await createAdminLog({
    module: "customer",
    action: nextImportant ? "mark_important" : "unmark_important",
    targetId: userId,
    targetName: inquiry.contactName,
    note: nextImportant
      ? `标记重点客户：${inquiry.contactName}（${inquiry.companyName}），来源询单：${inquiry.inquiryNo}`
      : `取消重点客户：${inquiry.contactName}（${inquiry.companyName}），来源询单：${inquiry.inquiryNo}`,
    beforeData: {
      ...inquiry.user,
      isImportant: inquiry.user.isImportant,
    },
    afterData: {
      ...inquiry.user,
      isImportant: nextImportant,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);

  redirect(
    `/admin/inquiries/${inquiryId}?success=${
      nextImportant ? "customer-important" : "customer-normal"
    }`
  );
}