/**
 * 文件作用：
 * 编辑促销活动表单组件。
 * 这是客户端组件，负责表单输入、提交和跳转。
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PromotionEditFormProps = {
  promotion: {
    id: number;
    title: string;
    description: string;
    discountType: string;
    discountValue: number;
    startAt: string;
    endAt: string;
    isActive: boolean;
  };
};

export function PromotionEditForm({ promotion }: PromotionEditFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    title: promotion.title,
    description: promotion.description,
    discountType: promotion.discountType,
    discountValue: String(promotion.discountValue),
    startAt: promotion.startAt,
    endAt: promotion.endAt,
    isActive: promotion.isActive,
  });

  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/promotions", {
      method: "PATCH",
      body: JSON.stringify({
        action: "update",
        promotionId: promotion.id,
        ...form,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("更新失败，请检查表单内容后重试。");
      return;
    }

    router.push(`/admin/promotions/${promotion.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="promotion-form">
      <div className="promotion-form-grid">
        <label className="promotion-form-field">
          <span>促销名称</span>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </label>

        <label className="promotion-form-field">
          <span>折扣类型</span>
          <select
            name="discountType"
            value={form.discountType}
            onChange={handleChange}
          >
            <option value="percent">百分比折扣</option>
            <option value="fixed">固定优惠金额</option>
          </select>
        </label>

        <label className="promotion-form-field">
          <span>折扣值</span>
          <input
            name="discountValue"
            type="number"
            min="0"
            step="0.01"
            value={form.discountValue}
            onChange={handleChange}
            required
          />
        </label>

        <label className="promotion-form-field">
          <span>开始日期</span>
          <input
            name="startAt"
            type="date"
            value={form.startAt}
            onChange={handleChange}
            required
          />
        </label>

        <label className="promotion-form-field">
          <span>结束日期</span>
          <input
            name="endAt"
            type="date"
            value={form.endAt}
            onChange={handleChange}
            required
          />
        </label>

        <label className="promotion-form-field promotion-form-checkbox">
          <input
            name="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={handleChange}
          />
          <span>启用该促销活动</span>
        </label>

        <label className="promotion-form-field promotion-form-full">
          <span>促销说明</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
          />
        </label>
      </div>

      <div className="promotion-form-actions">
        <Link href={`/admin/promotions/${promotion.id}`} className="admin-reset-link">
          取消返回
        </Link>

        <button type="submit" className="admin-search-button" disabled={loading}>
          {loading ? "保存中..." : "保存修改"}
        </button>
      </div>
    </form>
  );
}