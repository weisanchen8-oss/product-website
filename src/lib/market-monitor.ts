/**
 * 文件作用：
 * 封装行业风险监控模块的数据读取和风险状态判断逻辑。
 * 供后台行业风险监控列表页、数据看板风险提醒等模块复用。
 */

import { MarketMonitorIndicator } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function getMarketRiskStatus(indicator: MarketMonitorIndicator) {
  const { currentValue, warningThreshold, dangerThreshold, compareMode } =
    indicator;

  if (compareMode === "lte") {
    if (currentValue <= dangerThreshold) {
      return {
        level: "danger",
        label: "高风险",
        className: "bg-red-500 text-white",
      };
    }

    if (currentValue <= warningThreshold) {
      return {
        level: "warning",
        label: "预警",
        className: "bg-amber-500 text-white",
      };
    }

    return {
      level: "normal",
      label: "正常",
      className: "bg-emerald-500 text-white",
    };
  }

  if (currentValue >= dangerThreshold) {
    return {
      level: "danger",
      label: "高风险",
      className: "bg-red-500 text-white",
    };
  }

  if (currentValue >= warningThreshold) {
    return {
      level: "warning",
      label: "预警",
      className: "bg-amber-500 text-white",
    };
  }

  return {
    level: "normal",
    label: "正常",
    className: "bg-emerald-500 text-white",
  };
}

export async function getActiveMarketRiskIndicators() {
  const indicators = await prisma.marketMonitorIndicator.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return indicators.map((indicator) => ({
    ...indicator,
    riskStatus: getMarketRiskStatus(indicator),
  }));
}

export async function getMarketRiskAlerts() {
  const indicators = await getActiveMarketRiskIndicators();

  const riskItems = indicators
    .filter(
      (item) =>
        item.riskStatus.level === "warning" ||
        item.riskStatus.level === "danger"
    )
    .map((item) => {
      let suggestion = "";

      switch (item.type) {
        case "exchange_rate":
          suggestion =
            "汇率波动可能直接影响出口利润，建议立即核对产品报价、结算币种以及报价有效期，避免汇率风险侵蚀利润。";
          break;

        case "shipping":
          suggestion =
            "国际运费变化可能导致成本上升，建议核对运费承担方式（FOB / CIF）及报价结构，必要时调整价格策略。";
          break;

        case "tariff_policy":
          suggestion =
            "关税或政策变化可能影响产品竞争力，建议确认目标市场政策，并重新评估报价与利润空间。";
          break;

        case "market_risk":
          suggestion =
            "市场环境存在波动风险，建议关注客户需求变化，优化产品结构或调整销售策略。";
          break;

        default:
          suggestion =
            "当前指标存在风险波动，建议结合业务实际情况核对产品价格、成本及报价策略。";
      }

      return {
        ...item,
        suggestion,
      };
    });

  // 🔥 按风险等级排序（高风险优先）
  riskItems.sort((a, b) => {
    if (a.riskStatus.level === "danger" && b.riskStatus.level !== "danger")
      return -1;
    if (a.riskStatus.level !== "danger" && b.riskStatus.level === "danger")
      return 1;
    return 0;
  });

  return riskItems;
}