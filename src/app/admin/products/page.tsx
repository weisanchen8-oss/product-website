/**
 * 文件作用：
 * 定义后台产品管理页。
 * 支持：
 * - 产品搜索
 * - 新增产品入口
 * - 批量上架 / 下架 / 推荐 / 热销 / 删除
 * - 删除前弹窗确认
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { ProductBulkForm } from "@/components/admin/product-bulk-form";
import { getAdminProductsPageData } from "@/lib/admin-data";

type AdminProductsPageProps = {
  searchParams: Promise<{
    success?: string;
    q?: string;
  }>;
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const { success, q = "" } = await searchParams;
  const keyword = q.trim();

  const { products } = await getAdminProductsPageData(keyword);

  const currentParams = new URLSearchParams();

  if (keyword) {
    currentParams.set("q", keyword);
  }

  const currentPath = `/admin/products${
    currentParams.toString() ? `?${currentParams.toString()}` : ""
  }`;

  const bulkProducts = products.map((product) => {
    const coverImage = product.images[0];

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
      coverUrl: coverImage?.processedUrl || coverImage?.originalUrl || null,
    };
  });

  return (
    <AdminLayout>
      {success === "created" ? (
        <AdminActionToast message="产品已新增。" />
      ) : null}

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
          <p>可按产品名称、分类、关键词、简介或价格搜索产品。</p>
        </div>

        <Link href="/admin/products/new" className="primary-button">
          新增产品
        </Link>
      </div>

      <section className="admin-product-toolbar">
        <form className="admin-product-search-form">
          <input
            name="q"
            type="search"
            defaultValue={keyword}
            placeholder="搜索产品名称、分类、关键词、简介或价格"
          />

          <button type="submit" className="admin-search-button">
            搜索
          </button>

          <Link href="/admin/products" className="admin-reset-link">
            重置
          </Link>
        </form>
      </section>

      <section className="admin-product-table-card">
        <div className="admin-product-table-header">
          <div>
            <h2>产品列表</h2>
            <p>共 {products.length} 个产品</p>
          </div>
        </div>

        <ProductBulkForm products={bulkProducts} redirectTo={currentPath} />
      </section>
    </AdminLayout>
  );
}