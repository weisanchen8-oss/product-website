/**
 * 文件作用：
 * 定义后台管理系统公共布局。
 * 当前版本会检查管理员权限，并对未登录/非管理员用户给出清晰提示。
 */

import Link from "next/link";
import { getAdminAccessStatus } from "@/lib/auth";
import { logoutUserAction } from "@/app/logout/actions";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export async function AdminLayout({ children }: AdminLayoutProps) {
  const adminAccess = await getAdminAccessStatus();

  if (adminAccess.status !== "allowed") {
    return (
      <div className="admin-access-page">
        <div className="admin-access-card">
          <h1>
            {adminAccess.status === "not-logged-in"
              ? "请先登录管理员账号"
              : "当前账号无后台权限"}
          </h1>

          <p>
            {adminAccess.status === "not-logged-in"
              ? "后台管理系统仅允许管理员访问。请先登录管理员账号后继续操作。"
              : `当前登录账号「${adminAccess.user?.email}」不是管理员账号，无法访问后台管理系统。`}
          </p>

          <div className="admin-access-actions">
            <Link href="/" className="ghost-button inline-button-link">
              返回首页
            </Link>

            {adminAccess.status === "not-logged-in" ? (
              <Link
                href="/login?redirectTo=/admin"
                className="primary-button inline-button-link"
              >
                前往登录
              </Link>
            ) : (
              <form action={logoutUserAction}>
                <button type="submit" className="primary-button">
                  退出并切换账号
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  const adminUser = adminAccess.user;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-logo">
          后台管理
        </Link>

        <nav className="admin-nav">
          <Link href="/admin">后台首页</Link>
          <Link href="/admin/dashboard">数据看板</Link>
          <Link href="/admin/products">产品管理</Link>
          <Link href="/admin/categories">分类管理</Link>
          <Link href="/admin/inquiries">询单管理</Link>
          <Link href="/admin/customers">客户管理</Link>
          <Link href="/admin/content">内容管理</Link>
          <Link href="/admin/logs">操作日志</Link>
          <Link href="/">返回前台</Link>
        </nav>

        <div className="admin-user-box">
          <p>当前管理员</p>
          <strong>{adminUser.name}</strong>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}