/**
 * 文件作用：
 * 封装后台管理页所需的数据读取逻辑。
 */

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getAdminDashboardData() {
  const [
    productCount,
    activeProductCount,
    featuredProductCount,
    manualHotProductCount,
    categoryCount,
    inquiryCount,
    pendingInquiryCount,
    contactingInquiryCount,
    completedInquiryCount,
    importantInquiryCount,
    recentInquiries,
    recentAdminLogs,
    recentProducts,
    contentItems,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isFeatured: true } }),
    prisma.product.count({ where: { isManualHot: true } }),
    prisma.category.count(),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: "pending" } }),
    prisma.inquiry.count({
      where: {
        status: {
          in: ["contacting", "communicating"],
        },
      },
    }),
    prisma.inquiry.count({ where: { status: "completed" } }),
    prisma.inquiry.count({
      where: {
        user: {
          isImportant: true,
        },
      },
    }),
    prisma.inquiry.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 6,
      include: {
        user: true,
        items: true,
      },
    }),
    prisma.adminLog.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 8,
    }),
    prisma.product.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
      },
    }),
    prisma.siteContent.findMany({
      orderBy: [{ contentKey: "asc" }],
    }),
  ]);

  return {
    productCount,
    activeProductCount,
    featuredProductCount,
    manualHotProductCount,
    categoryCount,
    inquiryCount,
    pendingInquiryCount,
    contactingInquiryCount,
    completedInquiryCount,
    importantInquiryCount,
    recentInquiries,
    recentAdminLogs,
    recentProducts,
    contentItems,
  };
}

export type AdminProductFilters = {
  keyword?: string;
  categoryId?: string;
  activeStatus?: string;
  featuredStatus?: string;
  hotStatus?: string;
};

export async function getAdminProductsPageData(filters: AdminProductFilters = {}) {
  const keyword = filters.keyword?.trim() || "";

  const where: Prisma.ProductWhereInput = {};

  if (keyword) {
    where.OR = [
      { name: { contains: keyword } },
      { slug: { contains: keyword } },
      { shortDesc: { contains: keyword } },
      { keywords: { contains: keyword } },
      { priceText: { contains: keyword } },
      {
        category: {
          name: {
            contains: keyword,
          },
        },
      },
    ];
  }

  if (filters.categoryId && filters.categoryId !== "all") {
    where.categoryId = Number(filters.categoryId);
  }

  if (filters.activeStatus === "active") {
    where.isActive = true;
  }

  if (filters.activeStatus === "inactive") {
    where.isActive = false;
  }

  if (filters.featuredStatus === "featured") {
    where.isFeatured = true;
  }

  if (filters.featuredStatus === "not-featured") {
    where.isFeatured = false;
  }

  if (filters.hotStatus === "hot") {
    where.isManualHot = true;
  }

  if (filters.hotStatus === "not-hot") {
    where.isManualHot = false;
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      include: {
        category: true,
        images: {
          where: { isCover: true },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        promotionProducts: {
          include: {
            promotion: true,
          },
        },
      },
    }),

    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  return { products, categories };
}

export type AdminCategoryFilters = {
  keyword?: string;
  parentId?: string;
  activeStatus?: string;
  productStatus?: string;
  childStatus?: string;
};

export async function getAdminCategoriesPageData(filters: AdminCategoryFilters = {}) {
  const keyword = filters.keyword?.trim() || "";

  const where: Prisma.CategoryWhereInput = {};

  if (keyword) {
    where.OR = [
      { name: { contains: keyword } },
      { slug: { contains: keyword } },
      { description: { contains: keyword } },
    ];
  }

  if (filters.parentId === "none") {
    where.parentId = null;
  } else if (filters.parentId && filters.parentId !== "all") {
    where.parentId = Number(filters.parentId);
  }

  if (filters.activeStatus === "active") {
    where.isActive = true;
  }

  if (filters.activeStatus === "inactive") {
    where.isActive = false;
  }

  if (filters.productStatus === "has-products") {
    where.products = {
      some: {},
    };
  }

  if (filters.productStatus === "no-products") {
    where.products = {
      none: {},
    };
  }

  if (filters.childStatus === "has-children") {
    where.children = {
      some: {},
    };
  }

  if (filters.childStatus === "no-children") {
    where.children = {
      none: {},
    };
  }

  const [categories, parentCategories] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        parent: true,
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    }),

    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  return { categories, parentCategories };
}

export async function getAdminInquiriesPageData() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      user: true,
      items: true,
    },
  });

  return { inquiries };
}

export async function getAdminContentPageData() {
  const contentItems = await prisma.siteContent.findMany({
    orderBy: [{ contentKey: "asc" }],
  });

  return { contentItems };
}

export async function getAdminPromotionsPageData() {
  const promotions = await prisma.promotion.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      products: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              priceText: true,
            },
          },
        },
      },
    },
  });

  return { promotions };
}

export async function getAdminPromotionDetailPageData(id: number) {
  const promotion = await prisma.promotion.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  const allProducts = await prisma.product.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      category: true,
    },
  });

  return { promotion, allProducts };
}