/**
 * 文件作用：
 * 后台客户管理页。
 * 按客户维度聚合询单信息，支持搜索、重点客户展示和跳转查看客户相关询单。
 */

import Link from "next/link";
import { Prisma } from "@prisma/client";
import { AdminLayout } from "@/components/admin/admin-layout";
import { prisma } from "@/lib/prisma";
import { toggleCustomerImportantAction } from "./actions";

type AdminCustomersPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function AdminCustomersPage({
  searchParams,
}: AdminCustomersPageProps) {
  const { q = "" } = await searchParams;
  const keyword = q.trim();

  const whereClause: Prisma.UserWhereInput = keyword
    ? {
        OR: [
          { name: { contains: keyword } },
          { email: { contains: keyword } },
          { companyName: { contains: keyword } },
          { phone: { contains: keyword } },
        ],
      }
    : {};

  const customers = await prisma.user.findMany({
    where: whereClause,
    orderBy: [{ isImportant: "desc" }, { createdAt: "desc" }],
    include: {
      inquiries: {
        orderBy: [{ createdAt: "desc" }],
        select: {
          id: true,
          inquiryNo: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  return (
    <AdminLayout>
      <div className="admin-customer-header">
        <div>
          <h1>客户管理</h1>
          <p>按客户维度查看询单数量、重点客户标记和最近询单时间。</p>
        </div>
      </div>

      <section className="admin-customer-toolbar">
        <form className="admin-customer-search-form">
          <input
            name="q"
            type="search"
            defaultValue={keyword}
            placeholder="搜索客户姓名、公司、邮箱或电话"
          />

          <button type="submit" className="admin-search-button">
            搜索
          </button>

          <Link href="/admin/customers" className="admin-reset-link">
            重置
          </Link>
        </form>
      </section>

      <section className="admin-customer-table-card">
        <div className="admin-customer-table-header">
          <div>
            <h2>客户列表</h2>
            <p>共 {customers.length} 个客户</p>
          </div>
        </div>

        {customers.length > 0 ? (
          <div className="admin-customer-table-wrapper">
            <table className="admin-customer-table">
              <colgroup>
                <col style={{ width: "18%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "12%" }} />
              </colgroup>

              <thead>
                <tr>
                  <th>客户</th>
                  <th>公司</th>
                  <th>邮箱</th>
                  <th>电话</th>
                  <th>询单数</th>
                  <th>重点客户</th>
                  <th>操作</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => {
                  const latestInquiry = customer.inquiries[0];
                  const inquirySearchHref = customer.email
                    ? `/admin/inquiries?q=${encodeURIComponent(customer.email)}`
                    : `/admin/inquiries?q=${encodeURIComponent(customer.name)}`;

                  return (
                    <tr
                      key={customer.id}
                      className={
                        customer.isImportant ? "admin-customer-important-row" : ""
                      }
                    >
                      <td>
                        <strong>
                          {customer.isImportant ? "⭐ " : ""}
                          {customer.name || "未填写姓名"}
                        </strong>
                        <p>
                          最近询单：
                          {latestInquiry
                            ? latestInquiry.createdAt.toLocaleString("zh-CN")
                            : "暂无"}
                        </p>
                      </td>

                      <td>{customer.companyName || "未填写公司"}</td>

                      <td>{customer.email || "未填写邮箱"}</td>

                      <td>{customer.phone || "未填写电话"}</td>

                      <td>
                        <span className="admin-customer-count-badge">
                          {customer.inquiries.length}
                        </span>
                      </td>

                      <td>
                        <form action={toggleCustomerImportantAction}>
                          <input type="hidden" name="id" value={customer.id} />

                          <button
                            type="submit"
                            className={
                              customer.isImportant
                                ? "admin-customer-important-btn active"
                                : "admin-customer-important-btn"
                            }
                          >
                            {customer.isImportant ? "★ 已标记" : "☆ 标记"}
                          </button>
                        </form>
                      </td>

                      <td>
                        <Link
                          href={inquirySearchHref}
                          className="admin-customer-action-link"
                        >
                          查看询单
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-state">
            <h3>未找到匹配客户</h3>
            <p>请尝试更换关键词，或点击“重置”查看全部客户。</p>
            <Link href="/admin/customers" className="admin-reset-link">
              查看全部客户
            </Link>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}