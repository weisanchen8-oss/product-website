/**
 * 文件作用：
 * 定义后台编辑分类页。
 * 支持：
 * - 编辑分类名称
 * - 编辑分类说明
 * - 编辑分类图标地址
 * - 上传分类图标
 * - 预览当前分类图标
 * - 编辑父级分类、排序和启用状态
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

      {error === "invalid-parent" ? (
        <AdminActionToast message="保存失败：不能把自己设置为自己的父级分类。" />
      ) : null}

      {error === "update-failed" ? (
        <AdminActionToast message="保存失败：请检查数据是否有效。" />
      ) : null}

      <div className="admin-page-header">
        <div>
          <h1>编辑分类</h1>
          <p>可维护分类名称、说明、图标、排序和启用状态。</p>
        </div>

        <Link
          href="/admin/categories"
          className="ghost-button inline-button-link"
        >
          返回分类管理
        </Link>
      </div>

      <div className="admin-form-card">
        <form action={updateCategoryAction} className="stack-form">
          <input type="hidden" name="id" value={category.id} />

          <label className="form-field">
            <span>分类名称 *</span>
            <input type="text" name="name" defaultValue={category.name} />
            <small className="form-help-text">
              分类名称会显示在后台管理和前台分类卡片中。
            </small>
          </label>

          <details className="admin-advanced-config">
            <summary>展开高级网址标识设置</summary>

            <label className="form-field">
              <span>Slug（高级选项）</span>
              <input type="text" name="slug" defaultValue={category.slug} />
              <small className="form-help-text">
                用于网址中的分类标识。一般不建议频繁修改，避免后续链接变化。
              </small>
            </label>
          </details>

          <label className="form-field">
            <span>分类说明</span>
            <textarea
              name="description"
              defaultValue={category.description ?? ""}
              className="admin-textarea"
              rows={5}
              placeholder="请输入分类说明"
            />
          </label>

          <label className="form-field">
            <span>分类图标地址</span>
            <input
              type="text"
              name="imageUrl"
              defaultValue={category.imageUrl ?? ""}
              placeholder="可填写图片地址，也可以直接在下方上传"
            />
            <small className="form-help-text">
              该图片会用于首页产品分类卡片。上传新图片后会自动替换当前地址。
            </small>
          </label>

          <label className="form-field">
            <span>上传分类图标</span>
            <input type="file" name="imageFile" accept="image/*" />
            <small className="form-help-text">
              支持 jpg、png、webp、svg，最大 5MB。建议使用方形图标或简洁图片。
            </small>
          </label>

          {category.imageUrl ? (
            <div className="form-field">
              <span>当前分类图标预览</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={category.imageUrl}
                alt={category.name}
                style={{
                  width: "160px",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "20px",
                  border: "1px solid #e5e7eb",
                  background: "#f8fafc",
                }}
              />

              <label className="admin-checkbox-field">
                <input type="checkbox" name="removeImage" value="1" />
                <span>删除当前分类图标</span>
              </label>

              <small className="form-help-text">
                勾选后保存，将删除当前分类图标。若同时上传新图，则优先使用新上传的图片。
              </small>
            </div>
          ) : null}

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
            <input
              type="number"
              name="sortOrder"
              defaultValue={category.sortOrder}
            />
            <small className="form-help-text">
              数字越小越靠前。编辑时可手动调整分类顺序。
            </small>
          </label>

          <label className="admin-checkbox-field">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={category.isActive}
            />
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