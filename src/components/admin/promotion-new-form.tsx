/**
 * 文件作用：
 * 新增促销活动表单组件。
 * 这是客户端组件，负责表单输入、提交和跳转。
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function PromotionNewForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    discountType: "percent",
    discountValue: "",
    startAt: "",
    endAt: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/promotions", {
      method: "POST",
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin/promotions");
      router.refresh();
    } else {
      alert("创建失败，请检查表单内容后重试。");
    }
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
            placeholder="例如：春季出口产品促销"
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
            placeholder="例如：20"
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

        <label className="promotion-form-field promotion-form-full">
          <span>促销说明</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="填写促销适用场景、目标客户或活动说明"
            rows={4}
          />
        </label>
      </div>

      <div className="promotion-form-actions">
        <Link href="/admin/promotions" className="admin-reset-link">
          取消返回
        </Link>

        <button type="submit" className="admin-search-button" disabled={loading}>
          {loading ? "创建中..." : "创建促销"}
        </button>
      </div>
    </form>
  );
}