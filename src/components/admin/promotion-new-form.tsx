/**
 * 文件作用：
 * 新增促销活动表单组件。
 * 这是客户端组件，负责表单输入、提交和跳转。
 * 当前版本优化了表单排版，解决字段挤压、按钮错位和中英文说明错乱问题。
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function PromotionNewForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    titleEn: "",
    description: "",
    descriptionEn: "",
    discountType: "percent",
    discountValue: "",
    startAt: "",
    endAt: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

  const inputClassName =
    "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1E3A5F] focus:ring-4 focus:ring-slate-200";

  const textareaClassName =
    "mt-2 min-h-32 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1E3A5F] focus:ring-4 focus:ring-slate-200";

  const labelClassName = "block text-sm font-semibold text-slate-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-950">基础信息</h2>
          <p className="mt-2 text-sm text-slate-500">
            设置促销名称和活动说明，便于后台管理和前台展示。
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClassName}>
            促销名称
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="例如：春季出口产品促销"
              required
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            英文促销名称（可选）
            <input
              name="titleEn"
              value={form.titleEn}
              onChange={handleChange}
              placeholder="For example: Summer Sale"
              className={inputClassName}
            />
          </label>

          <label className={`${labelClassName} md:col-span-2`}>
            促销说明
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="填写促销适用场景、目标客户或活动说明"
              rows={4}
              className={textareaClassName}
            />
          </label>

          <label className={`${labelClassName} md:col-span-2`}>
            英文促销说明（可选）
            <textarea
              name="descriptionEn"
              value={form.descriptionEn}
              onChange={handleChange}
              placeholder="Displayed on the English product detail page."
              rows={4}
              className={textareaClassName}
            />
          </label>
        </div>
      </section>

      <section className="border-t border-slate-100 pt-8">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-950">折扣与时间</h2>
          <p className="mt-2 text-sm text-slate-500">
            设置折扣方式、折扣值和活动有效时间。
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <label className={labelClassName}>
            折扣类型
            <select
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              className={inputClassName}
            >
              <option value="percent">百分比折扣</option>
              <option value="fixed">固定优惠金额</option>
            </select>
          </label>

          <label className={labelClassName}>
            折扣值
            <input
              name="discountValue"
              type="number"
              min="0"
              step="0.01"
              value={form.discountValue}
              onChange={handleChange}
              placeholder="例如：20"
              required
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            开始日期
            <input
              name="startAt"
              type="date"
              value={form.startAt}
              onChange={handleChange}
              required
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            结束日期
            <input
              name="endAt"
              type="date"
              value={form.endAt}
              onChange={handleChange}
              required
              className={inputClassName}
            />
          </label>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-8 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href="/admin/promotions"
          className="inline-flex h-12 items-center justify-center rounded-xl px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          取消返回
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-[#111827] px-7 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1E3A5F] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "创建中..." : "创建促销"}
        </button>
      </div>
    </form>
  );
}