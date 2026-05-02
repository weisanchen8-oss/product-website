/**
 * 文件作用：
 * 定义前台网站公共顶部导航栏。
 * 当前支持：
 * - 根据 locale 显示中文/英文前台导航文案
 * - 根据 cookie 登录状态展示用户入口、我的询单和退出登录
 * - 后台 /admin 不使用该组件
 */

import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutUserAction } from "@/app/logout/actions";
import {
  FrontendLocale,
  getFrontendPath,
} from "@/lib/frontend-i18n";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

type SiteHeaderProps = {
  locale?: FrontendLocale;
};

export async function SiteHeader({ locale = "zh" }: SiteHeaderProps) {
  const currentUser = await getCurrentUser();

  const text = {
    logo: locale === "en" ? "Company Logo" : "公司 Logo",
    home: locale === "en" ? "Home" : "首页",
    products: locale === "en" ? "Products" : "产品中心",
    company: locale === "en" ? "Company" : "公司介绍",
    contact: locale === "en" ? "Contact" : "联系我们",
    searchPlaceholder:
      locale === "en" ? "Search product name or keyword" : "搜索产品名称或关键词",
    search: locale === "en" ? "Search" : "搜索",
    inquiryCart: locale === "en" ? "Inquiry List" : "询单清单",
    myInquiry: locale === "en" ? "My Inquiries" : "我的询单",
    login: locale === "en" ? "Login" : "登录",
    logout: locale === "en" ? "Logout" : "退出登录",
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href={getFrontendPath(locale)} className="site-logo">
          {text.logo}
        </Link>

        <nav className="site-nav">
          <Link href={getFrontendPath(locale)}>{text.home}</Link>
          <Link href={getFrontendPath(locale, "/products")}>{text.products}</Link>
          <Link href={getFrontendPath(locale, "/company")}>{text.company}</Link>
          <Link href={getFrontendPath(locale, "/contact")}>{text.contact}</Link>
        </nav>

        <form className="header-search" action={getFrontendPath(locale, "/search")}>
          <input name="q" placeholder={text.searchPlaceholder} />
          <button type="submit">{text.search}</button>
        </form>

        <div className="header-actions">
          <Link href={getFrontendPath(locale, "/inquiry-cart")} className="primary-button">
            {text.inquiryCart}
          </Link>

          {currentUser ? (
            <>
              <Link href={getFrontendPath(locale, "/my-inquiries")} className="ghost-button">
                {text.myInquiry}
              </Link>

              <span className="header-user-name">{currentUser.name}</span>

              <form action={logoutUserAction}>
                <button type="submit" className="ghost-button">
                  {text.logout}
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="ghost-button">
              {text.login}
            </Link>
          )}

          <LanguageSwitcher locale={locale} />
        </div>
      </div>
    </header>
  );
}