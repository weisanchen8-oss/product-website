/**
 * 文件作用：
 * 后台分类管理页（增强版）
 * 支持：
 * - 关键词搜索
 * - 父级分类筛选
 * - 启用状态筛选
 * - 是否有产品筛选
 * - 是否有子分类筛选
 * - 分类列表分页，每页 10 条
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { CategoryBulkForm } from "@/components/admin/category-bulk-form";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { getAdminCategoriesPageData } from "@/lib/admin-data";

type AdminCategoriesPageProps = {
  searchParams: Promise<{
    success?: string;
    q?: string;
    parentId?: string;
    activeStatus?: string;
    productStatus?: string;
    childStatus?: string;
    page?: string;
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
      return "无法删除：该分类下仍有产品。";
    case "delete-has-children":
      return "无法删除：该分类下仍有子分类。";
    case "bulk-updated":
      return "已完成分类批量更新。";
    default:
      return "";
  }
}

export default async function AdminCategoriesPage({
  searchParams,
}: AdminCategoriesPageProps) {
  const {
    success,
    q = "",
    parentId = "all",
    activeStatus = "all",
    productStatus = "all",
    childStatus = "all",
    page = "1",
  } = await searchParams;

  const keyword = q.trim();
  const pageNumber = Math.max(1, Number(page) || 1);

  const {
    categories,
    parentCategories,
    totalCount,
    currentPage,
    totalPages,
  } = await getAdminCategoriesPageData({
    keyword,
    parentId,
    activeStatus,
    productStatus,
    childStatus,
    page: pageNumber,
    pageSize: 10,
  });

  const toastMessage = getToastMessage(success);

  const currentParams = new URLSearchParams();

  if (keyword) currentParams.set("q", keyword);
  if (parentId !== "all") currentParams.set("parentId", parentId);
  if (activeStatus !== "all") currentParams.set("activeStatus", activeStatus);
  if (productStatus !== "all") {
    currentParams.set("productStatus", productStatus);
  }
  if (childStatus !== "all") currentParams.set("childStatus", childStatus);

  const currentPath = `/admin/categories${
    currentParams.toString() ? `?${currentParams.toString()}` : ""
  }`;

  const bulkCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || "暂无说明",
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
          <p>支持多维筛选分类数据。</p>
        </div>

        <Link href="/admin/categories/new" className="primary-button">
          新增分类
        </Link>
      </div>

      <section className="admin-category-toolbar">
        <form className="admin-category-filter-form">
          <input
            name="q"
            type="search"
            defaultValue={keyword}
            placeholder="关键词搜索"
          />

          <select name="parentId" defaultValue={parentId}>
            <option value="all">全部父级</option>
            <option value="none">无父级（顶级分类）</option>
            {parentCategories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>

          <select name="activeStatus" defaultValue={activeStatus}>
            <option value="all">全部状态</option>
            <option value="active">启用</option>
            <option value="inactive">停用</option>
          </select>

          <select name="productStatus" defaultValue={productStatus}>
            <option value="all">全部产品情况</option>
            <option value="has-products">有产品</option>
            <option value="no-products">无产品</option>
          </select>

          <select name="childStatus" defaultValue={childStatus}>
            <option value="all">全部子分类情况</option>
            <option value="has-children">有子分类</option>
            <option value="no-children">无子分类</option>
          </select>

          <button type="submit" className="admin-search-button">
            筛选
          </button>

          <Link href="/admin/categories" className="admin-reset-link">
            重置
          </Link>
        </form>
      </section>

      <section className="admin-category-table-card">
        <div className="admin-category-table-header">
          <h2>分类列表</h2>
          <p>
            当前筛选结果共 {totalCount} 个分类，每页显示 10 个
          </p>
        </div>

        <CategoryBulkForm
          categories={bulkCategories}
          redirectTo={currentPath}
        />

        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/admin/categories"
          searchParams={{
            q: keyword,
            parentId,
            activeStatus,
            productStatus,
            childStatus,
          }}
        />
      </section>
    </AdminLayout>
  );
}