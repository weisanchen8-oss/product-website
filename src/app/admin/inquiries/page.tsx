/**
 * 文件作用：
 * 后台询单管理列表页。
 * 支持状态筛选、关键词搜索、Excel 导出，并优化表格自适应布局。
 */

import Link from "next/link";
import { Prisma } from "@prisma/client";
import { AdminLayout } from "@/components/admin/admin-layout";
import { prisma } from "@/lib/prisma";

type AdminInquiriesPageProps = {
  searchParams: Promise<{
    status?: string;
    q?: string;
  }>;
};

const STATUS_OPTIONS = [
  { value: "all", label: "全部" },
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
  const { status = "all", q = "" } = await searchParams;
  const keyword = q.trim();

  const whereClause: Prisma.InquiryWhereInput = {};

  if (status !== "all") {
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

  return (
    <AdminLayout>
      <div className="admin-inquiry-header">
        <div>
          <h1>询单管理</h1>
          <p>查看客户提交的询单，按状态筛选，并跟进处理进度。</p>
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
                    ? "admin-filter-pill admin-filter-pill-active"
                    : "admin-filter-pill"
                }
              >
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

        {inquiries.length > 0 ? (
          <div className="admin-inquiry-table-wrapper">
            <table className="admin-inquiry-table">
              <colgroup>
                <col style={{ width: "24%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "8%" }} />
              </colgroup>

              <thead>
                <tr>
                  <th>询单编号</th>
                  <th>联系人</th>
                  <th>公司</th>
                  <th>产品数量</th>
                  <th>状态</th>
                  <th>提交时间</th>
                  <th>操作</th>
                </tr>
              </thead>

              <tbody>
                {inquiries.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.inquiryNo}</strong>
                    </td>
                    <td>{item.contactName}</td>
                    <td>{item.companyName}</td>
                    <td className="admin-table-center">{item.items.length}</td>
                    <td className="admin-table-center">
                      <span className={getStatusClassName(item.status)}>
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    <td>{item.createdAt.toLocaleString("zh-CN")}</td>
                    <td className="admin-table-center">
                      <Link
                        href={`/admin/inquiries/${item.id}`}
                        className="admin-table-action"
                      >
                        查看详情
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-state">
            <h3>暂无符合条件的询单</h3>
            <p>可以尝试清空搜索条件，或切换其他状态筛选。</p>
            <Link href="/admin/inquiries" className="admin-reset-link">
              查看全部询单
            </Link>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}