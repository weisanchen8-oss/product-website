/**
 * 文件作用：
 * 后台促销活动详情页。
 * 支持查看促销信息、已绑定产品和可绑定产品。
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { getAdminPromotionDetailPageData } from "@/lib/admin-data";
import { PromotionProductManager } from "@/components/admin/promotion-product-manager";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("zh-CN");
}

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promotionId = Number(id);

  if (!promotionId) {
    notFound();
  }

  const { promotion, allProducts } =
    await getAdminPromotionDetailPageData(promotionId);

  if (!promotion) {
    notFound();
  }

  const linkedProductIds = promotion.products.map((item) => item.productId);

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>{promotion.title}</h1>
          <p>{promotion.description || "暂无促销说明"}</p>
        </div>

        <Link href="/admin/promotions" className="admin-primary-btn">
          返回促销列表
        </Link>
      </div>

      <section className="admin-stat-grid">
        <div className="admin-stat-card">
          <span>折扣类型</span>
          <strong>
            {promotion.discountType === "percent" ? "百分比" : "固定优惠"}
          </strong>
          <p>当前促销折扣方式</p>
        </div>

        <div className="admin-stat-card">
          <span>折扣值</span>
          <strong>{promotion.discountValue}</strong>
          <p>{promotion.discountType === "percent" ? "百分比折扣" : "固定优惠金额"}</p>
        </div>

        <div className="admin-stat-card">
          <span>活动时间</span>
          <strong>{formatDate(promotion.startAt)}</strong>
          <p>至 {formatDate(promotion.endAt)}</p>
        </div>
      </section>

      <PromotionProductManager
        promotionId={promotion.id}
        linkedProductIds={linkedProductIds}
        allProducts={allProducts.map((product) => ({
          id: product.id,
          name: product.name,
          categoryName: product.category.name,
          priceText: product.priceText,
          salesCount: product.salesCount,
          isActive: product.isActive,
        }))}
      />
    </AdminLayout>
  );
}