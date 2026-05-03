/**
 * 文件作用：
 * 前台询单清单客户端组件。
 * 从 localStorage 读取已加入询单的产品，并支持修改数量、删除、清空。
 * 当前版本统一为商务深蓝风 UI。
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
      <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">
          {isEn ? "Your inquiry list is empty" : "询单清单为空"}
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
          {isEn
            ? "You can add products to the inquiry list from product detail pages."
            : "你可以在产品详情页将感兴趣的产品加入询单清单。"}
        </p>

        <Link
          href={getFrontendPath(locale, "/products")}
          className="mt-6 inline-flex h-11 items-center rounded-full bg-[#1E3A5F] px-6 text-sm font-bold text-white transition hover:bg-[#244B75]"
        >
          {isEn ? "Browse Products" : "浏览产品"}
        </Link>
      </div>
    );
  }

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#1E3A5F]">
            {isEn ? "Inquiry Cart" : "询单清单"}
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            {isEn ? "Selected Products" : "已选产品"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {isEn
              ? `${items.length} product(s), ${totalQuantity} item(s) in total.`
              : `共 ${items.length} 个产品，合计 ${totalQuantity} 件。`}
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          onClick={clearCart}
        >
          {isEn ? "Clear All" : "清空全部"}
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-[1fr_auto] md:items-center"
          >
            <div>
              <Link
                href={getFrontendPath(locale, `/product/${item.productSlug}`)}
                className="text-lg font-bold text-slate-950 hover:text-[#1E3A5F]"
              >
                {item.productName}
              </Link>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#1E3A5F] ring-1 ring-slate-200">
                  {item.priceText}
                </span>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                  {isEn ? "Inquiry Item" : "询单产品"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-slate-500">
                {isEn ? "Qty:" : "数量："}
              </span>

              <div className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600 transition hover:bg-[#EAF1F8] hover:text-[#1E3A5F]"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                >
                  -
                </button>

                <strong className="min-w-10 text-center text-sm text-slate-950">
                  {item.quantity}
                </strong>

                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600 transition hover:bg-[#EAF1F8] hover:text-[#1E3A5F]"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => removeItem(item.productId)}
              >
                {isEn ? "Remove" : "删除"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={getFrontendPath(locale, "/products")}
          className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-[#1E3A5F] transition hover:bg-[#EAF1F8]"
        >
          {isEn ? "Continue Browsing" : "继续浏览"}
        </Link>

        <Link
          href={getFrontendPath(locale, "/inquiry")}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#1E3A5F] px-7 text-sm font-bold text-white shadow-[0_10px_24px_rgba(30,58,95,0.18)] transition hover:bg-[#244B75]"
        >
          {isEn ? "Submit Inquiry" : "提交询单"}
        </Link>
      </div>
    </div>
  );
}