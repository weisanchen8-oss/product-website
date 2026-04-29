/**
 * 文件作用：
 * 定义后台行业风险监控指标编辑页面。
 * 管理员可以修改指标名称、类型、当前值、阈值、单位、说明和启用状态。
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { prisma } from "@/lib/prisma";
import { updateMarketMonitorIndicator } from "../../actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditMarketMonitorIndicatorPage({
  params,
}: PageProps) {
  const { id } = await params;

  const indicator = await prisma.marketMonitorIndicator.findUnique({
    where: {
      id,
    },
  });

  if (!indicator) {
    notFound();
  }

  const updateAction = updateMarketMonitorIndicator.bind(null, indicator.id);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            后台管理 / 行业风险监控 / 编辑指标
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            编辑监控指标
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            修改汇率、国际运费、关税政策或市场风险指标的监控数据。
          </p>
        </div>

        <form
          action={updateAction}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              指标名称
            </label>
            <input
              name="name"
              required
              defaultValue={indicator.name}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              指标类型
            </label>
            <select
              name="type"
              defaultValue={indicator.type}
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
                defaultValue={indicator.currentValue}
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
                defaultValue={indicator.warningThreshold}
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
                defaultValue={indicator.dangerThreshold}
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
              defaultValue={indicator.compareMode}
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
              defaultValue={indicator.unit ?? ""}
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
              defaultValue={indicator.description ?? ""}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked={indicator.isActive}
            />
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
              保存修改
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}