import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { prisma } from "@/lib/prisma";
import { toggleCustomerImportantAction } from "../actions";

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      inquiries: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) return notFound();

  return (
    <AdminLayout>
      <div className="admin-customer-detail-header">
        <div>
          <h1>{customer.name || "未命名客户"}</h1>
          <p>客户详情与询单记录</p>
        </div>

        <Link href="/admin/customers" className="secondary-button">
          返回客户列表
        </Link>
      </div>

      {/* 基础信息 */}
      <section className="admin-card">
        <h2>客户信息</h2>

        <p>公司：{customer.companyName || "未填写"}</p>
        <p>邮箱：{customer.email || "未填写"}</p>
        <p>电话：{customer.phone || "未填写"}</p>

        <form action={toggleCustomerImportantAction}>
          <input type="hidden" name="id" value={customer.id} />

          <button className="admin-customer-important-btn">
            {customer.isImportant ? "取消重点客户" : "设为重点客户"}
          </button>
        </form>
      </section>

      {/* 询单列表 */}
      <section className="admin-card">
        <h2>询单记录</h2>

        {customer.inquiries.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>询单编号</th>
                <th>状态</th>
                <th>时间</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              {customer.inquiries.map((i) => (
                <tr key={i.id}>
                  <td>{i.inquiryNo}</td>
                  <td>{i.status}</td>
                  <td>{i.createdAt.toLocaleString("zh-CN")}</td>
                  <td>
                    <Link href={`/admin/inquiries/${i.id}`}>
                      查看详情
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>暂无询单记录</p>
        )}
      </section>
    </AdminLayout>
  );
}