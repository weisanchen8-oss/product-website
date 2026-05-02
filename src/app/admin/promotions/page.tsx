/**
 * 文件作用：
 * 后台促销活动管理页。
 * 当前阶段支持：
 * - 查看促销活动列表
 * - 查看促销状态
 * - 查看参与促销的产品数量
 * - 提供新增促销活动入口
 * 当前版本优化了促销活动卡片布局，使页面更紧凑、正式、易浏览。
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

function getPromotionStatusClassName(status: string) {
  switch (status) {
    case "进行中":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "未开始":
      return "bg-sky-50 text-sky-700 ring-sky-200";
    case "已结束":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    case "已停用":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("zh-CN");
}

export default async function AdminPromotionsPage() {
  const { promotions } = await getAdminPromotionsPageData();

  return (
    <AdminLayout>
      <div className="space-y-7">
        <div className="admin-page-header">
          <div>
            <h1>促销活动</h1>
            <p>管理员可以在这里创建和管理产品促销活动。</p>
          </div>

          <Link href="/admin/promotions/new" className="admin-primary-btn">
            新增促销
          </Link>
        </div>

        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#1E3A5F]">
                Promotions
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                促销活动列表
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                共 {promotions.length} 个促销活动
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {promotions.length > 0 ? (
              promotions.map((promotion) => {
                const statusText = getPromotionStatusText(promotion);

                return (
                  <article
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
                    key={promotion.id}
                  >
                    <div className="grid gap-5 lg:grid-cols-[1fr_260px] lg:items-center">
                      <div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <h3 className="text-xl font-bold text-slate-950">
                            {promotion.title}
                          </h3>

                          <span
                            className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getPromotionStatusClassName(
                              statusText
                            )}`}
                          >
                            {statusText}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-500">
                          {promotion.description || "暂无促销说明"}
                        </p>

                        <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                          <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-slate-100">
                            <span className="block text-xs text-slate-400">
                              折扣方式
                            </span>
                            <strong className="mt-1 block font-semibold text-slate-800">
                              {promotion.discountType === "percent"
                                ? `${promotion.discountValue}% 折扣`
                                : `固定优惠 ${promotion.discountValue}`}
                            </strong>
                          </div>

                          <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-slate-100">
                            <span className="block text-xs text-slate-400">
                              活动时间
                            </span>
                            <strong className="mt-1 block font-semibold text-slate-800">
                              {formatDate(promotion.startAt)} -{" "}
                              {formatDate(promotion.endAt)}
                            </strong>
                          </div>

                          <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-slate-100">
                            <span className="block text-xs text-slate-400">
                              产品数量
                            </span>
                            <strong className="mt-1 block font-semibold text-slate-800">
                              {promotion.products.length} 个产品
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                        <Link
                          href={`/admin/promotions/${promotion.id}`}
                          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#1E3A5F] px-4 text-sm font-semibold text-white transition hover:bg-[#244B75]"
                        >
                          查看详情
                        </Link>

                        <div className="text-sm">
                          <PromotionListActions
                            promotionId={promotion.id}
                            isActive={promotion.isActive}
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-2xl bg-slate-50 p-12 text-center">
                <p className="text-sm text-slate-500">
                  暂无促销活动，请先新增一个促销活动。
                </p>

                <Link
                  href="/admin/promotions/new"
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#1E3A5F] px-5 text-sm font-semibold text-white transition hover:bg-[#244B75]"
                >
                  新增促销
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}