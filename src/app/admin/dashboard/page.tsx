/**
 * 文件作用：
 * 后台数据看板页面。
 * 保留原有客户、询单、产品、重点客户、热门产品数据展示；
 * 并在原页面底部新增“系统自动分析建议”模块。
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { prisma } from "@/lib/prisma";
import { getAdminAnalyticsData } from "@/lib/admin-analytics";

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
    analyticsData,
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
    getAdminAnalyticsData(),
  ]);

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>数据看板</h1>
          <p>汇总客户、询单、产品和重点客户情况，用于快速了解业务状态。</p>
        </div>

        <Link href="/admin/inquiries" className="admin-primary-btn">
          查看询单
        </Link>
      </div>

      <section className={`business-overview business-overview-${analyticsData.overall.riskLevel}`}>
        <div className="business-overview-main">
          <span>经营状态总览</span>
          <h2>{analyticsData.overall.overallStatusText}</h2>
          <p>{analyticsData.overall.overallSummary}</p>
        </div>

        <div className="business-overview-metrics">
          {analyticsData.overall.highlightMetrics.map((metric) => (
            <div className="business-overview-metric" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`inquiry-trend-card inquiry-trend-${analyticsData.inquiryTrend.inquiryTrendType}`}>
        <div>
          <span>询单趋势分析</span>
          <h2>
            {analyticsData.inquiryTrend.inquiryTrendType === "up"
              ? "询单增长"
              : analyticsData.inquiryTrend.inquiryTrendType === "down"
                ? "询单下降"
                : "询单稳定"}
          </h2>
          <p>{analyticsData.inquiryTrend.inquiryTrendText}</p>
        </div>

        <div className="inquiry-trend-metrics">
          <div>
            <span>本月询单</span>
            <strong>{analyticsData.inquiryTrend.thisMonthInquiryCount}</strong>
          </div>

          <div>
            <span>上月询单</span>
            <strong>{analyticsData.inquiryTrend.lastMonthInquiryCount}</strong>
          </div>

          <div>
            <span>环比变化</span>
            <strong>
              {analyticsData.inquiryTrend.inquiryTrendRate > 0 ? "+" : ""}
              {analyticsData.inquiryTrend.inquiryTrendRate}%
            </strong>
          </div>
        </div>
      </section>

      <section className="admin-stat-grid">
        <div className="admin-stat-card">
          <span>客户总数</span>
          <strong>{customerCount}</strong>
          <p>已沉淀客户数量</p>
        </div>

        <div className="admin-stat-card">
          <span>重点客户</span>
          <strong>{importantCustomerCount}</strong>
          <p>需要优先跟进</p>
        </div>

        <div className="admin-stat-card">
          <span>询单总数</span>
          <strong>{inquiryCount}</strong>
          <p>全部客户询单</p>
        </div>

        <div className="admin-stat-card">
          <span>本月询单</span>
          <strong>{monthlyInquiryCount}</strong>
          <p>本月新增询盘</p>
        </div>

        <div className="admin-stat-card">
          <span>产品总数</span>
          <strong>{productCount}</strong>
          <p>后台已录入产品</p>
        </div>

        <div className="admin-stat-card">
          <span>已上架产品</span>
          <strong>{activeProductCount}</strong>
          <p>前台可见产品</p>
        </div>
      </section>

      <section className="admin-dashboard-grid">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>最近询单</h2>
              <p>最新客户需求动态</p>
            </div>
            <Link href="/admin/inquiries">查看全部</Link>
          </div>

          <div className="admin-list">
            {recentInquiries.length > 0 ? (
              recentInquiries.map((inquiry) => (
                <div className="admin-list-item" key={inquiry.id}>
                  <div>
                    <strong>{inquiry.inquiryNo}</strong>
                    <p>
                      {inquiry.contactName} · {inquiry.companyName}
                    </p>
                  </div>
                  <span>{getInquiryStatusText(inquiry.status)}</span>
                </div>
              ))
            ) : (
              <p className="admin-empty-text">暂无询单</p>
            )}
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>重点客户</h2>
              <p>优先维护的客户资源</p>
            </div>
            <Link href="/admin/customers">客户管理</Link>
          </div>

          <div className="admin-list">
            {importantCustomers.length > 0 ? (
              importantCustomers.map((customer) => (
                <div className="admin-list-item" key={customer.id}>
                  <div>
                    <strong>⭐ {customer.name || "未命名客户"}</strong>
                    <p>{customer.companyName || "未填写公司"}</p>
                  </div>
                  <span>{customer.inquiries.length} 条询单</span>
                </div>
              ))
            ) : (
              <p className="admin-empty-text">暂无重点客户</p>
            )}
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>热门产品 Top 5</h2>
            <p>按销量字段排序，展示更有业务价值的产品数据。</p>
          </div>
          <Link href="/admin/products">产品管理</Link>
        </div>

        <div className="admin-list">
          {hotProducts.length > 0 ? (
            hotProducts.map((product, index) => (
              <div className="admin-list-item" key={product.id}>
                <div>
                  <strong>
                    #{index + 1} {product.name}
                  </strong>
                  <p>{product.priceText}</p>
                </div>
                <span>{product.salesCount} 销量</span>
              </div>
            ))
          ) : (
            <p className="admin-empty-text">暂无产品数据</p>
          )}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>系统自动分析建议</h2>
            <p>基于产品、询单和客户数据自动生成经营建议。</p>
          </div>
          <span>Auto Insights</span>
        </div>

        <div className="admin-list">
          {analyticsData.suggestions.map((item, index) => {
            const levelText =
              item.level === "high"
                ? "高优先级"
                : item.level === "medium"
                  ? "中优先级"
                  : "低优先级";

            return (
              <div className={`admin-list-item insight-item insight-${item.level}`} key={index}>
                <div>
                  <strong>
                    建议 {index + 1} · {levelText}
                  </strong>
                  <p>{item.title}</p>
                  <p>{item.action}</p>
                </div>

                <Link href={item.href} className="insight-action-link">
                  去处理
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </AdminLayout>
  );
}