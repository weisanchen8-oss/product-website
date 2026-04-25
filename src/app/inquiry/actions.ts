/**
 * 文件作用：
 * 定义前台询单提交相关的服务端写入动作。
 * 当前版本要求用户登录后才能提交询单，并将询单绑定到当前登录用户。
 */

"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

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
    redirect("/inquiry/submit?error=missing-required");
  }

  if (cartItems.length === 0) {
    redirect("/inquiry/submit?error=empty-cart");
  }

  const productIds = cartItems.map((item) => item.productId);

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
      isActive: true,
    },
  });

  const productMap = new Map(products.map((product) => [product.id, product]));

  const validItems = cartItems.filter((item) => productMap.has(item.productId));

  if (validItems.length === 0) {
    redirect("/inquiry/submit?error=no-valid-products");
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

  redirect(`/inquiry/success/${inquiry.inquiryNo}`);
}