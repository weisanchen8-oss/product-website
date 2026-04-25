/**
 * 文件作用：
 * 定义后台询单详情页。
 * 展示询单信息、产品清单、状态更新、内部备注、跟进记录和重点客户标记。
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { prisma } from "@/lib/prisma";
import {
  updateInquiryStatusAction,
  updateInquiryAdminNoteAction,
  addInquiryFollowAction,
  toggleImportantCustomerAction,
} from "@/app/admin/inquiries/actions";

type AdminInquiryDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

function getInquiryStatusText(status: string) {
  switch (status) {
    case "pending":
      return "待处理";
    case "contacting":
    case "communicating":
      return "沟通中";
    case "completed":
      return "已完成";
    case "closed":
      return "已关闭";
    case "note_updated":
      return "内部备注更新";
    default:
      return status || "未知状态";
  }
}

function getLogTitle(log: {
  status: string | null;
  fromStatus: string | null;
  toStatus: string | null;
  type: string;
}) {
  if (log.type === "status" && log.fromStatus && log.toStatus) {
    return `${getInquiryStatusText(log.fromStatus)} → ${getInquiryStatusText(
      log.toStatus
    )}`;
  }

  if (log.type === "note") {
    return "更新内部备注";
  }

  if (log.type === "follow") {
    return "新增跟进记录";
  }

  if (log.type === "customer") {
    return "客户标记变更";
  }

  if (log.status) {
    return getInquiryStatusText(log.status);
  }

  return "操作记录";
}

export default async function AdminInquiryDetailPage({
  params,
  searchParams,
}: AdminInquiryDetailPageProps) {
  const { id } = await params;
  const { success, error } = await searchParams;

  const inquiryId = Number(id);

  if (!inquiryId || Number.isNaN(inquiryId)) {
    notFound();
  }

  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    include: {
      user: true,
      items: true,
      logs: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!inquiry) {
    notFound();
  }

  return (
    <AdminLayout>
      {success === "status-updated" ? (
        <AdminActionToast message="询单状态已更新。" />
      ) : null}

      {success === "note-updated" ? (
        <AdminActionToast message="内部备注已保存。" />
      ) : null}

      {success === "follow-added" ? (
        <AdminActionToast message="跟进记录已添加。" />
      ) : null}

      {success === "customer-important" ? (
        <AdminActionToast message="已标记为重点客户。" />
      ) : null}

      {success === "customer-normal" ? (
        <AdminActionToast message="已取消重点客户标记。" />
      ) : null}

      {error === "invalid-status" ? (
        <AdminActionToast message="无效的询单状态。" />
      ) : null}

      {error === "follow-empty" ? (
        <AdminActionToast message="跟进内容不能为空。" />
      ) : null}

      <div className="admin-page-header">
        <div>
          <h1>询单详情</h1>
          <p>查看询单信息、产品清单，并持续记录客户跟进过程。</p>
        </div>

        <Link href="/admin/inquiries" className="secondary-button">
          返回询单管理
        </Link>
      </div>

      <div className="admin-detail-layout">
        <main className="admin-detail-main">
          <section className="admin-form-card admin-detail-section">
            <div className="admin-section-title-row">
              <h2>询单基本信息</h2>

              {inquiry.user.isImportant ? (
                <span className="important-customer-badge">⭐ 重点客户</span>
              ) : (
                <span className="normal-customer-badge">普通客户</span>
              )}
            </div>

            <div className="admin-detail-grid">
              <div>
                <span>询单编号</span>
                <strong>{inquiry.inquiryNo}</strong>
              </div>

              <div>
                <span>当前状态</span>
                <strong>{getInquiryStatusText(inquiry.status)}</strong>
              </div>

              <div>
                <span>提交时间</span>
                <strong>{inquiry.createdAt.toLocaleString("zh-CN")}</strong>
              </div>

              <div>
                <span>联系人</span>
                <strong>{inquiry.contactName}</strong>
              </div>

              <div>
                <span>公司名称</span>
                <strong>{inquiry.companyName}</strong>
              </div>

              <div>
                <span>联系电话</span>
                <strong>{inquiry.phone}</strong>
              </div>

              <div>
                <span>电子邮箱</span>
                <strong>{inquiry.email}</strong>
              </div>

              <div>
                <span>所在地区</span>
                <strong>{inquiry.region || "未填写"}</strong>
              </div>

              <div className="admin-detail-grid-full">
                <span>客户备注</span>
                <strong>{inquiry.remark || "未填写"}</strong>
              </div>
            </div>
          </section>

          <section className="admin-form-card admin-detail-section">
            <h2>产品清单</h2>

            <div className="admin-detail-item-list">
              {inquiry.items.map((item) => (
                <div key={item.id} className="admin-detail-item">
                  <div>
                    <strong>{item.productNameSnapshot}</strong>
                    <p>单价/价格：{item.priceSnapshot}</p>
                  </div>

                  <span>数量：{item.quantity}</span>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="admin-detail-sidebar">
          <section className="admin-form-card admin-detail-section important-customer-card">
            <h2>客户标记</h2>

            <p className="important-customer-desc">
              {inquiry.user.isImportant
                ? "该客户已被标记为重点客户，其后续询单会在列表中显示星标。"
                : "将该客户标记为重点客户后，其后续询单会在列表中显示星标。"}
            </p>

            <form action={toggleImportantCustomerAction}>
              <input type="hidden" name="inquiryId" value={inquiry.id} />
              <input type="hidden" name="userId" value={inquiry.userId} />
              <input
                type="hidden"
                name="nextImportant"
                value={inquiry.user.isImportant ? "false" : "true"}
              />

              <button
                type="submit"
                className={
                  inquiry.user.isImportant
                    ? "secondary-button important-toggle-button"
                    : "primary-button important-toggle-button"
                }
              >
                {inquiry.user.isImportant ? "取消重点客户" : "设为重点客户"}
              </button>
            </form>
          </section>

          <section className="admin-form-card admin-detail-section">
            <h2>更新询单状态</h2>

            <form action={updateInquiryStatusAction} className="admin-status-form">
              <input type="hidden" name="inquiryId" value={inquiry.id} />

              <div className="admin-form-group">
                <label>处理状态</label>
                <select name="status" defaultValue={inquiry.status}>
                  <option value="pending">待处理</option>
                  <option value="contacting">沟通中</option>
                  <option value="completed">已完成</option>
                  <option value="closed">已关闭</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>处理说明（可选）</label>
                <textarea
                  name="note"
                  rows={4}
                  placeholder="例如：已联系客户，等待报价确认。"
                />
              </div>

              <button type="submit" className="primary-button admin-status-submit">
                更新状态
              </button>
            </form>
          </section>

          <section className="admin-form-card admin-detail-section">
            <h2>添加跟进记录</h2>

            <form action={addInquiryFollowAction} className="admin-follow-form">
              <input type="hidden" name="inquiryId" value={inquiry.id} />

              <div className="admin-form-group">
                <label>跟进内容</label>
                <textarea
                  name="content"
                  rows={4}
                  placeholder="例如：已电话联系客户，客户希望补充 FOB 报价。"
                />
              </div>

              <button type="submit" className="primary-button admin-follow-submit">
                添加记录
              </button>
            </form>
          </section>

          <section className="admin-form-card admin-detail-section">
            <h2>内部备注</h2>

            <form
              action={updateInquiryAdminNoteAction}
              className="admin-note-form"
            >
              <input type="hidden" name="inquiryId" value={inquiry.id} />

              <div className="admin-form-group">
                <label>后台内部备注</label>
                <textarea
                  name="adminNote"
                  rows={6}
                  defaultValue={inquiry.adminNote || ""}
                  placeholder="例如：客户已电话沟通，重点关注交期和批发价格。"
                />
              </div>

              <button type="submit" className="primary-button admin-note-submit">
                保存内部备注
              </button>
            </form>
          </section>

          <section className="admin-form-card admin-detail-section">
            <h2>跟进与操作记录</h2>

            <div className="admin-timeline">
              {inquiry.logs.length > 0 ? (
                inquiry.logs.map((log) => (
                  <div
                    key={log.id}
                    className={`admin-timeline-item admin-timeline-${log.type}`}
                  >
                    <div className="admin-timeline-dot" />

                    <div className="admin-timeline-content">
                      <strong>
                        {getLogTitle({
                          status: log.status,
                          fromStatus: log.fromStatus,
                          toStatus: log.toStatus,
                          type: log.type,
                        })}
                      </strong>

                      <p>{log.note || "无备注"}</p>

                      <span>
                        {log.operatorName || "系统"} ·{" "}
                        {log.createdAt.toLocaleString("zh-CN")}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="admin-empty-text">暂无操作记录</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </AdminLayout>
  );
}