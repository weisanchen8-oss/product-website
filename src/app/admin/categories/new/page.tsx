/**
 * 文件作用：
 * 定义后台新增分类页。
 * 支持：
 * - 分类名称填写
 * - Slug 自动生成
 * - 分类说明
 * - 分类图标地址填写
 * - 分类图标本地上传
 * - 父级分类选择
 * - 排序自动补位
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { prisma } from "@/lib/prisma";
import { createCategoryAction } from "@/app/admin/categories/actions";

type AdminCategoryNewPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function AdminCategoryNewPage({
  searchParams,
}: AdminCategoryNewPageProps) {
  const { success, error } = await searchParams;

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <AdminLayout>
      {success === "created" ? (
        <AdminActionToast message="分类创建成功。" />
      ) : null}

      {error === "missing-name" ? (
        <AdminActionToast message="创建失败：请填写分类名称。" />
      ) : null}

      {error === "create-failed" ? (
        <AdminActionToast message="创建失败：请检查数据是否有效。" />
      ) : null}

      <div className="admin-page-header">
        <div>
          <h1>新增分类</h1>
          <p>填写分类名称、说明和图标后，可在首页产品分类区域展示。</p>
        </div>

        <Link
          href="/admin/categories"
          className="ghost-button inline-button-link"
        >
          返回分类管理
        </Link>
      </div>

      <div className="admin-form-card">
        <form action={createCategoryAction} className="stack-form">
          <label className="form-field">
            <span>分类名称 *</span>
            <input
              type="text"
              name="name"
              placeholder="例如：工业设备、办公用品"
            />
            <small className="form-help-text">
              必填。分类名称会显示在前台产品分类卡片中。
            </small>
          </label>

          <label className="form-field">
            <span>Slug（可选）</span>
            <input type="text" name="slug" placeholder="可不填，系统会自动生成" />
            <small className="form-help-text">
              用于网址中的分类标识。一般无需填写。
            </small>
          </label>

          <label className="form-field">
            <span>分类说明（可选）</span>
            <textarea
              name="description"
              placeholder="请输入分类说明，也可以暂时不填"
              className="admin-textarea"
              rows={5}
            />
          </label>

          <label className="form-field">
            <span>分类图标地址（可选）</span>
            <input
              type="text"
              name="imageUrl"
              placeholder="可填写图片地址，也可以直接在下方上传"
            />
            <small className="form-help-text">
              图片会用于首页产品分类卡片。若上传本地图片，会自动生成地址。
            </small>
          </label>

          <label className="form-field">
            <span>上传分类图标</span>
            <input type="file" name="imageFile" accept="image/*" />
            <small className="form-help-text">
              支持 jpg、png、webp、svg，最大 5MB。建议使用方形图标或简洁图片。
            </small>
          </label>

          <label className="form-field">
            <span>父级分类（可选）</span>
            <select name="parentId" className="admin-select" defaultValue="">
              <option value="">无，作为一级分类</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>排序值（可选）</span>
            <input
              type="number"
              name="sortOrder"
              placeholder="可不填，系统会自动排在最后"
            />
            <small className="form-help-text">
              数字越小越靠前。不填时，系统会自动排到当前分类列表最后。
            </small>
          </label>

          <label className="admin-checkbox-field">
            <input type="checkbox" name="isActive" defaultChecked />
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