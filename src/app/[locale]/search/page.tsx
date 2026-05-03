/**
 * 文件作用：
 * 前台多语言搜索结果页。
 * 支持：
 * - /zh/search?q=关键词
 * - /en/search?q=keyword
 * - 搜索结果产品名称、简介、分类、价格多语言展示
 * - 商务深蓝风产品卡片 UI
 */

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyStateCard } from "@/components/common/empty-state-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { searchProducts } from "@/lib/product-data";
import { getFrontendPath, isFrontendLocale } from "@/lib/frontend-i18n";
import { getLocalizedText } from "@/lib/localized-content";
import { formatLocalizedPrice } from "@/lib/currency";

type LocaleSearchPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

function getProductImageUrl(product: {
  images: {
    isCover: boolean;
    watermarkedUrl?: string | null;
    processedUrl?: string | null;
    originalUrl: string;
  }[];
}) {
  const coverImage =
    product.images.find((image) => image.isCover) ?? product.images[0];

  return (
    coverImage?.watermarkedUrl ??
    coverImage?.processedUrl ??
    coverImage?.originalUrl ??
    ""
  );
}

function getPromotionDiscountScore(promotion: {
  discountType: string;
  discountValue: number;
}) {
  return promotion.discountValue;
}

function getBestActivePromotion(
  promotionProducts: {
    promotion: {
      discountType: string;
      discountValue: number;
      isActive: boolean;
      startAt: Date;
      endAt: Date;
    };
  }[]
) {
  const now = new Date();

  const activePromotions = promotionProducts
    .map((item) => item.promotion)
    .filter(
      (promotion) =>
        promotion.isActive &&
        promotion.startAt <= now &&
        promotion.endAt >= now
    );

  if (activePromotions.length === 0) return null;

  return activePromotions.reduce((best, current) =>
    getPromotionDiscountScore(current) > getPromotionDiscountScore(best)
      ? current
      : best
  );
}

export default async function LocaleSearchPage({
  params,
  searchParams,
}: LocaleSearchPageProps) {
  const { locale: localeParam } = await params;

  if (!isFrontendLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam;
  const isEn = locale === "en";

  const queryParams = await searchParams;
  const keyword = queryParams.q?.trim() || "";
  const results = keyword ? await searchProducts(keyword) : [];

  return (
    <div className="site-shell">
      <SiteHeader locale={locale} variant="solid" />

      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-7xl px-6 pt-8 pb-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1E3A5F]">
            {isEn ? "Search Results" : "搜索结果"}
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-950 md:text-3xl">
            {keyword
              ? isEn
                ? `Results for "${keyword}"`
                : `关于“${keyword}”的搜索结果`
              : isEn
                ? "Search Products"
                : "搜索产品"}
          </h1>
        
          <p className="mt-2 text-sm text-slate-500">
            {keyword
              ? isEn
                ? `${results.length} result(s) found`
                : `当前匹配到 ${results.length} 条结果`
              : isEn
                ? "Enter keywords to start searching"
                : "请输入关键词进行搜索"}
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <form
            action={getFrontendPath(locale, "/search")}
            method="GET"
            className="mb-8 rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="flex w-full items-center gap-3">
              <input
                type="text"
                name="q"
                defaultValue={keyword}
                placeholder={isEn ? "Search products..." : "搜索产品名称或关键词"}
                className="h-12 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-5 text-sm text-slate-700 outline-none transition focus:border-[#1E3A5F]/40 focus:bg-white"
              />
          
              <button
                type="submit"
                className="h-12 shrink-0 rounded-full bg-[#1E3A5F] px-8 text-sm font-bold text-white shadow-[0_10px_24px_rgba(30,58,95,0.16)] transition hover:bg-[#244B75]"
              >
                {isEn ? "Search" : "搜索"}
              </button>
            </div>
          </form>

          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#1E3A5F]">
                {isEn ? "Search Results" : "搜索结果"}
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                {keyword
                  ? isEn
                    ? `Products matching "${keyword}"`
                    : `匹配“${keyword}”的产品`
                  : isEn
                    ? "No keyword entered"
                    : "尚未输入关键词"}
              </h2>
            </div>

            <Link
              href={getFrontendPath(locale, "/products")}
              className="hidden rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-[#1E3A5F] transition hover:bg-[#EAF1F8] sm:inline-flex"
            >
              {isEn ? "Back to Products" : "返回产品中心"}
            </Link>
          </div>

          {results.length > 0 ? (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((product) => {
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

                const categoryName = getLocalizedText(
                  locale,
                  product.category.name,
                  product.category.nameEn
                );

                const displayPrice = formatLocalizedPrice(
                  locale,
                  product.priceText
                );

                const imageUrl = getProductImageUrl(product);
                const bestPromotion = getBestActivePromotion(product.promotionProducts);

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-[#1E3A5F]/25 hover:shadow-[0_20px_50px_rgba(15,23,42,0.10)]"
                  >
                    <Link
                      href={getFrontendPath(locale, `/product/${product.slug}`)}
                      className="block"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                        {bestPromotion ? (
                          <span className="absolute left-4 top-4 z-10 inline-flex rounded-full bg-[#F59E0B] px-3.5 py-1.5 text-xs font-bold text-white shadow-[0_10px_24px_rgba(245,158,11,0.28)]">
                            {isEn ? "Limited Sale" : "限时促销"}
                          </span>
                        ) : null}

                        <span className="absolute right-4 top-4 z-10 inline-flex rounded-full border border-white/40 bg-white/80 px-3 py-1 text-xs font-bold text-[#1E3A5F] backdrop-blur">
                          {categoryName}
                        </span>

                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={productName}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-[#EAF1F8] text-sm font-semibold text-[#1E3A5F]/60">
                            {isEn ? "No image" : "暂无图片"}
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1E3A5F]/35 to-transparent opacity-0 transition group-hover:opacity-100" />
                      </div>

                      <div className="p-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <span className="rounded-full bg-[#EAF1F8] px-3 py-1 text-xs font-bold text-[#1E3A5F]">
                            {isEn ? "Search Match" : "搜索匹配"}
                          </span>

                          <span className="text-sm font-bold text-[#1E3A5F]">
                            {displayPrice}
                          </span>
                        </div>

                        <h3 className="line-clamp-1 text-xl font-bold text-slate-950">
                          {productName}
                        </h3>

                        <p className="mt-3 line-clamp-2 min-h-[48px] text-sm leading-6 text-slate-500">
                          {productDesc ||
                            (isEn
                              ? "No product description yet."
                              : "暂无产品简介。")}
                        </p>

                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                          <span className="text-sm font-semibold text-slate-400">
                            {isEn ? "Product Details" : "产品详情"}
                          </span>

                          <span className="inline-flex h-10 items-center rounded-full bg-[#1E3A5F] px-4 text-sm font-bold text-white transition group-hover:bg-[#244B75]">
                            {isEn ? "View →" : "查看 →"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyStateCard
              title={isEn ? "No matching products" : "暂无匹配产品"}
              description={
                isEn
                  ? "Try another product name or keyword."
                  : "可以尝试更换产品名称或关键词重新搜索。"
              }
            />
          )}

          <div className="mt-8 sm:hidden">
            <Link
              href={getFrontendPath(locale, "/products")}
              className="inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-[#1E3A5F]"
            >
              {isEn ? "Back to Products" : "返回产品中心"}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}