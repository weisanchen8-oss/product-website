/**
 * 文件作用：
 * 询单清单客户端组件。
 * 当前版本从 localStorage 读取产品清单，支持修改数量、删除产品和跳转提交询单。
 * 为避免服务端和客户端渲染不一致，首次渲染先显示加载态，再在客户端读取 localStorage。
 */

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type InquiryCartItem = {
  productId: number;
  productName: string;
  productSlug: string;
  priceText: string;
  quantity: number;
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

export function InquiryCartClient() {
  const [items, setItems] = useState<InquiryCartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setItems(readCartFromStorage());
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function saveItems(nextItems: InquiryCartItem[]) {
    setItems(nextItems);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  }

  function updateQuantity(productId: number, quantity: number) {
    const safeQuantity = Math.max(1, quantity || 1);

    saveItems(
      items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: safeQuantity }
          : item
      )
    );
  }

  function removeItem(productId: number) {
    saveItems(items.filter((item) => item.productId !== productId));
  }

  function clearCart() {
    const confirmed = window.confirm("确认要清空询单清单吗？此操作无法撤销。");

    if (!confirmed) {
      return;
    }

    saveItems([]);
  }

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  if (!mounted) {
    return (
      <div className="cart-empty-card">
        <h2>正在读取询单清单...</h2>
        <p>请稍候。</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-empty-card">
        <h2>询单清单为空</h2>
        <p>请先浏览产品，并将感兴趣的产品加入询单清单。</p>
        <Link href="/products" className="primary-button inline-button-link">
          去浏览产品
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <div className="cart-items-card">
        <h2>已选产品</h2>

        <div className="cart-item-list">
          {items.map((item) => (
            <div key={item.productId} className="cart-item">
              <div className="cart-item-image">产品图</div>

              <div className="cart-item-main">
                <h3>
                  <Link href={`/product/${item.productSlug}`} className="text-link">
                    {item.productName}
                  </Link>
                </h3>
                <p>价格：{item.priceText}</p>
              </div>

              <div className="cart-item-side">
                <label className="cart-quantity-field">
                  <span>数量</span>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) =>
                      updateQuantity(item.productId, Number(event.target.value))
                    }
                  />
                </label>

                <button
                  type="button"
                  className="danger-button"
                  onClick={() => removeItem(item.productId)}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="cart-summary-card">
        <h2>清单汇总</h2>
        <p>产品种类：{items.length}</p>
        <p>总数量：{totalQuantity}</p>
        <p>预估总价：以工作人员沟通确认为准</p>

        <div className="cart-summary-actions">
          <Link href="/products" className="ghost-button inline-button-link">
            继续浏览产品
          </Link>

          <Link href="/inquiry/submit" className="primary-button inline-button-link">
            去提交询单
          </Link>

          <button type="button" className="ghost-button" onClick={clearCart}>
            清空清单
          </button>
        </div>
      </aside>
    </div>
  );
}