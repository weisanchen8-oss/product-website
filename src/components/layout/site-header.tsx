/**
 * 文件作用：
 * 定义前台网站公共顶部导航栏。
 * 支持：
 * - 根据当前语言生成前台链接
 * - 中英文语言切换
 * - 登录 / 我的询单 / 退出登录入口
 * 
 * 注意：
 * 后台 /admin 不使用该组件。
 */

import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutUserAction } from "@/app/logout/actions";
import {
  type FrontendLocale,
  getFrontendPath,
} from "@/lib/frontend-i18n";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

type SiteHeaderProps = {
  locale?: FrontendLocale;
};

export async function SiteHeader({ locale = "zh" }: SiteHeaderProps) {
  const currentUser = await getCurrentUser();
  const isEn = locale === "en";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href={getFrontendPath(locale)}
          className="text-lg font-bold text-slate-900"
        >
          {isEn ? "B2B Product Platform" : "公司 Logo"}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href={getFrontendPath(locale)} className="hover:text-blue-600">
            {isEn ? "Home" : "首页"}
          </Link>

          <Link
            href={getFrontendPath(locale, "/products")}
            className="hover:text-blue-600"
          >
            {isEn ? "Products" : "产品中心"}
          </Link>

          <Link
            href={getFrontendPath(locale, "/company")}
            className="hover:text-blue-600"
          >
            {isEn ? "Company" : "公司介绍"}
          </Link>

          <Link
            href={getFrontendPath(locale, "/contact")}
            className="hover:text-blue-600"
          >
            {isEn ? "Contact" : "联系我们"}
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <Link
            href={getFrontendPath(locale, "/search")}
            className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 hover:border-blue-300 hover:text-blue-600"
          >
            {isEn ? "Search" : "搜索"}
          </Link>

          <Link
            href={getFrontendPath(locale, "/inquiry-cart")}
            className="rounded-full bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            {isEn ? "Inquiry Cart" : "询单清单"}
          </Link>

          <LanguageSwitcher locale={locale} />

          {currentUser ? (
            <>
              <Link
                href={getFrontendPath(locale, "/inquiry")}
                className="hidden text-slate-600 hover:text-blue-600 md:inline"
              >
                {isEn ? "My Inquiries" : "我的询单"}
              </Link>

              <span className="hidden text-slate-400 md:inline">
                {currentUser.name}
              </span>

              <form action={logoutUserAction}>
                <button
                  type="submit"
                  className="text-slate-600 hover:text-red-600"
                >
                  {isEn ? "Logout" : "退出登录"}
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="text-slate-600 hover:text-blue-600">
              {isEn ? "Login" : "登录"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}