/**
 * 文件作用：
 * 前台多语言产品中心页。
 * 当前支持 /zh/products 和 /en/products。
 * 英文页面优先显示产品/分类英文字段，未填写时自动回退中文。
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
    <div className="site-shell">
      <SiteHeader locale={locale} />

      <main>
        <PageHero
          eyebrow={isEn ? "Products" : "Product Center"}
          title={isEn ? "Product Center" : "产品中心"}
          description={
            isEn
              ? "Browse product categories, view product details, and quickly start an inquiry."
              : "浏览产品分类，查看产品详情，并快速发起询单。"
          }
        />

        <section className="section">
          <div className="container">
            <div className="category-filter">
              <Link href={getFrontendPath(locale, "/products")}>
                {isEn ? "All Products" : "全部产品"}
              </Link>

              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={getFrontendPath(locale, "/products")}
                >
                  {getLocalizedText(locale, category.name, category.nameEn)}
                </Link>
              ))}
            </div>

            {products.length === 0 ? (
              <EmptyStateCard
                title={isEn ? "No products yet" : "暂无产品"}
                description={
                  isEn
                    ? "Please add products in the admin panel first."
                    : "请先在后台添加产品。"
                }
              />
            ) : (
              <div className="product-list-grid">
                {products.map((product) => {
                  const coverImage =
                    product.images.find((image) => image.isCover) ??
                    product.images[0];

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

                  const displayPrice = formatLocalizedPrice(locale, product.priceText);

                  return (
                    <article key={product.id} className="product-list-card">
                      <Link
                        href={getFrontendPath(
                          locale,
                          `/product/${product.slug}`
                        )}
                        className="product-list-image-wrap"
                      >
                        {bestPromotion ? (
                          <span className="promotion-corner-badge">
                            {isEn ? "Sale" : "促销"}
                          </span>
                        ) : null}

                        {coverImage ? (
                          <Image
                            src={
                              coverImage.processedUrl ??
                              coverImage.originalUrl
                            }
                            alt={productName}
                            width={360}
                            height={260}
                            className="product-list-image"
                          />
                        ) : (
                          <div className="product-image-placeholder">
                            {isEn ? "No image" : "暂无图片"}
                          </div>
                        )}
                      </Link>

                      <div className="product-list-body">
                        <h3>
                          <Link
                            href={getFrontendPath(
                              locale,
                              `/product/${product.slug}`
                            )}
                            className="text-link"
                          >
                            {productName}
                          </Link>
                        </h3>

                        <p>{productDesc}</p>

                        <div className="product-meta">
                          {isEn ? "Category: " : "分类："}
                          {categoryName}
                        </div>

                        <div className="product-card-footer">
                          <span>{displayPrice}</span>

                          <Link
                            href={getFrontendPath(
                              locale,
                              `/product/${product.slug}`
                            )}
                            className="ghost-button inline-button-link"
                          >
                            {isEn ? "View Details" : "查看详情"}
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}