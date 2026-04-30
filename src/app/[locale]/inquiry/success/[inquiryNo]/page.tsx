/**
 * 文件作用：
 * 前台多语言询单提交成功页。
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getFrontendPath, isFrontendLocale } from "@/lib/frontend-i18n";

export default async function LocaleInquirySuccessPage({
  params,
}: {
  params: Promise<{ locale: string; inquiryNo: string }>;
}) {
  const { locale: localeParam, inquiryNo } = await params;

  if (!isFrontendLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam;
  const isEn = locale === "en";

  return (
    <div className="site-shell">
      <SiteHeader locale={locale} />

      <main>
        <PageHero
          eyebrow={isEn ? "Success" : "提交成功"}
          title={isEn ? "Inquiry Submitted Successfully" : "询单提交成功"}
          description={
            isEn
              ? `Your inquiry number is ${inquiryNo}. Our team will contact you soon.`
              : `你的询单编号为 ${inquiryNo}，工作人员将尽快与你联系。`
          }
        />

        <section className="section">
          <div className="container page-actions">
            <Link href={getFrontendPath(locale, "/products")} className="primary-button">
              {isEn ? "Continue Browsing" : "继续浏览产品"}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}