/**
 * 文件作用：
 * 定义后台内容管理页。
 * 用更友好的方式展示网站内容配置项，降低普通使用者的理解成本。
 * 支持：
 * - 内容模块中文名称展示
 * - 内容用途说明
 * - 标题 / 正文 / 图片 / 附加配置完整度提示
 * - 快速进入单条内容编辑页
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { getAdminContentPageData } from "@/lib/admin-data";

function getSafePreviewText(content: string | null) {
  if (!content) {
    return "暂无正文内容。";
  }

  if (content.length <= 80) {
    return content;
  }

  return `${content.slice(0, 80)}...`;
}

function getContentMeta(contentKey: string) {
  const metaMap: Record<
    string,
    {
      name: string;
      description: string;
      group: string;
    }
  > = {
    home_hero: {
      name: "首页主视觉区域",
      description: "控制首页顶部的大标题、介绍文案和主图展示。",
      group: "首页内容",
    },
    home_about: {
      name: "首页公司介绍",
      description: "用于展示公司简介、品牌优势和业务定位。",
      group: "首页内容",
    },
    home_features: {
      name: "首页优势卖点",
      description: "用于配置首页展示的核心优势、服务特色或能力说明。",
      group: "首页内容",
    },
    about_page: {
      name: "关于我们页面",
      description: "用于维护公司介绍、发展背景和企业说明。",
      group: "基础页面",
    },
    contact_page: {
      name: "联系我们页面",
      description: "用于维护联系方式、地址、邮箱、电话等信息。",
      group: "基础页面",
    },
    footer_info: {
      name: "网站底部信息",
      description: "用于维护页脚展示的公司信息、版权信息或辅助链接。",
      group: "通用内容",
    },
  };

  return (
    metaMap[contentKey] || {
      name: contentKey,
      description: "该内容项暂未配置中文说明，可进入编辑页查看详情。",
      group: "其他内容",
    }
  );
}

function getConfigStatus(item: {
  title: string | null;
  content: string | null;
  imageUrl: string | null;
  extraJson: unknown;
}) {
  const checks = [
    Boolean(item.title),
    Boolean(item.content),
    Boolean(item.imageUrl),
    Boolean(item.extraJson),
  ];

  const completedCount = checks.filter(Boolean).length;

  if (completedCount >= 3) {
    return {
      text: "配置较完整",
      className: "admin-status-badge admin-status-completed",
    };
  }

  if (completedCount >= 1) {
    return {
      text: "部分配置",
      className: "admin-status-badge admin-status-contacting",
    };
  }

  return {
    text: "待完善",
    className: "admin-status-badge admin-status-pending",
  };
}

export default async function AdminContentPage() {
  const { contentItems } = await getAdminContentPageData();

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>内容管理</h1>
          <p>
            统一维护网站首页、关于我们、联系我们、底部信息等展示内容。
            修改后会影响前台对应页面展示。
          </p>
        </div>
      </div>

      <div className="admin-table">
        {contentItems.map((item) => {
          const meta = getContentMeta(item.contentKey);
          const status = getConfigStatus(item);

          return (
            <div key={item.id} className="admin-row admin-row-content">
              <div className="admin-cell-main">
                <span className="admin-field-label">{meta.group}</span>
                <strong>{meta.name}</strong>
                <p>{meta.description}</p>
              </div>

              <div className="admin-cell-block">
                <span className="admin-field-label">当前标题</span>
                <span>{item.title || "未设置标题"}</span>
              </div>

              <div className="admin-cell-block">
                <span className="admin-field-label">正文预览</span>
                <span>{getSafePreviewText(item.content)}</span>
              </div>

              <div className="admin-cell-block">
                <span className="admin-field-label">配置状态</span>
                <span className={status.className}>{status.text}</span>
              </div>

              <div className="admin-cell-block">
                <div className="admin-action-group">
                  <Link
                    href={`/admin/content/${item.id}`}
                    className="ghost-button inline-button-link"
                  >
                    编辑内容
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}