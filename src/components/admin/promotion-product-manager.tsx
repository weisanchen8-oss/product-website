/**
 * 文件作用：
 * 促销活动产品绑定管理组件。
 * 这是客户端组件，负责单个/批量绑定和移除促销产品。
 */

"use client";

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
  const [selectedUnlinkedIds, setSelectedUnlinkedIds] = useState<number[]>([]);

  const linkedProducts = useMemo(
    () => allProducts.filter((product) => linkedProductIds.includes(product.id)),
    [allProducts, linkedProductIds]
  );

  const unlinkedProducts = useMemo(
    () => allProducts.filter((product) => !linkedProductIds.includes(product.id)),
    [allProducts, linkedProductIds]
  );

  const linkedVisibleIds = linkedProducts.map((product) => product.id);
  const unlinkedVisibleIds = unlinkedProducts.map((product) => product.id);

  const isAllLinkedSelected =
    linkedVisibleIds.length > 0 &&
    selectedLinkedIds.length === linkedVisibleIds.length;

  const isAllUnlinkedSelected =
    unlinkedVisibleIds.length > 0 &&
    selectedUnlinkedIds.length === unlinkedVisibleIds.length;

  function toggleLinked(id: number) {
    setSelectedLinkedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleUnlinked(id: number) {
    setSelectedUnlinkedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleAllLinked() {
    setSelectedLinkedIds(isAllLinkedSelected ? [] : linkedVisibleIds);
  }

  function toggleAllUnlinked() {
    setSelectedUnlinkedIds(isAllUnlinkedSelected ? [] : unlinkedVisibleIds);
  }

  async function handleBind(productId: number) {
    setLoadingProductId(productId);

    const res = await fetch("/api/admin/promotions", {
      method: "PATCH",
      body: JSON.stringify({
        promotionId,
        productId,
      }),
    });

    setLoadingProductId(null);

    if (!res.ok) {
      alert("绑定失败，可能该产品已在当前促销中。");
      return;
    }

    setSelectedUnlinkedIds([]);
    router.refresh();
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

  async function handleBulkBind() {
    if (selectedUnlinkedIds.length === 0) {
      alert("请先选择要加入促销的产品。");
      return;
    }

    setBulkLoading(true);

    const res = await fetch("/api/admin/promotions", {
      method: "PATCH",
      body: JSON.stringify({
        promotionId,
        productIds: selectedUnlinkedIds,
      }),
    });

    setBulkLoading(false);

    if (!res.ok) {
      alert("批量加入失败，请稍后重试。");
      return;
    }

    setSelectedUnlinkedIds([]);
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
    <section className="promotion-product-layout">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>已参与促销产品</h2>
            <p>共 {linkedProducts.length} 个产品</p>
          </div>
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
                      {product.categoryName} · {product.priceText}
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
            <p className="admin-empty-text">暂无绑定产品。</p>
          )}
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>可加入促销产品</h2>
            <p>从产品库中选择产品加入当前促销。</p>
          </div>
        </div>

        <div className="promotion-product-bulk-bar">
          <label>
            <input
              type="checkbox"
              checked={isAllUnlinkedSelected}
              onChange={toggleAllUnlinked}
            />
            全选可加入产品
          </label>

          <button
            type="button"
            className="promotion-bind-btn"
            disabled={bulkLoading || selectedUnlinkedIds.length === 0}
            onClick={handleBulkBind}
          >
            批量加入 {selectedUnlinkedIds.length || ""}
          </button>
        </div>

        <div className="admin-list">
          {unlinkedProducts.length > 0 ? (
            unlinkedProducts.map((product) => (
              <div className="admin-list-item" key={product.id}>
                <label className="promotion-product-check">
                  <input
                    type="checkbox"
                    checked={selectedUnlinkedIds.includes(product.id)}
                    onChange={() => toggleUnlinked(product.id)}
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
                  className="promotion-bind-btn"
                  disabled={loadingProductId === product.id}
                  onClick={() => handleBind(product.id)}
                >
                  {loadingProductId === product.id ? "处理中..." : "加入促销"}
                </button>
              </div>
            ))
          ) : (
            <p className="admin-empty-text">所有产品均已加入当前促销。</p>
          )}
        </div>
      </div>
    </section>
  );
}