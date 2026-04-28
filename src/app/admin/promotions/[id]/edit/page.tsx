/**
 * 文件作用：
 * 后台促销活动编辑页面。
 * 负责读取当前促销活动数据，并展示编辑表单。
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { getAdminPromotionDetailPageData } from "@/lib/admin-data";
import { PromotionEditForm } from "@/components/admin/promotion-edit-form";

function formatDateInput(date: Date) {
  return new Date(date).toISOString().slice(0, 10);
}

export default async function EditPromotionPage({
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
      <div className="admin-page-header">
        <div>
          <h1>编辑促销活动</h1>
          <p>修改促销名称、说明、折扣规则、活动时间和启用状态。</p>
        </div>

        <Link
          href={`/admin/promotions/${promotion.id}`}
          className="admin-primary-btn"
        >
          返回促销详情
        </Link>
      </div>

      <section className="admin-panel promotion-form-card">
        <PromotionEditForm
          promotion={{
            id: promotion.id,
            title: promotion.title,
            description: promotion.description || "",
            discountType: promotion.discountType,
            discountValue: promotion.discountValue,
            startAt: formatDateInput(promotion.startAt),
            endAt: formatDateInput(promotion.endAt),
            isActive: promotion.isActive,
          }}
        />
      </section>
    </AdminLayout>
  );
}