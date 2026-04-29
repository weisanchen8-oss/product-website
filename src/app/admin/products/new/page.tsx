/**
 * 文件作用：
 * 定义后台新增产品页。
 * 当前阶段支持创建真实产品数据，并尽量降低普通员工填写难度。
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { prisma } from "@/lib/prisma";
import { createProductAction } from "@/app/admin/products/actions";
import { ProductSpecsEditor } from "@/components/admin/product-specs-editor";

type AdminProductNewPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "missing-name":
      return "创建失败：请填写产品名称。";
    case "missing-category":
      return "创建失败：请选择产品分类。";
    case "missing-short-desc":
      return "创建失败：请填写产品简介。";
    case "missing-price":
      return "创建失败：请填写价格信息。";
    case "invalid-specs-json":
      return "创建失败：产品参数 JSON 格式不正确。";
    case "create-failed":
      return "创建失败：请检查 slug 是否重复或数据是否有效。";
    default:
      return "";
  }
}

export default async function AdminProductNewPage({
  searchParams,
}: AdminProductNewPageProps) {
  const { error } = await searchParams;
  const errorMessage = getErrorMessage(error);

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <AdminLayout>
      {errorMessage ? <AdminActionToast message={errorMessage} /> : null}

      <div className="admin-page-header">
        <div>
          <h1>新增产品</h1>
          <p>只需填写产品名称、分类、简介和价格即可创建产品；Slug 和排序可自动处理。</p>
        </div>

        <Link href="/admin/products" className="ghost-button inline-button-link">
          返回产品管理
        </Link>
      </div>

      <div className="admin-form-card">
        <form
          action={createProductAction}
          className="stack-form"
          encType="multipart/form-data"
        >
          <label className="form-field">
            <span>产品名称 *</span>
            <input type="text" name="name" placeholder="例如：工业设备基础款 A" />
            <small className="form-help-text">
              必填。产品名称会展示在前台产品列表和详情页中。
            </small>
          </label>

          <label className="form-field">
            <span>Slug（可选）</span>
            <input type="text" name="slug" placeholder="可不填，系统会自动生成" />
            <small className="form-help-text">
              用于产品详情页网址。普通员工一般不需要填写。
            </small>
          </label>

          <label className="form-field">
            <span>产品分类 *</span>
            <select name="categoryId" className="admin-select" defaultValue="">
              <option value="">请选择分类</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>产品简介 *</span>
            <textarea
              name="shortDesc"
              placeholder="用于产品卡片和详情页顶部的简短介绍"
              className="admin-textarea"
              rows={4}
            />
          </label>

          <label className="form-field">
            <span>详细介绍（可选）</span>
            <textarea
              name="fullDesc"
              placeholder="用于产品详情页图文详情区域"
              className="admin-textarea"
              rows={6}
            />
          </label>

          <label className="form-field">
            <span>关键词（可选）</span>
            <input
              type="text"
              name="keywords"
              placeholder="例如：工业设备,企业采购,基础款"
            />
            <small className="form-help-text">
              多个关键词可用逗号分隔，用于搜索匹配。
            </small>
          </label>

          <label className="form-field">
            <span>价格信息 *</span>
            <input type="text" name="priceText" placeholder="例如：面议、￥2000 起" />
            <small className="form-help-text">
              B2B 场景允许填写“面议”或价格区间。
            </small>
          </label>

          <ProductSpecsEditor />

          <div className="admin-form-section">
            <h2>产品图片</h2>
            <p className="form-help-text">
              可上传多张产品图片。第一张图片默认可作为产品展示封面，后续将支持 AI 自动抠图、白底图和水印处理。
            </p>

            <label className="form-field">
              <span>上传产品图片</span>
              <input
                type="file"
                name="images"
                accept="image/*"
                multiple
              />
              <small className="form-help-text">
                支持 JPG、PNG、WebP 等常见图片格式，可一次选择多张。
              </small>
            </label>

            <label className="admin-checkbox-field">
              <input type="checkbox" name="enableAiImageProcessing" />
              <span>启用 AI 图片优化处理</span>
            </label>

            <small className="form-help-text">
              当前阶段先恢复上传入口；下一步会接入后端 AI 处理流程，避免 API Key 暴露在前端。
            </small>
          </div>

          <label className="form-field">
            <span>销量数（可选）</span>
            <input type="number" name="salesCount" placeholder="可不填，默认为 0" />
            <small className="form-help-text">
              用于热销产品自动补位排序。
            </small>
          </label>

          <div className="admin-form-section">
            <h2>展示设置</h2>

            <label className="admin-checkbox-field">
              <input type="checkbox" name="isActive" defaultChecked />
              <span>上架该产品</span>
            </label>

            <label className="admin-checkbox-field">
              <input type="checkbox" name="isFeatured" />
              <span>设为推荐产品</span>
            </label>

            <label className="form-field">
              <span>推荐排序（可选）</span>
              <input
                type="number"
                name="featuredSort"
                placeholder="设为推荐时可填写；不填则自动排在最后"
              />
            </label>

            <label className="admin-checkbox-field">
              <input type="checkbox" name="isManualHot" />
              <span>设为人工热销产品</span>
            </label>

            <label className="form-field">
              <span>热销排序（可选）</span>
              <input
                type="number"
                name="manualHotSort"
                placeholder="设为热销时可填写；不填则自动排在最后"
              />
            </label>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="primary-button">
              保存产品
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}