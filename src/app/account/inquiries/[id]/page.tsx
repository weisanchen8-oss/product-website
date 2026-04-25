/**
 * 文件作用：
 * 定义前台“我的询单详情”页面。
 * 当前版本根据询单编号读取真实询单信息，展示产品清单、处理状态和状态记录。
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type AccountInquiryDetailPageProps = {
  params: Promise<{
    id: string;
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

export default async function AccountInquiryDetailPage({
  params,
}: AccountInquiryDetailPageProps) {
  const { id } = await params;

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    notFound();
  }

  const inquiry = await prisma.inquiry.findFirst({
    where: {
      inquiryNo: id,
      userId: currentUser.id,
    },
    include: {
      items: true,
      logs: {
        orderBy: [{ createdAt: "desc" }],
      },
    },
  });

  if (!inquiry) {
    notFound();
  }

  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <PageHero
          eyebrow="Inquiry Detail"
          title="询单详情"
          description="查看您的询单产品清单、处理状态和状态记录。"
        />

        <section className="section">
          <div className="container">
            <div className="content-card">
              <h2>基本信息</h2>
              <div className="account-detail-list">
                <p><strong>询单编号：</strong>{inquiry.inquiryNo}</p>
                <p><strong>当前状态：</strong>{getInquiryStatusText(inquiry.status)}</p>
                <p><strong>提交时间：</strong>{inquiry.createdAt.toLocaleString("zh-CN")}</p>
                <p><strong>联系人：</strong>{inquiry.contactName}</p>
                <p><strong>公司名称：</strong>{inquiry.companyName}</p>
                <p><strong>联系电话：</strong>{inquiry.phone}</p>
                <p><strong>电子邮箱：</strong>{inquiry.email}</p>
                <p><strong>备注说明：</strong>{inquiry.remark || "未填写"}</p>
              </div>
            </div>

            <div className="content-card account-detail-section">
              <h2>产品清单</h2>
              <div className="account-item-list">
                {inquiry.items.map((item) => (
                  <div key={item.id} className="account-item">
                    <div>
                      <strong>{item.productNameSnapshot}</strong>
                      <p>价格：{item.priceSnapshot}</p>
                    </div>
                    <span>数量：{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="content-card account-detail-section">
              <h2>状态记录</h2>
              <div className="account-log-list">
                {inquiry.logs.map((log) => (
                  <div key={log.id} className="account-log-item">
                    <strong>{getInquiryStatusText(log.status)}</strong>
                    <p>{log.note || "无备注"}</p>
                    <span>{log.createdAt.toLocaleString("zh-CN")}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="page-actions">
              <Link
                href="/account/inquiries"
                className="ghost-button inline-button-link"
              >
                返回我的询单
              </Link>
              <Link href="/products" className="primary-button inline-button-link">
                继续浏览产品
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}