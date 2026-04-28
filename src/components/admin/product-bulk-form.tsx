"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { bulkManageProductsAction } from "@/app/admin/products/actions";

type ProductBulkItem = {
  id: number;
  name: string;
  slug: string;
  shortDesc: string;
  categoryName: string;
  priceText: string;
  isActive: boolean;
  isFeatured: boolean;
  isManualHot: boolean;
  coverUrl: string | null;
  isPromoting: boolean;
  promotionTitle: string | null;
};

type ProductBulkFormProps = {
  products: ProductBulkItem[];
  promotions: PromotionOption[];
  redirectTo: string;
};

type PromotionOption = {
  id: number;
  title: string;
};

function getProductStatusText(isActive: boolean) {
  return isActive ? "上架" : "下架";
}

function getProductStatusClassName(isActive: boolean) {
  return isActive
    ? "admin-product-status admin-product-status-active"
    : "admin-product-status admin-product-status-inactive";
}

export function ProductBulkForm({
  products,
  promotions,
  redirectTo,
}: ProductBulkFormProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState("activate");

  const allVisibleIds = useMemo(
    () => products.map((product) => product.id),
    [products]
  );

  const isAllSelected =
    allVisibleIds.length > 0 && selectedIds.length === allVisibleIds.length;

  function toggleAll() {
    setSelectedIds(isAllSelected ? [] : allVisibleIds);
  }

  function toggleOne(id: number) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (selectedIds.length === 0) {
      event.preventDefault();
      return;
    }

    if (bulkAction === "delete") {
      const confirmed = window.confirm(
        `确定要删除选中的 ${selectedIds.length} 个产品吗？删除后不可恢复。历史询单中的产品快照仍会保留。`
      );

      if (!confirmed) {
        event.preventDefault();
      }
    }
  }

  return (
    <form action={bulkManageProductsAction} onSubmit={handleSubmit}>
      <input type="hidden" name="redirectTo" value={redirectTo} />

      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="productIds" value={id} />
      ))}

      <div className="admin-bulk-toolbar">
        <div>
          <strong>批量管理</strong>
          <span>已选择 {selectedIds.length} 个产品</span>
        </div>

        <div className="admin-bulk-actions">
          <select
            name="bulkAction"
            value={bulkAction}
            onChange={(event) => setBulkAction(event.target.value)}
          >
            <option value="activate">批量上架</option>
            <option value="deactivate">批量下架</option>
            <option value="add-promotion">加入促销活动</option>
            <option value="feature">设为推荐</option>
            <option value="unfeature">取消推荐</option>
            <option value="hot">设为热销</option>
            <option value="unhot">取消热销</option>
            <option value="delete">批量删除</option>
          </select>

          {bulkAction === "add-promotion" ? (
            <select name="promotionId" required>
              <option value="">选择促销活动</option>
              {promotions.map((promotion) => (
                <option value={promotion.id} key={promotion.id}>
                  {promotion.title}
                </option>
              ))}
            </select>
          ) : null}

          <button
            type="submit"
            className={
              bulkAction === "delete"
                ? "danger-button admin-bulk-submit"
                : "primary-button admin-bulk-submit"
            }
            disabled={selectedIds.length === 0}
          >
            执行操作
          </button>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="admin-product-table-wrapper">
          <table className="admin-product-table">
            <colgroup>
              <col style={{ width: "4%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "26%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>

            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleAll}
                    aria-label="全选产品"
                  />
                </th>
                <th>封面</th>
                <th>产品信息</th>
                <th>分类</th>
                <th>价格</th>
                <th>状态</th>
                <th>标签</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => toggleOne(product.id)}
                      aria-label={`选择产品 ${product.name}`}
                    />
                  </td>

                  <td>
                    <div className="admin-product-thumb">
                      {product.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.coverUrl} alt={product.name} />
                      ) : (
                        <span>无图</span>
                      )}
                    </div>
                  </td>

                  <td>
                    <strong>{product.name}</strong>
                    <p>{product.shortDesc}</p>
                  </td>

                  <td>{product.categoryName}</td>

                  <td>{product.priceText}</td>

                  <td>
                    <span className={getProductStatusClassName(product.isActive)}>
                      {getProductStatusText(product.isActive)}
                    </span>
                  </td>

                  <td>
                    <div className="admin-product-tags">
                      {product.isFeatured ? <span>推荐</span> : null}
                      {product.isManualHot ? <span>热销</span> : null}
                      {product.isPromoting ? (
                        <span className="admin-product-tag-promotion">
                          促销中{product.promotionTitle ? `：${product.promotionTitle}` : ""}
                        </span>
                      ) : null}

                      {!product.isFeatured && !product.isManualHot && !product.isPromoting ? (
                        <em>无</em>
                      ) : null}
                    </div>
                  </td>

                  <td>
                    <div className="admin-product-actions">
                      <Link href={`/product/${product.slug}`} target="_blank">
                        预览
                      </Link>
                      <Link href={`/admin/products/${product.id}`}>编辑</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-empty-state">
          <h3>未找到匹配产品</h3>
          <p>请尝试更换关键词，或点击“重置”查看全部产品。</p>
          <Link href="/admin/products" className="admin-reset-link">
            查看全部产品
          </Link>
        </div>
      )}
    </form>
  );
}