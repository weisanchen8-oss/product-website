/**
 * 文件作用：
 * 封装产品中心页、产品详情页和搜索页所需的数据读取逻辑。
 * 当前负责读取：
 * - 产品列表
 * - 单个产品详情
 * - 相关推荐
 * - 产品搜索结果
 * - 产品/分类中英文内容字段
 * - 产品关联的促销活动
 */

import { prisma } from "@/lib/prisma";

const productInclude = {
  images: {
    where: { isCover: true },
    orderBy: { sortOrder: "asc" as const },
    take: 1,
  },
  category: {
    select: {
      id: true,
      name: true,
      nameEn: true,
      slug: true,
      description: true,
      descriptionEn: true,
      imageUrl: true,
      isActive: true,
      sortOrder: true,
    },
  },
  promotionProducts: {
    include: {
      promotion: true,
    },
  },
};

export async function getProductsPageData() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ createdAt: "desc" }],
      include: productInclude,
    }),

    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        nameEn: true,
        slug: true,
        description: true,
        descriptionEn: true,
        imageUrl: true,
        isActive: true,
        sortOrder: true,
      },
    }),
  ]);

  return {
    products,
    categories,
  };
}

export async function getProductDetailBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
      },
      category: {
        select: {
          id: true,
          name: true,
          nameEn: true,
          slug: true,
          description: true,
          descriptionEn: true,
          imageUrl: true,
          isActive: true,
          sortOrder: true,
        },
      },
      promotionProducts: {
        include: {
          promotion: true,
        },
      },
    },
  });

  if (!product || !product.isActive) {
    return null;
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      NOT: {
        id: product.id,
      },
    },
    orderBy: [{ createdAt: "desc" }],
    include: productInclude,
    take: 3,
  });

  return {
    product,
    relatedProducts,
  };
}

export async function searchProducts(keyword: string) {
  const trimmedKeyword = keyword.trim();

  if (!trimmedKeyword) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        {
          name: {
            contains: trimmedKeyword,
          },
        },
        {
          nameEn: {
            contains: trimmedKeyword,
          },
        },
        {
          keywords: {
            contains: trimmedKeyword,
          },
        },
        {
          shortDesc: {
            contains: trimmedKeyword,
          },
        },
        {
          shortDescEn: {
            contains: trimmedKeyword,
          },
        },
      ],
    },
    orderBy: [{ createdAt: "desc" }],
    include: productInclude,
  });

  return products;
}