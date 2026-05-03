/**
 * 文件作用：
 * 前台多语言公司介绍页。
 * 支持：
 * - /zh/company
 * - /en/company
 * - 读取后台内容管理中的中文 / 英文字段
 * - 商务深蓝风 UI
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getFrontendPath, isFrontendLocale } from "@/lib/frontend-i18n";
import { getLocalizedText } from "@/lib/localized-content";
import { prisma } from "@/lib/prisma";

function safeParseAdvantages(value: string | null | undefined) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        title: typeof item?.title === "string" ? item.title : "",
        description:
          typeof item?.description === "string" ? item.description : "",
      }))
      .filter((item) => item.title || item.description);
  } catch {
    return [];
  }
}

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

  const [companyIntro, homeAdvantages] = await Promise.all([
    prisma.siteContent.findUnique({
      where: { contentKey: "home_company_intro" },
    }),
    prisma.siteContent.findUnique({
      where: { contentKey: "home_advantages" },
    }),
  ]);

  const companyTitle =
    getLocalizedText(locale, companyIntro?.title, companyIntro?.titleEn) ||
    (isEn
      ? "A professional product showcase and inquiry platform"
      : "专注产品展示与询单转化的企业平台");

  const companyContent =
    getLocalizedText(locale, companyIntro?.content, companyIntro?.contentEn) ||
    (isEn
      ? "This platform is designed for B2B product display and export business inquiries. It provides product browsing, category filtering, product details, inquiry submission, and admin management features."
      : "本平台面向 B2B 产品展示与出口贸易询单场景，支持产品浏览、分类筛选、产品详情展示、询单提交与后台管理等功能。");

  const advantageItems = safeParseAdvantages(
    isEn && homeAdvantages?.contentEn
      ? homeAdvantages.contentEn
      : homeAdvantages?.content
  );

  const fallbackAdvantages = [
    {
      title: isEn ? "Clear Product Showcase" : "清晰产品展示",
      description: isEn
        ? "Help customers understand products, categories, prices, and details quickly."
        : "帮助客户快速了解产品、分类、价格和详情信息。",
    },
    {
      title: isEn ? "Efficient Inquiry Flow" : "高效询单流程",
      description: isEn
        ? "Support inquiry cart, quantity adjustment, and online inquiry submission."
        : "支持询单清单、数量调整和在线提交询单。",
    },
    {
      title: isEn ? "Scalable Management" : "可扩展后台管理",
      description: isEn
        ? "Support product, category, promotion, content, and inquiry management."
        : "支持产品、分类、促销、内容和询单管理。",
    },
  ];

  const visibleAdvantages =
    advantageItems.length > 0 ? advantageItems : fallbackAdvantages;

  return (
    <div className="site-shell">
      <SiteHeader locale={locale} variant="solid" />

      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-14">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#1E3A5F]">
              {isEn ? "Company Profile" : "公司介绍"}
            </p>

            <h1
              className={
                isEn
                  ? "mt-4 max-w-4xl text-4xl font-bold leading-tight text-slate-950"
                  : "mt-4 max-w-4xl text-5xl font-bold leading-tight text-slate-950"
              }
            >
              {companyTitle}
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-500">
              {companyContent}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={getFrontendPath(locale, "/products")}
                className="inline-flex h-11 items-center rounded-full bg-[#1E3A5F] px-6 text-sm font-bold text-white transition hover:bg-[#244B75]"
              >
                {isEn ? "View Products" : "查看产品"}
              </Link>

              <Link
                href={getFrontendPath(locale, "/contact")}
                className="inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-[#1E3A5F] transition hover:bg-[#EAF1F8]"
              >
                {isEn ? "Contact Us" : "联系我们"}
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#1E3A5F]">
                {isEn ? "About Us" : "关于我们"}
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-950">
                {isEn ? "Built for B2B product inquiry scenarios" : "面向 B2B 产品询单场景"}
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-600">
                {companyContent}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {visibleAdvantages.slice(0, 4).map((item, index) => (
                <article
                  key={`${item.title}-${index}`}
                  className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="text-sm font-bold text-[#1E3A5F]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3 className="mt-4 text-xl font-bold text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}