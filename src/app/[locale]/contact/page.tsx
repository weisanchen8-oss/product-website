/**
 * 文件作用：
 * 前台多语言联系我们页。
 * 支持 /zh/contact 和 /en/contact。
 * 读取后台内容管理中的联系方式配置，并统一为商务深蓝风 UI。
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getFrontendPath, isFrontendLocale } from "@/lib/frontend-i18n";
import { prisma } from "@/lib/prisma";

function safeParseContactInfo(value: string | null | undefined) {
  if (!value) return {};

  try {
    return JSON.parse(value) as {
      phone?: string;
      email?: string;
      address?: string;
      workingHours?: string;
    };
  } catch {
    return {};
  }
}

export default async function LocaleContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  if (!isFrontendLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam;
  const isEn = locale === "en";

  const contactContent = await prisma.siteContent.findUnique({
    where: { contentKey: "inquiry_success_contact" },
  });

  const contactInfo = safeParseContactInfo(contactContent?.extraJson);

  const email = contactInfo.email || "contact@example.com";
  const phone = contactInfo.phone || "+86 000 0000 0000";
  const address =
    contactInfo.address ||
    (isEn
      ? "Please configure your company address."
      : "请在后台配置企业实际地址。");
  const workingHours =
    contactInfo.workingHours || (isEn ? "9:00 - 18:00" : "9:00 - 18:00");

  return (
    <div className="site-shell">
      <SiteHeader locale={locale} variant="solid" />

      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-14">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#1E3A5F]">
              {isEn ? "Contact" : "联系我们"}
            </p>

            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
              {isEn ? "Contact Us" : "联系我们"}
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-500">
              {isEn
                ? "Send us your product needs and our team will contact you as soon as possible."
                : "你可以提交产品需求，工作人员将尽快与你联系。"}
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#1E3A5F]">
              {isEn ? "Business Inquiry" : "业务咨询"}
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              {isEn ? "Submit your inquiry online" : "在线提交产品询单"}
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-600">
              {isEn
                ? "For product prices, specifications, delivery schedules, customization requirements, or cooperation details, please submit an inquiry."
                : "如需了解产品价格、规格参数、交付周期、定制需求或合作方式，请提交询单。"}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={getFrontendPath(locale, "/inquiry")}
                className="inline-flex h-11 items-center rounded-full bg-[#1E3A5F] px-6 text-sm font-bold text-white transition hover:bg-[#244B75]"
              >
                {isEn ? "Submit Inquiry" : "提交询单"}
              </Link>

              <Link
                href={getFrontendPath(locale, "/products")}
                className="inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-[#1E3A5F] transition hover:bg-[#EAF1F8]"
              >
                {isEn ? "View Products" : "查看产品"}
              </Link>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                label: isEn ? "Email" : "联系邮箱",
                value: email,
              },
              {
                label: isEn ? "Phone" : "联系电话",
                value: phone,
              },
              {
                label: isEn ? "Address" : "公司地址",
                value: address,
              },
              {
                label: isEn ? "Working Hours" : "工作时间",
                value: workingHours,
              },
            ].map((item) => (
              <article
                key={item.label}
                className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1E3A5F]">
                  {item.label}
                </p>

                <p className="mt-4 text-base font-semibold leading-7 text-slate-800">
                  {item.value}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}