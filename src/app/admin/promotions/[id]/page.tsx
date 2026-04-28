/**
 * 文件作用：
 * 后台促销活动详情页。
 * 支持：
 * - 查看促销基本信息
 * - 查看参与促销的产品
 * - 启用 / 停用促销
 * - 进入编辑页面
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { getAdminPromotionDetailPageData } from "@/lib/admin-data";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("zh-CN");
}

function getStatusText(promotion: {
  isActive: boolean;
  startAt: Date;
  endAt: Date;
}) {
  const now = new Date();

  if (!promotion.isActive) return "已停用";
  if (promotion.startAt > now) return "未开始";
  if (promotion.endAt < now) return "已结束";
  return "进行中";
}

export default async function AdminPromotionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promotionId = Number(id);

  if (!promotionId) {
    notFound();
  }

  const { promotion } = await getAdminPromotionDetailPageData(promotionId);

  if (!promotion) {
    notFound();
  }

  return (
    <AdminLayout>
      {/* ===== 页面头部 ===== */}
      <div className="admin-page-header">
        <div>
          <h1>{promotion.title}</h1>
          <p>查看促销详情、参与产品，并进行启用或编辑操作。</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/admin/promotions" className="ghost-button inline-button-link">
            返回列表
          </Link>

          <Link
            href={`/admin/promotions/${promotion.id}/edit`}
            className="admin-primary-btn"
          >
            编辑促销
          </Link>
        </div>
      </div>

      {/* ===== 基本信息 ===== */}
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>促销信息</h2>
            <p>当前促销活动的基础信息</p>
          </div>
        </div>

        <div className="promotion-detail-grid">
          <div>
            <strong>状态：</strong>
            <span>{getStatusText(promotion)}</span>
          </div>

          <div>
            <strong>折扣：</strong>
            <span>
              {promotion.discountType === "percent"
                ? `${promotion.discountValue}%`
                : `固定优惠 ${promotion.discountValue}`}
            </span>
          </div>

          <div>
            <strong>时间：</strong>
            <span>
              {formatDate(promotion.startAt)} - {formatDate(promotion.endAt)}
            </span>
          </div>

          <div>
            <strong>是否启用：</strong>
            <span>{promotion.isActive ? "是" : "否"}</span>
          </div>
        </div>

        {promotion.description ? (
          <div style={{ marginTop: "12px" }}>
            <strong>说明：</strong>
            <p>{promotion.description}</p>
          </div>
        ) : null}
      </section>

      {/* ===== 参与产品 ===== */}
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>参与促销产品</h2>
            <p>当前已加入该促销活动的产品</p>
          </div>

          <Link href="/admin/products" className="admin-primary-btn">
            去产品管理添加
          </Link>
        </div>

        <div className="admin-list">
          {promotion.products.length > 0 ? (
            promotion.products.map((item) => (
              <div key={item.product.id} className="admin-list-item">
                <div>
                  <strong>{item.product.name}</strong>
                  <p>{item.product.priceText}</p>
                </div>

                <Link
                  href={`/admin/products/${item.product.id}`}
                  className="ghost-button inline-button-link"
                >
                  查看产品
                </Link>
              </div>
            ))
          ) : (
            <p className="admin-empty-text">
              当前暂无产品参与该促销，请前往产品管理添加。
            </p>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}