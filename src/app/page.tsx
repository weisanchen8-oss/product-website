/**
 * 文件作用：
 * 首页（品牌风升级版）
 * 在原有功能基础上，仅优化 UI：
 * - 蓝白品牌配色
 * - 杂志式布局
 * - 色块 + 留白 + 层次
 */

import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  UiBadge,
  UiButton,
  UiCard,
  UiContainer,
  UiPage,
  UiSectionHeader,
} from "@/components/ui-system";
import { getHomePageData } from "@/lib/home-data";

/* ===== 原有逻辑保留 ===== */

type BannerExtra = {
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
};

type CompanyIntroExtra = {
  buttonText?: string;
  buttonHref?: string;
};

type AdvantageItem = {
  title?: string;
  description?: string;
};

function safeParseJson<T>(value: string | null | undefined): T {
  if (!value) return {} as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return {} as T;
  }
}

function safeParseAdvantages(value: string | null | undefined): AdvantageItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        title: typeof item?.title === "string" ? item.title : "",
        description: typeof item?.description === "string" ? item.description : "",
      }))
      .filter((item) => item.title || item.description);
  } catch {
    return [];
  }
}

/* ===== 页面 ===== */

export default async function HomePage() {
  const {
    banner,
    companyIntro,
    homeAdvantages,
    categories,
    featuredProducts,
    hotProducts,
  } = await getHomePageData();

  const bannerExtra = safeParseJson<BannerExtra>(banner?.extraJson);
  const companyIntroExtra = safeParseJson<CompanyIntroExtra>(companyIntro?.extraJson);
  const advantageItems = safeParseAdvantages(homeAdvantages?.content);

  const visibleAdvantages =
    advantageItems.length > 0
      ? advantageItems
      : [
          {
            title: "专业产品展示",
            description: "突出产品信息层次，帮助客户快速理解产品价值。",
          },
          {
            title: "高效询单流程",
            description: "让客户转化路径更清晰。",
          },
          {
            title: "统一品牌形象",
            description: "提升企业可信度。",
          },
        ];

  return (
    <>
      <SiteHeader />

      <UiPage>
        <UiContainer className="space-y-20">
          {/* ===== HERO（重点改造）===== */}
          <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            {/* 图片 */}
            <div className="relative">
              <div className="absolute left-[-40px] top-10 h-64 w-64 bg-[#DEF0F9]" />

              <div className="relative z-10 border-[8px] border-white shadow-lg">
                <div className="relative h-[420px] w-full bg-slate-200">
                  {featuredProducts[0]?.images?.[0]?.watermarkedUrl ? (
                    <Image
                      src={featuredProducts[0].images[0].watermarkedUrl!}
                      alt={featuredProducts[0].name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      主视觉图片
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 文案 */}
            <div className="flex items-center">
              <div className="bg-[#DEF0F9] p-10">
                <p className="text-xs uppercase tracking-[0.3em] text-[#4167B1]">
                  B2B Product Platform
                </p>

                <h1 className="mt-4 text-4xl font-bold text-[#4167B1]">
                  {banner?.title ?? "面向出口贸易公司的产品展示平台"}
                </h1>

                <p className="mt-4 text-sm text-slate-600">
                  {banner?.content ?? "展示产品、分类、推荐与询单入口，提升客户转化效率。"}
                </p>

                <div className="mt-6 flex gap-4">
                  <UiButton
                    href={bannerExtra.primaryButtonHref || "/products"}
                    className="bg-[#4167B1] text-white hover:bg-[#2f5597]"
                  >
                    {bannerExtra.primaryButtonText || "浏览产品"}
                  </UiButton>

                  <UiButton
                    href={bannerExtra.secondaryButtonHref || "/contact"}
                    variant="secondary"
                  >
                    {bannerExtra.secondaryButtonText || "提交询单"}
                  </UiButton>
                </div>
              </div>
            </div>
          </section>

          {/* ===== 公司介绍 ===== */}
          <section className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <UiCard className="overflow-hidden p-0">
              <div className="relative h-72 bg-slate-200">
                {companyIntro?.imageUrl && (
                  <Image
                    src={companyIntro.imageUrl}
                    alt="公司介绍"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            </UiCard>

            <div className="flex flex-col justify-center">
              <UiBadge variant="primary">About</UiBadge>

              <h2 className="mt-4 text-2xl font-bold text-[#4167B1]">
                {companyIntro?.title ?? "公司介绍"}
              </h2>

              <p className="mt-4 text-sm text-slate-600">
                {companyIntro?.content ?? "企业介绍内容"}
              </p>

              <div className="mt-6">
                <UiButton href={companyIntroExtra.buttonHref || "/about"}>
                  了解更多
                </UiButton>
              </div>
            </div>
          </section>

          {/* ===== 推荐产品 ===== */}
          <section>
            <UiSectionHeader
              title="推荐产品"
              description="核心产品展示"
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <UiCard>
                    <div className="relative h-48 bg-slate-100">
                      {product.images?.[0]?.watermarkedUrl && (
                        <Image
                          src={product.images[0].watermarkedUrl!}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    <h3 className="mt-4 font-bold text-[#1B1F23]">
                      {product.name}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      {product.shortDesc}
                    </p>

                    <p className="mt-4 font-semibold text-[#4167B1]">
                      {product.priceText}
                    </p>
                  </UiCard>
                </Link>
              ))}
            </div>
          </section>

          {/* ===== 分类 ===== */}
          <section>
            <UiSectionHeader title="产品分类" />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Link key={category.id} href={`/products?category=${category.slug}`}>
                  <UiCard className="hover:bg-[#DEF0F9]">
                    <h3 className="font-bold text-[#4167B1]">
                      {category.name}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      {category.description}
                    </p>
                  </UiCard>
                </Link>
              ))}
            </div>
          </section>

          {/* ===== 优势 ===== */}
          <section>
            <UiSectionHeader title="企业优势" />

            <div className="grid gap-6 md:grid-cols-3">
              {visibleAdvantages.map((item, index) => (
                <UiCard key={index}>
                  <div className="mb-4 text-[#4167B1] font-bold">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <h3 className="font-bold text-[#1B1F23]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {item.description}
                  </p>
                </UiCard>
              ))}
            </div>
          </section>
        </UiContainer>
      </UiPage>

      <SiteFooter />
    </>
  );
}