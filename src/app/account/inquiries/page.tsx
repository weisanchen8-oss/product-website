/**
 * 文件作用：
 * 定义前台“我的询单”页面。
 * 当前版本只读取当前登录用户自己的真实询单记录。
 */

import Link from "next/link";
import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { EmptyStateCard } from "@/components/common/empty-state-card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export default async function AccountInquiriesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <div className="site-shell">
        <SiteHeader />

        <main>
          <PageHero
            eyebrow="My Inquiries"
            title="我的询单"
            description="登录后可查看您提交过的询单记录和当前处理状态。"
          />

          <section className="section">
            <div className="container">
              <EmptyStateCard
                title="请先登录"
                description="登录后可查看您的询单记录。"
              />

              <div className="page-actions">
                <Link href="/login" className="primary-button inline-button-link">
                  前往登录
                </Link>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    );
  }

  const inquiries = await prisma.inquiry.findMany({
    where: {
      userId: currentUser.id,
    },
    orderBy: [{ createdAt: "desc" }],
    include: {
      items: true,
    },
  });

  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <PageHero
          eyebrow="My Inquiries"
          title="我的询单"
          description="这里用于查看您提交过的询单记录和当前处理状态。"
        />

        <section className="section">
          <div className="container">
            {inquiries.length > 0 ? (
              <div className="content-card">
                <h2>询单记录列表</h2>

                <div className="inquiry-record-list">
                  {inquiries.map((item) => (
                    <div key={item.id} className="inquiry-record-item">
                      <div className="inquiry-record-main">
                        <h3>询单编号：{item.inquiryNo}</h3>
                        <p>提交时间：{item.createdAt.toLocaleString("zh-CN")}</p>
                        <p>产品数量：{item.items.length}</p>
                      </div>

                      <div className="inquiry-record-side">
                        <p>预估信息：{item.estimatedTotalText}</p>
                        <span className="status-badge">
                          {getInquiryStatusText(item.status)}
                        </span>

                        <Link
                          href={`/account/inquiries/${item.inquiryNo}`}
                          className="ghost-button inline-button-link inquiry-detail-link"
                        >
                          查看详情
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyStateCard
                title="暂无询单记录"
                description="您提交询单后，这里会显示对应的询单记录和处理状态。"
              />
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}