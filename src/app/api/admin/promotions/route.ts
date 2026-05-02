/**
 * 文件作用：
 * 后台促销活动 API。
 * 支持：
 * - 创建促销活动
 * - 停止促销活动
 * - 启用促销活动
 * - 删除促销活动
 * - 给促销绑定单个或多个产品
 * - 从促销移除单个或多个产品
 */

import { prisma } from "@/lib/prisma";

function normalizeProductIds(productId?: number, productIds?: number[]) {
  if (Array.isArray(productIds) && productIds.length > 0) {
    return productIds.map(Number).filter((id) => Number.isFinite(id));
  }

  if (productId) {
    return [Number(productId)];
  }

  return [];
}

export async function POST(req: Request) {
  const body = await req.json();

  const promotion = await prisma.promotion.create({
    data: {
      title: body.title,
      titleEn: String(body.titleEn || "").trim() || null,
      description: body.description,
      descriptionEn: String(body.descriptionEn || "").trim() || null,
      discountType: body.discountType,
      discountValue: Number(body.discountValue),
      startAt: new Date(body.startAt),
      endAt: new Date(body.endAt),
    },
  });

  return Response.json(promotion);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { action, promotionId, productId, productIds } = body;

  if (!promotionId) {
    return Response.json({ error: "参数缺失" }, { status: 400 });
  }

  if (action === "stop") {
    const promotion = await prisma.promotion.update({
      where: { id: Number(promotionId) },
      data: { isActive: false },
    });

    return Response.json(promotion);
  }

  if (action === "update") {
    const promotion = await prisma.promotion.update({
      where: { id: Number(promotionId) },
      data: {
        title: String(body.title || "").trim(),
        titleEn: String(body.titleEn || "").trim() || null,
        description: String(body.description || "").trim(),
        descriptionEn: String(body.descriptionEn || "").trim() || null,
        discountType: body.discountType,
        discountValue: Number(body.discountValue),
        startAt: new Date(body.startAt),
        endAt: new Date(body.endAt),
        isActive: Boolean(body.isActive),
      },
    });

    return Response.json(promotion);
  }

  if (action === "enable") {
    const promotion = await prisma.promotion.update({
      where: { id: Number(promotionId) },
      data: { isActive: true },
    });

    return Response.json(promotion);
  }

  const normalizedProductIds = normalizeProductIds(productId, productIds);

  if (normalizedProductIds.length > 0) {
    await prisma.promotionProduct.createMany({
      data: normalizedProductIds.map((id) => ({
        promotionId: Number(promotionId),
        productId: id,
      })),
    });

    return Response.json({
      success: true,
      count: normalizedProductIds.length,
    });
  }

  return Response.json({ error: "无效操作" }, { status: 400 });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { promotionId, productId, productIds } = body;

  if (!promotionId) {
    return Response.json({ error: "参数缺失" }, { status: 400 });
  }

  const normalizedProductIds = normalizeProductIds(productId, productIds);

  if (normalizedProductIds.length > 0) {
    await prisma.promotionProduct.deleteMany({
      where: {
        promotionId: Number(promotionId),
        productId: {
          in: normalizedProductIds,
        },
      },
    });

    return Response.json({
      success: true,
      count: normalizedProductIds.length,
    });
  }

  await prisma.promotion.delete({
    where: {
      id: Number(promotionId),
    },
  });

  return Response.json({ success: true });
}