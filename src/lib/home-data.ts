/**
 * 文件作用：
 * 封装首页所需的数据读取逻辑。
 * 当前负责读取：
 * - 首页 Banner
 * - 公司简介
 * - 企业优势
 * - 推荐产品
 * - 热销产品（人工优先 + 销量补位）
 * - 分类列表
 */

import { prisma } from "@/lib/prisma";

export async function getHomePageData() {
  const [
    banner,
    companyIntro,
    homeAdvantages,
    categories,
    featuredProducts,
    manualHotProducts,
    autoHotCandidates,
  ] = await Promise.all([
    prisma.siteContent.findUnique({
      where: { contentKey: "home_banner" },
    }),
    prisma.siteContent.findUnique({
      where: { contentKey: "home_company_intro" },
    }),
    prisma.siteContent.findUnique({
      where: { contentKey: "home_advantages" },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      orderBy: [{ featuredSort: "asc" }, { createdAt: "desc" }],
      include: {
        images: {
          where: { isCover: true },
          take: 1,
          orderBy: { sortOrder: "asc" },
        },
      },
      take: 4,
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
        isManualHot: true,
      },
      orderBy: [{ manualHotSort: "asc" }, { createdAt: "desc" }],
      include: {
        images: {
          where: { isCover: true },
          take: 1,
          orderBy: { sortOrder: "asc" },
        },
      },
      take: 4,
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ salesCount: "desc" }, { createdAt: "desc" }],
      include: {
        images: {
          where: { isCover: true },
          take: 1,
          orderBy: { sortOrder: "asc" },
        },
      },
      take: 12,
    }),
  ]);

  const hotSlots = 4;
  const manualIds = new Set(manualHotProducts.map((item) => item.id));
  const autoHotProducts = autoHotCandidates.filter((item) => !manualIds.has(item.id));
  const hotProducts = [...manualHotProducts, ...autoHotProducts].slice(0, hotSlots);

  return {
    banner,
    companyIntro,
    homeAdvantages,
    categories,
    featuredProducts,
    hotProducts,
  };
}