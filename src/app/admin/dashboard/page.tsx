/**
 * 文件作用：
 * 后台数据看板。
 * 用于作品集展示核心业务数据：客户、询单、产品、重点客户、热门产品。
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { prisma } from "@/lib/prisma";

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
      return status || "未知";
  }
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    customerCount,
    importantCustomerCount,
    inquiryCount,
    monthlyInquiryCount,
    productCount,
    activeProductCount,
    recentInquiries,
    importantCustomers,
    hotProducts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isImportant: true } }),
    prisma.inquiry.count(),
    prisma.inquiry.count({
      where: {
        createdAt: {
          gte: monthStart,
        },
      },
    }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.inquiry.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 5,
      include: {
        user: true,
      },
    }),
    prisma.user.findMany({
      where: { isImportant: true },
      orderBy: [{ createdAt: "desc" }],
      take: 5,
      include: {
        inquiries: {
          orderBy: [{ createdAt: "desc" }],
          take: 1,
        },
      },
    }),
    prisma.product.findMany({
      orderBy: [{ salesCount: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        salesCount: true,
        priceText: true,
      },
    }),
  ]);

  return (
    <AdminLayout>
      <div className="admin-dashboard-page-header">
        <div>
          <h1>数据看板</h1>
          <p>汇总客户、询单、产品和重点客户情况，用于快速了解业务状态。</p>
        </div>

        <Link href="/admin/inquiries" className="primary-button">
          查看询单
        </Link>
      </div>

      <section className="portfolio-dashboard-grid">
        <Link href="/admin/customers" className="portfolio-dashboard-card">
          <span>客户总数</span>
          <strong>{customerCount}</strong>
          <p>已沉淀客户数量</p>
        </Link>

        <Link
          href="/admin/customers"
          className="portfolio-dashboard-card important"
        >
          <span>重点客户</span>
          <strong>{importantCustomerCount}</strong>
          <p>需要优先跟进</p>
        </Link>

        <Link href="/admin/inquiries" className="portfolio-dashboard-card">
          <span>询单总数</span>
          <strong>{inquiryCount}</strong>
          <p>全部客户询单</p>
        </Link>

        <Link href="/admin/inquiries" className="portfolio-dashboard-card blue">
          <span>本月询单</span>
          <strong>{monthlyInquiryCount}</strong>
          <p>本月新增询盘</p>
        </Link>

        <Link href="/admin/products" className="portfolio-dashboard-card">
          <span>产品总数</span>
          <strong>{productCount}</strong>
          <p>后台已录入产品</p>
        </Link>

        <Link href="/admin/products" className="portfolio-dashboard-card green">
          <span>已上架产品</span>
          <strong>{activeProductCount}</strong>
          <p>前台可见产品</p>
        </Link>
      </section>

      <div className="portfolio-dashboard-panels">
        <section className="portfolio-dashboard-panel">
          <div className="portfolio-panel-header">
            <div>
              <h2>最近询单</h2>
              <p>最新客户需求动态</p>
            </div>

            <Link href="/admin/inquiries">查看全部</Link>
          </div>

          <div className="portfolio-panel-list">
            {recentInquiries.length > 0 ? (
              recentInquiries.map((inquiry) => (
                <Link
                  key={inquiry.id}
                  href={`/admin/inquiries/${inquiry.id}`}
                  className="portfolio-panel-item"
                >
                  <div>
                    <strong>{inquiry.inquiryNo}</strong>
                    <p>
                      {inquiry.contactName} · {inquiry.companyName}
                    </p>
                  </div>

                  <span>{getInquiryStatusText(inquiry.status)}</span>
                </Link>
              ))
            ) : (
              <p className="admin-empty-text">暂无询单</p>
            )}
          </div>
        </section>

        <section className="portfolio-dashboard-panel">
          <div className="portfolio-panel-header">
            <div>
              <h2>重点客户</h2>
              <p>优先维护的客户资源</p>
            </div>

            <Link href="/admin/customers">客户管理</Link>
          </div>

          <div className="portfolio-panel-list">
            {importantCustomers.length > 0 ? (
              importantCustomers.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/admin/customers/${customer.id}`}
                  className="portfolio-panel-item important"
                >
                  <div>
                    <strong>⭐ {customer.name || "未命名客户"}</strong>
                    <p>{customer.companyName || "未填写公司"}</p>
                  </div>

                  <span>{customer.inquiries.length} 条询单</span>
                </Link>
              ))
            ) : (
              <p className="admin-empty-text">暂无重点客户</p>
            )}
          </div>
        </section>

        <section className="portfolio-dashboard-panel wide">
          <div className="portfolio-panel-header">
            <div>
              <h2>热门产品 Top 5</h2>
              <p>按销量字段排序，展示更有业务价值的产品数据。</p>
            </div>

            <Link href="/admin/products">产品管理</Link>
          </div>

          <div className="portfolio-hot-product-list">
            {hotProducts.length > 0 ? (
              hotProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="portfolio-hot-product-item"
                >
                  <span className="portfolio-rank">#{index + 1}</span>

                  <div>
                    <strong>{product.name}</strong>
                    <p>{product.priceText}</p>
                  </div>

                  <em>{product.salesCount} 销量</em>
                </Link>
              ))
            ) : (
              <p className="admin-empty-text">暂无产品数据</p>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}