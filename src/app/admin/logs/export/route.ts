/**
 * 文件作用：
 * 后台操作日志导出 Excel 接口。
 * 支持：
 * - 按模块导出
 * - 按关键词导出
 * - 导出中文模块名称
 */

import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

function getModuleText(moduleName: string) {
  switch (moduleName) {
    case "product":
      return "产品";
    case "category":
      return "分类";
    case "inquiry":
      return "询单";
    case "customer":
      return "客户";
    case "system":
      return "系统";
    default:
      return moduleName || "未知";
  }
}

function buildLogWhere(moduleFilter: string, keyword: string) {
  const where: Prisma.AdminLogWhereInput = {};

  if (moduleFilter !== "all") {
    where.module = moduleFilter;
  }

  if (keyword) {
    where.OR = [
      { action: { contains: keyword } },
      { targetName: { contains: keyword } },
      { operatorName: { contains: keyword } },
      { note: { contains: keyword } },
    ];
  }

  return where;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const moduleFilter = searchParams.get("module") || "all";
  const keyword = (searchParams.get("q") || "").trim();

  const logs = await prisma.adminLog.findMany({
    where: buildLogWhere(moduleFilter, keyword),
    orderBy: [{ createdAt: "desc" }],
  });

  const rows = logs.map((log) => ({
    模块: getModuleText(log.module),
    操作类型: log.action,
    目标ID: log.targetId || "",
    目标对象: log.targetName || "",
    操作说明: log.note || "",
    操作人: log.operatorName || "管理员",
    操作时间: log.createdAt.toLocaleString("zh-CN"),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  worksheet["!cols"] = [
    { wch: 12 },
    { wch: 20 },
    { wch: 10 },
    { wch: 24 },
    { wch: 60 },
    { wch: 14 },
    { wch: 24 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "操作日志");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  const fileName = encodeURIComponent("后台操作日志.xlsx");

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${fileName}`,
    },
  });
}