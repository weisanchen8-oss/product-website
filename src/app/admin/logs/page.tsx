/**
 * 文件作用：
 * 定义后台操作日志页面。
 * 支持按模块筛选、关键词搜索、分页查看、导出当前筛选结果，并查看变更详情。
 */

import Link from "next/link";
import { Prisma } from "@prisma/client";
import { AdminLayout } from "@/components/admin/admin-layout";
import { prisma } from "@/lib/prisma";

type AdminLogsPageProps = {
  searchParams: Promise<{
    module?: string;
    q?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 20;

const MODULE_OPTIONS = [
  { value: "all", label: "全部" },
  { value: "product", label: "产品" },
  { value: "category", label: "分类" },
  { value: "inquiry", label: "询单" },
  { value: "customer", label: "客户" },
  { value: "system", label: "系统" },
];

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

function getModuleClassName(moduleName: string) {
  switch (moduleName) {
    case "product":
      return "admin-log-module admin-log-product";
    case "category":
      return "admin-log-module admin-log-category";
    case "inquiry":
      return "admin-log-module admin-log-inquiry";
    case "customer":
      return "admin-log-module admin-log-customer";
    case "system":
      return "admin-log-module admin-log-system";
    default:
      return "admin-log-module";
  }
}

function getAdminLogHref(log: { module: string; targetId: number | null }) {
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

function buildLogWhere(moduleFilter: string, keyword: string) {
  const whereClause: Prisma.AdminLogWhereInput = {};

  if (moduleFilter !== "all") {
    whereClause.module = moduleFilter;
  }

  if (keyword) {
    whereClause.OR = [
      { action: { contains: keyword } },
      { targetName: { contains: keyword } },
      { operatorName: { contains: keyword } },
      { note: { contains: keyword } },
    ];
  }

  return whereClause;
}

function buildHref(params: {
  moduleFilter: string;
  keyword: string;
  page?: number;
  includePage?: boolean;
}) {
  const searchParams = new URLSearchParams();

  if (params.moduleFilter !== "all") {
    searchParams.set("module", params.moduleFilter);
  }

  if (params.keyword) {
    searchParams.set("q", params.keyword);
  }

  if (params.includePage && params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const query = searchParams.toString();

  return `/admin/logs${query ? `?${query}` : ""}`;
}

export default async function AdminLogsPage({
  searchParams,
}: AdminLogsPageProps) {
  const {
    module: moduleFilter = "all",
    q = "",
    page = "1",
  } = await searchParams;

  const keyword = q.trim();
  const currentPage = Math.max(1, Number(page) || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const whereClause = buildLogWhere(moduleFilter, keyword);

  const [logs, totalCount] = await Promise.all([
    prisma.adminLog.findMany({
      where: whereClause,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: PAGE_SIZE,
    }),
    prisma.adminLog.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const exportParams = new URLSearchParams();

  if (moduleFilter !== "all") {
    exportParams.set("module", moduleFilter);
  }

  if (keyword) {
    exportParams.set("q", keyword);
  }

  const exportHref = `/admin/logs/export${
    exportParams.toString() ? `?${exportParams.toString()}` : ""
  }`;

  return (
    <AdminLayout>
      <div className="admin-log-header">
        <div>
          <h1>操作日志</h1>
          <p>查看产品、分类、询单和客户标记相关的后台操作记录。</p>
        </div>

        <Link href={exportHref} className="admin-export-button">
          导出 Excel
        </Link>
      </div>

      <section className="admin-log-toolbar">
        <form className="admin-log-search-form">
          <input
            name="q"
            type="search"
            defaultValue={keyword}
            placeholder="搜索操作内容、目标名称或操作人"
          />

          <input type="hidden" name="module" value={moduleFilter} />

          <button type="submit" className="admin-search-button">
            搜索
          </button>

          <Link href="/admin/logs" className="admin-reset-link">
            重置
          </Link>
        </form>

        <div className="admin-log-filter-row">
          {MODULE_OPTIONS.map((option) => {
            const href =
              option.value === "all"
                ? keyword
                  ? `/admin/logs?q=${encodeURIComponent(keyword)}`
                  : "/admin/logs"
                : `/admin/logs?module=${option.value}${
                    keyword ? `&q=${encodeURIComponent(keyword)}` : ""
                  }`;

            return (
              <Link
                key={option.value}
                href={href}
                className={
                  moduleFilter === option.value
                    ? "admin-filter-pill admin-filter-pill-active"
                    : "admin-filter-pill"
                }
              >
                {option.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="admin-log-table-card">
        <div className="admin-log-table-header">
          <div>
            <h2>日志列表</h2>
            <p>
              共 {totalCount} 条记录，当前第 {currentPage} / {totalPages} 页
            </p>
          </div>
        </div>

        {logs.length > 0 ? (
          <>
            <div className="admin-log-table-wrapper">
              <table className="admin-log-table">
                <colgroup>
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "17%" }} />
                  <col style={{ width: "27%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "10%" }} />
                </colgroup>

                <thead>
                  <tr>
                    <th>模块</th>
                    <th>操作类型</th>
                    <th>目标对象</th>
                    <th>操作说明</th>
                    <th>操作人</th>
                    <th>时间</th>
                    <th>变更</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => {
                    const hasSnapshot = Boolean(log.beforeData || log.afterData);

                    return (
                      <tr key={log.id}>
                        <td>
                          <span className={getModuleClassName(log.module)}>
                            {getModuleText(log.module)}
                          </span>
                        </td>

                        <td>{log.action}</td>

                        <td>
                          <Link
                            href={getAdminLogHref({
                              module: log.module,
                              targetId: log.targetId,
                            })}
                            className="admin-log-target-link"
                          >
                            {log.targetName || "未记录"}
                          </Link>
                        </td>

                        <td>{log.note || "无说明"}</td>

                        <td>{log.operatorName || "管理员"}</td>

                        <td>{log.createdAt.toLocaleString("zh-CN")}</td>

                        <td>
                          {hasSnapshot ? (
                            <Link
                              href={`/admin/logs/${log.id}`}
                              className="admin-log-change-link"
                            >
                              查看变更
                            </Link>
                          ) : (
                            <span className="admin-log-no-change">无快照</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <Link
                href={buildHref({
                  moduleFilter,
                  keyword,
                  page: currentPage - 1,
                  includePage: true,
                })}
                className={
                  currentPage <= 1
                    ? "admin-pagination-button disabled"
                    : "admin-pagination-button"
                }
              >
                上一页
              </Link>

              <span>
                第 {currentPage} 页 / 共 {totalPages} 页
              </span>

              <Link
                href={buildHref({
                  moduleFilter,
                  keyword,
                  page: currentPage + 1,
                  includePage: true,
                })}
                className={
                  currentPage >= totalPages
                    ? "admin-pagination-button disabled"
                    : "admin-pagination-button"
                }
              >
                下一页
              </Link>
            </div>
          </>
        ) : (
          <div className="admin-empty-state">
            <h3>暂无符合条件的日志</h3>
            <p>可以尝试清空搜索条件，或切换其他模块筛选。</p>
            <Link href="/admin/logs" className="admin-reset-link">
              查看全部日志
            </Link>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}

