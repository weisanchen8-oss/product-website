/**
 * 文件作用：
 * 后台询单管理列表页。
 * 支持：
 * - 状态筛选
 * - 重点询单筛选
 * - 关键词搜索
 * - Excel 导出
 * - 重点客户星标展示
 * - 批量更新询单状态
 */

import Link from "next/link";
import { Prisma } from "@prisma/client";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { InquiryBulkForm } from "@/components/admin/inquiry-bulk-form";
import { prisma } from "@/lib/prisma";

type AdminInquiriesPageProps = {
  searchParams: Promise<{
    status?: string;
    q?: string;
    success?: string;
  }>;
};

const STATUS_OPTIONS = [
  { value: "all", label: "全部" },
  { value: "important", label: "重点询单" },
  { value: "pending", label: "待处理" },
  { value: "contacting", label: "沟通中" },
  { value: "completed", label: "已完成" },
  { value: "closed", label: "已关闭" },
];

function getStatusText(status: string) {
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

function getStatusClassName(status: string) {
  switch (status) {
    case "pending":
      return "admin-status-badge admin-status-pending";
    case "contacting":
    case "communicating":
      return "admin-status-badge admin-status-contacting";
    case "completed":
      return "admin-status-badge admin-status-completed";
    case "closed":
      return "admin-status-badge admin-status-closed";
    default:
      return "admin-status-badge";
  }
}

export default async function AdminInquiriesPage({
  searchParams,
}: AdminInquiriesPageProps) {
  const { status = "all", q = "", success } = await searchParams;
  const keyword = q.trim();

  const whereClause: Prisma.InquiryWhereInput = {};

  if (status === "important") {
    whereClause.user = {
      isImportant: true,
    };
  } else if (status !== "all") {
    whereClause.status =
      status === "contacting"
        ? { in: ["contacting", "communicating"] }
        : status;
  }

  if (keyword) {
    whereClause.OR = [
      { inquiryNo: { contains: keyword } },
      { contactName: { contains: keyword } },
      { companyName: { contains: keyword } },
      { phone: { contains: keyword } },
      { email: { contains: keyword } },
      {
        items: {
          some: {
            productNameSnapshot: {
              contains: keyword,
            },
          },
        },
      },
      {
        items: {
          some: {
            product: {
              keywords: {
                contains: keyword,
              },
            },
          },
        },
      },
    ];
  }

  const inquiries = await prisma.inquiry.findMany({
    where: whereClause,
    orderBy: [{ createdAt: "desc" }],
    include: {
      user: true,
      items: true,
    },
  });

  const exportParams = new URLSearchParams();

  if (status !== "all") {
    exportParams.set("status", status);
  }

  if (keyword) {
    exportParams.set("q", keyword);
  }

  const exportHref = `/admin/inquiries/export${
    exportParams.toString() ? `?${exportParams.toString()}` : ""
  }`;

  const currentParams = new URLSearchParams();

  if (status !== "all") {
    currentParams.set("status", status);
  }

  if (keyword) {
    currentParams.set("q", keyword);
  }

  const currentPath = `/admin/inquiries${
    currentParams.toString() ? `?${currentParams.toString()}` : ""
  }`;

  const bulkItems = inquiries.map((item) => ({
    id: item.id,
    inquiryNo: item.inquiryNo,
    contactName: item.contactName,
    companyName: item.companyName,
    itemCount: item.items.length,
    status: item.status,
    statusText: getStatusText(item.status),
    statusClassName: getStatusClassName(item.status),
    createdAtText: item.createdAt.toLocaleString("zh-CN"),
    isImportant: item.user.isImportant,
  }));

  return (
    <AdminLayout>
      {success === "bulk-status-updated" ? (
        <AdminActionToast message="已批量更新询单状态。" />
      ) : null}

      {success === "bulk-empty" ? (
        <AdminActionToast message="请先选择需要批量处理的询单。" />
      ) : null}

      {success === "bulk-invalid-status" ? (
        <AdminActionToast message="批量更新失败：无效的询单状态。" />
      ) : null}

      <div className="admin-inquiry-header">
        <div>
          <h1>询单管理</h1>
          <p>查看客户提交的询单，按状态和重点客户筛选，并跟进处理进度。</p>
        </div>

        <Link href={exportHref} className="admin-export-button">
          导出 Excel
        </Link>
      </div>

      <section className="admin-inquiry-toolbar">
        <form className="admin-inquiry-search-form">
          <input
            name="q"
            type="search"
            defaultValue={keyword}
            placeholder="搜索询单编号、联系人、公司、电话、邮箱或产品关键词"
          />

          <input type="hidden" name="status" value={status} />

          <button type="submit" className="admin-search-button">
            搜索
          </button>

          <Link href="/admin/inquiries" className="admin-reset-link">
            重置
          </Link>
        </form>

        <div className="admin-status-filter">
          {STATUS_OPTIONS.map((option) => {
            const href =
              option.value === "all"
                ? keyword
                  ? `/admin/inquiries?q=${encodeURIComponent(keyword)}`
                  : "/admin/inquiries"
                : `/admin/inquiries?status=${option.value}${
                    keyword ? `&q=${encodeURIComponent(keyword)}` : ""
                  }`;

            return (
              <Link
                key={option.value}
                href={href}
                className={
                  status === option.value
                    ? option.value === "important"
                      ? "admin-filter-pill admin-filter-pill-important admin-filter-pill-active"
                      : "admin-filter-pill admin-filter-pill-active"
                    : option.value === "important"
                      ? "admin-filter-pill admin-filter-pill-important"
                      : "admin-filter-pill"
                }
              >
                {option.value === "important" ? "⭐ " : ""}
                {option.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="admin-inquiry-table-card">
        <div className="admin-inquiry-table-header">
          <div>
            <h2>询单列表</h2>
            <p>共 {inquiries.length} 条询单记录</p>
          </div>
        </div>

        <InquiryBulkForm inquiries={bulkItems} redirectTo={currentPath} />
      </section>
    </AdminLayout>
  );
}