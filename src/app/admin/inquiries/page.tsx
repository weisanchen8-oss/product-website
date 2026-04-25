/**
 * 询单列表页（优化版）
 */

import Link from "next/link";
import { Prisma } from "@prisma/client";
import { AdminLayout } from "@/components/admin/admin-layout";
import { prisma } from "@/lib/prisma";

type Props = {
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
      return status;
  }
}

function getStatusClassName(status: string) {
  return `admin-status-badge status-${status}`;
}

export default async function Page({ searchParams }: Props) {
  const { status = "all", q = "" } = await searchParams;
  const keyword = q.trim();

  const where: Prisma.InquiryWhereInput = {};

  if (status !== "all") {
    where.status =
      status === "contacting"
        ? { in: ["contacting", "communicating"] }
        : status;
  }

  if (keyword) {
    where.OR = [
      { inquiryNo: { contains: keyword } },
      { contactName: { contains: keyword } },
      { companyName: { contains: keyword } },
    ];
  }

  const inquiries = await prisma.inquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>询单管理</h1>
      </div>

      {/* 搜索区 */}
      <section className="admin-form-card admin-toolbar-compact">
        <form className="admin-search-row">
          <input
            name="q"
            defaultValue={keyword}
            placeholder="搜索询单编号、联系人、公司"
          />

          <input type="hidden" name="status" value={status} />

          <button className="primary-button">搜索</button>
          <Link href="/admin/inquiries" className="secondary-button">
            重置
          </Link>
        </form>

        <div className="admin-filter-row">
          {STATUS_OPTIONS.map((opt) => {
            const href =
              opt.value === "all"
                ? "/admin/inquiries"
                : `/admin/inquiries?status=${opt.value}`;

            return (
              <Link
                key={opt.value}
                href={href}
                className={
                  status === opt.value
                    ? "filter-pill active"
                    : "filter-pill"
                }
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </section>

      {/* 列表区 */}
      <section className="admin-form-card admin-table-card compact">
        <div className="table-header">
          <h2>询单列表</h2>
          <span>{inquiries.length} 条记录</span>
        </div>

        <table className="admin-table full-width">
          <thead>
            <tr>
              <th className="col-id">询单编号</th>
              <th className="col-name">联系人</th>
              <th className="col-company">公司</th>
              <th className="col-count">数量</th>
              <th className="col-status">状态</th>
              <th className="col-time">提交时间</th>
              <th className="col-action">操作</th>
            </tr>
          </thead>

          <tbody>
            {inquiries.map((item) => (
              <tr key={item.id}>
                <td className="col-id">{item.inquiryNo}</td>
                <td>{item.contactName}</td>
                <td>{item.companyName}</td>
                <td className="center">{item.items.length}</td>

                <td>
                  <span className={getStatusClassName(item.status)}>
                    {getStatusText(item.status)}
                  </span>
                </td>

                <td>{item.createdAt.toLocaleString("zh-CN")}</td>

                <td>
                  <Link
                    href={`/admin/inquiries/${item.id}`}
                    className="action-btn"
                  >
                    查看
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
}