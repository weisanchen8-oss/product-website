/**
 * 文件作用：
 * 定义后台编辑分类页。
 * 当前版本支持编辑真实分类数据，并对 slug 和排序字段提供清晰说明。
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { prisma } from "@/lib/prisma";
import { updateCategoryAction } from "@/app/admin/categories/actions";

type AdminCategoryEditPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function AdminCategoryEditPage({
  params,
  searchParams,
}: AdminCategoryEditPageProps) {
  const { id } = await params;
  const { success, error } = await searchParams;
  const categoryId = Number(id);

  if (!categoryId || Number.isNaN(categoryId)) {
    notFound();
  }

  const [category, categories] = await Promise.all([
    prisma.category.findUnique({
      where: { id: categoryId },
    }),
    prisma.category.findMany({
      where: {
        NOT: {
          id: categoryId,
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <AdminLayout>
      {success === "updated" ? (
        <AdminActionToast message="分类保存成功。" />
      ) : null}

      {error === "missing-name" ? (
        <AdminActionToast message="保存失败：请填写分类名称。" />
      ) : null}

      {error === "update-failed" ? (
        <AdminActionToast message="保存失败：请检查数据是否有效。" />
      ) : null}

      <div className="admin-page-header">
        <div>
          <h1>编辑分类</h1>
          <p>普通修改通常只需要调整分类名称、说明、排序或启用状态。</p>
        </div>

        <Link href="/admin/categories" className="ghost-button inline-button-link">
          返回分类管理
        </Link>
      </div>

      <div className="admin-form-card">
        <form action={updateCategoryAction} className="stack-form">
          <input type="hidden" name="id" value={category.id} />

          <label className="form-field">
            <span>分类名称 *</span>
            <input type="text" name="name" defaultValue={category.name} />
          </label>

          <label className="form-field">
            <span>Slug（高级选项）</span>
            <input type="text" name="slug" defaultValue={category.slug} />
            <small className="form-help-text">
              用于网址中的分类标识。一般不建议频繁修改，避免后续链接变化。
            </small>
          </label>

          <label className="form-field">
            <span>分类说明</span>
            <textarea
              name="description"
              defaultValue={category.description ?? ""}
              className="admin-textarea"
              rows={5}
            />
          </label>

          <label className="form-field">
            <span>父级分类</span>
            <select
              name="parentId"
              className="admin-select"
              defaultValue={category.parentId?.toString() ?? ""}
            >
              <option value="">无，作为一级分类</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>排序值</span>
            <input type="number" name="sortOrder" defaultValue={category.sortOrder} />
            <small className="form-help-text">
              数字越小越靠前。编辑时可手动调整分类顺序。
            </small>
          </label>

          <label className="admin-checkbox-field">
            <input type="checkbox" name="isActive" defaultChecked={category.isActive} />
            <span>启用该分类</span>
          </label>

          <div className="admin-form-actions">
            <button type="submit" className="primary-button">
              保存分类
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}