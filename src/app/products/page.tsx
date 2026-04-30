/**
 * 文件作用：
 * 产品列表页（前台）
 * 当前版本采用蓝白品牌风格升级：
 * - 保留原有产品读取、图片展示、推荐标签和详情跳转
 * - 增加品牌化顶部横幅
 * - 增加左侧说明区 + 右侧产品网格
 * - 统一主色 #4167B1 与浅蓝背景 #DEF0F9
 */

import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import {
  UiBadge,
  UiCard,
  UiContainer,
  UiPage,
  UiSectionHeader,
} from "@/components/ui-system";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const featuredCount = products.filter((product) => product.isFeatured).length;

  return (
    <>
      <SiteHeader />

      <UiPage>
        <UiContainer className="space-y-14">
          {/* 顶部品牌横幅 */}
          <section className="relative overflow-hidden bg-[#DEF0F9] px-8 py-12 shadow-sm md:px-12">
            <div className="absolute right-[-80px] top-[-80px] h-64 w-64 rounded-full bg-white/60 blur-3xl" />
            <div className="absolute bottom-[-90px] left-[20%] h-56 w-56 rounded-full bg-[#4167B1]/10 blur-3xl" />

            <div className="relative z-10 max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#4167B1]">
                Products Center
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#4167B1]">
                产品中心
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#1B1F23]/70">
                浏览企业全部产品，快速了解产品特点、价格信息与推荐状态。后续可继续扩展分类筛选、关键词搜索、促销标签和询单入口。
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="bg-white/75 p-5 shadow-sm backdrop-blur">
                  <p className="text-2xl font-bold text-[#4167B1]">
                    {products.length}
                  </p>
                  <p className="mt-1 text-xs text-[#1B1F23]/60">在售产品</p>
                </div>

                <div className="bg-white/75 p-5 shadow-sm backdrop-blur">
                  <p className="text-2xl font-bold text-[#4167B1]">
                    {featuredCount}
                  </p>
                  <p className="mt-1 text-xs text-[#1B1F23]/60">推荐产品</p>
                </div>

                <div className="bg-white/75 p-5 shadow-sm backdrop-blur">
                  <p className="text-2xl font-bold text-[#4167B1]">
                    B2B
                  </p>
                  <p className="mt-1 text-xs text-[#1B1F23]/60">产品展示场景</p>
                </div>
              </div>
            </div>
          </section>

          {/* 主体区域：左侧说明 + 右侧产品网格 */}
          <section className="grid gap-8 lg:grid-cols-[260px_1fr]">
            {/* 左侧说明栏 */}
            <aside className="h-fit bg-white p-6 shadow-[0_12px_35px_rgba(27,31,35,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#4167B1]">
                Browse
              </p>

              <h2 className="mt-4 text-xl font-bold text-[#1B1F23]">
                产品浏览
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#1B1F23]/65">
                当前页面展示所有启用产品。推荐产品会显示蓝色标签，便于客户快速识别重点产品。
              </p>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-sm font-semibold text-[#1B1F23]">
                  展示规则
                </p>

                <ul className="mt-3 space-y-2 text-sm text-[#1B1F23]/60">
                  <li>• 按最新创建时间排序</li>
                  <li>• 仅展示已启用产品</li>
                  <li>• 点击卡片进入详情页</li>
                </ul>
              </div>
            </aside>

            {/* 产品区域 */}
            <div className="space-y-6">
              <UiSectionHeader
                eyebrow="All Products"
                title="全部产品"
                description="采用更宽松的卡片网格，让产品图、名称、描述和价格信息更清晰。"
              />

              <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group block"
                  >
                    <UiCard
                      className={
                        index === 0
                          ? "overflow-hidden p-0 xl:col-span-2"
                          : "overflow-hidden p-0"
                      }
                    >
                      <div
                        className={
                          index === 0
                            ? "relative h-72 overflow-hidden bg-[#DEF0F9]"
                            : "relative h-56 overflow-hidden bg-[#DEF0F9]"
                        }
                      >
                        {product.images?.[0]?.watermarkedUrl ? (
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

                        <div className="absolute left-4 top-4 flex gap-2">
                          {product.isFeatured && (
                            <UiBadge
                              variant="primary"
                              className="bg-white/85 text-[#4167B1] backdrop-blur"
                            >
                              推荐
                            </UiBadge>
                          )}

                          {index === 0 && (
                            <UiBadge
                              variant="success"
                              className="bg-white/85 text-emerald-700 backdrop-blur"
                            >
                              Featured
                            </UiBadge>
                          )}
                        </div>
                      </div>

                      <div className={index === 0 ? "p-7" : "p-5"}>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#4167B1]">
                          Product
                        </p>

                        <h3
                          className={
                            index === 0
                              ? "line-clamp-1 text-2xl font-bold text-[#1B1F23]"
                              : "line-clamp-1 text-lg font-bold text-[#1B1F23]"
                          }
                        >
                          {product.name}
                        </h3>

                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#1B1F23]/60">
                          {product.shortDesc}
                        </p>

                        <div className="mt-5 flex items-center justify-between">
                          <span className="text-lg font-bold text-[#4167B1]">
                            {product.priceText}
                          </span>

                          <span className="text-sm font-semibold text-[#1B1F23]/50 transition group-hover:text-[#4167B1]">
                            查看详情 →
                          </span>
                        </div>
                      </div>
                    </UiCard>
                  </Link>
                ))}
              </div>

              {products.length === 0 && (
                <UiCard className="py-16 text-center">
                  <p className="text-slate-500">暂无产品</p>
                </UiCard>
              )}
            </div>
          </section>
        </UiContainer>
      </UiPage>

      <SiteFooter />
    </>
  );
}