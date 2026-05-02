/**
 * 文件作用：
 * 前台多语言询单提交表单。
 * 从 localStorage 读取询单清单，并随表单一起提交到服务端。
 */

"use client";

import { useEffect, useState } from "react";
import { submitInquiryAction } from "@/app/inquiry/actions";
import { FrontendLocale } from "@/lib/frontend-i18n";

type InquiryCartItem = {
  productId: number;
  productName: string;
  productSlug: string;
  priceText: string;
  quantity: number;
};

const STORAGE_KEY = "b2b_inquiry_cart";

export function FrontendInquiryForm({ locale }: { locale: FrontendLocale }) {
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

  return (
    <form action={submitInquiryAction} className="admin-form">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="cartItems" value={JSON.stringify(items)} />

      <div className="form-grid">
        <label>
          {isEn ? "Contact Name" : "联系人姓名"} *
          <input
            name="contactName"
            required
            placeholder={isEn ? "Your name" : "请输入联系人姓名"}
          />
        </label>

        <label>
          {isEn ? "Company Name" : "公司名称"} *
          <input
            name="companyName"
            required
            placeholder={isEn ? "Company name" : "请输入公司名称"}
          />
        </label>

        <label>
          {isEn ? "Phone" : "联系电话"} *
          <input
            name="phone"
            required
            placeholder={isEn ? "Phone number" : "请输入联系电话"}
          />
        </label>

        <label>
          {isEn ? "Email" : "邮箱"} *
          <input
            name="email"
            type="email"
            required
            placeholder={isEn ? "Email address" : "请输入邮箱"}
          />
        </label>

        <label>
          {isEn ? "Country / Region" : "国家 / 地区"}
          <input
            name="region"
            placeholder={isEn ? "Country or region" : "请输入国家或地区"}
          />
        </label>
      </div>

      <label>
        {isEn ? "Inquiry Message" : "询单备注"}
        <textarea
          name="remark"
          rows={5}
          placeholder={
            isEn
              ? "Please describe your purchase needs, quantity, shipping destination, or other requirements."
              : "请填写采购需求、数量、收货地区或其他补充说明。"
          }
        />
      </label>

      <div className="detail-card">
        <h3>{isEn ? "Selected Products" : "已选产品"}</h3>

        {items.length === 0 ? (
          <p className="muted-text">
            {isEn
              ? "No products selected yet. Please add products to the inquiry list first."
              : "当前还没有选择产品，请先将产品加入询单清单。"}
          </p>
        ) : (
          <div className="admin-list">
            {items.map((item) => (
              <div key={item.productId} className="admin-list-item">
                <div>
                  <strong>{item.productName}</strong>
                  <p className="muted-text">{item.priceText}</p>
                </div>
                <span>
                  {isEn ? "Qty: " : "数量："}
                  {item.quantity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="page-actions">
        <button type="submit" className="primary-button">
          {isEn ? "Submit Inquiry" : "提交询单"}
        </button>
      </div>
    </form>
  );
}