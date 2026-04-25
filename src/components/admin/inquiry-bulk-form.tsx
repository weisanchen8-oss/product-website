"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { bulkUpdateInquiryStatusAction } from "@/app/admin/inquiries/actions";

type InquiryBulkItem = {
  id: number;
  inquiryNo: string;
  contactName: string;
  companyName: string;
  itemCount: number;
  status: string;
  statusText: string;
  statusClassName: string;
  createdAtText: string;
  isImportant: boolean;
};

type InquiryBulkFormProps = {
  inquiries: InquiryBulkItem[];
  redirectTo: string;
};

export function InquiryBulkForm({
  inquiries,
  redirectTo,
}: InquiryBulkFormProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const allVisibleIds = useMemo(
    () => inquiries.map((item) => item.id),
    [inquiries]
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
    <form action={bulkUpdateInquiryStatusAction}>
      <input type="hidden" name="redirectTo" value={redirectTo} />

      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="inquiryIds" value={id} />
      ))}

      <div className="admin-bulk-toolbar">
        <div>
          <strong>批量管理</strong>
          <span>已选择 {selectedIds.length} 条询单</span>
        </div>

        <div className="admin-bulk-actions">
          <select name="status" defaultValue="contacting">
            <option value="pending">改为待处理</option>
            <option value="contacting">改为沟通中</option>
            <option value="completed">改为已完成</option>
            <option value="closed">改为已关闭</option>
          </select>

          <button
            type="submit"
            className="primary-button admin-bulk-submit"
            disabled={selectedIds.length === 0}
          >
            批量更新
          </button>
        </div>
      </div>

      {inquiries.length > 0 ? (
        <div className="admin-inquiry-table-wrapper">
          <table className="admin-inquiry-table admin-inquiry-table-compact">
            <colgroup>
              <col style={{ width: "4%" }} />
              <col style={{ width: "23%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "17%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>

            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleAll}
                    aria-label="全选询单"
                  />
                </th>
                <th>询单编号</th>
                <th>联系人</th>
                <th>公司</th>
                <th>产品数量</th>
                <th>状态</th>
                <th>提交时间</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              {inquiries.map((item) => (
                <tr
                  key={item.id}
                  className={item.isImportant ? "important-inquiry-row" : ""}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleOne(item.id)}
                      aria-label={`选择询单 ${item.inquiryNo}`}
                    />
                  </td>

                  <td>
                    <strong className="inquiry-no-cell">
                      {item.isImportant ? (
                        <span className="important-star" title="重点客户">
                          ⭐
                        </span>
                      ) : null}
                      {item.inquiryNo}
                    </strong>
                  </td>

                  <td>{item.contactName}</td>
                  <td>{item.companyName}</td>
                  <td>{item.itemCount}</td>

                  <td>
                    <span className={item.statusClassName}>
                      {item.statusText}
                    </span>
                  </td>

                  <td className="admin-time-cell">{item.createdAtText}</td>

                  <td>
                    <Link
                      href={`/admin/inquiries/${item.id}`}
                      className="admin-table-action"
                    >
                      查看详情
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-empty-state">
          <h3>暂无符合条件的询单</h3>
          <p>可以尝试清空搜索条件，或切换其他状态筛选。</p>
          <Link href="/admin/inquiries" className="admin-reset-link">
            查看全部询单
          </Link>
        </div>
      )}
    </form>
  );
}