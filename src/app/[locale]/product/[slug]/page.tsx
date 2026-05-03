/**
 * 文件作用：
 * 前台多语言产品详情页。
 * 支持：
 * - /zh/product/[slug] 和 /en/product/[slug]
 * - 英文页面优先显示产品/分类/参数/促销英文字段，未填写时自动回退中文
 * - 商务深蓝风产品详情 UI
 */

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AddToInquiryButton } from "@/components/inquiry/add-to-inquiry-button";
import { getProductDetailBySlug } from "@/lib/product-data";
import { getFrontendPath, isFrontendLocale } from "@/lib/frontend-i18n";
import { getLocalizedText } from "@/lib/localized-content";
import { formatLocalizedPrice } from "@/lib/currency";
import { ProductGallery } from "@/components/product/product-gallery";

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
      titleEn: string | null;
      description: string | null;
      descriptionEn: string | null;
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

function getImageUrl(image: {
  watermarkedUrl?: string | null;
  processedUrl?: string | null;
  originalUrl: string;
}) {
  return image.watermarkedUrl ?? image.processedUrl ?? image.originalUrl;
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

  const productName = getLocalizedText(locale, product.name, product.nameEn);
  const productShortDesc = getLocalizedText(
    locale,
    product.shortDesc,
    product.shortDescEn
  );
  const productFullDesc = getLocalizedText(
    locale,
    product.fullDesc,
    product.fullDescEn
  );
  const categoryName = getLocalizedText(
    locale,
    product.category.name,
    product.category.nameEn
  );
  const displayPrice = formatLocalizedPrice(locale, product.priceText);

  const specs = parseSpecs(
    locale === "en" && product.specsJsonEn
      ? product.specsJsonEn
      : product.specsJson
  );

  const bestPromotion = getBestActivePromotion(product.promotionProducts);

  const promotionTitle = bestPromotion
    ? getLocalizedText(locale, bestPromotion.title, bestPromotion.titleEn)
    : "";

  const promotionDescription = bestPromotion
    ? getLocalizedText(
        locale,
        bestPromotion.description,
        bestPromotion.descriptionEn
      )
    : "";

  const galleryImages = product.images.map((image) => ({
    id: image.id,
    url: getImageUrl(image),
    alt: productName,
  }));

  return (
    <div className="site-shell">
      <SiteHeader locale={locale} variant="solid" />

      <main className="min-h-screen bg-slate-50">

        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
            <ProductGallery images={galleryImages} locale={locale} />
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#EAF1F8] px-3 py-1 text-xs font-bold text-[#1E3A5F]">
                  {isEn ? "Business Purchase" : "企业采购"}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {categoryName}
                </span>

                {product.isFeatured ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {isEn ? "Featured" : "推荐产品"}
                  </span>
                ) : null}

                {product.isManualHot ? (
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                    {isEn ? "Hot Product" : "热销产品"}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-5 text-3xl font-bold leading-tight text-slate-950">
                {productName}
              </h1>

              <p className="mt-4 text-sm leading-7 text-slate-500">
                {productShortDesc ||
                  (isEn ? "No product description yet." : "暂无产品简介。")}
              </p>
          
              {bestPromotion ? (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#F59E0B] px-3 py-1 text-xs font-bold text-white">
                      {isEn ? "Limited-time Sale" : "限时促销"}
                    </span>
          
                    <strong className="text-sm font-bold text-amber-900">
                      {promotionTitle}
                    </strong>
                  </div>
          
                  <p className="mt-3 text-sm leading-6 text-amber-900">
                    {getPromotionText(bestPromotion, isEn)}
                    {promotionDescription ? ` · ${promotionDescription}` : ""}
                  </p>
          
                  <p className="mt-3 text-xs leading-5 text-amber-800/80">
                    {isEn
                      ? "Discounts cannot be combined. The best available promotion is displayed."
                      : "优惠不可叠加，系统默认展示当前可用的最优促销。"}
                  </p>
                </div>
              ) : null}
          
              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <span className="text-sm font-semibold text-slate-500">
                      {isEn ? "Reference Price" : "参考价格"}
                    </span>
          
                    <strong className="mt-2 block text-3xl font-bold text-[#1E3A5F]">
                      {displayPrice}
                    </strong>
                  </div>
          
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                    {isEn ? "B2B Quote" : "询价参考"}
                  </span>
                </div>
          
                <p className="mt-4 text-xs leading-5 text-slate-500">
                  {isEn
                    ? "Final quotation may vary based on quantity, shipping destination, and customization requirements."
                    : "最终报价会根据采购数量、收货地区和定制要求进一步确认。"}
                </p>
              </div>
          
              <div className="mt-6 border-t border-slate-100 pt-6">
                <AddToInquiryButton
                  productId={product.id}
                  productName={productName}
                  productSlug={product.slug}
                  priceText={displayPrice}
                  locale={locale}
                />
              </div>
          
              <div className="mt-6 grid gap-3 text-sm text-slate-500 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <strong className="block text-slate-900">
                    {isEn ? "Inquiry" : "快速询单"}
                  </strong>
                  <span className="mt-1 block text-xs">
                    {isEn ? "Submit online" : "在线提交需求"}
                  </span>
                </div>
          
                <div className="rounded-2xl bg-slate-50 p-4">
                  <strong className="block text-slate-900">
                    {isEn ? "B2B" : "企业采购"}
                  </strong>
                  <span className="mt-1 block text-xs">
                    {isEn ? "Bulk support" : "支持批量采购"}
                  </span>
                </div>
          
                <div className="rounded-2xl bg-slate-50 p-4">
                  <strong className="block text-slate-900">
                    {isEn ? "Follow-up" : "人工跟进"}
                  </strong>
                  <span className="mt-1 block text-xs">
                    {isEn ? "Staff reply" : "工作人员联系"}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-7">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#1E3A5F]">
                {isEn ? "Specifications" : "产品参数"}
              </p>

              <h2 className="mt-3 text-2xl font-bold text-slate-950">
                {isEn ? "Product Specifications" : "产品参数"}
              </h2>

              {specs.length > 0 ? (
                <dl className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {specs.map(([key, value]) => (
                    <div
                      key={key}
                      className="grid gap-3 px-5 py-4 sm:grid-cols-[150px_1fr]"
                    >
                      <dt className="text-sm font-bold text-slate-500">{key}</dt>
                      <dd className="text-sm font-semibold text-slate-900">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-6 rounded-2xl bg-white p-5 text-sm leading-6 text-slate-500">
                  {isEn
                    ? "No specifications yet. Product parameters can be added later in the admin panel."
                    : "暂无参数，后续可在后台补充产品参数信息。"}
                </p>
              )}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-7">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#1E3A5F]">
                {isEn ? "Details" : "图文详情"}
              </p>

              <h2 className="mt-3 text-2xl font-bold text-slate-950">
                {isEn ? "Product Details" : "图文详情"}
              </h2>

              <p className="mt-6 text-base leading-8 text-slate-600">
                {productFullDesc ||
                  (isEn
                    ? "Detailed product introduction has not been added yet."
                    : "当前产品尚未补充详细介绍内容。")}
              </p>

              <p className="mt-5 rounded-2xl bg-white p-5 text-sm leading-6 text-slate-500">
                {isEn
                  ? "This section can be expanded with richer product descriptions and detail images."
                  : "后续该区域将继续接入更完整的图文详情内容与详情图展示。"}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#1E3A5F]">
                {isEn ? "Related Products" : "相关推荐"}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950">
                {isEn ? "Related Products" : "相关推荐"}
              </h2>
              <p className="mt-3 text-sm text-slate-500">
                {isEn
                  ? "Recommended products are currently based on the same category."
                  : "当前根据同分类产品进行推荐展示。"}
              </p>
            </div>
          </div>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((item) => {
              const relatedName = getLocalizedText(
                locale,
                item.name,
                item.nameEn
              );
              const relatedDesc = getLocalizedText(
                locale,
                item.shortDesc,
                item.shortDescEn
              );
              const relatedPrice = formatLocalizedPrice(locale, item.priceText);
              const imageUrl = item.images[0] ? getImageUrl(item.images[0]) : "";

              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-[#1E3A5F]/25 hover:shadow-[0_20px_50px_rgba(15,23,42,0.10)]"
                >
                  <Link
                    href={getFrontendPath(locale, `/product/${item.slug}`)}
                    className="block"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={relatedName}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[#EAF1F8] text-sm font-semibold text-[#1E3A5F]/60">
                          {isEn ? "No image" : "暂无图片"}
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="line-clamp-1 text-xl font-bold text-slate-950">
                        {relatedName}
                      </h3>

                      <p className="mt-3 line-clamp-2 min-h-[48px] text-sm leading-6 text-slate-500">
                        {relatedDesc}
                      </p>

                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                        <span className="text-sm font-bold text-[#1E3A5F]">
                          {relatedPrice}
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
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}