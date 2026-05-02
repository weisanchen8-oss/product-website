/**
 * 文件作用：
 * 前台多语言询单清单页。
 * 当前支持 /zh/inquiry-cart 和 /en/inquiry-cart。
 */

import { notFound } from "next/navigation";
import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { FrontendInquiryCart } from "@/components/inquiry/frontend-inquiry-cart";
import { isFrontendLocale } from "@/lib/frontend-i18n";

export default async function LocaleInquiryCartPage({
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
          eyebrow={isEn ? "Inquiry Cart" : "询单"}
          title={isEn ? "Inquiry List" : "询单清单"}
          description={
            isEn
              ? "Review selected products and submit your inquiry request."
              : "查看已选择的产品，并继续提交询单需求。"
          }
        />

        <section className="section">
          <div className="container">
            <FrontendInquiryCart locale={locale} />
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}