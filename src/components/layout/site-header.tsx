/**
 * 文件作用：
 * 定义前台网站公共顶部导航栏。
 * 当前版本支持根据 cookie 登录状态展示用户入口、我的询单和退出登录。
 */

import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutUserAction } from "@/app/logout/actions";

export async function SiteHeader() {
  const currentUser = await getCurrentUser();

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="site-logo">
          公司 Logo
        </Link>

        <nav className="site-nav" aria-label="主导航">
          <Link href="/">首页</Link>
          <Link href="/products">产品中心</Link>
          <Link href="/company">公司介绍</Link>
          <Link href="/contact">联系我们</Link>
        </nav>

        <div className="site-header-actions">
          <form action="/search" method="get" className="search-form">
            <input
              type="text"
              name="q"
              placeholder="搜索产品名称或关键词"
              className="search-input"
              aria-label="搜索产品名称或关键词"
            />
            <button type="submit" className="ghost-button">
              搜索
            </button>
          </form>

          <Link href="/inquiry/cart" className="primary-button inline-button-link">
            询单清单
          </Link>

          {currentUser ? (
            <>
              <Link
                href="/account/inquiries"
                className="ghost-button inline-button-link"
              >
                我的询单
              </Link>

              <span className="site-user-name">{currentUser.name}</span>

              <form action={logoutUserAction}>
                <button type="submit" className="ghost-button">
                  退出登录
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="ghost-button inline-button-link">
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}