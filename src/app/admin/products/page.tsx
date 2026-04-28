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

      <div className="admin-product-header">
        <div>
          <h1>产品管理</h1>
          <p>可按关键词、分类、上架状态、推荐状态和热销状态筛选产品。</p>
        </div>

        <Link href="/admin/products/new" className="primary-button">
          新增产品
        </Link>
      </div>

      <section className="admin-product-toolbar">
        <form className="admin-product-filter-form">
          <div className="admin-filter-field admin-filter-keyword">
            <label>关键词</label>
            <input
              name="q"
              type="search"
              defaultValue={keyword}
              placeholder="搜索产品名称、分类、关键词、简介或价格"
            />
          </div>

          <div className="admin-filter-field">
            <label>分类</label>
            <select name="categoryId" defaultValue={categoryId}>
              <option value="all">全部分类</option>
              {categories.map((category) => (
                <option value={String(category.id)} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-filter-field">
            <label>上架状态</label>
            <select name="activeStatus" defaultValue={activeStatus}>
              <option value="all">全部</option>
              <option value="active">已上架</option>
              <option value="inactive">未上架</option>
            </select>
          </div>

          <div className="admin-filter-field">
            <label>推荐状态</label>
            <select name="featuredStatus" defaultValue={featuredStatus}>
              <option value="all">全部</option>
              <option value="featured">已推荐</option>
              <option value="not-featured">未推荐</option>
            </select>
          </div>

          <div className="admin-filter-field">
            <label>热销状态</label>
            <select name="hotStatus" defaultValue={hotStatus}>
              <option value="all">全部</option>
              <option value="hot">已标记热销</option>
              <option value="not-hot">未标记热销</option>
            </select>
          </div>

          <div className="admin-filter-actions">
            <button type="submit" className="admin-search-button">
              筛选
            </button>

            <Link href="/admin/products" className="admin-reset-link">
              重置
            </Link>
          </div>
        </form>
      </section>

      <section className="admin-product-table-card">
        <div className="admin-product-table-header">
          <div>
            <h2>产品列表</h2>
            <p>
              当前筛选结果共 {totalCount} 个产品，每页显示 10 个
            </p>
          </div>
        </div>

        <ProductBulkForm
          products={bulkProducts}
          promotions={promotions}
          redirectTo={currentPath}
        />

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
      </section>
    </AdminLayout>
  );
}