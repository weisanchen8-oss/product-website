/**
 * 文件作用：
 * 产品详情页“加入询单清单”组件。
 * 支持：
 * - 选择数量
 * - 加入 localStorage 询单清单
 * - 根据 locale 显示中文 / 英文按钮与提示
 */

"use client";

import { useState } from "react";
import type { FrontendLocale } from "@/lib/frontend-i18n";

type AddToInquiryButtonProps = {
  productId: number;
  productName: string;
  productSlug: string;
  priceText: string;
  locale?: FrontendLocale;
};

type InquiryCartItem = {
  productId: number;
  productName: string;
  productSlug: string;
  priceText: string;
  quantity: number;
};

const STORAGE_KEY = "b2b_inquiry_cart";

export function AddToInquiryButton({
  productId,
  productName,
  productSlug,
  priceText,
  locale = "zh",
}: AddToInquiryButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  const isEn = locale === "en";

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => current + 1);
  }

  function handleAddToCart() {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    const currentItems: InquiryCartItem[] = rawValue ? JSON.parse(rawValue) : [];

    const existingItem = currentItems.find(
      (item) => item.productId === productId
    );

    const nextItems = existingItem
      ? currentItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      : [
          ...currentItems,
          {
            productId,
            productName,
            productSlug,
            priceText,
            quantity,
          },
        ];

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));

    setMessage(
      isEn
        ? "Added to inquiry cart. You can view it from the top-right Inquiry Cart."
        : "已加入询单清单，可在右上角“询单清单”中查看。"
    );

    window.setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  return (
    <div className="add-inquiry-box">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-900">
            {isEn ? "Quantity:" : "数量："}
          </span>

          <div className="quantity-box">
            <button type="button" onClick={decreaseQuantity}>
              -
            </button>

            <span>{quantity}</span>
  
            <button type="button" onClick={increaseQuantity}>
              +
            </button>
          </div>
        </div>

        <button type="button" className="primary-button" onClick={handleAddToCart}>
          {isEn ? "Add to Inquiry Cart" : "加入询单清单"}
        </button>
      </div>

      {message ? <p className="add-inquiry-message">{message}</p> : null}
    </div>
  );
}