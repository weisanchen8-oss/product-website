/**
 * 文件作用：
 * 前台多语言搜索结果页。
 * 当前支持 /zh/search?q=关键词 和 /en/search?q=keyword。
 * 固定 UI 文案支持中英文切换，产品数据库内容后续再接入英文字段。
 */

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyStateCard } from "@/components/common/empty-state-card";
import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { searchProducts } from "@/lib/product-data";
import { getFrontendPath, isFrontendLocale } from "@/lib/frontend-i18n";

type LocaleSearchPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

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
      <SiteHeader locale={locale} />

      <main>
        <PageHero
          eyebrow={isEn ? "Search" : "搜索结果"}
          title={
            keyword
              ? isEn
                ? `Search results for "${keyword}"`
                : `关于“${keyword}”的搜索结果`
              : isEn
                ? "Please enter a product name or keyword"
                : "请输入产品名称或关键词进行搜索"
          }
          description={
            keyword
              ? isEn
                ? `${results.length} result(s) found.`
                : `当前匹配到 ${results.length} 条结果。`
              : isEn
                ? "No search keyword entered yet, so no results are displayed."
                : "当前未输入搜索关键词，因此暂不展示搜索结果。"
          }
        />

        <section className="section">
          <div className="container">
            {results.length > 0 ? (
              <div className="product-list-grid">
                {results.map((product) => {
                  const coverImage =
                    product.images.find((image) => image.isCover) ??
                    product.images[0];

                  return (
                    <article key={product.id} className="product-list-card">
                      <Link
                        href={getFrontendPath(locale, `/product/${product.slug}`)}
                        className="product-list-image-wrap"
                      >
                        {coverImage ? (
                          <Image
                            src={coverImage.processedUrl ?? coverImage.originalUrl}
                            alt={product.name}
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
                            href={getFrontendPath(locale, `/product/${product.slug}`)}
                            className="text-link"
                          >
                            {product.name}
                          </Link>
                        </h3>

                        <p>{product.shortDesc}</p>

                        <div className="product-meta">
                          {isEn ? "Category: " : "分类："}
                          {product.category.name}
                        </div>

                        <div className="product-card-footer">
                          <span>{product.priceText}</span>

                          <Link
                            href={getFrontendPath(locale, `/product/${product.slug}`)}
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

            <div className="page-actions">
              <Link
                href={getFrontendPath(locale, "/products")}
                className="ghost-button"
              >
                {isEn ? "Back to Products" : "返回产品中心"}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}