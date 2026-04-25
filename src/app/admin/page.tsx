/**
 * 文件作用：
 * 定义后台首页（仪表盘）。
 * 当前版本从数据库读取真实统计数据和最近内容，作为后台总览入口。
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { getAdminDashboardData } from "@/lib/admin-data";

export default async function AdminHomePage() {
  const {
    productCount,
    activeProductCount,
    featuredProductCount,
    manualHotProductCount,
    categoryCount,
    inquiryCount,
    pendingInquiryCount,
    recentProducts,
    contentItems,
  } = await getAdminDashboardData();

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>后台首页</h1>
          <p>当前页面已从数据库读取真实统计与内容数据。</p>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h3>产品总数</h3>
          <p>{productCount}</p>
        </div>

        <div className="admin-card">
          <h3>已上架产品</h3>
          <p>{activeProductCount}</p>
        </div>

        <div className="admin-card">
          <h3>推荐产品</h3>
          <p>{featuredProductCount}</p>
        </div>

        <div className="admin-card">
          <h3>人工热销</h3>
          <p>{manualHotProductCount}</p>
        </div>

        <div className="admin-card">
          <h3>分类数量</h3>
          <p>{categoryCount}</p>
        </div>

        <div className="admin-card">
          <h3>询单总数</h3>
          <p>{inquiryCount}</p>
        </div>

        <div className="admin-card">
          <h3>待处理询单</h3>
          <p>{pendingInquiryCount}</p>
        </div>

        <div className="admin-card">
          <h3>内容配置项</h3>
          <p>{contentItems.length}</p>
        </div>
      </div>

      <div className="admin-dashboard-section">
        <div className="admin-dashboard-card">
          <h2>最近产品</h2>

          <div className="admin-list">
            {recentProducts.map((product) => (
              <div key={product.id} className="admin-list-item">
                <div>
                  <strong>{product.name}</strong>
                  <p>{product.createdAt.toLocaleDateString("zh-CN")}</p>
                </div>

                <Link
                  href={`/product/${product.slug}`}
                  className="ghost-button inline-button-link"
                >
                  预览
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-dashboard-card">
          <h2>内容配置概览</h2>

          <div className="admin-list">
            {contentItems.map((item) => (
              <div key={item.id} className="admin-list-item">
                <div>
                  <strong>{item.contentKey}</strong>
                  <p>{item.title ?? "未设置标题"}</p>
                </div>

                <Link
                  href="/admin/content"
                  className="ghost-button inline-button-link"
                >
                  查看
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}