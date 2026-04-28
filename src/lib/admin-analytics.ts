/**
 * 文件作用：
 * 后台数据看板自动分析工具。
 * 负责统计产品、询单、客户数据，并生成经营状态、风险等级、询单趋势和结构化自动建议。
 */

import { prisma } from "@/lib/prisma";

type SuggestionLevel = "high" | "medium" | "low";

type AnalyticsSuggestion = {
  level: SuggestionLevel;
  title: string;
  action: string;
  href: string;
};

function percent(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

export async function getAdminAnalyticsData() {
  const now = new Date();

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = thisMonthStart;

  const [
    productCount,
    activeProductCount,
    featuredProductCount,
    hotProductCount,

    inquiryCount,
    pendingInquiryCount,
    contactingInquiryCount,
    completedInquiryCount,
    importantCustomerInquiryCount,
    thisMonthInquiryCount,
    lastMonthInquiryCount,

    topProducts,
    recentInquiries,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isFeatured: true } }),
    prisma.product.count({ where: { isManualHot: true } }),

    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: "pending" } }),
    prisma.inquiry.count({
      where: {
        status: {
          in: ["contacting", "communicating"],
        },
      },
    }),
    prisma.inquiry.count({ where: { status: "completed" } }),
    prisma.inquiry.count({
      where: {
        user: {
          isImportant: true,
        },
      },
    }),
    prisma.inquiry.count({
      where: {
        createdAt: {
          gte: thisMonthStart,
          lt: nextMonthStart,
        },
      },
    }),
    prisma.inquiry.count({
      where: {
        createdAt: {
          gte: lastMonthStart,
          lt: lastMonthEnd,
        },
      },
    }),

    prisma.product.findMany({
      orderBy: [{ salesCount: "desc" }, { createdAt: "desc" }],
      take: 5,
      include: {
        category: true,
      },
    }),

    prisma.inquiry.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
      include: {
        user: true,
        items: true,
      },
    }),
  ]);

  const activeProductRate = percent(activeProductCount, productCount);
  const completedInquiryRate = percent(completedInquiryCount, inquiryCount);
  const pendingInquiryRate = percent(pendingInquiryCount, inquiryCount);
  const importantInquiryRate = percent(importantCustomerInquiryCount, inquiryCount);

  let inquiryTrendRate = 0;
  let inquiryTrendType: "up" | "down" | "flat" = "flat";

  if (lastMonthInquiryCount > 0) {
    inquiryTrendRate = Math.round(
      ((thisMonthInquiryCount - lastMonthInquiryCount) / lastMonthInquiryCount) * 100
    );
  } else if (thisMonthInquiryCount > 0) {
    inquiryTrendRate = 100;
  }

  if (inquiryTrendRate > 5) {
    inquiryTrendType = "up";
  } else if (inquiryTrendRate < -5) {
    inquiryTrendType = "down";
  }

  const inquiryTrendText =
    inquiryTrendType === "up"
      ? `本月询单较上月增长 ${inquiryTrendRate}%，说明近期客户咨询活跃度提升。`
      : inquiryTrendType === "down"
        ? `本月询单较上月下降 ${Math.abs(inquiryTrendRate)}%，建议检查前台产品曝光、推荐产品和询单入口。`
        : "本月询单与上月基本持平，当前客户咨询趋势较稳定。";

  let riskLevel: "good" | "warning" | "danger" = "good";
  let overallStatusText = "经营状态良好";
  let overallSummary = "当前产品展示和询单跟进整体较稳定，可以继续优化推荐产品和客户转化。";

  if (inquiryCount === 0 || productCount === 0) {
    riskLevel = "warning";
    overallStatusText = "数据积累不足";
    overallSummary = "当前产品或询单数据较少，建议先完善产品库，并检查前台询单入口是否清晰。";
  } else if (pendingInquiryRate >= 50 || activeProductRate < 60) {
    riskLevel = "danger";
    overallStatusText = "需要重点处理";
    overallSummary = "当前待处理询单比例较高，或产品上架率偏低，建议管理员优先处理高影响事项。";
  } else if (pendingInquiryRate >= 30 || completedInquiryRate < 40) {
    riskLevel = "warning";
    overallStatusText = "需要关注";
    overallSummary = "当前询单转化和处理效率还有提升空间，建议优先推进待处理和沟通中询单。";
  }

  const highlightMetrics = [
    {
      label: "产品上架率",
      value: `${activeProductRate}%`,
      desc: activeProductRate >= 80 ? "产品展示基础较完整" : "建议检查未上架产品",
    },
    {
      label: "待处理询单占比",
      value: `${pendingInquiryRate}%`,
      desc: pendingInquiryRate >= 40 ? "待处理比例偏高" : "询单处理压力可控",
    },
    {
      label: "询单完成率",
      value: `${completedInquiryRate}%`,
      desc: completedInquiryRate >= 50 ? "转化表现较稳定" : "仍有转化提升空间",
    },
    {
      label: "重点客户询单占比",
      value: `${importantInquiryRate}%`,
      desc: importantInquiryRate >= 30 ? "重点客户活跃度较高" : "可继续沉淀重点客户",
    },
  ];

  const suggestions: AnalyticsSuggestion[] = [];

  if (productCount === 0) {
    suggestions.push({
      level: "high",
      title: "产品库为空，无法形成有效展示",
      action: "请先录入核心出口产品，并补充图片、分类、价格区间和产品描述。",
      href: "/admin/products",
    });
  } else if (activeProductRate < 70) {
    suggestions.push({
      level: "medium",
      title: `产品上架率为 ${activeProductRate}%，展示完整度不足`,
      action: "建议检查未上架产品，优先完善图片、描述、分类和基础参数。",
      href: "/admin/products",
    });
  } else {
    suggestions.push({
      level: "low",
      title: `产品上架率为 ${activeProductRate}%，展示基础较完整`,
      action: "可以继续优化推荐产品、热销产品和首页展示顺序，提高询单转化。",
      href: "/admin/products",
    });
  }

  suggestions.push({
    level: inquiryTrendType === "down" ? "medium" : "low",
    title: "询单趋势分析",
    action: inquiryTrendText,
    href: "/admin/inquiries",
  });

  if (inquiryCount === 0) {
    suggestions.push({
      level: "high",
      title: "当前暂无客户询单",
      action: "建议检查前台询单入口是否明显，并优化首页推荐产品和产品详情页转化按钮。",
      href: "/admin/inquiries",
    });
  } else {
    if (pendingInquiryRate >= 40) {
      suggestions.push({
        level: "high",
        title: `待处理询单占比为 ${pendingInquiryRate}%，处理压力偏高`,
        action: `建议优先处理 ${pendingInquiryCount} 条待处理询单，尤其关注重点客户提交的询单。`,
        href: "/admin/inquiries",
      });
    }

    if (completedInquiryRate >= 50) {
      suggestions.push({
        level: "low",
        title: `询单完成率为 ${completedInquiryRate}%，转化表现较稳定`,
        action: "建议进一步复盘已完成询单对应产品，沉淀高转化产品和客户类型。",
        href: "/admin/inquiries",
      });
    } else {
      suggestions.push({
        level: "medium",
        title: `询单完成率为 ${completedInquiryRate}%，仍有提升空间`,
        action: `建议重点推进 ${contactingInquiryCount} 条沟通中询单，缩短客户跟进周期。`,
        href: "/admin/inquiries",
      });
    }

    if (importantInquiryRate >= 30) {
      suggestions.push({
        level: "high",
        title: `重点客户询单占比为 ${importantInquiryRate}%，重点客户活跃`,
        action: "建议优先维护重点客户，补充跟进备注，并对高意向客户进行二次触达。",
        href: "/admin/customers",
      });
    }
  }

  if (featuredProductCount === 0) {
    suggestions.push({
      level: "medium",
      title: "当前没有设置推荐产品",
      action: "建议选择核心出口产品作为首页推荐，提高重点产品曝光和询单转化。",
      href: "/admin/products",
    });
  }

  if (hotProductCount === 0) {
    suggestions.push({
      level: "medium",
      title: "当前没有设置手动热销产品",
      action: "建议结合销售数量和业务经验设置热销标识，帮助客户快速识别重点产品。",
      href: "/admin/products",
    });
  }

  return {
    overall: {
      riskLevel,
      overallStatusText,
      overallSummary,
      highlightMetrics,
    },
    inquiryTrend: {
      thisMonthInquiryCount,
      lastMonthInquiryCount,
      inquiryTrendRate,
      inquiryTrendType,
      inquiryTrendText,
    },
    summary: {
      productCount,
      activeProductCount,
      activeProductRate,
      featuredProductCount,
      hotProductCount,
      inquiryCount,
      pendingInquiryCount,
      contactingInquiryCount,
      completedInquiryCount,
      completedInquiryRate,
      importantCustomerInquiryCount,
      importantInquiryRate,
    },
    topProducts,
    recentInquiries,
    suggestions,
  };
}