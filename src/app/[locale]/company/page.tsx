/**
 * 文件作用：
 * 前台多语言公司介绍页。
 * 当前支持 /zh/company 和 /en/company。
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getFrontendPath, isFrontendLocale } from "@/lib/frontend-i18n";

export default async function LocaleCompanyPage({
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
          eyebrow={isEn ? "Company" : "公司介绍"}
          title={
            isEn
              ? "A professional product showcase and inquiry platform"
              : "专注产品展示与询单转化的企业平台"
          }
          description={
            isEn
              ? "We help customers understand products clearly and submit inquiries efficiently."
              : "我们帮助客户清晰了解产品信息，并高效提交采购询单。"
          }
        />

        <section className="section">
          <div className="container detail-section-grid">
            <div className="detail-card">
              <h2>{isEn ? "About Us" : "关于我们"}</h2>
              <p>
                {isEn
                  ? "This platform is designed for B2B product display and export business inquiries. It provides product browsing, category filtering, product details, inquiry submission, and admin management features."
                  : "本平台面向 B2B 产品展示与出口贸易询单场景，支持产品浏览、分类筛选、产品详情展示、询单提交与后台管理等功能。"}
              </p>
            </div>

            <div className="detail-card">
              <h2>{isEn ? "Our Advantages" : "我们的优势"}</h2>
              <p>
                {isEn
                  ? "We focus on clear product presentation, efficient inquiry conversion, consistent visual design, and scalable business management."
                  : "我们注重清晰的产品展示、高效的询单转化、统一的视觉体验，以及可持续扩展的业务管理能力。"}
              </p>
            </div>
          </div>

          <div className="container page-actions">
            <Link href={getFrontendPath(locale, "/products")} className="primary-button">
              {isEn ? "View Products" : "查看产品"}
            </Link>

            <Link href={getFrontendPath(locale, "/contact")} className="ghost-button">
              {isEn ? "Contact Us" : "联系我们"}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}