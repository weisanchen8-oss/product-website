/**
 * 文件作用：
 * 前台多语言首页。
 * 在原首页基础上接入 /zh 和 /en 路由。
 * 当前阶段先翻译固定 UI 文案，产品/分类数据库内容仍显示原中文数据。
 */

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { HomeHero } from "@/components/home/home-hero";
import { HomeSectionTitle } from "@/components/home/home-section-title";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getHomePageData } from "@/lib/home-data";
import {
  getFrontendMessages,
  getFrontendPath,
  getLocaleLabel,
  getOppositeLocale,
  isFrontendLocale,
} from "@/lib/frontend-i18n";

type BannerExtra = {
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
};

type CompanyIntroExtra = {
  buttonText?: string;
  buttonHref?: string;
};

type AdvantageItem = {
  title?: string;
  description?: string;
};

function safeParseJson<T>(value: string | null | undefined): T {
  if (!value) return {} as T;

  try {
    return JSON.parse(value);
  } catch {
    return {} as T;
  }
}

function safeParseAdvantages(value: string | null | undefined): AdvantageItem[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        title: typeof item?.title === "string" ? item.title : "",
        description: typeof item?.description === "string" ? item.description : "",
      }))
      .filter((item) => item.title || item.description);
  } catch {
    return [];
  }
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  if (!isFrontendLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam;
  const messages = await getFrontendMessages(locale);
  const t = messages.HomePage;
  const common = messages.Common;

  const targetLocale = getOppositeLocale(locale);
  const targetLabel = getLocaleLabel(targetLocale);

  const {
    banner,
    companyIntro,
    homeAdvantages,
    categories,
    featuredProducts,
    hotProducts,
  } = await getHomePageData();

  const bannerExtra = safeParseJson<BannerExtra>(banner?.extraJson);
  const companyIntroExtra = safeParseJson<CompanyIntroExtra>(
    companyIntro?.extraJson
  );
  const advantageItems = safeParseAdvantages(homeAdvantages?.content);

  const visibleAdvantages =
    advantageItems.length > 0
      ? advantageItems
      : [
          {
            title: locale === "en" ? "Professional Showcase" : "专业产品展示",
            description:
              locale === "en"
                ? "Present product information clearly and help customers understand your offerings quickly."
                : "突出产品信息层次，便于客户快速建立认知。",
          },
          {
            title: locale === "en" ? "Efficient Inquiry Flow" : "高效询单流程",
            description:
              locale === "en"
                ? "Help customers submit needs quickly and improve communication efficiency."
                : "支持客户快速整理需求，提升沟通效率。",
          },
          {
            title: locale === "en" ? "Consistent Brand Image" : "品牌统一形象",
            description:
              locale === "en"
                ? "Keep page style and product presentation consistent to improve business credibility."
                : "统一页面风格与产品展示逻辑，增强企业可信度。",
          },
          {
            title: locale === "en" ? "Scalable System" : "可持续扩展",
            description:
              locale === "en"
                ? "Ready for future data, operation, AI, and online deployment features."
                : "后续可接入更多数据与后台配置能力。",
          },
        ];

  return (
    <div className="site-shell">
      <SiteHeader locale={locale} />

      <main>
        <HomeHero
          title={banner?.title ?? t.title}
          description={banner?.content ?? t.subtitle}
          imageUrl={banner?.imageUrl ?? undefined}
          primaryButtonText={bannerExtra.primaryButtonText ?? t.viewProducts}
          primaryButtonLink={getFrontendPath(locale, "/products")}
          secondaryButtonText={bannerExtra.secondaryButtonText ?? t.submitInquiry}
          secondaryButtonLink={getFrontendPath(locale, "/inquiry")}
        />

        <section className="section">
          <div className="container">
            <div className="intro-card">
              <div className="intro-content">
                <p className="eyebrow">
                  {locale === "en" ? "Company Profile" : "公司简介"}
                </p>

                <h2>
                  {companyIntro?.title ??
                    (locale === "en"
                      ? "A business product showcase platform focused on clear presentation and efficient inquiries"
                      : "以清晰展示和高效询单为核心的企业产品展示平台")}
                </h2>

                <p>
                  {companyIntro?.content ??
                    (locale === "en"
                      ? "This platform helps companies display product information, support browsing, searching, filtering, and inquiry submission. The design focuses on clarity, trust, and business conversion."
                      : "本平台用于集中展示企业产品信息，帮助客户完成浏览、搜索、筛选和询单。页面风格以简洁、大气、可信赖为核心，兼顾品牌展示与业务转化。")}
                </p>

                <div className="intro-link-row">
                  <Link
                    href={getFrontendPath(locale, "/company")}
                    className="ghost-button inline-button-link"
                  >
                    {companyIntroExtra.buttonText ||
                      (locale === "en" ? "View Company Profile" : "查看公司介绍")}
                  </Link>
                </div>
              </div>

              <div className="intro-placeholder">
                {companyIntro?.imageUrl ? (
                  <Image
                    src={companyIntro.imageUrl}
                    alt={companyIntro.title ?? common.siteName}
                    width={520}
                    height={320}
                    className="intro-image"
                  />
                ) : locale === "en" ? (
                  "Company / Brand Image"
                ) : (
                  "公司介绍 / 品牌图预留区"
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <HomeSectionTitle
              eyebrow="Featured"
              title={locale === "en" ? "Featured Products" : "推荐产品"}
              description={
                locale === "en"
                  ? "Recommended products selected from the database."
                  : "该区域当前已从数据库读取推荐产品数据。"
              }
            />

            <div className="card-grid">
              {featuredProducts.map((product) => (
                <article key={product.id} className="product-card">
                  <Link
                    href={getFrontendPath(locale, `/product/${product.slug}`)}
                    className="product-image-link product-link-block"
                  >
                    {product.images[0] ? (
                      <Image
                        src={
                          product.images[0].processedUrl ??
                          product.images[0].originalUrl
                        }
                        alt={product.name}
                        width={320}
                        height={240}
                        className="product-card-image"
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        {locale === "en" ? "No image" : "暂无图片"}
                      </div>
                    )}
                  </Link>

                  <div className="product-card-body">
                    <h3>
                      <Link
                        href={getFrontendPath(locale, `/product/${product.slug}`)}
                        className="text-link"
                      >
                        {product.name}
                      </Link>
                    </h3>

                    <p>{product.shortDesc}</p>

                    <div className="product-card-footer">
                      <span>{product.priceText}</span>

                      <Link
                        href={getFrontendPath(locale, `/product/${product.slug}`)}
                        className="ghost-button inline-button-link"
                      >
                        {locale === "en" ? "View Details" : "查看详情"}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-muted">
          <div className="container">
            <HomeSectionTitle
              eyebrow="Hot Products"
              title={locale === "en" ? "Hot Products" : "热销推荐"}
              description={
                locale === "en"
                  ? "A mixed recommendation strategy based on manual hot selections and sales ranking."
                  : "该区域已启用人工热销优先、销量补位的混合推荐逻辑。"
              }
            />

            <div className="card-grid">
              {hotProducts.map((product) => (
                <article key={product.id} className="product-card">
                  <Link
                    href={getFrontendPath(locale, `/product/${product.slug}`)}
                    className="product-image-link product-link-block"
                  >
                    {product.images[0] ? (
                      <Image
                        src={
                          product.images[0].processedUrl ??
                          product.images[0].originalUrl
                        }
                        alt={product.name}
                        width={320}
                        height={240}
                        className="product-card-image"
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        {locale === "en" ? "No image" : "暂无图片"}
                      </div>
                    )}
                  </Link>

                  <div className="product-card-body">
                    <h3>
                      <Link
                        href={getFrontendPath(locale, `/product/${product.slug}`)}
                        className="text-link"
                      >
                        {product.name}
                      </Link>
                    </h3>

                    <p>{product.shortDesc}</p>

                    <div className="product-card-footer">
                      <span>{product.priceText}</span>

                      <Link
                        href={getFrontendPath(locale, `/product/${product.slug}`)}
                        className="ghost-button inline-button-link"
                      >
                        {locale === "en" ? "View Details" : "查看详情"}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="page-actions">
              <Link
                href={getFrontendPath(locale, "/search?q=热销")}
                className="ghost-button inline-button-link"
              >
                {locale === "en" ? "View More Hot Products" : "查看更多热销结果"}
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <HomeSectionTitle
              eyebrow="Categories"
              title={locale === "en" ? "Product Categories" : "产品分类"}
              description={
                locale === "en"
                  ? "Product categories loaded from the database."
                  : "该区域已从数据库读取分类数据。"
              }
            />

            <div className="category-grid">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={getFrontendPath(locale, "/products")}
                  className="category-card category-link-card"
                >
                  <div className="category-card-image-wrap">
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        width={96}
                        height={96}
                        className="category-card-image"
                      />
                    ) : (
                      <span className="category-card-fallback-icon">
                        {category.name.slice(0, 1)}
                      </span>
                    )}
                  </div>

                  <div className="category-card-content">
                    <h3>{category.name}</h3>
                    <p>
                      {category.description ??
                        (locale === "en"
                          ? "View products under this category."
                          : "查看该分类下的相关产品。")}
                    </p>
                  </div>

                  <span className="category-card-more">
                    {locale === "en" ? "View Products →" : "查看产品 →"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-muted">
          <div className="container">
            <HomeSectionTitle
              eyebrow="Advantages"
              title={
                homeAdvantages?.title ??
                (locale === "en" ? "Business Advantages" : "企业优势")
              }
              description={
                locale === "en"
                  ? "This section supports content management from the admin panel."
                  : "该区域已支持后台内容管理配置。"
              }
            />

            <div className="advantage-grid">
              {visibleAdvantages.map((item, index) => (
                <div className="advantage-card" key={`${item.title}-${index}`}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}