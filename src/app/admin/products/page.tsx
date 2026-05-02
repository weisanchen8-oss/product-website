/**
 * 文件作用：
 * 定义后台产品管理页。
 * 支持：
 * - 产品关键词搜索
 * - 分类筛选
 * - 上架状态筛选
 * - 推荐状态筛选
 * - 热销状态筛选
 * - 新增产品入口
 * - 批量上架 / 下架 / 推荐 / 热销 / 删除
 * - 删除前弹窗确认
 * - 产品列表分页，每页 10 条
 * 当前版本统一产品管理与分类管理的筛选栏、按钮、标题和列表卡片排版。
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { ProductBulkForm } from "@/components/admin/product-bulk-form";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { getAdminProductsPageData } from "@/lib/admin-data";

type AdminProductsPageProps = {
  searchParams: Promise<{
    success?: string;
    q?: string;
    categoryId?: string;
    activeStatus?: string;
    featuredStatus?: string;
    hotStatus?: string;
    page?: string;
  }>;
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const {
    success,
    q = "",
    categoryId = "all",
    activeStatus = "all",
    featuredStatus = "all",
    hotStatus = "all",
    page = "1",
  } = await searchParams;

  const keyword = q.trim();
  const pageNumber = Math.max(1, Number(page) || 1);

  const {
    products,
    categories,
    promotions,
    totalCount,
    currentPage,
    totalPages,
  } = await getAdminProductsPageData({
    keyword,
    categoryId,
    activeStatus,
    featuredStatus,
    hotStatus,
    page: pageNumber,
    pageSize: 10,
  });

  const currentParams = new URLSearchParams();

  if (keyword) currentParams.set("q", keyword);
  if (categoryId !== "all") currentParams.set("categoryId", categoryId);
  if (activeStatus !== "all") currentParams.set("activeStatus", activeStatus);
  if (featuredStatus !== "all") {
    currentParams.set("featuredStatus", featuredStatus);
  }
  if (hotStatus !== "all") currentParams.set("hotStatus", hotStatus);

  const currentPath = `/admin/products${
    currentParams.toString() ? `?${currentParams.toString()}` : ""
  }`;

  function getPromotionDiscountScore(promotion: {
    discountType: string;
    discountValue: number;
  }) {
    if (promotion.discountType === "percent") {
      return promotion.discountValue;
    }

    return promotion.discountValue;
  }

  function getBestPromotion<
    T extends {
      title: string;
      discountType: string;
      discountValue: number;
    },
  >(promotions: T[]) {
    if (promotions.length === 0) return null;

    return promotions.reduce((best, current) => {
      return getPromotionDiscountScore(current) > getPromotionDiscountScore(best)
        ? current
        : best;
    });
  }

  const bulkProducts = products.map((product) => {
    const coverImage = product.images[0];
    const now = new Date();

    const activePromotions = product.promotionProducts
      .map((item) => item.promotion)
      .filter(
        (promotion) =>
          promotion.isActive &&
          promotion.startAt <= now &&
          promotion.endAt >= now
      );

    const bestPromotion = getBestPromotion(activePromotions);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDesc: product.shortDesc,
      categoryName: product.category.name,
      priceText: product.priceText,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isManualHot: product.isManualHot,
      isPromoting: Boolean(bestPromotion),
      promotionTitle: bestPromotion
        ? `${bestPromotion.title}（最优优惠）`
        : null,
      coverUrl: coverImage?.processedUrl || coverImage?.originalUrl || null,
    };
  });

  return (
    <AdminLayout>
      {success === "created" ? <AdminActionToast message="产品已新增。" /> : null}
      {success === "bulk-updated" ? (
        <AdminActionToast message="已完成产品批量更新。" />
      ) : null}
      {success === "bulk-deleted" ? (
        <AdminActionToast message="已删除选中的产品。" />
      ) : null}
      {success === "bulk-empty" ? (
        <AdminActionToast message="请先选择需要批量处理的产品。" />
      ) : null}
      {success === "bulk-invalid-action" ? (
        <AdminActionToast message="批量操作失败：无效的操作类型。" />
      ) : null}

      <div className="space-y-8">
        <div className="admin-page-header">
          <div>
            <h1>产品管理</h1>
            <p>可按关键词、分类、上架状态、推荐状态和热销状态筛选产品。</p>
          </div>

          <Link href="/admin/products/new" className="admin-primary-btn">
            新增产品
          </Link>
        </div>

        <section className="rounded-[28px] bg-white p-8 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
          <form className="grid gap-5 xl:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto_auto] xl:items-end">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                关键词
              </span>
              <input
                name="q"
                type="search"
                defaultValue={keyword}
                placeholder="搜索产品名称、分类、关键词、简介或价格"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1E3A5F] focus:ring-4 focus:ring-slate-200"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                分类
              </span>
              <select
                name="categoryId"
                defaultValue={categoryId}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#1E3A5F] focus:ring-4 focus:ring-slate-200"
              >
                <option value="all">全部分类</option>
                {categories.map((category) => (
                  <option value={String(category.id)} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                上架状态
              </span>
              <select
                name="activeStatus"
                defaultValue={activeStatus}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#1E3A5F] focus:ring-4 focus:ring-slate-200"
              >
                <option value="all">全部</option>
                <option value="active">已上架</option>
                <option value="inactive">未上架</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                推荐状态
              </span>
              <select
                name="featuredStatus"
                defaultValue={featuredStatus}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#1E3A5F] focus:ring-4 focus:ring-slate-200"
              >
                <option value="all">全部</option>
                <option value="featured">已推荐</option>
                <option value="not-featured">未推荐</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                热销状态
              </span>
              <select
                name="hotStatus"
                defaultValue={hotStatus}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#1E3A5F] focus:ring-4 focus:ring-slate-200"
              >
                <option value="all">全部</option>
                <option value="hot">已标记热销</option>
                <option value="not-hot">未标记热销</option>
              </select>
            </label>

            <button
              type="submit"
              className="h-12 rounded-xl bg-[#111827] px-7 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1E3A5F]"
            >
              筛选
            </button>

            <Link
              href="/admin/products"
              className="flex h-12 items-center justify-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              重置
            </Link>
          </form>
        </section>

        <section className="rounded-[28px] bg-white p-8 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
              产品列表
            </h2>
            <p className="mt-4 text-sm text-slate-500">
              当前筛选结果共 {totalCount} 个产品，每页显示 10 个
            </p>
          </div>

          <ProductBulkForm
            products={bulkProducts}
            promotions={promotions}
            redirectTo={currentPath}
          />

          <div className="mt-6">
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/admin/products"
              searchParams={{
                q: keyword,
                categoryId,
                activeStatus,
                featuredStatus,
                hotStatus,
              }}
            />
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}