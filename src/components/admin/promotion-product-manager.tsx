/**
 * 文件作用：
 * 促销活动产品绑定管理组件。
 * 当前版本只展示已参与促销产品，并支持单个/批量移除。
 * 添加产品请前往产品管理页，通过搜索/筛选后批量加入促销活动。
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ProductItem = {
  id: number;
  name: string;
  categoryName: string;
  priceText: string;
  salesCount: number;
  isActive: boolean;
};

type PromotionProductManagerProps = {
  promotionId: number;
  linkedProductIds: number[];
  allProducts: ProductItem[];
};

export function PromotionProductManager({
  promotionId,
  linkedProductIds,
  allProducts,
}: PromotionProductManagerProps) {
  const router = useRouter();

  const [loadingProductId, setLoadingProductId] = useState<number | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [selectedLinkedIds, setSelectedLinkedIds] = useState<number[]>([]);

  const linkedProducts = useMemo(
    () => allProducts.filter((product) => linkedProductIds.includes(product.id)),
    [allProducts, linkedProductIds]
  );

  const linkedVisibleIds = linkedProducts.map((product) => product.id);

  const isAllLinkedSelected =
    linkedVisibleIds.length > 0 &&
    selectedLinkedIds.length === linkedVisibleIds.length;

  function toggleLinked(id: number) {
    setSelectedLinkedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleAllLinked() {
    setSelectedLinkedIds(isAllLinkedSelected ? [] : linkedVisibleIds);
  }

  async function handleRemove(productId: number) {
    if (!confirm("确定要从该促销中移除这个产品吗？")) {
      return;
    }

    setLoadingProductId(productId);

    const res = await fetch("/api/admin/promotions", {
      method: "DELETE",
      body: JSON.stringify({
        promotionId,
        productId,
      }),
    });

    setLoadingProductId(null);

    if (!res.ok) {
      alert("移除失败，请稍后重试。");
      return;
    }

    setSelectedLinkedIds([]);
    router.refresh();
  }

  async function handleBulkRemove() {
    if (selectedLinkedIds.length === 0) {
      alert("请先选择要移除的产品。");
      return;
    }

    if (!confirm(`确定要移除选中的 ${selectedLinkedIds.length} 个促销产品吗？`)) {
      return;
    }

    setBulkLoading(true);

    const res = await fetch("/api/admin/promotions", {
      method: "DELETE",
      body: JSON.stringify({
        promotionId,
        productIds: selectedLinkedIds,
      }),
    });

    setBulkLoading(false);

    if (!res.ok) {
      alert("批量移除失败，请稍后重试。");
      return;
    }

    setSelectedLinkedIds([]);
    router.refresh();
  }

  return (
    <section className="promotion-product-single-layout">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>已参与促销产品</h2>
            <p>共 {linkedProducts.length} 个产品。需要新增促销产品时，请前往产品管理页筛选后批量加入。</p>
          </div>

          <Link href="/admin/products" className="promotion-card-link">
            去产品管理添加
          </Link>
        </div>

        <div className="promotion-tip-box">
          <strong>操作提示</strong>
          <p>
            促销产品的添加入口已统一放在产品管理页。你可以先按分类、上架状态、推荐状态、热销状态或关键词筛选产品，再勾选多个产品批量加入当前促销活动。
          </p>
        </div>

        <div className="promotion-product-bulk-bar">
          <label>
            <input
              type="checkbox"
              checked={isAllLinkedSelected}
              onChange={toggleAllLinked}
            />
            全选已加入产品
          </label>

          <button
            type="button"
            className="promotion-remove-btn"
            disabled={bulkLoading || selectedLinkedIds.length === 0}
            onClick={handleBulkRemove}
          >
            批量移除 {selectedLinkedIds.length || ""}
          </button>
        </div>

        <div className="admin-list">
          {linkedProducts.length > 0 ? (
            linkedProducts.map((product) => (
              <div className="admin-list-item" key={product.id}>
                <label className="promotion-product-check">
                  <input
                    type="checkbox"
                    checked={selectedLinkedIds.includes(product.id)}
                    onChange={() => toggleLinked(product.id)}
                  />
                  <span>
                    <strong>{product.name}</strong>
                    <p>
                      {product.categoryName} · {product.priceText} ·{" "}
                      {product.salesCount} 销量
                    </p>
                  </span>
                </label>

                <button
                  type="button"
                  className="promotion-remove-btn"
                  disabled={loadingProductId === product.id}
                  onClick={() => handleRemove(product.id)}
                >
                  {loadingProductId === product.id ? "处理中..." : "移除"}
                </button>
              </div>
            ))
          ) : (
            <p className="admin-empty-text">
              当前促销活动暂无绑定产品，请点击“去产品管理添加”。
            </p>
          )}
        </div>
      </div>
    </section>
  );
}