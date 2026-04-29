/**
 * 文件作用：
 * 定义后台行业风险监控列表页。
 * 当前页面用于展示汇率、国际运费、关税政策、市场风险等监控指标，
 * 并根据当前值、预警阈值和高风险阈值实时计算正常 / 预警 / 高风险状态。
 * 同时支持编辑、启用/停用和删除入口。
 */

import Link from "next/link";
import { MarketMonitorIndicator } from "@prisma/client";
import { AdminLayout } from "@/components/admin/admin-layout";
import { prisma } from "@/lib/prisma";
import {
  deleteMarketMonitorIndicator,
  toggleMarketMonitorIndicator,
  updateAllCurrencyRatesFromApi,
} from "./actions";

function getRiskStatus(indicator: MarketMonitorIndicator) {
  const { currentValue, warningThreshold, dangerThreshold, compareMode } =
    indicator;

  if (compareMode === "lte") {
    if (currentValue <= dangerThreshold) {
      return {
        label: "高风险",
        className: "bg-red-500 text-white",
      };
    }

    if (currentValue <= warningThreshold) {
      return {
        label: "预警",
        className: "bg-amber-500 text-white",
      };
    }

    return {
      label: "正常",
      className: "bg-emerald-500 text-white",
    };
  }

  if (currentValue >= dangerThreshold) {
    return {
      label: "高风险",
      className: "bg-red-500 text-white",
    };
  }

  if (currentValue >= warningThreshold) {
    return {
      label: "预警",
      className: "bg-amber-500 text-white",
    };
  }

  return {
    label: "正常",
    className: "bg-emerald-500 text-white",
  };
}

function getTypeLabel(type: string) {
  const typeMap: Record<string, string> = {
    exchange_rate: "汇率",
    shipping: "国际运费",
    tariff_policy: "关税政策",
    market_risk: "市场风险",
    other: "其他",
  };

  return typeMap[type] || "其他";
}

export default async function AdminMarketMonitorPage() {
  const indicators: MarketMonitorIndicator[] =
    await prisma.marketMonitorIndicator.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

  const activeCount = indicators.filter((item) => item.isActive).length;
  const inactiveCount = indicators.filter((item) => !item.isActive).length;

  const warningOrDangerCount = indicators.filter((item) => {
    if (!item.isActive) return false;
    const status = getRiskStatus(item);
    return status.label === "预警" || status.label === "高风险";
  }).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              后台管理 / 行业风险监控
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              行业风险监控
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              手动维护汇率、国际运费、关税政策和市场风险指标，超过阈值后提醒管理员重新核对售价、运费和报价策略。汇率数据支持手动点击更新，作为每日参考数据使用，不代表秒级实时行情。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <form action={updateAllCurrencyRatesFromApi}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
              >
                更新汇率数据（每日参考）
              </button>
            </form>

            <Link
              href="/admin/market-monitor/new"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              新增监控指标
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">监控指标总数</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {indicators.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">启用中指标</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">停用指标</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {inactiveCount}
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
            <p className="text-sm text-red-600">需关注风险</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {warningOrDangerCount}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              监控指标列表
            </h2>
          </div>

          {indicators.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-slate-500">
                暂无行业风险监控指标，请点击右上角新增。
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">指标名称</th>
                    <th className="px-6 py-3 font-medium">类型</th>
                    <th className="px-6 py-3 font-medium">当前值</th>
                    <th className="px-6 py-3 font-medium">预警阈值</th>
                    <th className="px-6 py-3 font-medium">高风险阈值</th>
                    <th className="px-6 py-3 font-medium">实时状态</th>
                    <th className="px-6 py-3 font-medium">启用状态</th>
                    <th className="px-6 py-3 font-medium">数据更新时间</th>
                    <th className="px-6 py-3 font-medium">操作</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {indicators.map((item) => {
                    const status = getRiskStatus(item);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">
                            {item.name}
                          </div>
                          {item.description ? (
                            <div className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                              {item.description}
                            </div>
                          ) : null}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {getTypeLabel(item.type)}
                        </td>

                        <td className="px-6 py-4 font-medium text-slate-900">
                          {item.currentValue}
                          {item.unit ? ` ${item.unit}` : ""}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {item.warningThreshold}
                          {item.unit ? ` ${item.unit}` : ""}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {item.dangerThreshold}
                          {item.unit ? ` ${item.unit}` : ""}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              item.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {item.isActive ? "启用" : "停用"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-500">
                          {item.updatedAt.toLocaleString("zh-CN")}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/admin/market-monitor/${item.id}/edit`}
                              className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-900 hover:text-white"
                            >
                              编辑
                            </Link>

                            <form action={toggleMarketMonitorIndicator.bind(null, item.id)}>
                              <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-600 hover:text-white"
                              >
                                {item.isActive ? "停用" : "启用"}
                              </button>
                            </form>

                            <form action={deleteMarketMonitorIndicator.bind(null, item.id)}>
                              <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-600 hover:text-white"
                              >
                                删除
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}