/**
 * 文件作用：
 * 定义后台产品管理页。
 * 当前版本支持产品搜索、真实产品列表、新增产品入口和成功反馈提示。
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { getAdminProductsPageData } from "@/lib/admin-data";

function getProductStatusText(isActive: boolean) {
  return isActive ? "上架" : "下架";
}

function getBooleanText(value: boolean) {
  return value ? "是" : "否";
}

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

  return (
    <AdminLayout>
      {success === "created" ? (
        <AdminActionToast message="产品新增成功。" />
      ) : null}

      <div className="admin-page-header">
        <div>
          <h1>产品管理</h1>
          <p>可按产品名称、分类、关键词、简介或价格搜索产品。</p>
        </div>

        <Link href="/admin/products/new" className="primary-button inline-button-link">
          新增产品
        </Link>
      </div>

      <form method="get" className="admin-search-bar">
        <input
          type="text"
          name="q"
          defaultValue={keyword}
          placeholder="搜索产品名称 / 分类 / 关键词 / 简介 / 价格"
        />

        <button type="submit" className="primary-button">
          搜索
        </button>

        <Link href="/admin/products" className="ghost-button inline-button-link">
          重置
        </Link>
      </form>

      <div className="admin-table">
        {products.map((product) => (
          <div key={product.id} className="admin-row admin-row-products">
            <div className="admin-cell-main">
              <span className="admin-field-label">产品名称</span>
              <strong>{product.name}</strong>
              <p>{product.shortDesc}</p>
            </div>

            <div className="admin-cell-block">
              <span className="admin-field-label">分类</span>
              <span>{product.category.name}</span>
            </div>

            <div className="admin-cell-block">
              <span className="admin-field-label">价格</span>
              <span>{product.priceText}</span>
            </div>

            <div className="admin-cell-block">
              <span className="admin-field-label">状态</span>
              <span>{getProductStatusText(product.isActive)}</span>
            </div>

            <div className="admin-cell-block">
              <span className="admin-field-label">推荐</span>
              <span>{getBooleanText(product.isFeatured)}</span>
            </div>

            <div className="admin-cell-block">
              <span className="admin-field-label">热销</span>
              <span>{getBooleanText(product.isManualHot)}</span>
            </div>

            <div className="admin-cell-block">
              <div className="admin-action-group">
                <Link
                  href={`/product/${product.slug}`}
                  className="ghost-button inline-button-link"
                >
                  预览
                </Link>

                <Link
                  href={`/admin/products/${product.id}`}
                  className="ghost-button inline-button-link"
                >
                  编辑
                </Link>
              </div>
            </div>
          </div>
        ))}

        {products.length === 0 ? (
          <div className="admin-row">
            <div className="admin-cell-main">
              <strong>未找到匹配产品</strong>
              <p>请尝试更换关键词，或点击“重置”查看全部产品。</p>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}