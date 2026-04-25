/**
 * 文件作用：
 * 定义产品详情页。
 * 当前版本根据 slug 从数据库读取真实产品详情、图片、分类和相关推荐。
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getProductDetailBySlug } from "@/lib/product-data";
import { ProductGallery } from "@/components/product/product-gallery";
import { AddToInquiryButton } from "@/components/inquiry/add-to-inquiry-button";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function parseSpecs(specsJson: string | null) {
  if (!specsJson) {
    return [];
  }

  try {
    const parsed = JSON.parse(specsJson) as Record<string, string>;
    return Object.entries(parsed);
  } catch {
    return [];
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const data = await getProductDetailBySlug(slug);

  if (!data) {
    notFound();
  }

  const { product, relatedProducts } = data;
  const specs = parseSpecs(product.specsJson);
  const galleryImages = product.images.map((image) => ({
    id: image.id,
    url: image.processedUrl ?? image.originalUrl,
    alt: product.name,
  }));

  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <PageHero
          eyebrow="Product Detail"
          title={product.name}
          description={product.shortDesc}
        />

        <section className="section">
          <div className="container">
            <div className="product-detail-layout">
              <div className="product-gallery-card">
                <ProductGallery images={galleryImages} />
              </div>

              <div className="product-info-card">
                <p className="eyebrow">产品分类：{product.category.name}</p>
                <h2>{product.name}</h2>
                <p className="product-info-text">
                  {product.shortDesc}
                </p>

                <div className="product-tag-row">
                  <span className="product-tag">企业采购</span>
                  {product.isFeatured ? (
                    <span className="product-tag">推荐产品</span>
                  ) : null}
                  {product.isManualHot ? (
                    <span className="product-tag">热销产品</span>
                  ) : null}
                </div>

                <div className="product-price-box">
                  <strong>参考价格：</strong>
                  <span>{product.priceText}</span>
                </div>

                <div className="product-action-row">
                  <AddToInquiryButton
                    productId={product.id}
                    productName={product.name}
                    productSlug={product.slug}
                    priceText={product.priceText}
                  />
                  <Link href="/products" className="ghost-button inline-button-link">
                    返回产品中心
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-muted">
          <div className="container">
            <div className="content-card">
              <h2>产品参数</h2>

              <div className="spec-grid">
                {specs.length > 0 ? (
                  specs.map(([key, value]) => (
                    <div key={key} className="spec-item">
                      <strong>{key}</strong>
                      <span>{value}</span>
                    </div>
                  ))
                ) : (
                  <div className="spec-item">
                    <strong>暂无参数</strong>
                    <span>后续可在后台补充产品参数信息。</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="content-card">
              <h2>图文详情</h2>
              <p>{product.fullDesc ?? "当前产品尚未补充详细介绍内容。"}</p>
              <p>后续该区域将继续接入更完整的图文详情内容与详情图展示。</p>
            </div>
          </div>
        </section>

        <section className="section section-muted">
          <div className="container">
            <div className="section-title">
              <p className="eyebrow">Related Products</p>
              <h2>相关推荐</h2>
              <p>当前根据同分类产品进行推荐展示。</p>
            </div>

            <div className="card-grid related-grid">
              {relatedProducts.map((item) => (
                <article key={item.id} className="product-card">
                  <Link
                    href={`/product/${item.slug}`}
                    className="product-image-placeholder product-link-block"
                  >
                    {item.images[0]?.processedUrl ? "展示图" : "产品图"}
                  </Link>

                  <div className="product-card-body">
                    <h3>
                      <Link href={`/product/${item.slug}`} className="text-link">
                        {item.name}
                      </Link>
                    </h3>

                    <p>{item.shortDesc}</p>

                    <div className="product-card-footer">
                      <span>{item.priceText}</span>
                      <Link
                        href={`/product/${item.slug}`}
                        className="ghost-button inline-button-link"
                      >
                        查看详情
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}