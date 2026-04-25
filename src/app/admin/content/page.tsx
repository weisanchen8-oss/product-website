/**
 * 文件作用：
 * 定义后台内容管理页。
 * 当前版本从数据库读取真实内容配置项，并提供进入单条内容编辑页的入口。
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { getAdminContentPageData } from "@/lib/admin-data";

function getSafePreviewText(content: string | null) {
  if (!content) {
    return "暂无内容。";
  }

  if (content.length <= 80) {
    return content;
  }

  return `${content.slice(0, 80)}...`;
}

export default async function AdminContentPage() {
  const { contentItems } = await getAdminContentPageData();

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>内容管理</h1>
          <p>当前页面已从数据库读取真实内容配置数据。</p>
        </div>
      </div>

      <div className="admin-table">
        {contentItems.map((item) => (
          <div key={item.id} className="admin-row admin-row-content">
            <div className="admin-cell-main">
              <span className="admin-field-label">内容键</span>
              <strong>{item.contentKey}</strong>
              <p>{item.title ?? "未设置标题"}</p>
            </div>

            <div className="admin-cell-block">
              <span className="admin-field-label">内容预览</span>
              <span>{getSafePreviewText(item.content)}</span>
            </div>

            <div className="admin-cell-block">
              <span className="admin-field-label">图片</span>
              <span>{item.imageUrl ? "已配置" : "未配置"}</span>
            </div>

            <div className="admin-cell-block">
              <span className="admin-field-label">附加配置</span>
              <span>{item.extraJson ? "已配置" : "未配置"}</span>
            </div>

            <div className="admin-cell-block">
              <div className="admin-action-group">
                <Link
                  href={`/admin/content/${item.id}`}
                  className="ghost-button inline-button-link"
                >
                  编辑
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}