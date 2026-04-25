/**
 * 文件作用：
 * 定义后台询单详情页。
 * 当前版本展示真实询单信息、产品清单、状态日志，并支持更新询单状态。
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { prisma } from "@/lib/prisma";
import { updateInquiryStatusAction } from "@/app/admin/inquiries/actions";

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
    case "communicating":
      return "沟通中";
    case "completed":
      return "已完成";
    case "closed":
      return "已关闭";
    default:
      return status;
  }
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
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!inquiry) {
    notFound();
  }

  return (
    <AdminLayout>
      {success === "status-updated" ? (
        <AdminActionToast message="询单状态更新成功。" />
      ) : null}

      {error === "invalid-status" ? (
        <AdminActionToast message="状态更新失败：请选择有效状态。" />
      ) : null}

      <div className="admin-page-header">
        <div>
          <h1>询单详情</h1>
          <p>查看询单信息、产品清单，并更新处理状态。</p>
        </div>

        <Link href="/admin/inquiries" className="ghost-button inline-button-link">
          返回询单管理
        </Link>
      </div>

      <div className="admin-detail-grid">
        <div className="admin-form-card">
          <h2>询单基本信息</h2>

          <div className="admin-detail-list">
            <p><strong>询单编号：</strong>{inquiry.inquiryNo}</p>
            <p><strong>当前状态：</strong>{getInquiryStatusText(inquiry.status)}</p>
            <p><strong>提交时间：</strong>{inquiry.createdAt.toLocaleString("zh-CN")}</p>
            <p><strong>联系人：</strong>{inquiry.contactName}</p>
            <p><strong>公司名称：</strong>{inquiry.companyName}</p>
            <p><strong>联系电话：</strong>{inquiry.phone}</p>
            <p><strong>电子邮箱：</strong>{inquiry.email}</p>
            <p><strong>所在地区：</strong>{inquiry.region || "未填写"}</p>
            <p><strong>备注说明：</strong>{inquiry.remark || "未填写"}</p>
          </div>
        </div>

        <div className="admin-form-card">
          <h2>更新询单状态</h2>

          <form action={updateInquiryStatusAction} className="stack-form">
            <input type="hidden" name="inquiryId" value={inquiry.id} />

            <label className="form-field">
              <span>处理状态</span>
              <select
                name="status"
                className="admin-select"
                defaultValue={inquiry.status}
              >
                <option value="pending">待处理</option>
                <option value="communicating">沟通中</option>
                <option value="completed">已完成</option>
                <option value="closed">已关闭</option>
              </select>
            </label>

            <label className="form-field">
              <span>处理备注</span>
              <textarea
                name="note"
                className="admin-textarea"
                rows={5}
                placeholder="例如：已通过微信联系客户，等待确认报价。"
              />
            </label>

            <button type="submit" className="primary-button">
              保存状态
            </button>
          </form>
        </div>
      </div>

      <div className="admin-form-card admin-detail-section">
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
      </div>

      <div className="admin-form-card admin-detail-section">
        <h2>状态记录</h2>

        <div className="admin-detail-log-list">
          {inquiry.logs.map((log) => (
            <div key={log.id} className="admin-detail-log-item">
              <strong>{getInquiryStatusText(log.status)}</strong>
              <p>{log.note || "无备注"}</p>
              <span>
                {log.operatorName || "系统"} · {log.createdAt.toLocaleString("zh-CN")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}