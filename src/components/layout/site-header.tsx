/**
 * 文件作用：
 * 定义前台网站公共顶部导航栏。
 * 支持：
 * - 根据当前语言生成前台链接
 * - 中英文语言切换
 * - 登录 / 我的询单 / 退出登录入口
 * - 首页白色导航 / 非首页深蓝导航
 *
 * 注意：
 * 后台 /admin 不使用该组件。
 */

import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutUserAction } from "@/app/logout/actions";
import { type FrontendLocale, getFrontendPath } from "@/lib/frontend-i18n";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

type SiteHeaderProps = {
  locale?: FrontendLocale;
  variant?: "light" | "solid";
};

export async function SiteHeader({
  locale = "zh",
  variant = "light",
}: SiteHeaderProps) {
  const currentUser = await getCurrentUser();
  const isEn = locale === "en";
  const isSolid = variant === "solid";

  const headerClassName = isSolid
    ? "sticky top-0 z-50 border-b border-white/10 bg-[#1E3A5F]/95 text-white backdrop-blur-xl"
    : "sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 text-slate-900 backdrop-blur-xl";

  const logoClassName = isSolid
    ? "text-lg font-bold text-white"
    : "text-lg font-bold text-slate-900";

  const navClassName = isSolid
    ? "hidden items-center gap-6 text-sm font-medium text-white/80 md:flex"
    : "hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex";

  const navLinkClassName = isSolid
    ? "hover:text-white"
    : "hover:text-[#1E3A5F]";

  const searchClassName = isSolid
    ? "rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white hover:bg-white/15"
    : "rounded-full border border-slate-200 px-4 py-2 text-slate-700 hover:border-[#1E3A5F]/30 hover:text-[#1E3A5F]";

  const inquiryClassName = isSolid
    ? "rounded-full bg-white px-4 py-2 font-semibold text-[#1E3A5F] hover:bg-slate-100"
    : "rounded-full bg-[#1E3A5F] px-4 py-2 font-semibold text-white hover:bg-[#244B75]";

  const textLinkClassName = isSolid
    ? "hidden text-white/80 hover:text-white md:inline"
    : "hidden text-slate-600 hover:text-[#1E3A5F] md:inline";

  const userNameClassName = isSolid
    ? "hidden text-white/60 md:inline"
    : "hidden text-slate-400 md:inline";

  const logoutClassName = isSolid
    ? "text-white/80 hover:text-white"
    : "text-slate-600 hover:text-red-600";

  return (
    <header className={headerClassName}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href={getFrontendPath(locale)} className={logoClassName}>
          {isEn ? "B2B Product Platform" : "公司 Logo"}
        </Link>

        <nav className={navClassName}>
          <Link href={getFrontendPath(locale)} className={navLinkClassName}>
            {isEn ? "Home" : "首页"}
          </Link>

          <Link
            href={getFrontendPath(locale, "/products")}
            className={navLinkClassName}
          >
            {isEn ? "Products" : "产品中心"}
          </Link>

          <Link
            href={getFrontendPath(locale, "/company")}
            className={navLinkClassName}
          >
            {isEn ? "Company" : "公司介绍"}
          </Link>

          <Link
            href={getFrontendPath(locale, "/contact")}
            className={navLinkClassName}
          >
            {isEn ? "Contact" : "联系我们"}
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <form
            action={getFrontendPath(locale, "/search")}
            method="GET"
            className="hidden items-center gap-2 lg:flex"
          >
            <input
              type="text"
              name="q"
              placeholder={isEn ? "Search products" : "搜索产品"}
              className={
                isSolid
                  ? "h-10 w-44 rounded-full border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/55 focus:border-white/50 focus:ring-0"
                  : "h-10 w-44 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A5F]/40 focus:ring-0"
              }
            />
          
            <button type="submit" className={searchClassName}>
              {isEn ? "Search" : "搜索"}
            </button>
          </form>

          <Link
            href={getFrontendPath(locale, "/inquiry-cart")}
            className={inquiryClassName}
          >
            {isEn ? "Inquiry Cart" : "询单清单"}
          </Link>

          <LanguageSwitcher locale={locale} />

          {currentUser ? (
            <>
              <Link
                href={getFrontendPath(locale, "/inquiry")}
                className={textLinkClassName}
              >
                {isEn ? "My Inquiries" : "我的询单"}
              </Link>

              <span className={userNameClassName}>{currentUser.name}</span>

              <form action={logoutUserAction}>
                <button type="submit" className={logoutClassName}>
                  {isEn ? "Logout" : "退出登录"}
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className={logoutClassName}>
              {isEn ? "Login" : "登录"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}