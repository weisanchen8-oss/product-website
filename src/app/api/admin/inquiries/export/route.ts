import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status") ?? "all";
  const q = (searchParams.get("q") ?? "").trim();

  const where: Prisma.InquiryWhereInput = {};

  if (status !== "all") {
    where.status = status;
  }

  if (q) {
    where.OR = [
      { inquiryNo: { contains: q } },
      { contactName: { contains: q } },
      { companyName: { contains: q } },
      { phone: { contains: q } },
      { email: { contains: q } },
      {
        items: {
          some: {
            productNameSnapshot: { contains: q },
          },
        },
      },
    ];
  }

  const inquiries = await prisma.inquiry.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    include: { items: true },
  });

  const rows = inquiries.map((inq) => ({
    询单编号: inq.inquiryNo,
    联系人: inq.contactName,
    公司名称: inq.companyName,
    电话: inq.phone,
    邮箱: inq.email,
    产品列表: inq.items
      .map((item) => `${item.productNameSnapshot} x${item.quantity}`)
      .join("；"),
    状态: inq.status,
    提交时间: inq.createdAt.toLocaleString("zh-CN"),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "询单");

  const buffer = XLSX.write(wb, {
    type: "buffer",
    bookType: "xlsx",
  });

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=inquiries.xlsx",
    },
  });
}