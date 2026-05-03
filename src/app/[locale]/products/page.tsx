/**
 * 文件作用：
 * 前台多语言产品中心页。
 * 支持：
 * - /zh/products 中文产品中心
 * - /en/products 英文产品中心
 * - 分类筛选
 * - 产品名称、简介、分类名称按语言显示
 * - 价格按语言切换人民币 / 美元估算价
 * - 促销标识中英文切换
 * - 商务深蓝风产品卡片 UI
 */

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyStateCard } from "@/components/common/empty-state-card";
import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getProductsPageData } from "@/lib/product-data";
import { getFrontendPath, isFrontendLocale } from "@/lib/frontend-i18n";
import { getLocalizedText } from "@/lib/localized-content";
import { formatLocalizedPrice } from "@/lib/currency";

function getPromotionDiscountScore(promotion: {
  discountType: string;
  discountValue: number;
}) {
  return promotion.discountValue;
}

function getBestActivePromotion(
  promotionProducts: {
    promotion: {
      title: string;
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

function getCategoryButtonClassName(isActive: boolean) {
  return isActive
    ? "inline-flex h-10 items-center rounded-full bg-[#1E3A5F] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#244B75]"
    : "inline-flex h-10 items-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600 transition hover:border-[#1E3A5F]/30 hover:bg-[#EAF1F8] hover:text-[#1E3A5F]";
}

export default async function LocaleProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ categoryId?: string }>;
}) {
  const { locale: localeParam } = await params;
  const { categoryId } = await searchParams;

  if (!isFrontendLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam;
  const isEn = locale === "en";

  const { products, categories } = await getProductsPageData();

  const selectedCategoryId = Number(categoryId);

  const visibleProducts =
    categoryId && !Number.isNaN(selectedCategoryId)
      ? products.filter((product) => product.category.id === selectedCategoryId)
      : products;

  return (
    <>
      <SiteHeader locale={locale} variant="solid" />

      <main className="min-h-screen bg-slate-50">
        <PageHero
          eyebrow={isEn ? "Product Center" : "产品中心"}
          title={isEn ? "All Products" : "全部产品"}
          description={
            isEn
              ? "Browse products by category, view specifications, and quickly submit inquiries."
              : "按分类浏览产品，查看规格信息，并快速提交询单。"
          }
        />

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-10 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#1E3A5F]">
                  {isEn ? "Categories" : "产品分类"}
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  {isEn ? "Filter by Category" : "按分类筛选"}
                </h2>
              </div>

              <span className="hidden rounded-full bg-[#EAF1F8] px-4 py-2 text-sm font-bold text-[#1E3A5F] sm:inline-flex">
                {isEn
                  ? `${visibleProducts.length} products`
                  : `${visibleProducts.length} 个产品`}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={getFrontendPath(locale, "/products")}
                className={getCategoryButtonClassName(!categoryId)}
              >
                {isEn ? "All Products" : "全部产品"}
              </Link>

              {categories.map((category) => {
                const categoryName = getLocalizedText(
                  locale,
                  category.name,
                  category.nameEn
                );

                const isActiveCategory = selectedCategoryId === category.id;

                return (
                  <Link
                    key={category.id}
                    href={getFrontendPath(
                      locale,
                      `/products?categoryId=${category.id}`
                    )}
                    className={getCategoryButtonClassName(isActiveCategory)}
                  >
                    {categoryName}
                  </Link>
                );
              })}
            </div>
          </div>

          {visibleProducts.length === 0 ? (
            <EmptyStateCard
              title={isEn ? "No products found" : "暂无匹配产品"}
              description={
                isEn
                  ? "No products are available under the selected category yet."
                  : "当前分类下暂无产品，请切换其他分类查看。"
              }
            />
          ) : (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product) => {
                const coverImage =
                  product.images.find((image) => image.isCover) ??
                  product.images[0];

                const coverImageUrl =
                  coverImage?.watermarkedUrl ??
                  coverImage?.processedUrl ??
                  coverImage?.originalUrl ??
                  "";

                const bestPromotion = getBestActivePromotion(
                  product.promotionProducts
                );

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

                        {coverImageUrl ? (
                          <Image
                            src={coverImageUrl}
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
                            {isEn ? "Business Purchase" : "企业采购"}
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
          )}
        </section>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}