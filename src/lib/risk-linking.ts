/**
 * 文件作用：
 * 实现“风险 → 业务联动”逻辑。
 * 当前版本：根据汇率风险，生成需要检查价格的产品列表。
 */

import { prisma } from "@/lib/prisma";
import { getMarketRiskAlerts } from "@/lib/market-monitor";

export async function getExchangeRateAffectedProducts() {
  const alerts = await getMarketRiskAlerts();

  // 找到“汇率风险”
  const exchangeRisk = alerts.find(
    (item) => item.type === "exchange_rate"
  );

  if (!exchangeRisk) {
    return [];
  }

  // 只在预警 / 高风险时触发
  if (
    exchangeRisk.riskStatus.level !== "warning" &&
    exchangeRisk.riskStatus.level !== "danger"
  ) {
    return [];
  }

  // 获取所有上架产品
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    take: 5,
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      name: true,
      priceText: true,
    },
  });

  return products.map((product) => ({
    ...product,
    reason: "当前汇率波动可能影响利润，建议核对该产品报价是否需要调整。",
  }));
}