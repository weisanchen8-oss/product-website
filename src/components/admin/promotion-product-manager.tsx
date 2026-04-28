/**
 * 文件作用：
 * 促销活动产品绑定管理组件。
 * 这是客户端组件，负责单个/批量绑定和移除促销产品。
 * 支持：
 * - 已参与促销产品分页，每页 10 个
 * - 可加入促销产品分页，每页 10 个
 * - 当前页批量选择
 * - 单个加入 / 移除
 * - 批量加入 / 移除
 */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

const PAGE_SIZE = 10;

function PaginationButtons({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="admin-pagination">
      <button
        type="button"
        className="admin-pagination-link"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        上一页
      </button>

      <span className="admin-pagination-info">
        第 {currentPage} / {totalPages} 页
      </span>

      <button
        type="button"
        className="admin-pagination-link"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        下一页
      </button>
    </div>
  );
}

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

  const [linkedPage, setLinkedPage] = useState(1);
  const [unlinkedPage, setUnlinkedPage] = useState(1);

  const linkedProducts = useMemo(
    () => allProducts.filter((product) => linkedProductIds.includes(product.id)),
    [allProducts, linkedProductIds]
  );

  const unlinkedProducts = useMemo(
    () => allProducts.filter((product) => !linkedProductIds.includes(product.id)),
    [allProducts, linkedProductIds]
  );

  const linkedTotalPages = Math.max(
    1,
    Math.ceil(linkedProducts.length / PAGE_SIZE)
  );

  const unlinkedTotalPages = Math.max(
    1,
    Math.ceil(unlinkedProducts.length / PAGE_SIZE)
  );

  const safeLinkedPage = Math.min(linkedPage, linkedTotalPages);
  const safeUnlinkedPage = Math.min(unlinkedPage, unlinkedTotalPages);

  const pagedLinkedProducts = linkedProducts.slice(
    (safeLinkedPage - 1) * PAGE_SIZE,
    safeLinkedPage * PAGE_SIZE
  );

  const pagedUnlinkedProducts = unlinkedProducts.slice(
    (safeUnlinkedPage - 1) * PAGE_SIZE,
    safeUnlinkedPage * PAGE_SIZE
  );

  const linkedVisibleIds = pagedLinkedProducts.map((product) => product.id);
  const unlinkedVisibleIds = pagedUnlinkedProducts.map((product) => product.id);

  const isAllLinkedSelected =
    linkedVisibleIds.length > 0 &&
    linkedVisibleIds.every((id) => selectedLinkedIds.includes(id));

  const isAllUnlinkedSelected =
    unlinkedVisibleIds.length > 0 &&
    unlinkedVisibleIds.every((id) => selectedUnlinkedIds.includes(id));

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
    if (isAllLinkedSelected) {
      setSelectedLinkedIds((current) =>
        current.filter((id) => !linkedVisibleIds.includes(id))
      );
      return;
    }

    setSelectedLinkedIds((current) =>
      Array.from(new Set([...current, ...linkedVisibleIds]))
    );
  }

  function toggleAllUnlinked() {
    if (isAllUnlinkedSelected) {
      setSelectedUnlinkedIds((current) =>
        current.filter((id) => !unlinkedVisibleIds.includes(id))
      );
      return;
    }

    setSelectedUnlinkedIds((current) =>
      Array.from(new Set([...current, ...unlinkedVisibleIds]))
    );
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
            <p>
              共 {linkedProducts.length} 个产品，每页显示 {PAGE_SIZE} 个
            </p>
          </div>
        </div>

        <div className="promotion-product-bulk-bar">
          <label>
            <input
              type="checkbox"
              checked={isAllLinkedSelected}
              onChange={toggleAllLinked}
            />
            全选本页已加入产品
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
          {pagedLinkedProducts.length > 0 ? (
            pagedLinkedProducts.map((product) => (
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

        <PaginationButtons
          currentPage={safeLinkedPage}
          totalPages={linkedTotalPages}
          onPageChange={setLinkedPage}
        />
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>可加入促销产品</h2>
            <p>
              从产品库中选择产品加入当前促销，共 {unlinkedProducts.length} 个可加入产品。
            </p>
          </div>
        </div>

        <div className="promotion-product-bulk-bar">
          <label>
            <input
              type="checkbox"
              checked={isAllUnlinkedSelected}
              onChange={toggleAllUnlinked}
            />
            全选本页可加入产品
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
          {pagedUnlinkedProducts.length > 0 ? (
            pagedUnlinkedProducts.map((product) => (
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

        <PaginationButtons
          currentPage={safeUnlinkedPage}
          totalPages={unlinkedTotalPages}
          onPageChange={setUnlinkedPage}
        />
      </div>
    </section>
  );
}