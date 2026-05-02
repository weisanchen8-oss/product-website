/**
 * 文件作用：
 * 编辑促销活动表单组件。
 * 这是客户端组件，负责表单输入、提交、加载状态和跳转。
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type PromotionEditFormProps = {
  promotion: {
    id: number;
    title: string;
    titleEn: string | null;
    description: string | null;
    descriptionEn: string | null;
    discountType: string;
    discountValue: number;
    startAt: string;
    endAt: string;
    isActive: boolean;
  };
};

export function PromotionEditForm({ promotion }: PromotionEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: promotion.title,
    titleEn: promotion.titleEn ?? "",
    description: promotion.description ?? "",
    descriptionEn: promotion.descriptionEn ?? "",
    discountType: promotion.discountType,
    discountValue: String(promotion.discountValue),
    startAt: promotion.startAt,
    endAt: promotion.endAt,
    isActive: promotion.isActive,
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/promotions", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
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
    <form className="promotion-form-grid" onSubmit={handleSubmit}>
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
        <span>英文促销名称（可选）</span>
        <input
          name="titleEn"
          value={form.titleEn}
          onChange={handleChange}
          placeholder="For example: Summer Sale"
        />
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

      <label className="promotion-form-field promotion-form-full">
        <span>英文促销说明（可选）</span>
        <textarea
          name="descriptionEn"
          value={form.descriptionEn}
          onChange={handleChange}
          rows={4}
          placeholder="Displayed on the English product detail page."
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
          <option value="fixed">固定金额优惠</option>
        </select>
      </label>

      <label className="promotion-form-field">
        <span>折扣值</span>
        <input
          name="discountValue"
          type="number"
          step="0.01"
          min="0"
          value={form.discountValue}
          onChange={handleChange}
          required
        />
      </label>

      <label className="promotion-form-field">
        <span>开始日期</span>
        <input
          type="date"
          name="startAt"
          value={form.startAt}
          onChange={handleChange}
          required
        />
      </label>

      <label className="promotion-form-field">
        <span>结束日期</span>
        <input
          type="date"
          name="endAt"
          value={form.endAt}
          onChange={handleChange}
          required
        />
      </label>

      <label className="promotion-form-checkbox promotion-form-full">
        <input
          type="checkbox"
          name="isActive"
          checked={form.isActive}
          onChange={handleChange}
        />
        <span>启用该促销活动</span>
      </label>

      <div className="promotion-form-actions promotion-form-full">
        <button
          type="button"
          className="ghost-button"
          onClick={() => router.push(`/admin/promotions/${promotion.id}`)}
          disabled={loading}
        >
          取消返回
        </button>

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "保存中..." : "保存修改"}
        </button>
      </div>
    </form>
  );
}