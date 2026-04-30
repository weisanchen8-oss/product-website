/**
 * 文件作用：
 * 定义前台网站公共页脚组件。
 * 当前支持根据 locale 显示中文 / 英文文案。
 */

import Link from "next/link";
import { FrontendLocale, getFrontendPath } from "@/lib/frontend-i18n";

type SiteFooterProps = {
  locale?: FrontendLocale;
};

export function SiteFooter({ locale = "zh" }: SiteFooterProps) {
  const isEn = locale === "en";

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <h2>{isEn ? "B2B Product Website" : "B2B 产品展示系统"}</h2>
          <p>
            {isEn
              ? "A professional product showcase and inquiry platform for export-oriented businesses."
              : "面向出口贸易企业的产品展示与询单管理平台。"}
          </p>
        </div>

        <div className="footer-links">
          <Link href={getFrontendPath(locale)}>{isEn ? "Home" : "首页"}</Link>
          <Link href={getFrontendPath(locale, "/products")}>
            {isEn ? "Products" : "产品中心"}
          </Link>
          <Link href={getFrontendPath(locale, "/company")}>
            {isEn ? "Company" : "公司介绍"}
          </Link>
          <Link href={getFrontendPath(locale, "/contact")}>
            {isEn ? "Contact" : "联系我们"}
          </Link>
        </div>
      </div>
    </footer>
  );
}