/**
 * 文件作用：
 * 后台询单导出 Excel 接口。
 * 支持：
 * - 与询单列表页一致的状态筛选
 * - 重点询单筛选
 * - 兼容 contacting / communicating 两种“沟通中”旧状态
 * - 关键词搜索
 * - 导出中文状态
 * - 导出重点客户标记
 */

import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

function getStatusText(status: string) {
  switch (status) {
    case "pending":
      return "待处理";
    case "contacting":
    case "communicating":
      return "沟通中";
    case "completed":
      return "已完成";
    case "closed":
      return "已关闭";
    default:
      return status || "未知状态";
  }
}

function buildInquiryWhere(status: string, keyword: string) {
  const where: Prisma.InquiryWhereInput = {};

  if (status === "important") {
    where.user = {
      isImportant: true,
    };
  } else if (status !== "all") {
    if (status === "contacting") {
      where.status = {
        in: ["contacting", "communicating"],
      };
    } else {
      where.status = status;
    }
  }

  if (keyword) {
    where.OR = [
      { inquiryNo: { contains: keyword } },
      { contactName: { contains: keyword } },
      { companyName: { contains: keyword } },
      { phone: { contains: keyword } },
      { email: { contains: keyword } },
      {
        items: {
          some: {
            productNameSnapshot: {
              contains: keyword,
            },
          },
        },
      },
      {
        items: {
          some: {
            product: {
              keywords: {
                contains: keyword,
              },
            },
          },
        },
      },
    ];
  }

  return where;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const status = searchParams.get("status") || "all";
  const keyword = (searchParams.get("q") || "").trim();

  const inquiries = await prisma.inquiry.findMany({
    where: buildInquiryWhere(status, keyword),
    orderBy: [{ createdAt: "desc" }],
    include: {
      user: true,
      items: true,
    },
  });

  const rows = inquiries.map((inquiry) => ({
    询单编号: inquiry.inquiryNo,
    是否重点客户: inquiry.user.isImportant ? "是" : "否",
    联系人: inquiry.contactName,
    公司名称: inquiry.companyName,
    电话: inquiry.phone,
    邮箱: inquiry.email,
    所在地区: inquiry.region || "",
    客户备注: inquiry.remark || "",
    内部备注: inquiry.adminNote || "",
    产品数量: inquiry.items.length,
    产品列表: inquiry.items
      .map((item) => `${item.productNameSnapshot} × ${item.quantity}`)
      .join("；"),
    状态: getStatusText(inquiry.status),
    提交时间: inquiry.createdAt.toLocaleString("zh-CN"),
    更新时间: inquiry.updatedAt.toLocaleString("zh-CN"),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  worksheet["!cols"] = [
    { wch: 22 },
    { wch: 14 },
    { wch: 14 },
    { wch: 24 },
    { wch: 18 },
    { wch: 28 },
    { wch: 18 },
    { wch: 30 },
    { wch: 30 },
    { wch: 10 },
    { wch: 50 },
    { wch: 12 },
    { wch: 22 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "询单列表");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  const fileName = encodeURIComponent("询单列表.xlsx");

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${fileName}`,
    },
  });
}