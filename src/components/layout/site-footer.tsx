import Link from "next/link";
import { getFrontendPath, type FrontendLocale } from "@/lib/frontend-i18n";

export function SiteFooter({ locale = "zh" }: { locale?: FrontendLocale }) {
  const isEn = locale === "en";

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* 上半部分 */}
        <div className="grid gap-10 md:grid-cols-3">
          {/* 品牌信息 */}
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEn ? "B2B Product Platform" : "B2B 产品展示系统"}
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {isEn
                ? "A professional product showcase and inquiry management platform for export-oriented businesses."
                : "面向出口贸易企业的产品展示与询单管理平台。"}
            </p>
          </div>

          {/* 导航 */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              {isEn ? "Navigation" : "网站导航"}
            </h4>

            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500">
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
            </div>
          </div>

          {/* 联系方式 */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              {isEn ? "Contact" : "联系方式"}
            </h4>

            <div className="mt-3 space-y-2 text-sm text-slate-500">
              <p>Email: contact@company.com</p>
              <p>WhatsApp: +86 123 4567 8888</p>
              <p>{isEn ? "Working Hours: 9:00 - 18:00" : "工作时间：9:00 - 18:00"}</p>
            </div>
          </div>
        </div>

        {/* 分割线 */}
        <div className="my-8 border-t border-slate-200" />

        {/* 底部版权 */}
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-slate-400 md:flex-row">
          <p>
            © {new Date().getFullYear()}{" "}
            {isEn ? "B2B Product Platform" : "B2B 产品展示系统"}
          </p>

          <div className="flex gap-4">
            <Link href="#" className="hover:text-blue-600">
              {isEn ? "Privacy Policy" : "隐私政策"}
            </Link>

            <Link href="#" className="hover:text-blue-600">
              {isEn ? "Terms of Service" : "服务条款"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}