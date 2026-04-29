/**
 * 文件作用：
 * 定义后台新增行业风险监控指标页面。
 * 管理员可以手动录入指标名称、类型、当前值、阈值、单位、风险说明和启用状态。
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { createMarketMonitorIndicator } from "../actions";

export default function NewMarketMonitorIndicatorPage() {
  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            后台管理 / 行业风险监控 / 新增指标
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            新增监控指标
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            用于手动维护汇率、国际运费、关税政策或市场风险指标。
          </p>
        </div>

        <form
          action={createMarketMonitorIndicator}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              指标名称
            </label>
            <input
              name="name"
              required
              placeholder="例如：美元兑人民币汇率"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              指标类型
            </label>
            <select
              name="type"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-900"
            >
              <option value="exchange_rate">汇率</option>
              <option value="shipping">国际运费</option>
              <option value="tariff_policy">关税政策</option>
              <option value="market_risk">市场风险</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                当前值
              </label>
              <input
                name="currentValue"
                type="number"
                step="0.01"
                required
                placeholder="例如：7.25"
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                预警阈值
              </label>
              <input
                name="warningThreshold"
                type="number"
                step="0.01"
                required
                placeholder="例如：7.30"
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                高风险阈值
              </label>
              <input
                name="dangerThreshold"
                type="number"
                step="0.01"
                required
                placeholder="例如：7.40"
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              阈值触发方向
            </label>
            <select
              name="compareMode"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-900"
            >
              <option value="gte">当前值大于等于阈值时触发风险</option>
              <option value="lte">当前值小于等于阈值时触发风险</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              单位
            </label>
            <input
              name="unit"
              placeholder="例如：%、USD、CNY、指数点"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              风险说明
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="例如：汇率持续上升时，建议重新核对出口报价和利润空间。"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input name="isActive" type="checkbox" defaultChecked />
            启用该指标
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Link
              href="/admin/market-monitor"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              取消
            </Link>

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              保存指标
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}