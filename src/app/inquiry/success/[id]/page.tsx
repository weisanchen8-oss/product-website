/**
 * 文件作用：
 * 定义询单成功页。
 * 当前版本根据询单编号读取真实询单信息，并展示后续联系提示。
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { prisma } from "@/lib/prisma";

type InquirySuccessPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function InquirySuccessPage({
  params,
}: InquirySuccessPageProps) {
  const { id } = await params;

  const inquiry = await prisma.inquiry.findUnique({
    where: {
      inquiryNo: id,
    },
    include: {
      items: true,
    },
  });

  if (!inquiry) {
    notFound();
  }

  const contactContent = await prisma.siteContent.findUnique({
    where: {
      contentKey: "inquiry_success_contact",
    },
  });

  const contactInfo = contactContent?.extraJson
    ? JSON.parse(contactContent.extraJson)
    : {
        contactName: "公司工作人员",
        phone: "000-00000000",
        wechat: "后续由后台配置",
        email: "contact@example.com",
      };

  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <PageHero
          eyebrow="Inquiry Success"
          title="询单已提交"
          description="我们已收到您的询单信息，后续订购流程请与工作人员联系。"
        />

        <section className="section">
          <div className="container narrow-container">
            <div className="success-card">
              <div className="success-icon">✓</div>
              <h2>询单提交成功</h2>
              <p>询单编号：{inquiry.inquiryNo}</p>
              <p>提交时间：{inquiry.createdAt.toLocaleString("zh-CN")}</p>
              <p>当前状态：待处理</p>

              <div className="success-contact-box">
                <h3>已提交产品清单</h3>

                <div className="success-item-list">
                  {inquiry.items.map((item) => (
                    <div key={item.id} className="success-item">
                      <strong>{item.productNameSnapshot}</strong>
                      <span>数量：{item.quantity}</span>
                      <span>{item.priceSnapshot}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="success-contact-box">
                <h3>{contactContent?.content ?? "请联系工作人员继续后续流程"}</h3>
                <p>联系人：{contactInfo.contactName}</p>
                <p>联系电话：{contactInfo.phone}</p>
                <p>企业微信：{contactInfo.wechat}</p>
                <p>电子邮箱：{contactInfo.email}</p>
              </div>

              <div className="success-action-row">
                <Link href="/" className="ghost-button inline-button-link">
                  返回首页
                </Link>
                <Link href="/products" className="ghost-button inline-button-link">
                  继续浏览产品
                </Link>
                <Link
                  href="/account/inquiries"
                  className="primary-button inline-button-link"
                >
                  查看我的询单
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}