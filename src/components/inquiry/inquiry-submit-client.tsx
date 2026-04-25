/**
 * 文件作用：
 * 询单提交页客户端组件。
 * 当前版本从 localStorage 读取询单清单，自动填充登录用户信息，并把清单 JSON 传给服务端提交动作。
 */

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { submitInquiryAction } from "@/app/inquiry/actions";

type InquiryCartItem = {
  productId: number;
  productName: string;
  productSlug: string;
  priceText: string;
  quantity: number;
};

type InquirySubmitClientProps = {
  errorMessage?: string;
  defaultContact?: {
    name: string;
    companyName: string;
    phone: string;
    email: string;
  };
};

const STORAGE_KEY = "b2b_inquiry_cart";

function readCartFromStorage(): InquiryCartItem[] {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : [];
  } catch {
    return [];
  }
}

export function InquirySubmitClient({
  errorMessage,
  defaultContact,
}: InquirySubmitClientProps) {
  const [items, setItems] = useState<InquiryCartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const [contactName, setContactName] = useState(defaultContact?.name ?? "");
  const [companyName, setCompanyName] = useState(defaultContact?.companyName ?? "");
  const [phone, setPhone] = useState(defaultContact?.phone ?? "");
  const [email, setEmail] = useState(defaultContact?.email ?? "");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setItems(readCartFromStorage());
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  if (!mounted) {
    return <div className="submit-error-card">正在读取询单清单，请稍候。</div>;
  }

  if (items.length === 0) {
    return (
      <div className="cart-empty-card">
        <h2>暂无可提交产品</h2>
        <p>请先将产品加入询单清单，再提交正式询单。</p>
        <Link href="/products" className="primary-button inline-button-link">
          去浏览产品
        </Link>
      </div>
    );
  }

  return (
    <>
      {errorMessage ? <div className="submit-error-card">{errorMessage}</div> : null}

      <div className="submit-layout">
        <div className="form-card">
          <h2>联系信息</h2>

          <form
            action={async (formData) => {
              window.localStorage.removeItem(STORAGE_KEY);
              await submitInquiryAction(formData);
            }}
            className="stack-form"
          >
            <input type="hidden" name="cartItems" value={JSON.stringify(items)} />

            <label className="form-field">
              <span>联系人姓名 *</span>
              <input
                type="text"
                name="contactName"
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                placeholder="请输入联系人姓名"
              />
            </label>

            <label className="form-field">
              <span>公司名称 *</span>
              <input
                type="text"
                name="companyName"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="请输入公司名称"
              />
            </label>

            <label className="form-field">
              <span>联系电话 *</span>
              <input
                type="text"
                name="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="请输入联系电话"
              />
            </label>

            <label className="form-field">
              <span>电子邮箱 *</span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="请输入电子邮箱"
              />
            </label>

            <label className="form-field">
              <span>所在地区</span>
              <input type="text" name="region" placeholder="请输入所在地区" />
            </label>

            <label className="form-field">
              <span>备注说明</span>
              <input type="text" name="remark" placeholder="请输入补充说明" />
            </label>

            <button type="submit" className="primary-button form-submit">
              确认提交
            </button>
          </form>
        </div>

        <aside className="submit-summary-card">
          <h2>产品确认</h2>

          <div className="submit-item-list">
            {items.map((item) => (
              <div key={item.productId} className="submit-item">
                <div>
                  <strong>{item.productName}</strong>
                  <p>数量：{item.quantity}</p>
                </div>
                <span>{item.priceText}</span>
              </div>
            ))}
          </div>

          <div className="submit-note-box">
            <p>产品种类：{items.length}</p>
            <p>总数量：{totalQuantity}</p>
            <p>提交后将由工作人员跟进。</p>
            <p>后续沟通不在站内完成，最终信息以双方联系确认为准。</p>
          </div>

          <div className="cart-summary-actions">
            <Link href="/inquiry/cart" className="ghost-button inline-button-link">
              返回询单清单
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}