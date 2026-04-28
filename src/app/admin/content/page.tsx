/**
 * 文件作用：
 * 定义后台内容管理页。
 * 面向普通使用者展示中文化、卡片化的网站内容配置入口。
 * 支持：
 * - 隐藏系统键
 * - 中文模块名称
 * - 中文用途说明
 * - 按首页内容 / 询单内容 / 其他内容分组
 * - 配置完整度提示
 * - 快速进入编辑页
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { getAdminContentPageData } from "@/lib/admin-data";

function getContentMeta(contentKey: string) {
  const metaMap: Record<
    string,
    {
      name: string;
      description: string;
      group: string;
      editTip: string;
    }
  > = {
    home_banner: {
      name: "首页横幅",
      description: "维护首页顶部主标题、介绍文案、按钮和展示图片。",
      group: "首页内容",
      editTip: "建议用于突出公司定位、主营产品和核心卖点。",
    },
    home_company_intro: {
      name: "首页公司介绍",
      description: "维护首页中的公司简介、品牌说明和业务定位。",
      group: "首页内容",
      editTip: "建议用简洁可信的文字介绍公司优势。",
    },
    home_advantages: {
      name: "首页企业优势",
      description: "维护首页底部的企业优势卡片内容。",
      group: "首页内容",
      editTip: "可直接填写优势标题和说明，保存后同步到前台首页。",
    },
    inquiry_success_contact: {
      name: "询单成功联系信息",
      description: "维护客户提交询单后看到的联系说明和补充信息。",
      group: "询单内容",
      editTip: "建议填写电话、邮箱、工作时间等便于客户继续联系的信息。",
    },
  };

  return (
    metaMap[contentKey] || {
      name: "其他内容模块",
      description: "该内容项暂未配置专用说明，可进入编辑页查看和维护。",
      group: "其他内容",
      editTip: "如不确定用途，建议先不要修改。",
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

function groupContentItems<T extends { contentKey: string }>(items: T[]) {
  const groups = ["首页内容", "询单内容", "其他内容"];

  return groups.map((groupName) => ({
    groupName,
    items: items.filter((item) => getContentMeta(item.contentKey).group === groupName),
  }));
}

export default async function AdminContentPage() {
  const { contentItems } = await getAdminContentPageData();
  const groupedItems = groupContentItems(contentItems);

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>内容管理</h1>
          <p>
            这里用于维护网站前台展示文字、图片和联系信息。所有技术配置已默认隐藏，
            普通使用者只需要进入对应模块填写中文内容即可。
          </p>
        </div>
      </div>

      <div className="admin-content-page">
        {groupedItems.map((group) =>
          group.items.length > 0 ? (
            <section key={group.groupName} className="admin-content-group">
              <div className="admin-content-group-header">
                <h2>{group.groupName}</h2>
                <p>选择需要维护的内容模块，点击进入后即可编辑。</p>
              </div>

              <div className="admin-content-card-grid">
                {group.items.map((item) => {
                  const meta = getContentMeta(item.contentKey);
                  const status = getConfigStatus(item);

                  return (
                    <article key={item.id} className="admin-content-card">
                      <div className="admin-content-card-header">
                        <div>
                          <span className="admin-field-label">{meta.group}</span>
                          <h3>{meta.name}</h3>
                        </div>

                        <span className={status.className}>{status.text}</span>
                      </div>

                      <p className="admin-content-card-desc">
                        {meta.description}
                      </p>

                      <div className="admin-content-card-info">
                        <p>
                          <strong>当前标题：</strong>
                          {item.title || "未设置标题"}
                        </p>
                        <p>
                          <strong>图片状态：</strong>
                          {item.imageUrl ? "已配置图片" : "未配置图片"}
                        </p>
                        <p>
                          <strong>操作提示：</strong>
                          {meta.editTip}
                        </p>
                      </div>

                      <div className="admin-content-card-actions">
                        <Link
                          href={`/admin/content/${item.id}`}
                          className="primary-button"
                        >
                          编辑这个模块
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null
        )}
      </div>
    </AdminLayout>
  );
}