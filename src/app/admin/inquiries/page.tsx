/**
 * 文件作用：
 * 定义后台询单管理列表页。
 * 当前版本支持：
 * - 状态筛选
 * - 关键词搜索
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Prisma } from "@prisma/client";

type AdminInquiriesPageProps = {
  searchParams: Promise<{
    status?: string;
    q?: string;
  }>;
};

const STATUS_OPTIONS = [
  { value: "all", label: "全部" },
  { value: "pending", label: "待处理" },
  { value: "communicating", label: "沟通中" },
  { value: "completed", label: "已完成" },
  { value: "closed", label: "已关闭" },
];

function getStatusText(status: string) {
  switch (status) {
    case "pending":
      return "待处理";
    case "communicating":
      return "沟通中";
    case "completed":
      return "已完成";
    case "closed":
      return "已关闭";
    default:
      return status;
  }
}

export default async function AdminInquiriesPage({
  searchParams,
}: AdminInquiriesPageProps) {
  const { status = "all", q = "" } = await searchParams;
  const keyword = q.trim();

  const whereClause: Prisma.InquiryWhereInput = {};

  if (status !== "all") {
    whereClause.status = status;
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
      items: true,
    },
  });

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>询单管理</h1>
        <p>查看客户提交的询单，并进行状态跟进。</p>
      </div>

      {/* 🔍 搜索 */}
      <form method="get" className="admin-search-bar">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="搜索询单编号 / 客户 / 公司 / 电话 / 邮箱 / 产品关键词"
        />

        <input type="hidden" name="status" value={status} />

        <button type="submit" className="primary-button">
          搜索
        </button>

        <Link href="/admin/inquiries" className="ghost-button inline-button-link">
          重置
        </Link>
      </form>

      <Link
        href={`/api/admin/inquiries/export?status=${status}&q=${encodeURIComponent(keyword)}`}
        className="primary-button"
      >
        导出 Excel
      </Link>

      {/* 🔘 状态筛选 */}
      <div className="admin-filter-bar">
        {STATUS_OPTIONS.map((option) => (
          <Link
            key={option.value}
            href={`/admin/inquiries?status=${option.value}${
              keyword ? `&q=${encodeURIComponent(keyword)}` : ""
            }`}
            className={`admin-filter-chip ${
              status === option.value ? "active" : ""
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>

      {/* 📋 列表 */}
      <div className="admin-table">
        <div className="admin-table-head">
          <span>询单编号</span>
          <span>联系人</span>
          <span>公司</span>
          <span>产品数量</span>
          <span>状态</span>
          <span>时间</span>
          <span>操作</span>
        </div>

        {inquiries.map((item) => (
          <div key={item.id} className="admin-table-row">
            <span>{item.inquiryNo}</span>
            <span>{item.contactName}</span>
            <span>{item.companyName}</span>
            <span>{item.items.length}</span>
            <span className="status-badge">
              {getStatusText(item.status)}
            </span>
            <span>{item.createdAt.toLocaleString("zh-CN")}</span>

            <span>
              <Link
                href={`/admin/inquiries/${item.id}`}
                className="ghost-button inline-button-link"
              >
                查看
              </Link>
            </span>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}