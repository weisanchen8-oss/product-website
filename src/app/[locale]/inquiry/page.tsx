/**
 * 文件作用：
 * 前台多语言询单提交页。
 * 当前支持 /zh/inquiry 和 /en/inquiry。
 */

import { notFound } from "next/navigation";
import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { FrontendInquiryForm } from "@/components/inquiry/frontend-inquiry-form";
import { isFrontendLocale } from "@/lib/frontend-i18n";

export default async function LocaleInquiryPage({
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
      <SiteHeader locale={locale} />

      <main>
        <PageHero
          eyebrow={isEn ? "Submit Inquiry" : "Inquiry"}
          title={isEn ? "Submit Inquiry" : "提交询单"}
          description={
            isEn
              ? "Fill in your contact information and purchase requirements. Our team will follow up as soon as possible."
              : "填写联系方式与采购需求，工作人员将尽快跟进。"
          }
        />

        <section className="section">
          <div className="container">
            <FrontendInquiryForm locale={locale} />
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}