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

export async function getAdminProductsPageData(keyword = "") {
  const trimmedKeyword = keyword.trim();

  const where: Prisma.ProductWhereInput = trimmedKeyword
    ? {
        OR: [
          { name: { contains: trimmedKeyword } },
          { slug: { contains: trimmedKeyword } },
          { shortDesc: { contains: trimmedKeyword } },
          { keywords: { contains: trimmedKeyword } },
          { priceText: { contains: trimmedKeyword } },
          {
            category: {
              name: {
                contains: trimmedKeyword,
              },
            },
          },
        ],
      }
    : {};

  const products = await prisma.product.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    include: {
      category: true,
      images: {
        where: { isCover: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });

  return { products };
}

export async function getAdminCategoriesPageData(keyword = "") {
  const trimmedKeyword = keyword.trim();

  const where: Prisma.CategoryWhereInput = trimmedKeyword
    ? {
        OR: [
          { name: { contains: trimmedKeyword } },
          { slug: { contains: trimmedKeyword } },
          { description: { contains: trimmedKeyword } },
        ],
      }
    : {};

  const categories = await prisma.category.findMany({
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
  });

  return { categories };
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