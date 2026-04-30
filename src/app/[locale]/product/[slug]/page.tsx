/**
 * 文件作用：
 * 前台多语言产品详情页。
 * 当前支持 /zh/product/[slug] 和 /en/product/[slug]。
 * 本阶段先翻译固定 UI 文案，产品数据库内容后续再接入中英文字段。
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductGallery } from "@/components/product/product-gallery";
import { AddToInquiryButton } from "@/components/inquiry/add-to-inquiry-button";
import { getProductDetailBySlug } from "@/lib/product-data";
import { getFrontendPath, isFrontendLocale } from "@/lib/frontend-i18n";

type ProductDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

function parseSpecs(specsJson: string | null) {
  if (!specsJson) return [];

  try {
    const parsed = JSON.parse(specsJson) as Record<string, string>;
    return Object.entries(parsed);
  } catch {
    return [];
  }
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
      title: string;
      description: string | null;
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

function getPromotionText(
  promotion: {
    discountType: string;
    discountValue: number;
  },
  isEn: boolean
) {
  if (promotion.discountType === "percent") {
    return isEn
      ? `${promotion.discountValue}% off`
      : `${promotion.discountValue}% 优惠`;
  }

  return isEn
    ? `Fixed discount ${promotion.discountValue}`
    : `固定优惠 ${promotion.discountValue}`;
}

export default async function LocaleProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { locale: localeParam, slug } = await params;

  if (!isFrontendLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam;
  const isEn = locale === "en";

  const data = await getProductDetailBySlug(slug);

  if (!data) {
    notFound();
  }

  const { product, relatedProducts } = data;
  const specs = parseSpecs(product.specsJson);
  const bestPromotion = getBestActivePromotion(product.promotionProducts);

  const galleryImages = product.images.map((image) => ({
    id: image.id,
    url: image.processedUrl ?? image.originalUrl,
    alt: product.name,
  }));

  return (
    <div className="site-shell">
      <SiteHeader locale={locale} />

      <main>
        <PageHero
          eyebrow={
            isEn
              ? `Category: ${product.category.name}`
              : `产品分类：${product.category.name}`
          }
          title={product.name}
          description={product.shortDesc}
        />

        <section className="section">
          <div className="container product-detail-layout">
            <ProductGallery images={galleryImages} />

            <div className="product-detail-panel">
              {bestPromotion ? (
                <div className="promotion-detail-box">
                  <span className="promotion-detail-label">
                    {isEn ? "Limited-time Sale" : "限时促销"}
                  </span>

                  <h3>{bestPromotion.title}</h3>

                  <p>
                    {getPromotionText(bestPromotion, isEn)}
                    {bestPromotion.description
                      ? ` · ${bestPromotion.description}`
                      : ""}
                  </p>

                  <small>
                    {isEn
                      ? "If multiple promotions apply to the same product, the system displays the best discount. Discounts cannot be combined."
                      : "同一产品参与多个促销时，系统默认展示优惠力度最大的一项，优惠不可叠加。"}
                  </small>
                </div>
              ) : null}

              <div className="product-tag-row">
                <span>{isEn ? "Business Purchase" : "企业采购"}</span>

                {product.isFeatured ? (
                  <span>{isEn ? "Featured Product" : "推荐产品"}</span>
                ) : null}

                {product.isManualHot ? (
                  <span>{isEn ? "Hot Product" : "热销产品"}</span>
                ) : null}
              </div>

              <div className="product-price-line">
                <span>{isEn ? "Reference Price:" : "参考价格："}</span>
                <strong>{product.priceText}</strong>
              </div>

              <AddToInquiryButton
                productId={product.id}
                productName={product.name}
                productSlug={product.slug}
                priceText={product.priceText}
              />

              <Link
                href={getFrontendPath(locale, "/products")}
                className="ghost-button inline-button-link"
              >
                {isEn ? "Back to Products" : "返回产品中心"}
              </Link>
            </div>
          </div>
        </section>

        <section className="section section-muted">
          <div className="container detail-section-grid">
            <div className="detail-card">
              <h2>{isEn ? "Specifications" : "产品参数"}</h2>

              {specs.length > 0 ? (
                <dl className="spec-list">
                  {specs.map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="muted-text">
                  {isEn
                    ? "No specifications yet. Product parameters can be added later in the admin panel."
                    : "暂无参数，后续可在后台补充产品参数信息。"}
                </p>
              )}
            </div>

            <div className="detail-card">
              <h2>{isEn ? "Product Details" : "图文详情"}</h2>

              <p>
                {product.fullDesc ??
                  (isEn
                    ? "Detailed product introduction has not been added yet."
                    : "当前产品尚未补充详细介绍内容。")}
              </p>

              <p className="muted-text">
                {isEn
                  ? "This section can be expanded with richer product descriptions and detail images."
                  : "后续该区域将继续接入更完整的图文详情内容与详情图展示。"}
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Related Products</p>
                <h2>{isEn ? "Related Products" : "相关推荐"}</h2>
                <p>
                  {isEn
                    ? "Recommended products are currently based on the same category."
                    : "当前根据同分类产品进行推荐展示。"}
                </p>
              </div>
            </div>

            <div className="card-grid">
              {relatedProducts.map((item) => (
                <article key={item.id} className="product-card">
                  <Link
                    href={getFrontendPath(locale, `/product/${item.slug}`)}
                    className="product-image-link product-link-block"
                  >
                    <div className="product-image-placeholder">
                      {item.images[0]?.processedUrl
                        ? isEn
                          ? "Image"
                          : "展示图"
                        : isEn
                          ? "Product Image"
                          : "产品图"}
                    </div>
                  </Link>

                  <div className="product-card-body">
                    <h3>
                      <Link
                        href={getFrontendPath(locale, `/product/${item.slug}`)}
                        className="text-link"
                      >
                        {item.name}
                      </Link>
                    </h3>

                    <p>{item.shortDesc}</p>

                    <div className="product-card-footer">
                      <span>{item.priceText}</span>

                      <Link
                        href={getFrontendPath(locale, `/product/${item.slug}`)}
                        className="ghost-button inline-button-link"
                      >
                        {isEn ? "View Details" : "查看详情"}
                      </Link>
                    </div>
                  </div>
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