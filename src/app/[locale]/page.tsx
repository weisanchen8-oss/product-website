/**
 * 文件作用：
 * 前台多语言首页（商务深蓝 Hero 升级版）。
 * 支持：
 * - /zh 和 /en
 * - 首页 Banner、公司介绍、推荐产品、热销产品、分类、优势内容多语言展示
 * - 使用深蓝商务风统一前台视觉
 */

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getHomePageData } from "@/lib/home-data";
import {
  getFrontendMessages,
  getFrontendPath,
  isFrontendLocale,
} from "@/lib/frontend-i18n";
import { getLocalizedText } from "@/lib/localized-content";
import { formatLocalizedPrice } from "@/lib/currency";

type BannerExtra = {
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
};

type AdvantageItem = {
  title?: string;
  description?: string;
};

function safeParseJson<T>(value: string | null | undefined): T {
  if (!value) return {} as T;

  try {
    return JSON.parse(value) as T;
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
        description:
          typeof item?.description === "string" ? item.description : "",
      }))
      .filter((item) => item.title || item.description);
  } catch {
    return [];
  }
}

function getProductImageUrl(product: {
  images: {
    watermarkedUrl?: string | null;
    processedUrl?: string | null;
    originalUrl: string;
  }[];
}) {
  const image = product.images[0];

  if (!image) return "";

  return image.watermarkedUrl ?? image.processedUrl ?? image.originalUrl;
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
  const isEn = locale === "en";

  const messages = await getFrontendMessages(locale);
  const t = messages.HomePage;
  const common = messages.Common;

  const {
    banner,
    companyIntro,
    homeAdvantages,
    categories,
    featuredProducts,
    hotProducts,
  } = await getHomePageData();

  const bannerExtra = safeParseJson<BannerExtra>(
    isEn && banner?.extraJsonEn ? banner.extraJsonEn : banner?.extraJson
  );

  const bannerTitle =
    getLocalizedText(locale, banner?.title, banner?.titleEn) ||
    (isEn
      ? "A clean, reliable B2B product showcase and inquiry platform."
      : "简洁、大气、可信赖的企业产品展示与询单平台。");

  const bannerContent =
    getLocalizedText(locale, banner?.content, banner?.contentEn) ||
    (isEn
      ? "Display products, categories, featured items, and inquiry entry points in one place to help customers understand your offerings faster."
      : "为企业提供统一的产品展示、热销推荐、搜索浏览与询单入口，帮助客户更快了解产品并提交采购需求。");

  const companyTitle =
    getLocalizedText(locale, companyIntro?.title, companyIntro?.titleEn) ||
    (isEn
      ? "A business product showcase platform focused on clear presentation and efficient inquiries"
      : "以清晰展示和高效询单为核心的企业产品展示平台");

  const companyContent =
    getLocalizedText(locale, companyIntro?.content, companyIntro?.contentEn) ||
    (isEn
      ? "This platform helps companies display product information, support browsing, searching, filtering, and inquiry submission. The design focuses on clarity, trust, and business conversion."
      : "本平台用于集中展示企业产品信息，帮助客户完成浏览、搜索、筛选和询单。页面风格以简洁、大气、可信赖为核心，兼顾品牌展示与业务转化。");

  const advantagesTitle = getLocalizedText(
    locale,
    homeAdvantages?.title,
    homeAdvantages?.titleEn
  );

  const advantagesContent =
    isEn && homeAdvantages?.contentEn
      ? homeAdvantages.contentEn
      : homeAdvantages?.content;

  const advantageItems = safeParseAdvantages(advantagesContent);

  const visibleAdvantages =
    advantageItems.length > 0
      ? advantageItems
      : [
          {
            title: isEn ? "Professional Showcase" : "专业产品展示",
            description: isEn
              ? "Present product information clearly and help customers understand your offerings quickly."
              : "突出产品信息层次，便于客户快速建立认知。",
          },
          {
            title: isEn ? "Efficient Inquiry Flow" : "高效询单流程",
            description: isEn
              ? "Help customers submit needs quickly and improve communication efficiency."
              : "支持客户快速整理需求，提升沟通效率。",
          },
          {
            title: isEn ? "Consistent Brand Image" : "品牌统一形象",
            description: isEn
              ? "Keep page style and product presentation consistent to improve business credibility."
              : "统一页面风格与产品展示逻辑，增强企业可信度。",
          },
        ];

  const heroImageUrl =
    banner?.imageUrl ||
    companyIntro?.imageUrl ||
    getProductImageUrl(featuredProducts[0]) ||
    "";

  return (
    <>
      <SiteHeader locale={locale} />

      <main className="min-h-screen bg-slate-50">
        <section className="relative overflow-hidden bg-[#1E3A5F]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_28rem),radial-gradient(circle_at_80%_10%,rgba(42,123,228,0.28),transparent_26rem)]" />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur">
                {isEn ? "B2B Product Showcase" : "B2B Product Showcase"}
              </div>

              <div className="space-y-6">
                <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl">
                  {bannerTitle}
                </h1>

                <p className="max-w-2xl text-lg leading-8 text-white/76">
                  {bannerContent}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href={getFrontendPath(
                    locale,
                    bannerExtra.primaryButtonHref || "/products"
                  )}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-bold text-[#1E3A5F] shadow-[0_18px_40px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  {bannerExtra.primaryButtonText ||
                    (isEn ? "View Products" : "查看产品")}
                </Link>

                <Link
                  href={getFrontendPath(
                    locale,
                    bannerExtra.secondaryButtonHref || "/inquiry-cart"
                  )}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/35 bg-white/10 px-7 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/18"
                >
                  {bannerExtra.secondaryButtonText ||
                    (isEn ? "Start Inquiry" : "提交询单")}
                </Link>
              </div>

              <div className="grid max-w-xl grid-cols-3 gap-3 pt-4">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <strong className="block text-2xl text-white">
                    {featuredProducts.length}
                  </strong>
                  <span className="mt-1 block text-xs text-white/65">
                    {isEn ? "Featured" : "推荐产品"}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <strong className="block text-2xl text-white">
                    {hotProducts.length}
                  </strong>
                  <span className="mt-1 block text-xs text-white/65">
                    {isEn ? "Hot Items" : "热销产品"}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <strong className="block text-2xl text-white">
                    {categories.length}
                  </strong>
                  <span className="mt-1 block text-xs text-white/65">
                    {isEn ? "Categories" : "产品分类"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/18 bg-white/12 p-4 shadow-[0_28px_80px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-white/10">
                {heroImageUrl ? (
                  <Image
                    src={heroImageUrl}
                    alt={bannerTitle}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-semibold text-white/70">
                    {isEn ? "Brand Image" : "品牌主视觉"}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A5F]/45 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/18 bg-white/16 p-4 text-white backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                    {isEn ? "Business Ready" : "企业展示"}
                  </p>
                  <p className="mt-2 text-lg font-bold">
                    {isEn
                      ? "Clear product display and fast inquiry conversion."
                      : "清晰展示产品，提升询单转化效率。"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#1E3A5F]">
              {isEn ? "Company Profile" : "公司简介"}
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-950">
              {companyTitle}
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-600">
              {companyContent}
            </p>

            <Link
              href={getFrontendPath(locale, "/company")}
              className="mt-7 inline-flex h-11 items-center rounded-full bg-[#1E3A5F] px-6 text-sm font-bold text-white transition hover:bg-[#244B75]"
            >
              {isEn ? "View Company Profile" : "查看公司介绍"}
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#1E3A5F]">
                {isEn ? "Featured Products" : "推荐产品"}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950">
                {isEn ? "Featured Products" : "推荐产品"}
              </h2>
            </div>

            <Link
              href={getFrontendPath(locale, "/products")}
              className="hidden rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-[#1E3A5F] transition hover:bg-[#EAF1F8] sm:inline-flex"
            >
              {isEn ? "View All" : "查看全部"}
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredProducts.map((product) => {
              const productName = getLocalizedText(
                locale,
                product.name,
                product.nameEn
              );
              const productDesc = getLocalizedText(
                locale,
                product.shortDesc,
                product.shortDescEn
              );
              const displayPrice = formatLocalizedPrice(locale, product.priceText);
              const imageUrl = getProductImageUrl(product);

              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <Link href={getFrontendPath(locale, `/product/${product.slug}`)}>
                    <div className="relative aspect-[4/3] bg-slate-100">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={productName}
                          fill
                          className="object-cover transition duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                          {isEn ? "No image" : "暂无图片"}
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="line-clamp-1 text-lg font-bold text-slate-950">
                        {productName}
                      </h3>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                        {productDesc}
                      </p>

                      <div className="mt-5 flex items-center justify-between gap-4">
                        <span className="font-bold text-[#1E3A5F]">
                          {displayPrice}
                        </span>
                        <span className="text-sm font-bold text-slate-500">
                          {isEn ? "View Details →" : "查看详情 →"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#1E3A5F]">
              {isEn ? "Hot Products" : "热销产品"}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              {isEn ? "Hot Products" : "热销产品"}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {hotProducts.map((product) => {
              const productName = getLocalizedText(
                locale,
                product.name,
                product.nameEn
              );
              const productDesc = getLocalizedText(
                locale,
                product.shortDesc,
                product.shortDescEn
              );
              const displayPrice = formatLocalizedPrice(locale, product.priceText);
              const imageUrl = getProductImageUrl(product);

              return (
                <article
                  key={product.id}
                  className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <Link href={getFrontendPath(locale, `/product/${product.slug}`)}>
                    <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={productName}
                          fill
                          className="object-cover transition duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                          {isEn ? "No image" : "暂无图片"}
                        </div>
                      )}
                    </div>

                    <h3 className="line-clamp-1 text-lg font-bold text-slate-950">
                      {productName}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                      {productDesc}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="font-bold text-[#1E3A5F]">
                        {displayPrice}
                      </span>
                      <span className="text-sm font-bold text-slate-500">
                        {isEn ? "View Details" : "查看详情"}
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href={getFrontendPath(locale, "/products")}
              className="inline-flex h-11 items-center rounded-full bg-[#1E3A5F] px-6 text-sm font-bold text-white transition hover:bg-[#244B75]"
            >
              {isEn ? "View More Hot Products" : "查看更多热销结果"}
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#1E3A5F]">
              {isEn ? "Categories" : "产品分类"}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              {isEn ? "Categories" : "产品分类"}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {categories.map((category) => {
              const categoryName = getLocalizedText(
                locale,
                category.name,
                category.nameEn
              );
              const categoryDesc = getLocalizedText(
                locale,
                category.description,
                category.descriptionEn
              );

              return (
                <Link
                  key={category.id}
                  href={getFrontendPath(
                    locale,
                    `/products?categoryId=${category.id}`
                  )}
                  className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:bg-[#EAF1F8] hover:shadow-md"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E3A5F] text-xl font-bold text-white">
                    {categoryName.slice(0, 1)}
                  </div>

                  <h3 className="text-xl font-bold text-slate-950">
                    {categoryName}
                  </h3>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                    {categoryDesc ||
                      (isEn
                        ? "View products under this category."
                        : "查看该分类下的相关产品。")}
                  </p>

                  <span className="mt-5 inline-block text-sm font-bold text-[#1E3A5F]">
                    {isEn ? "View Products →" : "查看产品 →"}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}