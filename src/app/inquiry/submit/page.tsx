/**
 * 文件作用：
 * 定义提交询单页。
 * 当前版本要求用户登录后才能提交询单，并自动带入当前登录用户的联系信息。
 */

import Link from "next/link";
import { PageHero } from "@/components/common/page-hero";
import { InquirySubmitClient } from "@/components/inquiry/inquiry-submit-client";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentUser } from "@/lib/auth";

type InquirySubmitPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "missing-required":
      return "请填写联系人姓名、公司名称、联系电话和电子邮箱。";
    case "empty-cart":
      return "询单清单为空，请先添加产品后再提交。";
    case "no-valid-products":
      return "清单中的产品当前不可提交，请返回产品中心重新选择。";
    default:
      return "";
  }
}

export default async function InquirySubmitPage({
  searchParams,
}: InquirySubmitPageProps) {
  const { error } = await searchParams;
  const errorMessage = getErrorMessage(error);
  const currentUser = await getCurrentUser();

  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <PageHero
          eyebrow="Inquiry Submit"
          title="提交询单"
          description="请填写联系信息并确认产品清单，提交后工作人员将通过站外方式与您联系。"
        />

        <section className="section">
          <div className="container">
            {currentUser ? (
              <InquirySubmitClient
                errorMessage={errorMessage}
                defaultContact={{
                  name: currentUser.name ?? "",
                  companyName: currentUser.companyName ?? "",
                  phone: currentUser.phone ?? "",
                  email: currentUser.email ?? "",
                }}
              />
            ) : (
              <div className="cart-empty-card">
                <h2>请先登录后再提交询单</h2>
                <p>您可以先把产品加入询单清单，登录后再提交正式询单。</p>
                <Link
                  href="/login?error=login-required"
                  className="primary-button inline-button-link"
                >
                  前往登录
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}