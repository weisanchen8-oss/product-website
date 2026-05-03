/**
 * 文件作用：
 * 前台多语言联系我们页。
 * 当前支持 /zh/contact 和 /en/contact。
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getFrontendPath, isFrontendLocale } from "@/lib/frontend-i18n";

export default async function LocaleContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  if (!isFrontendLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam;
  const isEn = locale === "en";

  return (
    <div className="site-shell">
      <SiteHeader locale={locale} variant="solid" />

      <main>
        <PageHero
          eyebrow={isEn ? "Contact" : "联系我们"}
          title={isEn ? "Contact Us" : "联系我们"}
          description={
            isEn
              ? "Send us your product needs and our team will contact you as soon as possible."
              : "你可以提交产品需求，工作人员将尽快与你联系。"
          }
        />

        <section className="section">
          <div className="container detail-section-grid">
            <div className="detail-card">
              <h2>{isEn ? "Business Inquiry" : "业务咨询"}</h2>
              <p>
                {isEn
                  ? "For product price, specifications, delivery, and cooperation details, please submit an inquiry."
                  : "如需了解产品价格、规格、交付周期或合作方式，请提交询单。"}
              </p>

              <div className="page-actions">
                <Link href={getFrontendPath(locale, "/inquiry")} className="primary-button">
                  {isEn ? "Submit Inquiry" : "提交询单"}
                </Link>
              </div>
            </div>

            <div className="detail-card">
              <h2>{isEn ? "Contact Information" : "联系方式"}</h2>
              <p>{isEn ? "Email: contact@example.com" : "邮箱：contact@example.com"}</p>
              <p>{isEn ? "Phone: +86 000 0000 0000" : "电话：+86 000 0000 0000"}</p>
              <p>{isEn ? "Address: Please configure your company address." : "地址：请在后续配置企业实际地址。"}</p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}