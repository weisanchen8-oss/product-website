/**
 * 文件作用：
 * 定义后台单条内容项编辑页。
 * 支持：
 * - 编辑标题、正文、图片地址和附加 JSON 配置
 * - 返回内容管理列表
 * - 图片地址预览
 * - 内容模块中文说明
 * - JSON 填写提示
 * - 保存成功 / JSON 错误提示
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { prisma } from "@/lib/prisma";
import { updateSiteContentAction } from "@/app/admin/content/actions";
import { ContentVisualEditor } from "@/components/admin/content-visual-editor";

type AdminContentEditPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
};

function getContentMeta(contentKey: string) {
  const metaMap: Record<
    string,
    {
      name: string;
      description: string;
      jsonHint: string;
    }
  > = {
    home_hero: {
      name: "首页主视觉区域",
      description: "通常用于配置首页顶部标题、介绍文案、按钮文案和主图。",
      jsonHint:
        '{"primaryButtonText":"查看产品","primaryButtonHref":"/products","secondaryButtonText":"联系我们","secondaryButtonHref":"/contact"}',
    },
    home_about: {
      name: "首页公司介绍",
      description: "通常用于配置首页中的公司介绍、品牌说明或业务定位。",
      jsonHint: '{"items":["专业出口贸易服务","稳定供应链","快速响应客户询单"]}',
    },
    home_features: {
      name: "首页优势卖点",
      description: "通常用于配置首页展示的优势卡片、服务特色或能力说明。",
      jsonHint:
        '{"features":[{"title":"快速报价","description":"及时响应客户询单"}]}',
    },
    about_page: {
      name: "关于我们页面",
      description: "用于维护公司介绍、发展背景、企业定位等内容。",
      jsonHint: '{"sections":[{"title":"我们的优势","content":"这里填写说明"}]}',
    },
    contact_page: {
      name: "联系我们页面",
      description: "用于维护联系电话、邮箱、地址等联系信息。",
      jsonHint:
        '{"phone":"+86 000 0000 0000","email":"sales@example.com","address":"请输入公司地址"}',
    },
    footer_info: {
      name: "网站底部信息",
      description: "用于维护页脚公司信息、版权说明或辅助链接。",
      jsonHint: '{"copyright":"© 2026 Company Name","links":[]}',
    },
  };

  return (
    metaMap[contentKey] || {
      name: contentKey,
      description: "该内容项暂未配置中文说明，可根据前台展示效果进行维护。",
      jsonHint: '{"key":"value"}',
    }
  );
}

export default async function AdminContentEditPage({
  params,
  searchParams,
}: AdminContentEditPageProps) {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const contentId = Number(id);

  if (!contentId || Number.isNaN(contentId)) {
    notFound();
  }

  const contentItem = await prisma.siteContent.findUnique({
    where: { id: contentId },
  });

  if (!contentItem) {
    notFound();
  }

  const meta = getContentMeta(contentItem.contentKey);

  return (
    <AdminLayout>
      {saved === "1" ? (
        <AdminActionToast message="保存成功，内容已更新。" />
      ) : null}

      {error === "invalid-json" ? (
        <AdminActionToast message="保存失败：附加配置不是合法 JSON，请检查格式。" />
      ) : null}

      <div className="admin-page-header">
        <div>
          <h1>编辑内容：{meta.name}</h1>
          <p>{meta.description}</p>
        </div>

        <Link href="/admin/content" className="ghost-button">
          返回内容管理
        </Link>
      </div>

      <div className="admin-form-card">
        <div className="admin-content-meta">
          <details className="admin-advanced-config">
            <summary>展开技术信息</summary>
            <p>
              <strong>系统识别键：</strong>
              {contentItem.contentKey}
            </p>
          </details>
          <p>
            <strong>最近更新时间：</strong>
            {contentItem.updatedAt.toLocaleString("zh-CN")}
          </p>
        </div>

        <form
          action={updateSiteContentAction}
          className="stack-form"
        >
          <input type="hidden" name="id" value={contentItem.id} />

          <label className="form-field">
            <span>标题</span>
            <input
              type="text"
              name="title"
              defaultValue={contentItem.title ?? ""}
              placeholder="例如：首页主标题、关于我们标题、联系我们标题"
            />
            <small>用于前台页面中的主标题或模块标题。</small>
          </label>

          {contentItem.contentKey !== "home_advantages" ? (
            <label className="form-field">
              <span>正文内容</span>
              <textarea
                name="content"
                defaultValue={contentItem.content ?? ""}
                placeholder="请输入对用户展示的正文内容"
                className="admin-textarea"
                rows={8}
              />
              <small>建议使用简洁、正式、适合企业展示的文字。</small>
            </label>
          ) : null}

          <label className="form-field">
            <span>图片地址</span>
            <input
              type="text"
              name="imageUrl"
              defaultValue={contentItem.imageUrl ?? ""}
              placeholder="例如：https://example.com/banner.jpg，或在下方直接上传图片，保存后可自动识别。"
            />
            <small>可填写网络图片地址。留空则前台不展示该图片。</small>
          </label>

          <label className="form-field">
            <span>上传新图片</span>
            <input type="file" name="imageFile" accept="image/*" />
            <small>
              支持 jpg、png、webp、svg，最大 5MB。上传新图片后会自动替换上方图片地址。
            </small>
          </label>

          {contentItem.imageUrl ? (
            <div className="form-field">
              <span>当前图片预览</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={contentItem.imageUrl}
                alt={contentItem.title ?? "内容图片预览"}
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  borderRadius: "16px",
                  border: "1px solid #e5e7eb",
                  objectFit: "cover",
                }}
              />
            </div>
          ) : null}

          <ContentVisualEditor
            contentKey={contentItem.contentKey}
            defaultExtraJson={contentItem.extraJson}
            defaultContent={contentItem.content}
          />

          <div className="admin-form-actions">
            <button type="submit" className="primary-button">
              保存内容
            </button>

            <Link href="/admin/content" className="ghost-button">
              取消并返回
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}