/**
 * 文件作用：
 * 定义后台首页经营看板。
 * 展示产品、询单、重点客户、最近询单和全系统后台操作日志。
 * 当前版本在保留原有功能和数据逻辑的基础上，
 * 将 UI 调整为更严肃、正式、企业级的后台管理风格。
 */

import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { getAdminDashboardData } from "@/lib/admin-data";

function getInquiryStatusText(status: string) {
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

function getStatusClassName(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "contacting":
    case "communicating":
      return "bg-sky-50 text-sky-700 ring-sky-200";
    case "completed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "closed":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

function getModuleText(module: string) {
  switch (module) {
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
      return "操作";
  }
}

function getModuleClassName(module: string) {
  switch (module) {
    case "product":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    case "category":
      return "bg-indigo-50 text-indigo-700 ring-indigo-200";
    case "inquiry":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "customer":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

function truncateText(text: string, maxLength = 42) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
}

function getAdminLogHref(log: {
  module: string;
  targetId: number | null;
}) {
  if (log.module === "product" && log.targetId) {
    return `/admin/products/${log.targetId}`;
  }

  if (log.module === "category" && log.targetId) {
    return `/admin/categories/${log.targetId}`;
  }

  if (log.module === "inquiry" && log.targetId) {
    return `/admin/inquiries/${log.targetId}`;
  }

  if (log.module === "customer") {
    return "/admin/inquiries?status=important";
  }

  return "/admin";
}

export default async function AdminHomePage() {
  const {
    productCount,
    activeProductCount,
    featuredProductCount,
    categoryCount,
    inquiryCount,
    pendingInquiryCount,
    contactingInquiryCount,
    completedInquiryCount,
    importantInquiryCount,
    recentInquiries,
    recentAdminLogs,
  } = await getAdminDashboardData();

  const statCards = [
    {
      title: "询单总数",
      value: inquiryCount,
      desc: "全部客户询单",
      href: "/admin/inquiries",
      featured: true,
    },
    {
      title: "待处理",
      value: pendingInquiryCount,
      desc: "需要尽快跟进",
      href: "/admin/inquiries?status=pending",
    },
    {
      title: "沟通中",
      value: contactingInquiryCount,
      desc: "正在推进的询单",
      href: "/admin/inquiries?status=contacting",
    },
    {
      title: "重点询单",
      value: importantInquiryCount,
      desc: "重点客户提交",
      href: "/admin/inquiries?status=important",
    },
    {
      title: "已完成",
      value: completedInquiryCount,
      desc: "已完成处理",
      href: "/admin/inquiries?status=completed",
    },
    {
      title: "产品总数",
      value: productCount,
      desc: "已录入产品",
      href: "/admin/products",
    },
    {
      title: "已上架产品",
      value: activeProductCount,
      desc: "前台可见产品",
      href: "/admin/products",
    },
    {
      title: "分类数量",
      value: categoryCount,
      desc: "产品分类结构",
      href: "/admin/categories",
    },
    {
      title: "推荐产品",
      value: featuredProductCount,
      desc: "首页推荐展示",
      href: "/admin/products",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A5F] via-[#244B75] to-[#2F5F8F] p-8 text-white shadow-[0_18px_50px_rgba(15,23,42,0.22)]">
          <div className="absolute right-[-100px] top-[-100px] h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-[-120px] left-[35%] h-72 w-72 rounded-full bg-slate-900/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-200">
                Admin Dashboard
              </p>

              <h1 className="mt-4 text-3xl font-bold tracking-tight">
                后台经营看板
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">
                统一查看产品、询单、客户跟进与后台操作动态，帮助管理员快速判断当前业务状态。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/inquiries"
                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#1E3A5F] shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                查看询单
              </Link>

              <Link
                href="/admin/products"
                className="inline-flex items-center justify-center rounded-lg border border-white/35 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                管理产品
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={
                card.featured
                  ? "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)] xl:col-span-2"
                  : "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)]"
              }
            >
              <div className="absolute right-[-48px] top-[-48px] h-32 w-32 rounded-full bg-slate-200 opacity-45 transition group-hover:bg-slate-300" />

              <div className="relative z-10">
                <span className="text-sm font-medium text-slate-500">
                  {card.title}
                </span>

                <strong className="mt-3 block text-4xl font-bold tracking-tight text-slate-950">
                  {card.value}
                </strong>

                <p className="mt-2 text-sm text-slate-500">{card.desc}</p>
              </div>
            </Link>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#1E3A5F]">
                  Recent Inquiries
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  最近询单
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  最新客户询单动态
                </p>
              </div>

              <Link
                href="/admin/inquiries"
                className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-[#1E3A5F] transition hover:bg-slate-200"
              >
                查看全部
              </Link>
            </div>

            <div className="space-y-3">
              {recentInquiries.length > 0 ? (
                recentInquiries.map((inquiry) => (
                  <Link
                    key={inquiry.id}
                    href={`/admin/inquiries/${inquiry.id}`}
                    className={
                      inquiry.user.isImportant
                        ? "block rounded-xl border border-amber-200 bg-amber-50/60 p-4 transition hover:-translate-y-0.5 hover:bg-amber-50"
                        : "block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-slate-100"
                    }
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <strong className="text-sm font-bold text-slate-950">
                          {inquiry.user.isImportant ? "⭐ " : ""}
                          {inquiry.inquiryNo}
                        </strong>

                        <p className="mt-1 text-sm text-slate-500">
                          {inquiry.contactName} · {inquiry.companyName}
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-2 sm:items-end">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusClassName(
                            inquiry.status
                          )}`}
                        >
                          {getInquiryStatusText(inquiry.status)}
                        </span>

                        <small className="text-xs text-slate-400">
                          {inquiry.createdAt.toLocaleString("zh-CN")}
                        </small>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                  暂无询单
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#1E3A5F]">
                Operation Logs
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-950">
                最近后台操作
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                产品、分类、询单和客户标记的操作记录
              </p>
            </div>

            <div className="space-y-3">
              {recentAdminLogs.length > 0 ? (
                recentAdminLogs.map((log) => (
                  <Link
                    key={log.id}
                    href={getAdminLogHref({
                      module: log.module,
                      targetId: log.targetId,
                    })}
                    className="block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-slate-100"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getModuleClassName(
                          log.module
                        )}`}
                      >
                        {getModuleText(log.module)}
                      </span>

                      <small className="text-xs text-slate-400">
                        {log.createdAt.toLocaleString("zh-CN")}
                      </small>
                    </div>

                    <strong className="block text-sm font-bold text-slate-950">
                      {truncateText(log.note || log.action || "后台操作")}
                    </strong>

                    <p className="mt-1 text-sm text-slate-500">
                      {log.operatorName || "管理员"}
                      {log.targetName ? ` · ${log.targetName}` : ""}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                  暂无后台操作记录
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}