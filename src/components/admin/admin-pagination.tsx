/**
 * 文件作用：
 * 后台通用分页组件。
 * 用于产品、分类、询单等管理列表页，支持保留当前搜索条件并切换页码。
 */

import Link from "next/link";

type AdminPaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | number | undefined>;
};

export function AdminPagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: AdminPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  function buildHref(page: number) {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== "all") {
        params.set(key, String(value));
      }
    });

    params.set("page", String(page));

    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="admin-pagination">
      <Link
        className={`admin-pagination-link ${
          currentPage <= 1 ? "admin-pagination-disabled" : ""
        }`}
        href={currentPage <= 1 ? buildHref(1) : buildHref(currentPage - 1)}
      >
        上一页
      </Link>

      <span className="admin-pagination-info">
        第 {currentPage} / {totalPages} 页
      </span>

      <Link
        className={`admin-pagination-link ${
          currentPage >= totalPages ? "admin-pagination-disabled" : ""
        }`}
        href={
          currentPage >= totalPages
            ? buildHref(totalPages)
            : buildHref(currentPage + 1)
        }
      >
        下一页
      </Link>
    </div>
  );
}