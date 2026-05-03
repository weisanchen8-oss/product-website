/**
 * 文件作用：
 * 定义后台产品编辑页。
 * 支持编辑产品基础信息、上传产品图片、AI图片优化、设置封面图、删除图片。
 */

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { prisma } from "@/lib/prisma";
import {
  updateProductAction,
  uploadProductImageAction,
  setProductCoverImageAction,
  deleteProductImageAction,
  processProductImageWithAiAction,
  applyTextWatermarkToSelectedProductImagesAction,
  applyLogoWatermarkToSelectedProductImagesAction,
} from "@/app/admin/products/actions";
import { ProductSpecsEditor } from "@/components/admin/product-specs-editor";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { SubmitButton } from "@/components/admin/submit-button";
import { ImageSelectToolbar } from "@/components/admin/image-select-toolbar";
import { ConfirmSubmitActionButton } from "@/components/admin/confirm-submit-action-button";
import { LogoImageUploadField } from "@/components/admin/logo-image-upload-field";

type AdminProductEditPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    success?: string;
    error?: string;
    count?: string;
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
    case "update-failed":
      return "保存失败：请检查 slug 是否重复或数据是否有效。";
    case "missing-image":
      return "上传失败：请选择图片文件。";
    case "invalid-image-type":
      return "上传失败：请上传图片格式文件。";
    case "ai-image-failed":
      return "AI 图片优化失败：请检查 API Key、图片格式或 remove.bg 额度。";
    case "missing-watermark-text":
      return "添加水印失败：请输入水印文字。";
    case "watermark-failed":
      return "添加水印失败：请检查图片是否存在或稍后重试。";
    case "missing-logo-file":
      return "添加 Logo 水印失败：请先选择 Logo 图片。";
    case "missing-selected-images":
      return "添加水印失败：请先勾选要加水印的图片。";
    case "invalid-logo-file":
      return "添加 Logo 水印失败：请上传图片格式的 Logo 文件。";
    case "logo-watermark-failed":
      return "添加 Logo 水印失败：请检查图片是否存在或稍后重试。";
    default:
      return "";
  }
}

function getImageProcessingStatus(status: string) {
  switch (status) {
    case "processing":
      return {
        text: "处理中",
        className: "admin-ai-status admin-ai-status-processing",
      };
    case "success":
      return {
        text: "处理成功",
        className: "admin-ai-status admin-ai-status-success",
      };
    case "failed":
      return {
        text: "处理失败",
        className: "admin-ai-status admin-ai-status-failed",
      };
    case "idle":
    default:
      return {
        text: "未处理",
        className: "admin-ai-status admin-ai-status-idle",
      };
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
  const { success, error, count } = await searchParams;
  const successCount = Number(count);
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
  const specEntriesEn = parseSpecsForForm(product.specsJsonEn);

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

      {success === "watermark-applied" ? (
        <AdminActionToast
          message={
            Number.isFinite(successCount) && successCount > 0
              ? `文字水印添加成功，共处理 ${successCount} 张图片。`
              : "文字水印添加成功。"
          }
        />
      ) : null}

      {success === "logo-watermark-applied" ? (
        <AdminActionToast
          message={
            Number.isFinite(successCount) && successCount > 0
              ? `Logo 水印添加成功，共处理 ${successCount} 张图片。`
              : "Logo 水印添加成功。"
          }
        />
      ) : null}

      {success === "ai-image-processed" ? (
        <AdminActionToast message="AI 图片优化完成。" />
      ) : null}

      {errorMessage ? <AdminActionToast message={errorMessage} /> : null}

      <div className="admin-page-header">
        <div>
          <h1>编辑产品</h1>
          <p>当前正在编辑真实产品数据，保存后前台页面会同步更新。</p>
        </div>

        <div className="admin-action-group">
          <Link
            href={`/zh/product/${product.slug}`}
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
            <span>英文产品名称（可选）</span>
            <input
              type="text"
              name="nameEn"
              defaultValue={product.nameEn ?? ""}
              placeholder="例如：Industrial Water Pump"
            />
            <small className="form-help-text">
              用于英文前台页面展示；不填写时英文页面会显示中文名称。
            </small>
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
            <span>英文产品简介（可选）</span>
            <textarea
              name="shortDescEn"
              defaultValue={product.shortDescEn ?? ""}
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
            <span>英文详细介绍（可选）</span>
            <textarea
              name="fullDescEn"
              defaultValue={product.fullDescEn ?? ""}
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

          <ProductSpecsEditor
            initialSpecs={specEntries}
            initialSpecsEn={specEntriesEn}
          />

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
          当前支持基础图片上传与 AI 抠图白底优化。建议上传主体清晰、背景简单的真实产品图。
        </p>

        <form action={uploadProductImageAction} className="admin-upload-form">
          <input type="hidden" name="productId" value={product.id} />

          <label className="form-field">
            <span>上传产品图片</span>
            <input type="file" name="image" accept="image/*" />
            <small className="form-help-text">
              建议上传主体清晰、背景简单的真实产品图，AI 优化成功率更高。
            </small>
          </label>

          <label className="admin-checkbox-field">
            <input type="checkbox" name="autoAiProcess" />
            <span>上传后自动进行 AI 抠图白底优化</span>
          </label>

          <button type="submit" className="primary-button">
            上传图片
          </button>
        </form>
 
        <ImageSelectToolbar />

        <form
          id="batch-watermark-form"
          action={applyTextWatermarkToSelectedProductImagesAction}
          className="admin-batch-watermark-bar"
        >
          <input type="hidden" name="productId" value={product.id} />

          {/* 左侧输入区 */}
          <div className="admin-watermark-input-group">
            <LogoImageUploadField />

            <input
              type="text"
              name="watermarkText"
              placeholder="输入统一水印文字"
              className="admin-input"
            />
          </div>

          {/* 右侧按钮区 */}
          <div className="admin-watermark-actions">
            <ConfirmSubmitActionButton
              className="watermark-action-button watermark-action-button-secondary"
              loadingText="加Logo中..."
              confirmMessage="确定要给选中的图片添加 Logo 水印吗？"
              formAction={applyLogoWatermarkToSelectedProductImagesAction}
            >
              加Logo水印
            </ConfirmSubmitActionButton>

            <ConfirmSubmitActionButton
              className="watermark-action-button watermark-action-button-primary"
              loadingText="加水印中..."
              confirmMessage="确定要给选中的图片添加文字水印吗？"
            >
              加文字水印
            </ConfirmSubmitActionButton>
          </div>
        </form>

        <div className="admin-image-list">
          {product.images.length > 0 ? (
            product.images.map((image) => {
              const statusInfo = getImageProcessingStatus(image.processingStatus);
              const displayUrl =
                image.watermarkedUrl ?? image.processedUrl ?? image.originalUrl;

              return (
                <div key={image.id} className="admin-image-item">
                  <label className="admin-image-select">
                    <input
                      type="checkbox"
                      name="imageIds"
                      value={image.id}
                      form="batch-watermark-form"
                    />
                    <span>选择</span>
                  </label>

                  <Image
                    src={displayUrl}
                    alt={product.name}
                    width={120}
                    height={90}
                    className="admin-image-preview"
                  />

                  <div className="admin-image-info">
                    <strong>{image.isCover ? "当前封面图" : "产品图片"}</strong>

                    <p>
                      AI处理状态：
                      <span className={statusInfo.className}>
                        {statusInfo.text}
                      </span>
                    </p>

                    <p>图片地址：{displayUrl}</p>

                    {image.processingStatus === "failed" &&
                    image.processingError ? (
                      <p className="admin-error-text">
                        失败原因：{image.processingError}
                      </p>
                    ) : null}
                  </div>

                  <div className="admin-image-actions">
                    <form action={processProductImageWithAiAction}>
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="imageId" value={image.id} />
                      <SubmitButton className="ghost-button">
                        {image.isProcessed ? "重新AI优化" : "AI优化图片"}
                      </SubmitButton>
                    </form>

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
                      <ConfirmSubmitButton
                        className="danger-button"
                        message="确定要删除这张产品图片吗？删除后不可恢复。"
                      >
                        删除图片
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="admin-section-help">
              当前产品还没有上传图片。第一张上传图片会自动成为封面图。
            </p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}