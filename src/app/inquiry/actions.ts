/**
 * 文件作用：
 * 定义前台询单提交相关的服务端写入动作。
 * 当前版本支持多语言前台路径：
 * - /zh/inquiry
 * - /en/inquiry
 */

"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isFrontendLocale } from "@/lib/frontend-i18n";

type SubmittedCartItem = {
  productId: number;
  productName: string;
  productSlug: string;
  priceText: string;
  quantity: number;
};

function createInquiryNo() {
  return `INQ-${Date.now()}`;
}

function parseCartItems(value: FormDataEntryValue | null): SubmittedCartItem[] {
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value) as SubmittedCartItem[];

    return parsed
      .map((item) => ({
        productId: Number(item.productId),
        productName: String(item.productName ?? "").trim(),
        productSlug: String(item.productSlug ?? "").trim(),
        priceText: String(item.priceText ?? "").trim(),
        quantity: Math.max(1, Number(item.quantity) || 1),
      }))
      .filter((item) => item.productId && item.productName);
  } catch {
    return [];
  }
}

export async function submitInquiryAction(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? "zh");
  const locale = isFrontendLocale(localeValue) ? localeValue : "zh";

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?error=login-required");
  }

  const contactName = String(formData.get("contactName") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const remark = String(formData.get("remark") ?? "").trim();
  const cartItems = parseCartItems(formData.get("cartItems"));

  if (!contactName || !companyName || !phone || !email) {
    redirect(`/${locale}/inquiry?error=missing-required`);
  }

  if (cartItems.length === 0) {
    redirect(`/${locale}/inquiry?error=empty-cart`);
  }

  const productIds = cartItems.map((item) => item.productId);

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true,
    },
  });

  const productMap = new Map(products.map((product) => [product.id, product]));

  const validItems = cartItems.filter((item) => productMap.has(item.productId));

  if (validItems.length === 0) {
    redirect(`/${locale}/inquiry?error=no-valid-products`);
  }

  const inquiryNo = createInquiryNo();

  const inquiry = await prisma.inquiry.create({
    data: {
      inquiryNo,
      userId: currentUser.id,
      contactName,
      companyName,
      phone,
      email,
      region,
      remark,
      estimatedTotalText: "以工作人员沟通确认为准",
      status: "pending",
      items: {
        create: validItems.map((item) => {
          const product = productMap.get(item.productId)!;

          return {
            productId: product.id,
            productNameSnapshot: product.name,
            priceSnapshot: product.priceText,
            quantity: item.quantity,
            subtotalSnapshot: product.priceText,
          };
        }),
      },
      logs: {
        create: {
          status: "pending",
          note: "客户提交询单。",
          operatorName: "系统",
        },
      },
    },
  });

  redirect(`/${locale}/inquiry/success/${inquiry.inquiryNo}`);
}