/**
 * 文件作用：
 * 前台多语言产品中心页。
 * 支持：
 * - /zh/products 中文产品中心
 * - /en/products 英文产品中心
 * - 产品名称、简介、分类名称按语言显示
 * - 价格按语言切换人民币 / 美元估算价
 * - 促销标识中英文切换
 */

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyStateCard } from "@/components/common/empty-state-card";
import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getProductsPageData } from "@/lib/product-data";
import {
  getFrontendPath,
  isFrontendLocale,
} from "@/lib/frontend-i18n";
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

  if (activePromotions.length === 0) {
    return null;
  }

  return activePromotions.reduce((best, current) =>
    getPromotionDiscountScore(current) > getPromotionDiscountScore(best)
      ? current
      : best
  );
}

export default async function LocaleProductsPage({
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

  const { products, categories } = await getProductsPageData();

  return (
    <>
      <SiteHeader locale={locale} />

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

        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-8 flex flex-wrap gap-3">
            {categories.map((category) => {
              const categoryName = getLocalizedText(
                locale,
                category.name,
                category.nameEn
              );

              return (
                <Link
                  key={category.id}
                  href={getFrontendPath(
                    locale,
                    `/products?categoryId=${category.id}`
                  )}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-600"
                >
                  {categoryName}
                </Link>
              );
            })}
          </div>

          {products.length === 0 ? (
            <EmptyStateCard
              title={isEn ? "No products yet" : "暂无产品"}
              description={
                isEn
                  ? "Products will be displayed here after they are added in the admin panel."
                  : "后台添加产品后，将会在这里展示。"
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const coverImage =
                  product.images.find((image) => image.isCover) ?? product.images[0];

                const coverImageUrl = coverImage?.watermarkedUrl ?? "";

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
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <Link href={getFrontendPath(locale, `/product/${product.slug}`)}>
                      <div className="relative aspect-[4/3] bg-slate-100">
                        {bestPromotion ? (
                          <span className="absolute left-4 top-4 z-10 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                            {isEn ? "Sale" : "限时促销"}
                          </span>
                        ) : null}

                        {coverImageUrl ? (
                          <Image
                            src={coverImageUrl}
                            alt={productName}
                            fill
                            className="object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-slate-400">
                            {isEn ? "No image" : "暂无图片"}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 p-5">
                        <div>
                          <h3 className="line-clamp-1 text-base font-semibold text-slate-900">
                            {productName}
                          </h3>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                            {productDesc ||
                              (isEn
                                ? "No product description yet."
                                : "暂无产品简介。")}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                            {isEn ? "Category: " : "分类："}
                            {categoryName}
                          </span>

                          <span className="font-semibold text-blue-600">
                            {displayPrice}
                          </span>
                        </div>

                        <div className="pt-2 text-sm font-medium text-blue-600">
                          {isEn ? "View Details →" : "查看详情 →"}
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

      <SiteFooter />
    </>
  );
}