/**
 * 文件作用：
 * 前台询单清单客户端组件。
 * 从 localStorage 读取已加入询单的产品，并支持修改数量、删除、清空。
 */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FrontendLocale, getFrontendPath } from "@/lib/frontend-i18n";

type InquiryCartItem = {
  productId: number;
  productName: string;
  productSlug: string;
  priceText: string;
  quantity: number;
};

const STORAGE_KEY = "b2b_inquiry_cart";

type FrontendInquiryCartProps = {
  locale: FrontendLocale;
};

export function FrontendInquiryCart({ locale }: FrontendInquiryCartProps) {
  const isEn = locale === "en";
  const [items, setItems] = useState<InquiryCartItem[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);

      try {
        setItems(rawValue ? JSON.parse(rawValue) : []);
      } catch {
        setItems([]);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function saveItems(nextItems: InquiryCartItem[]) {
    setItems(nextItems);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  }

  function updateQuantity(productId: number, quantity: number) {
    const nextItems = items.map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    );

    saveItems(nextItems);
  }

  function removeItem(productId: number) {
    saveItems(items.filter((item) => item.productId !== productId));
  }

  function clearCart() {
    saveItems([]);
  }

  if (items.length === 0) {
    return (
      <div className="empty-state-card">
        <h2>{isEn ? "Your inquiry list is empty" : "询单清单为空"}</h2>
        <p>
          {isEn
            ? "You can add products to the inquiry list from product detail pages."
            : "你可以在产品详情页将感兴趣的产品加入询单清单。"}
        </p>

        <Link href={getFrontendPath(locale, "/products")} className="primary-button">
          {isEn ? "Browse Products" : "浏览产品"}
        </Link>
      </div>
    );
  }

  return (
    <div className="detail-card">
      <div className="section-heading-row">
        <div>
          <h2>{isEn ? "Inquiry List" : "询单清单"}</h2>
          <p>
            {isEn
              ? "Confirm the products and quantities before submitting your inquiry."
              : "请确认需要询价的产品和数量，然后继续提交询单。"}
          </p>
        </div>

        <button type="button" className="ghost-button" onClick={clearCart}>
          {isEn ? "Clear" : "清空"}
        </button>
      </div>

      <div className="admin-list">
        {items.map((item) => (
          <div key={item.productId} className="admin-list-item">
            <div>
              <h3>
                <Link
                  href={getFrontendPath(locale, `/product/${item.productSlug}`)}
                  className="text-link"
                >
                  {item.productName}
                </Link>
              </h3>

              <p className="muted-text">{item.priceText}</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                type="button"
                className="ghost-button"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              >
                -
              </button>

              <strong>{item.quantity}</strong>

              <button
                type="button"
                className="ghost-button"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              >
                +
              </button>

              <button
                type="button"
                className="ghost-button"
                onClick={() => removeItem(item.productId)}
              >
                {isEn ? "Remove" : "删除"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="page-actions">
        <Link href={getFrontendPath(locale, "/products")} className="ghost-button">
          {isEn ? "Continue Browsing" : "继续浏览"}
        </Link>

        <Link href={getFrontendPath(locale, "/inquiry")} className="primary-button">
          {isEn ? "Submit Inquiry" : "提交询单"}
        </Link>
      </div>
    </div>
  );
}