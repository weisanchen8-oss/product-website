/**
 * 文件作用：
 * 后台促销活动管理页。
 * 当前阶段支持：
 * - 查看促销活动列表
 * - 查看促销状态
 * - 查看参与促销的产品数量
 * - 提供新增促销活动入口
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { getAdminPromotionsPageData } from "@/lib/admin-data";
import { PromotionListActions } from "@/components/admin/promotion-list-actions";

function getPromotionStatusText(promotion: {
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

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("zh-CN");
}

export default async function AdminPromotionsPage() {
  const { promotions } = await getAdminPromotionsPageData();

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>促销活动</h1>
          <p>管理员可以在这里创建和管理产品促销活动。</p>
        </div>

        <Link href="/admin/promotions/new" className="admin-primary-btn">
          新增促销
        </Link>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>促销活动列表</h2>
            <p>共 {promotions.length} 个促销活动</p>
          </div>
        </div>

        <div className="promotion-list">
          {promotions.length > 0 ? (
            promotions.map((promotion) => (
              <div className="promotion-card" key={promotion.id}>
                <div>
                  <div className="promotion-card-title">
                    <h3>{promotion.title}</h3>
                    <span>{getPromotionStatusText(promotion)}</span>
                  </div>

                  <p className="promotion-card-desc">
                    {promotion.description || "暂无促销说明"}
                  </p>

                  <div className="promotion-card-meta">
                    <span>
                      折扣方式：
                      {promotion.discountType === "percent"
                        ? `${promotion.discountValue}% 折扣`
                        : `固定优惠 ${promotion.discountValue}`}
                    </span>
                    <span>
                      时间：{formatDate(promotion.startAt)} -{" "}
                      {formatDate(promotion.endAt)}
                    </span>
                    <span>产品数量：{promotion.products.length}</span>
                  </div>
                </div>

                <div className="promotion-card-right">
                  <Link
                    href={`/admin/promotions/${promotion.id}`}
                    className="promotion-card-link"
                  >
                    查看详情
                  </Link>

                  <PromotionListActions
                    promotionId={promotion.id}
                    isActive={promotion.isActive}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="admin-empty-text">
              暂无促销活动，请先新增一个促销活动。
            </p>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}