/**
 * 文件作用：
 * 定义网站首页。
 * 当前版本使用 Bento Grid + 渐变主视觉 + 统一卡片系统，
 * 展示 Banner、公司简介、推荐产品、热销产品、分类入口和企业优势。
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
            description: "让客户从浏览产品到提交需求的路径更短、更清晰。",
          },
          {
            title: "统一品牌形象",
            description: "通过统一视觉系统提升企业专业感和可信度。",
          },
          {
            title: "可持续扩展",
            description: "后续可继续接入数据分析、促销运营和行业风险监控。",
          },
        ];

  return (
    <>
      <SiteHeader />

      <UiPage>
        <UiContainer className="space-y-12">
          <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-8 text-white shadow-lg sm:p-10">
              <div className="absolute right-[-80px] top-[-80px] h-64 w-64 rounded-full bg-white/15 blur-2xl" />
              <div className="absolute bottom-[-100px] left-[20%] h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />

              <div className="relative z-10 max-w-2xl">
                <UiBadge className="bg-white/15 text-white backdrop-blur">
                  B2B Product Platform
                </UiBadge>

                <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                  {banner?.title ?? "面向出口贸易公司的智能产品展示平台"}
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-blue-50">
                  {banner?.content ??
                    "集中展示产品、分类、热销推荐和询单入口，帮助企业打造更专业、更可信赖的线上产品门户。"}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <UiButton
                    href={bannerExtra.primaryButtonHref || "/products"}
                    className="bg-white text-blue-700 hover:bg-blue-50"
                  >
                    {bannerExtra.primaryButtonText || "浏览产品"}
                  </UiButton>

                  <UiButton
                    href={bannerExtra.secondaryButtonHref || "/contact"}
                    variant="secondary"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                  >
                    {bannerExtra.secondaryButtonText || "提交询单"}
                  </UiButton>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <UiCard variant="featured" className="min-h-[180px]">
                <UiBadge variant="primary">经营升级</UiBadge>
                <h2 className="mt-4 text-xl font-bold text-slate-950">
                  从产品展示到运营管理
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  网站不仅展示产品，还可以继续扩展询单管理、客户管理、数据分析、促销活动与行业风险监控。
                </p>
              </UiCard>

              <UiCard className="min-h-[160px]">
                <UiBadge variant="success">专业可信</UiBadge>
                <p className="mt-4 text-3xl font-bold text-slate-950">
                  {categories.length}+
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  当前可展示产品分类，支持后续持续扩展。
                </p>
              </UiCard>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <UiCard className="overflow-hidden p-0">
              {companyIntro?.imageUrl ? (
                <div className="relative h-72 w-full">
                  <Image
                    src={companyIntro.imageUrl}
                    alt={companyIntro.title ?? "公司介绍"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-72 items-center justify-center bg-slate-100 text-sm text-slate-400">
                  公司介绍 / 品牌图预留区
                </div>
              )}
            </UiCard>

            <UiCard className="flex flex-col justify-center">
              <UiBadge variant="primary">公司简介</UiBadge>
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
                {companyIntro?.title ?? "以清晰展示和高效询单为核心的企业产品展示平台"}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                {companyIntro?.content ??
                  "本平台用于集中展示企业产品信息，帮助客户完成浏览、搜索、筛选和询单。页面风格以简洁、大气、可信赖为核心，兼顾品牌展示与业务转化。"}
              </p>
              <div className="mt-6">
                <UiButton href={companyIntroExtra.buttonHref || "/about"} variant="secondary">
                  {companyIntroExtra.buttonText || "查看公司介绍"}
                </UiButton>
              </div>
            </UiCard>
          </section>

          <section>
            <UiSectionHeader
              eyebrow="Featured Products"
              title="推荐产品"
              description="通过更大的产品卡片突出核心产品，增强首页视觉层级和转化入口。"
              action={<UiButton href="/products">查看全部产品</UiButton>}
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product, index) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group">
                  <UiCard
                    className={index === 0 ? "md:col-span-2 lg:col-span-2" : ""}
                    variant={index === 0 ? "featured" : "default"}
                  >
                    <div
                      className={`relative overflow-hidden rounded-2xl bg-slate-100 ${
                        index === 0 ? "h-72" : "h-48"
                      }`}
                    >
                       {product.images[0]?.watermarkedUrl ? (
                        <Image
                          src={product.images[0].watermarkedUrl}
                          alt={product.name}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                          暂无图片
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <h3 className="line-clamp-1 text-lg font-bold text-slate-950">
                        {product.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {product.shortDesc}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="font-semibold text-blue-600">
                          {product.priceText}
                        </span>
                        <span className="text-sm font-medium text-slate-500">
                          查看详情 →
                        </span>
                      </div>
                    </div>
                  </UiCard>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <UiSectionHeader
              eyebrow="Hot Products"
              title="热销产品"
              description="将热销产品集中展示，强化用户对热门产品的快速判断。"
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {hotProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group">
                  <UiCard>
                    <div className="relative h-44 overflow-hidden rounded-2xl bg-slate-100">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].watermarkedUrl!}
                          alt={product.name}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                          暂无图片
                        </div>
                      )}

                      <div className="absolute left-3 top-3">
                        <UiBadge variant="warning">Hot</UiBadge>
                      </div>
                    </div>

                    <h3 className="mt-4 line-clamp-1 text-base font-bold text-slate-950">
                      {product.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {product.shortDesc}
                    </p>
                    <p className="mt-4 font-semibold text-blue-600">
                      {product.priceText}
                    </p>
                  </UiCard>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <UiSectionHeader
              eyebrow="Categories"
              title="产品分类"
              description="以卡片入口展示分类，便于客户快速进入感兴趣的产品集合。"
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Link key={category.id} href={`/products?category=${category.slug}`}>
                  <UiCard className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-blue-50">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xl font-bold text-blue-600">
                          {category.name.slice(0, 1)}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-950">{category.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                        {category.description ?? "查看该分类下的相关产品。"}
                      </p>
                    </div>
                  </UiCard>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <UiSectionHeader
              eyebrow="Advantages"
              title="企业优势"
              description="用简洁卡片承载核心优势，提升首页品牌表达。"
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {visibleAdvantages.map((item, index) => (
                <UiCard key={`${item.title}-${index}`}>
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-blue-600">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className="font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
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