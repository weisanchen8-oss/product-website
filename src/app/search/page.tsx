/**
 * 文件作用：
 * 定义搜索结果页。
 * 当前版本根据查询参数 q 从数据库搜索产品，并统一产品卡片图片展示结构。
 */

import Image from "next/image";
import Link from "next/link";
import { EmptyStateCard } from "@/components/common/empty-state-card";
import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { searchProducts } from "@/lib/product-data";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const keyword = params.q?.trim() || "";
  const results = keyword ? await searchProducts(keyword) : [];

  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <PageHero
          eyebrow="Search"
          title="搜索结果"
          description="该页面根据顶部搜索栏输入内容，从数据库中返回匹配产品结果。"
        />

        <section className="section">
          <div className="container">
            <div className="search-summary-card">
              <h2>
                {keyword
                  ? `关于 “${keyword}” 的搜索结果`
                  : "请输入产品名称或关键词进行搜索"}
              </h2>
              <p>
                {keyword
                  ? `当前匹配到 ${results.length} 条结果。`
                  : "当前未输入搜索关键词，因此暂不展示搜索结果。"}
              </p>
            </div>

            {results.length > 0 ? (
              <div className="card-grid">
                {results.map((product) => {
                  const coverImage =
                    product.images.find((image) => image.isCover) ??
                    product.images[0];

                  return (
                    <article key={product.id} className="product-card">
                      <Link
                        href={`/product/${product.slug}`}
                        className="product-image-link product-link-block"
                      >
                        {coverImage ? (
                          <Image
                            src={coverImage.processedUrl ?? coverImage.originalUrl}
                            alt={product.name}
                            width={320}
                            height={240}
                            className="product-card-image"
                          />
                        ) : (
                          <div className="product-image-placeholder">暂无图片</div>
                        )}
                      </Link>

                      <div className="product-card-body">
                        <h3>
                          <Link
                            href={`/product/${product.slug}`}
                            className="text-link"
                          >
                            {product.name}
                          </Link>
                        </h3>

                        <p>{product.shortDesc}</p>

                        <div className="product-card-meta">
                          <span className="product-meta-text">
                            分类：{product.category.name}
                          </span>
                        </div>

                        <div className="product-card-footer">
                          <span>{product.priceText}</span>
                          <Link
                            href={`/product/${product.slug}`}
                            className="ghost-button inline-button-link"
                          >
                            查看详情
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="section-block">
                <EmptyStateCard
                  title="未找到匹配产品"
                  description={
                    keyword
                      ? "当前关键词没有匹配到产品，请尝试更换关键词后重新搜索。"
                      : "请输入关键词开始搜索产品。"
                  }
                />
              </div>
            )}

            <div className="page-actions">
              <Link href="/products" className="ghost-button inline-button-link">
                返回产品中心
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}