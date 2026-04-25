/**
 * 文件作用：
 * 定义后台单条内容项编辑页。
 * 当前阶段支持编辑 SiteContent 的标题、正文、图片地址和附加 JSON 配置，
 * 并在保存成功后显示弹窗提示。
 */

import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { prisma } from "@/lib/prisma";
import { updateSiteContentAction } from "@/app/admin/content/actions";

type AdminContentEditPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    saved?: string;
  }>;
};

export default async function AdminContentEditPage({
  params,
  searchParams,
}: AdminContentEditPageProps) {
  const { id } = await params;
  const { saved } = await searchParams;
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

  return (
    <AdminLayout>
      {saved === "1" ? <AdminActionToast message="保存成功，内容已更新。" /> : null}

      <div className="admin-page-header">
        <div>
          <h1>编辑内容项</h1>
          <p>当前正在编辑数据库中的真实内容配置项。</p>
        </div>
      </div>

      <div className="admin-form-card">
        <div className="admin-content-meta">
          <p>
            <strong>内容键：</strong>
            {contentItem.contentKey}
          </p>
          <p>
            <strong>最近更新时间：</strong>
            {contentItem.updatedAt.toLocaleString("zh-CN")}
          </p>
        </div>

        <form action={updateSiteContentAction} className="stack-form">
          <input type="hidden" name="id" value={contentItem.id} />

          <label className="form-field">
            <span>标题</span>
            <input
              type="text"
              name="title"
              defaultValue={contentItem.title ?? ""}
              placeholder="请输入内容标题"
            />
          </label>

          <label className="form-field">
            <span>正文内容</span>
            <textarea
              name="content"
              defaultValue={contentItem.content ?? ""}
              placeholder="请输入内容正文"
              className="admin-textarea"
              rows={8}
            />
          </label>

          <label className="form-field">
            <span>图片地址</span>
            <input
              type="text"
              name="imageUrl"
              defaultValue={contentItem.imageUrl ?? ""}
              placeholder="请输入图片地址"
            />
          </label>

          <label className="form-field">
            <span>附加配置（JSON）</span>
            <textarea
              name="extraJson"
              defaultValue={contentItem.extraJson ?? ""}
              placeholder='例如：{"primaryButtonText":"查看产品"}'
              className="admin-textarea"
              rows={8}
            />
          </label>

          <div className="admin-form-actions">
            <button type="submit" className="primary-button">
              保存内容
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}