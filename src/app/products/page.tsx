/**
 * 文件作用：
 * 定义产品中心页。
 * 当前版本从数据库读取产品列表、分类信息和促销信息；
 * 促销产品会在产品图片左上角显示促销角标。
 */

import Image from "next/image";
import Link from "next/link";
import { EmptyStateCard } from "@/components/common/empty-state-card";
import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getProductsPageData } from "@/lib/product-data";

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

export default async function ProductsPage() {
  const { products, categories } = await getProductsPageData();

  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <PageHero
          eyebrow="Products"
          title="产品中心"
          description="集中展示企业产品信息，当前页面已从数据库读取产品与分类数据。"
        />

        <section className="section">
          <div className="container">
            <div className="filter-bar">
              <div className="filter-chip-group">
                <button type="button" className="filter-chip active">
                  全部产品
                </button>

                {categories.map((category) => (
                  <button key={category.id} type="button" className="filter-chip">
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="card-grid">
              {products.map((product) => {
                const coverImage =
                  product.images.find((image) => image.isCover) ??
                  product.images[0];

                const bestPromotion = getBestActivePromotion(
                  product.promotionProducts
                );

                return (
                  <article key={product.id} className="product-card">
                    <div className="product-image-wrapper">
                      {bestPromotion ? (
                        <div className="product-corner-badge">促销</div>
                      ) : null}

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
                          <div className="product-image-placeholder">
                            暂无图片
                          </div>
                        )}
                      </Link>
                    </div>

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

            <div className="section-block">
              <EmptyStateCard
                title="当前已连接真实产品数据"
                description="下一阶段将继续完善分类筛选、询单清单和产品管理流程。"
              />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}