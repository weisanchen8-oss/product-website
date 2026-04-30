/**
 * 文件作用：
 * 产品列表页（前台）
 * 使用统一 UI 系统重构，提升卡片质量、交互体验和视觉层级。
 */

import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import {
  UiBadge,
  UiButton,
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

  return (
    <>
      <SiteHeader />

      <UiPage>
        <UiContainer className="space-y-10">
          {/* 标题区 */}
          <UiSectionHeader
            eyebrow="Products"
            title="产品中心"
            description="浏览全部产品，支持后续扩展筛选、搜索与分类。"
          />

          {/* 产品网格 */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`} className="group">
                <UiCard>
                  {/* 图片 */}
                  <div className="relative h-52 overflow-hidden rounded-2xl bg-slate-100">
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

                    {/* 标签（后续可以接促销/热销） */}
                    <div className="absolute left-3 top-3 flex gap-2">
                      {product.isFeatured && (
                        <UiBadge variant="primary">推荐</UiBadge>
                      )}
                    </div>
                  </div>

                  {/* 内容 */}
                  <div className="mt-4">
                    <h3 className="line-clamp-1 text-base font-bold text-slate-950">
                      {product.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {product.shortDesc}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        {product.priceText}
                      </span>

                      <span className="text-sm text-slate-500 group-hover:text-blue-600">
                        查看 →
                      </span>
                    </div>
                  </div>
                </UiCard>
              </Link>
            ))}
          </div>

          {/* 空状态 */}
          {products.length === 0 && (
            <UiCard className="text-center py-12">
              <p className="text-slate-500">暂无产品</p>
            </UiCard>
          )}
        </UiContainer>
      </UiPage>

      <SiteFooter />
    </>
  );
}