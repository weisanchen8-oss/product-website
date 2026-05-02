/**
 * 文件作用：
 * 后台分类管理页。
 * 支持：
 * - 关键词搜索
 * - 父级分类筛选
 * - 启用状态筛选
 * - 是否有产品筛选
 * - 是否有子分类筛选
 * - 分类列表分页，每页 10 条
 * 当前版本统一为与产品管理页一致的后台排版结构：
 * 标题区 + 白色筛选卡片 + 白色列表卡片。
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
  if (productStatus !== "all") currentParams.set("productStatus", productStatus);
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

      <div className="space-y-8">
        <div className="admin-page-header">
          <div>
            <h1>分类管理</h1>
            <p>支持按关键词、父级分类、启用状态、产品数量和子分类情况筛选分类数据。</p>
          </div>

          <Link href="/admin/categories/new" className="admin-primary-btn">
            新增分类
          </Link>
        </div>

        <section className="rounded-[28px] bg-white p-8 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
          <form className="grid gap-5 xl:grid-cols-[1.35fr_1fr_1fr_1fr_1fr_auto_auto] xl:items-end">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                关键词
              </span>
              <input
                name="q"
                type="search"
                defaultValue={keyword}
                placeholder="搜索分类名称、说明"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1E3A5F] focus:ring-4 focus:ring-slate-200"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                父级分类
              </span>
              <select
                name="parentId"
                defaultValue={parentId}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#1E3A5F] focus:ring-4 focus:ring-slate-200"
              >
                <option value="all">全部父级</option>
                <option value="none">无父级</option>
                {parentCategories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                启用状态
              </span>
              <select
                name="activeStatus"
                defaultValue={activeStatus}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#1E3A5F] focus:ring-4 focus:ring-slate-200"
              >
                <option value="all">全部状态</option>
                <option value="active">启用</option>
                <option value="inactive">停用</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                产品情况
              </span>
              <select
                name="productStatus"
                defaultValue={productStatus}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#1E3A5F] focus:ring-4 focus:ring-slate-200"
              >
                <option value="all">全部产品情况</option>
                <option value="has-products">有产品</option>
                <option value="no-products">无产品</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                子分类情况
              </span>
              <select
                name="childStatus"
                defaultValue={childStatus}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#1E3A5F] focus:ring-4 focus:ring-slate-200"
              >
                <option value="all">全部子分类情况</option>
                <option value="has-children">有子分类</option>
                <option value="no-children">无子分类</option>
              </select>
            </label>

            <button
              type="submit"
              className="h-12 rounded-xl bg-[#111827] px-7 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1E3A5F]"
            >
              筛选
            </button>

            <Link
              href="/admin/categories"
              className="flex h-12 items-center justify-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              重置
            </Link>
          </form>
        </section>

        <section className="rounded-[28px] bg-white p-8 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
              分类列表
            </h2>
            <p className="mt-4 text-sm text-slate-500">
              当前筛选结果共 {totalCount} 个分类，每页显示 10 个
            </p>
          </div>

          <CategoryBulkForm
            categories={bulkCategories}
            redirectTo={currentPath}
          />

          <div className="mt-6">
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
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}