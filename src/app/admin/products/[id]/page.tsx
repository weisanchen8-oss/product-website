/**
 * 文件作用：
 * 定义后台产品编辑页。
 * 当前阶段支持编辑真实产品数据，并同步成功/失败弹窗反馈。
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { prisma } from "@/lib/prisma";
import {
  updateProductAction,
  uploadProductImageAction,
  setProductCoverImageAction,
  deleteProductImageAction,
} from "@/app/admin/products/actions";
import { ProductSpecsEditor } from "@/components/admin/product-specs-editor";
import Image from "next/image";

type AdminProductEditPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "missing-name":
      return "保存失败：请填写产品名称。";
    case "missing-category":
      return "保存失败：请选择产品分类。";
    case "missing-short-desc":
      return "保存失败：请填写产品简介。";
    case "missing-price":
      return "保存失败：请填写价格信息。";
    case "invalid-specs-json":
      return "保存失败：产品参数 JSON 格式不正确。";
    case "update-failed":
      return "保存失败：请检查 slug 是否重复或数据是否有效。";
    case "missing-image":
      return "上传失败：请选择图片文件。";
    case "invalid-image-type":
      return "上传失败：请上传图片格式文件。";
    default:
      return "";
  }
}

function parseSpecsForForm(specsJson: string | null) {
  if (!specsJson) {
    return [];
  }

  try {
    return Object.entries(JSON.parse(specsJson) as Record<string, string>).map(
      ([key, value]) => ({
        key,
        value,
      })
    );
  } catch {
    return [];
  }
}

export default async function AdminProductEditPage({
  params,
  searchParams,
}: AdminProductEditPageProps) {
  const { id } = await params;
  const { success, error } = await searchParams;
  const productId = Number(id);

  if (!productId || Number.isNaN(productId)) {
    notFound();
  }

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        images: {
          orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
        },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  if (!product) {
    notFound();
  }

  const errorMessage = getErrorMessage(error);
  const specEntries = parseSpecsForForm(product.specsJson);

  return (
    <AdminLayout>
      {success === "updated" ? (
        <AdminActionToast message="产品保存成功。" />
      ) : null}

      {success === "image-uploaded" ? (
        <AdminActionToast message="产品图片上传成功。" />
      ) : null}

      {success === "cover-updated" ? (
        <AdminActionToast message="封面图设置成功。" />
      ) : null}

      {success === "image-deleted" ? (
        <AdminActionToast message="产品图片删除成功。" />
      ) : null}

      {errorMessage ? <AdminActionToast message={errorMessage} /> : null}

      <div className="admin-page-header">
        <div>
          <h1>编辑产品</h1>
          <p>当前正在编辑真实产品数据，保存后前台页面会同步更新。</p>
        </div>

        <div className="admin-action-group">
          <Link
            href={`/product/${product.slug}`}
            className="ghost-button inline-button-link"
          >
            预览产品
          </Link>

          <Link href="/admin/products" className="ghost-button inline-button-link">
            返回产品管理
          </Link>
        </div>
      </div>

      <div className="admin-form-card">
        <form action={updateProductAction} className="stack-form">
          <input type="hidden" name="id" value={product.id} />

          <label className="form-field">
            <span>产品名称 *</span>
            <input type="text" name="name" defaultValue={product.name} />
          </label>

          <label className="form-field">
            <span>Slug（高级选项）</span>
            <input type="text" name="slug" defaultValue={product.slug} />
            <small className="form-help-text">
              用于产品详情页网址。一般不建议频繁修改。
            </small>
          </label>

          <label className="form-field">
            <span>产品分类 *</span>
            <select
              name="categoryId"
              className="admin-select"
              defaultValue={product.categoryId.toString()}
            >
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
              defaultValue={product.shortDesc}
              className="admin-textarea"
              rows={4}
            />
          </label>

          <label className="form-field">
            <span>详细介绍</span>
            <textarea
              name="fullDesc"
              defaultValue={product.fullDesc ?? ""}
              className="admin-textarea"
              rows={6}
            />
          </label>

          <label className="form-field">
            <span>关键词</span>
            <input
              type="text"
              name="keywords"
              defaultValue={product.keywords ?? ""}
            />
            <small className="form-help-text">
              多个关键词可用逗号分隔，用于搜索匹配。
            </small>
          </label>

          <label className="form-field">
            <span>价格信息 *</span>
            <input type="text" name="priceText" defaultValue={product.priceText} />
          </label>

          <ProductSpecsEditor initialSpecs={specEntries} />

          <label className="form-field">
            <span>销量数</span>
            <input
              type="number"
              name="salesCount"
              defaultValue={product.salesCount}
            />
          </label>

          <div className="admin-form-section">
            <h2>展示设置</h2>

            <label className="admin-checkbox-field">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={product.isActive}
              />
              <span>上架该产品</span>
            </label>

            <label className="admin-checkbox-field">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={product.isFeatured}
              />
              <span>设为推荐产品</span>
            </label>

            <label className="form-field">
              <span>推荐排序</span>
              <input
                type="number"
                name="featuredSort"
                defaultValue={product.featuredSort}
              />
            </label>

            <label className="admin-checkbox-field">
              <input
                type="checkbox"
                name="isManualHot"
                defaultChecked={product.isManualHot}
              />
              <span>设为人工热销产品</span>
            </label>

            <label className="form-field">
              <span>热销排序</span>
              <input
                type="number"
                name="manualHotSort"
                defaultValue={product.manualHotSort}
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

      <div className="admin-form-card admin-image-card">
        <h2>产品图片</h2>
        <p className="admin-section-help">
           当前为基础图片上传版本。后续会在这里接入 AI 抠图、白底处理和 Logo 叠加。
         </p>
          
         <form action={uploadProductImageAction} className="admin-upload-form">
           <input type="hidden" name="productId" value={product.id} />
          
          <label className="form-field">
            <span>上传产品图片</span>
              <input type="file" name="image" accept="image/*" />
          </label>
          
          <button type="submit" className="primary-button">
            上传图片
          </button>
        </form>
          
        <div className="admin-image-list">
          {product.images.length > 0 ? (
            product.images.map((image) => (
              <div key={image.id} className="admin-image-item">
                <Image
                  src={image.processedUrl ?? image.originalUrl}
                  alt={product.name}
                  width={120}
                  height={90}
                  className="admin-image-preview"
                />

                <div className="admin-image-info">
                  <strong>{image.isCover ? "当前封面图" : "产品图片"}</strong>
                  <p>处理状态：{image.processingStatus}</p>
                  <p>图片地址：{image.processedUrl ?? image.originalUrl}</p>
                </div>

                <div className="admin-image-actions">
                  {image.isCover ? (
                    <span className="admin-cover-badge">已设为封面</span>
                  ) : (
                    <form action={setProductCoverImageAction}>
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="imageId" value={image.id} />
                      <button type="submit" className="ghost-button">
                        设为封面图
                      </button>
                    </form>
                  )}

                  <form action={deleteProductImageAction}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="imageId" value={image.id} />
                    <button type="submit" className="danger-button">
                      删除图片
                    </button>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <p className="admin-section-help">当前产品还没有上传图片。第一张上传图片会自动成为封面图。</p>
          )}
        </div>
      </div>
        
    </AdminLayout>
  );
}

