/**
 * 文件作用：
 * 定义后台分类管理页。
 * 支持：
 * - 分类搜索
 * - 新增分类
 * - 编辑分类
 * - 删除分类成功/失败提示
 * - 删除分类前确认
 * - 删除分类安全校验
 * - 批量启用 / 停用分类
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { CategoryBulkForm } from "@/components/admin/category-bulk-form";
import { getAdminCategoriesPageData } from "@/lib/admin-data";

type AdminCategoriesPageProps = {
  searchParams: Promise<{
    success?: string;
    q?: string;
  }>;
};

function getToastMessage(success?: string) {
  switch (success) {
    case "created":
      return "分类已新增。";
    case "updated":
      return "分类已更新。";
    case "deleted":
      return "分类已删除。";
    case "delete-has-products":
      return "无法删除：该分类下仍有产品，请先调整产品分类。";
    case "delete-has-children":
      return "无法删除：该分类下仍有子分类，请先处理子分类。";
    case "delete-not-found":
      return "删除失败：分类不存在。";
    case "delete-failed":
      return "删除失败，请稍后重试。";
    case "bulk-updated":
      return "已完成分类批量更新。";
    case "bulk-empty":
      return "请先选择需要批量处理的分类。";
    case "bulk-invalid-action":
      return "批量操作失败：无效的操作类型。";
    default:
      return "";
  }
}

export default async function AdminCategoriesPage({
  searchParams,
}: AdminCategoriesPageProps) {
  const { success, q = "" } = await searchParams;
  const keyword = q.trim();

  const { categories } = await getAdminCategoriesPageData(keyword);
  const toastMessage = getToastMessage(success);

  const currentParams = new URLSearchParams();

  if (keyword) {
    currentParams.set("q", keyword);
  }

  const currentPath = `/admin/categories${
    currentParams.toString() ? `?${currentParams.toString()}` : ""
  }`;

  const bulkCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || "暂无分类说明。",
    parentName: category.parent?.name || "无",
    sortOrder: category.sortOrder,
    productCount: category._count.products,
    childCount: category._count.children,
    isActive: category.isActive,
  }));

  return (
    <AdminLayout>
      {toastMessage ? <AdminActionToast message={toastMessage} /> : null}

      <div className="admin-category-header">
        <div>
          <h1>分类管理</h1>
          <p>可按分类名称、Slug 或分类说明搜索分类，并批量启用/停用。</p>
        </div>

        <Link href="/admin/categories/new" className="primary-button">
          新增分类
        </Link>
      </div>

      <section className="admin-category-toolbar">
        <form className="admin-category-search-form">
          <input
            name="q"
            type="search"
            defaultValue={keyword}
            placeholder="搜索分类名称、Slug 或分类说明"
          />

          <button type="submit" className="admin-search-button">
            搜索
          </button>

          <Link href="/admin/categories" className="admin-reset-link">
            重置
          </Link>
        </form>
      </section>

      <section className="admin-category-table-card">
        <div className="admin-category-table-header">
          <div>
            <h2>分类列表</h2>
            <p>共 {categories.length} 个分类</p>
          </div>
        </div>

        <CategoryBulkForm
          categories={bulkCategories}
          redirectTo={currentPath}
        />
      </section>
    </AdminLayout>
  );
}