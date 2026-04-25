/**
 * 文件作用：
 * 定义后台分类管理页。
 * 当前版本支持分类搜索、新增分类、编辑分类和成功反馈。
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { getAdminCategoriesPageData } from "@/lib/admin-data";

function getCategoryStatusText(isActive: boolean) {
  return isActive ? "启用" : "停用";
}

type AdminCategoriesPageProps = {
  searchParams: Promise<{
    success?: string;
    q?: string;
  }>;
};

export default async function AdminCategoriesPage({
  searchParams,
}: AdminCategoriesPageProps) {
  const { success, q = "" } = await searchParams;
  const keyword = q.trim();
  const { categories } = await getAdminCategoriesPageData(keyword);

  return (
    <AdminLayout>
      {success === "created" ? (
        <AdminActionToast message="分类新增成功。" />
      ) : null}

      <div className="admin-page-header">
        <div>
          <h1>分类管理</h1>
          <p>可按分类名称、Slug 或分类说明搜索分类。</p>
        </div>

        <Link href="/admin/categories/new" className="primary-button inline-button-link">
          新增分类
        </Link>
      </div>

      <form method="get" className="admin-search-bar">
        <input
          type="text"
          name="q"
          defaultValue={keyword}
          placeholder="搜索分类名称 / Slug / 分类说明"
        />

        <button type="submit" className="primary-button">
          搜索
        </button>

        <Link href="/admin/categories" className="ghost-button inline-button-link">
          重置
        </Link>
      </form>

      <div className="admin-table">
        {categories.map((category) => (
          <div key={category.id} className="admin-row admin-row-categories">
            <div className="admin-cell-main">
              <span className="admin-field-label">分类名称</span>
              <strong>{category.name}</strong>
              <p>{category.description ?? "暂无分类说明。"}</p>
            </div>

            <div className="admin-cell-block">
              <span className="admin-field-label">父级分类</span>
              <span>{category.parent?.name ?? "无"}</span>
            </div>

            <div className="admin-cell-block">
              <span className="admin-field-label">排序</span>
              <span>{category.sortOrder}</span>
            </div>

            <div className="admin-cell-block">
              <span className="admin-field-label">产品数量</span>
              <span>{category._count.products}</span>
            </div>

            <div className="admin-cell-block">
              <span className="admin-field-label">子分类数</span>
              <span>{category._count.children}</span>
            </div>

            <div className="admin-cell-block">
              <span className="admin-field-label">状态</span>
              <span>{getCategoryStatusText(category.isActive)}</span>
            </div>

            <div className="admin-cell-block">
              <div className="admin-action-group">
                <Link
                  href={`/admin/categories/${category.id}`}
                  className="ghost-button inline-button-link"
                >
                  编辑
                </Link>
              </div>
            </div>
          </div>
        ))}

        {categories.length === 0 ? (
          <div className="admin-row">
            <div className="admin-cell-main">
              <strong>未找到匹配分类</strong>
              <p>请尝试更换关键词，或点击“重置”查看全部分类。</p>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}