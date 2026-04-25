/**
 * 文件作用：
 * 定义网站首页。
 * 当前版本从数据库读取：
 * - Banner
 * - 公司简介
 * - 推荐产品
 * - 热销产品（人工优先 + 销量补位）
 * - 分类列表
 */

import Link from "next/link";
import { HomeHero } from "@/components/home/home-hero";
import { HomeSectionTitle } from "@/components/home/home-section-title";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getHomePageData } from "@/lib/home-data";
import Image from "next/image";

type BannerExtra = {
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
};

export default async function HomePage() {
  const { banner, companyIntro, categories, featuredProducts, hotProducts } =
    await getHomePageData();

  const bannerExtra: BannerExtra = banner?.extraJson
    ? JSON.parse(banner.extraJson)
    : {};

  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <HomeHero
          title={banner?.title ?? undefined}
          description={banner?.content ?? undefined}
          primaryButtonText={bannerExtra.primaryButtonText}
          primaryButtonLink={bannerExtra.primaryButtonLink}
          secondaryButtonText={bannerExtra.secondaryButtonText}
          secondaryButtonLink={bannerExtra.secondaryButtonLink}
        />

        <section className="section">
          <div className="container">
            <div className="intro-card">
              <div className="intro-content">
                <p className="eyebrow">公司简介</p>
                <h2>
                  {companyIntro?.title ??
                    "以清晰展示和高效询单为核心的企业产品展示平台"}
                </h2>
                <p>
                  {companyIntro?.content ??
                    "本平台用于集中展示企业产品信息，帮助客户完成浏览、搜索、筛选和询单。页面风格以简洁、大气、可信赖为核心，兼顾品牌展示与业务转化。"}
                </p>

                <div className="intro-link-row">
                  <Link href="/company" className="ghost-button inline-button-link">
                    查看公司介绍
                  </Link>
                </div>
              </div>

              <div className="intro-placeholder">公司介绍 / 品牌图预留区</div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <HomeSectionTitle
              eyebrow="Featured"
              title="推荐产品"
              description="该区域当前已从数据库读取推荐产品数据。"
            />

            <div className="card-grid">
              {featuredProducts.map((product) => (
                <article key={product.id} className="product-card">
                  <Link
                    href={`/product/${product.slug}`}
                    className="product-image-link product-link-block"
                  >
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].processedUrl ?? product.images[0].originalUrl}
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
                      <Link href={`/product/${product.slug}`} className="text-link">
                        {product.name}
                      </Link>
                    </h3>

                    <p>{product.shortDesc}</p>

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
              ))}
            </div>
          </div>
        </section>

        <section className="section section-muted">
          <div className="container">
            <HomeSectionTitle
              eyebrow="Hot Products"
              title="热销推荐"
              description="该区域已启用人工热销优先、销量补位的混合推荐逻辑。"
            />

            <div className="card-grid">
              {hotProducts.map((product) => (
                <article key={product.id} className="product-card">
                  <Link
                    href={`/product/${product.slug}`}
                    className="product-image-link product-link-block"
                  >
                    {product.images[0] ? (
                     <Image
                        src={product.images[0].processedUrl ?? product.images[0].originalUrl}
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
                      <Link href={`/product/${product.slug}`} className="text-link">
                        {product.name}
                      </Link>
                    </h3>

                    <p>{product.shortDesc}</p>

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
              ))}
            </div>

            <div className="page-actions">
              <Link href="/search?q=热销" className="ghost-button inline-button-link">
                查看更多热销结果
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <HomeSectionTitle
              eyebrow="Categories"
              title="产品分类"
              description="该区域已从数据库读取分类数据。"
            />

            <div className="category-grid">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href="/products"
                  className="category-card category-link-card"
                >
                  <div className="category-icon-placeholder">分类图标</div>
                  <h3>{category.name}</h3>
                  <p>{category.description ?? "分类说明占位内容。"}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-muted">
          <div className="container">
            <HomeSectionTitle
              eyebrow="Advantages"
              title="企业优势"
              description="该区域后续将继续改造为数据库或内容配置驱动。"
            />

            <div className="advantage-grid">
              <div className="advantage-card">
                <h3>专业产品展示</h3>
                <p>突出产品信息层次，便于客户快速建立认知。</p>
              </div>
              <div className="advantage-card">
                <h3>高效询单流程</h3>
                <p>支持客户快速整理需求，提升沟通效率。</p>
              </div>
              <div className="advantage-card">
                <h3>品牌统一形象</h3>
                <p>统一页面风格与产品展示逻辑，增强企业可信度。</p>
              </div>
              <div className="advantage-card">
                <h3>可持续扩展</h3>
                <p>后续可接入更多数据与后台配置能力。</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}