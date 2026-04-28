/**
 * 文件作用：
 * 封装后台管理页所需的数据读取逻辑。
 * 包括：
 * - 后台首页统计数据
 * - 产品管理分页与多条件筛选数据
 * - 分类管理分页与多条件筛选数据
 * - 询单、内容、促销等后台数据
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
  page?: number;
  pageSize?: number;
};

export async function getAdminProductsPageData(filters: AdminProductFilters = {}) {
  const {
    keyword = "",
    categoryId = "all",
    activeStatus = "all",
    featuredStatus = "all",
    hotStatus = "all",
    page = 1,
    pageSize = 10,
  } = filters;

  const currentPage = Math.max(1, page);
  const currentPageSize = Math.max(1, pageSize);
  const skip = (currentPage - 1) * currentPageSize;
  const trimmedKeyword = keyword.trim();

  const where: Prisma.ProductWhereInput = {};

  if (trimmedKeyword) {
    where.OR = [
      { name: { contains: trimmedKeyword } },
      { slug: { contains: trimmedKeyword } },
      { shortDesc: { contains: trimmedKeyword } },
      { keywords: { contains: trimmedKeyword } },
      { priceText: { contains: trimmedKeyword } },
      { category: { name: { contains: trimmedKeyword } } },
    ];
  }

  if (categoryId !== "all") {
    const parsedCategoryId = Number(categoryId);

    if (!Number.isNaN(parsedCategoryId)) {
      where.categoryId = parsedCategoryId;
    }
  }

  if (activeStatus !== "all") {
    where.isActive = activeStatus === "active";
  }

  if (featuredStatus !== "all") {
    where.isFeatured = featuredStatus === "featured";
  }

  if (hotStatus !== "all") {
    where.isManualHot = hotStatus === "hot";
  }

  const [products, categories, promotions, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: currentPageSize,
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
    prisma.promotion.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        isActive: true,
        startAt: true,
        endAt: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    categories,
    promotions,
    totalCount,
    pageSize: currentPageSize,
    currentPage,
    totalPages: Math.max(1, Math.ceil(totalCount / currentPageSize)),
  };
}

export type AdminCategoryFilters = {
  keyword?: string;
  parentId?: string;
  activeStatus?: string;
  productStatus?: string;
  childStatus?: string;
  page?: number;
  pageSize?: number;
};

export async function getAdminCategoriesPageData(
  filters: AdminCategoryFilters = {}
) {
  const {
    keyword = "",
    parentId = "all",
    activeStatus = "all",
    productStatus = "all",
    childStatus = "all",
    page = 1,
    pageSize = 10,
  } = filters;

  const currentPage = Math.max(1, page);
  const currentPageSize = Math.max(1, pageSize);
  const skip = (currentPage - 1) * currentPageSize;
  const trimmedKeyword = keyword.trim();

  const where: Prisma.CategoryWhereInput = {};

  if (trimmedKeyword) {
    where.OR = [
      { name: { contains: trimmedKeyword } },
      { slug: { contains: trimmedKeyword } },
      { description: { contains: trimmedKeyword } },
    ];
  }

  if (parentId === "none") {
    where.parentId = null;
  } else if (parentId !== "all") {
    const parsedParentId = Number(parentId);

    if (!Number.isNaN(parsedParentId)) {
      where.parentId = parsedParentId;
    }
  }

  if (activeStatus !== "all") {
    where.isActive = activeStatus === "active";
  }

  if (productStatus === "has-products") {
    where.products = {
      some: {},
    };
  } else if (productStatus === "no-products") {
    where.products = {
      none: {},
    };
  }

  if (childStatus === "has-children") {
    where.children = {
      some: {},
    };
  } else if (childStatus === "no-children") {
    where.children = {
      none: {},
    };
  }

  const [categories, parentCategories, totalCount] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip,
      take: currentPageSize,
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
      where: {
        parentId: null,
      },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.category.count({ where }),
  ]);

  return {
    categories,
    parentCategories,
    totalCount,
    pageSize: currentPageSize,
    currentPage,
    totalPages: Math.max(1, Math.ceil(totalCount / currentPageSize)),
  };
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