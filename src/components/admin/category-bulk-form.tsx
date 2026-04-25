"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import {
  bulkUpdateCategoryStatusAction,
  deleteCategoryAction,
} from "@/app/admin/categories/actions";

type CategoryBulkItem = {
  id: number;
  name: string;
  slug: string;
  description: string;
  parentName: string;
  sortOrder: number;
  productCount: number;
  childCount: number;
  isActive: boolean;
};

type CategoryBulkFormProps = {
  categories: CategoryBulkItem[];
  redirectTo: string;
};

function getCategoryStatusText(isActive: boolean) {
  return isActive ? "启用" : "停用";
}

function getCategoryStatusClassName(isActive: boolean) {
  return isActive
    ? "admin-category-status admin-category-status-active"
    : "admin-category-status admin-category-status-inactive";
}

export function CategoryBulkForm({
  categories,
  redirectTo,
}: CategoryBulkFormProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const allVisibleIds = useMemo(
    () => categories.map((category) => category.id),
    [categories]
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

  return (
    <>
      <form action={bulkUpdateCategoryStatusAction}>
        <input type="hidden" name="redirectTo" value={redirectTo} />

        {selectedIds.map((id) => (
          <input key={id} type="hidden" name="categoryIds" value={id} />
        ))}

        <div className="admin-bulk-toolbar">
          <div>
            <strong>批量管理</strong>
            <span>已选择 {selectedIds.length} 个分类</span>
          </div>

          <div className="admin-bulk-actions">
            <select name="bulkAction" defaultValue="activate">
              <option value="activate">批量启用</option>
              <option value="deactivate">批量停用</option>
            </select>

            <button
              type="submit"
              className="primary-button admin-bulk-submit"
              disabled={selectedIds.length === 0}
            >
              执行操作
            </button>
          </div>
        </div>
      </form>

      {categories.length > 0 ? (
        <div className="admin-category-table-wrapper">
          <table className="admin-category-table admin-category-table-compact">
            <colgroup>
              <col style={{ width: "4%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "13%" }} />
            </colgroup>

            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleAll}
                    aria-label="全选分类"
                  />
                </th>
                <th>分类名称</th>
                <th>分类说明</th>
                <th>父级分类</th>
                <th>排序</th>
                <th>产品数量</th>
                <th>子分类数</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(category.id)}
                      onChange={() => toggleOne(category.id)}
                      aria-label={`选择分类 ${category.name}`}
                    />
                  </td>

                  <td>
                    <strong>{category.name}</strong>
                    <p>{category.slug}</p>
                  </td>

                  <td>{category.description}</td>

                  <td>{category.parentName}</td>

                  <td>{category.sortOrder}</td>

                  <td>{category.productCount}</td>

                  <td>{category.childCount}</td>

                  <td>
                    <span
                      className={getCategoryStatusClassName(
                        category.isActive
                      )}
                    >
                      {getCategoryStatusText(category.isActive)}
                    </span>
                  </td>

                  <td>
                    <div className="admin-category-actions admin-category-row-actions">
                      <Link href={`/admin/categories/${category.id}`}>
                        编辑
                      </Link>

                      <form action={deleteCategoryAction}>
                        <input type="hidden" name="id" value={category.id} />

                        <ConfirmSubmitButton
                          className="admin-category-delete-button"
                          message={`确定要删除分类“${category.name}”吗？删除前系统会检查该分类下是否存在产品或子分类。`}
                        >
                          删除
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-empty-state">
          <h3>未找到匹配分类</h3>
          <p>请尝试更换关键词，或点击“重置”查看全部分类。</p>
          <Link href="/admin/categories" className="admin-reset-link">
            查看全部分类
          </Link>
        </div>
      )}
    </>
  );
}