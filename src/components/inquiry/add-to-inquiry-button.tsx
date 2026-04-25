/**
 * 文件作用：
 * 产品详情页“加入询单清单”组件。
 * 当前版本支持选择数量并加入 localStorage 询单清单，加入后停留在当前页面并显示提示。
 */

"use client";

import { useState } from "react";

type AddToInquiryButtonProps = {
  productId: number;
  productName: string;
  productSlug: string;
  priceText: string;
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
}: AddToInquiryButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => current + 1);
  }

  function handleAddToCart() {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    const currentItems: InquiryCartItem[] = rawValue ? JSON.parse(rawValue) : [];

    const existingItem = currentItems.find((item) => item.productId === productId);

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
    setMessage("已加入询单清单，可在右上角“询单清单”中查看。");

    window.setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  return (
    <div className="add-inquiry-box">
      <div className="product-quantity-row">
        <span>数量：</span>
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
        加入询单清单
      </button>

      {message ? <p className="add-inquiry-message">{message}</p> : null}
    </div>
  );
}