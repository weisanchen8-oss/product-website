/**
 * 文件作用：
 * 定义后台首页经营看板。
 * 展示产品、询单、重点客户、最近询单和全系统后台操作日志。
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { getAdminDashboardData } from "@/lib/admin-data";

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

function getInquiryStatusClassName(status: string) {
  switch (status) {
    case "pending":
      return "dashboard-status dashboard-status-pending";
    case "contacting":
    case "communicating":
      return "dashboard-status dashboard-status-contacting";
    case "completed":
      return "dashboard-status dashboard-status-completed";
    case "closed":
      return "dashboard-status dashboard-status-closed";
    default:
      return "dashboard-status";
  }
}

function getModuleText(module: string) {
  switch (module) {
    case "product":
      return "产品";
    case "category":
      return "分类";
    case "inquiry":
      return "询单";
    case "customer":
      return "客户";
    case "system":
      return "系统";
    default:
      return "操作";
  }
}

function getModuleClassName(module: string) {
  switch (module) {
    case "product":
      return "dashboard-log-type dashboard-log-product";
    case "category":
      return "dashboard-log-type dashboard-log-category";
    case "inquiry":
      return "dashboard-log-type dashboard-log-inquiry";
    case "customer":
      return "dashboard-log-type dashboard-log-customer";
    default:
      return "dashboard-log-type";
  }
}

function truncateText(text: string, maxLength = 42) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
}

function getAdminLogHref(log: {
  module: string;
  targetId: number | null;
}) {
  if (log.module === "product" && log.targetId) {
    return `/admin/products/${log.targetId}`;
  }

  if (log.module === "category" && log.targetId) {
    return `/admin/categories/${log.targetId}`;
  }

  if (log.module === "inquiry" && log.targetId) {
    return `/admin/inquiries/${log.targetId}`;
  }

  if (log.module === "customer") {
    return "/admin/inquiries?status=important";
  }

  return "/admin";
}

export default async function AdminHomePage() {
  const {
    productCount,
    activeProductCount,
    featuredProductCount,
    categoryCount,
    inquiryCount,
    pendingInquiryCount,
    contactingInquiryCount,
    completedInquiryCount,
    importantInquiryCount,
    recentInquiries,
    recentAdminLogs,
  } = await getAdminDashboardData();

  return (
    <AdminLayout>
      <div className="admin-dashboard-header">
        <div>
          <h1>后台首页</h1>
          <p>查看产品、询单、客户跟进和后台操作记录。</p>
        </div>

        <div className="admin-dashboard-actions">
          <Link href="/admin/inquiries" className="primary-button">
            查看询单
          </Link>

          <Link href="/admin/products" className="secondary-button">
            管理产品
          </Link>
        </div>
      </div>

      <section className="admin-dashboard-stat-grid">
        <Link href="/admin/inquiries" className="admin-dashboard-stat-card">
          <span>询单总数</span>
          <strong>{inquiryCount}</strong>
          <p>全部客户询单</p>
        </Link>

        <Link
          href="/admin/inquiries?status=pending"
          className="admin-dashboard-stat-card admin-stat-warning"
        >
          <span>待处理</span>
          <strong>{pendingInquiryCount}</strong>
          <p>需要尽快跟进</p>
        </Link>

        <Link
          href="/admin/inquiries?status=contacting"
          className="admin-dashboard-stat-card admin-stat-blue"
        >
          <span>沟通中</span>
          <strong>{contactingInquiryCount}</strong>
          <p>正在推进的询单</p>
        </Link>

        <Link
          href="/admin/inquiries?status=important"
          className="admin-dashboard-stat-card admin-stat-important"
        >
          <span>重点询单</span>
          <strong>{importantInquiryCount}</strong>
          <p>重点客户提交</p>
        </Link>

        <Link
          href="/admin/inquiries?status=completed"
          className="admin-dashboard-stat-card"
        >
          <span>已完成</span>
          <strong>{completedInquiryCount}</strong>
          <p>已完成处理</p>
        </Link>

        <Link href="/admin/products" className="admin-dashboard-stat-card">
          <span>产品总数</span>
          <strong>{productCount}</strong>
          <p>已录入产品</p>
        </Link>

        <Link href="/admin/products" className="admin-dashboard-stat-card">
          <span>已上架产品</span>
          <strong>{activeProductCount}</strong>
          <p>前台可见产品</p>
        </Link>

        <Link href="/admin/categories" className="admin-dashboard-stat-card">
          <span>分类数量</span>
          <strong>{categoryCount}</strong>
          <p>产品分类结构</p>
        </Link>

        <Link href="/admin/products" className="admin-dashboard-stat-card">
          <span>推荐产品</span>
          <strong>{featuredProductCount}</strong>
          <p>首页推荐展示</p>
        </Link>
      </section>

      <div className="admin-dashboard-two-column">
        <section className="admin-dashboard-panel dashboard-equal-panel">
          <div className="admin-dashboard-panel-header">
            <div>
              <h2>最近询单</h2>
              <p>最新客户询单动态</p>
            </div>

            <Link href="/admin/inquiries" className="admin-panel-link">
              查看全部
            </Link>
          </div>

          <div className="admin-dashboard-list">
            {recentInquiries.length > 0 ? (
              recentInquiries.map((inquiry) => (
                <Link
                  key={inquiry.id}
                  href={`/admin/inquiries/${inquiry.id}`}
                  className={
                    inquiry.user.isImportant
                      ? "admin-dashboard-list-item dashboard-important-item"
                      : "admin-dashboard-list-item"
                  }
                >
                  <div className="dashboard-list-main">
                    <strong>
                      {inquiry.user.isImportant ? (
                        <span className="dashboard-star">⭐</span>
                      ) : null}
                      {inquiry.inquiryNo}
                    </strong>

                    <p>
                      {inquiry.contactName} · {inquiry.companyName}
                    </p>
                  </div>

                  <div className="admin-dashboard-list-meta">
                    <span className={getInquiryStatusClassName(inquiry.status)}>
                      {getInquiryStatusText(inquiry.status)}
                    </span>

                    <small>{inquiry.createdAt.toLocaleString("zh-CN")}</small>
                  </div>
                </Link>
              ))
            ) : (
              <p className="admin-empty-text">暂无询单</p>
            )}
          </div>
        </section>

        <section className="admin-dashboard-panel dashboard-equal-panel">
          <div className="admin-dashboard-panel-header">
            <div>
              <h2>最近后台操作</h2>
              <p>产品、分类、询单和客户标记的操作记录</p>
            </div>
          </div>

          <div className="admin-dashboard-log-list">
            {recentAdminLogs.length > 0 ? (
              recentAdminLogs.map((log) => (
                <Link
                  key={log.id}
                  href={getAdminLogHref({
                    module: log.module,
                    targetId: log.targetId,
                  })}
                  className="admin-dashboard-log-item"
                >
                  <div className="dashboard-log-top">
                    <span className={getModuleClassName(log.module)}>
                      {getModuleText(log.module)}
                    </span>

                    <small>{log.createdAt.toLocaleString("zh-CN")}</small>
                  </div>

                  <strong>{truncateText(log.note || log.action || "后台操作")}</strong>

                  <p>
                    {log.operatorName || "管理员"}
                    {log.targetName ? ` · ${log.targetName}` : ""}
                  </p>
                </Link>
              ))
            ) : (
              <p className="admin-empty-text">暂无后台操作记录</p>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}