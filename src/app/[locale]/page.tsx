/**
 * 文件作用：
 * 前台多语言首页。
 * 当前用于测试 next-intl 是否正常工作。
 */

import { useTranslations } from "next-intl";

export default function LocaleHomePage() {
  const t = useTranslations("HomePage");

  return (
    <main style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <section>
        <p style={{ color: "#16a34a", fontWeight: 600 }}>
          B2B Product Website
        </p>

        <h1 style={{ fontSize: 42, lineHeight: 1.2, marginTop: 16 }}>
          {t("title")}
        </h1>

        <p
          style={{
            marginTop: 20,
            fontSize: 18,
            lineHeight: 1.8,
            color: "#555",
            maxWidth: 720,
          }}
        >
          {t("subtitle")}
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <a
            href="/zh/products"
            style={{
              padding: "12px 20px",
              borderRadius: 999,
              background: "#16a34a",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {t("viewProducts")}
          </a>

          <a
            href="/zh/inquiry"
            style={{
              padding: "12px 20px",
              borderRadius: 999,
              border: "1px solid #ddd",
              color: "#333",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {t("submitInquiry")}
          </a>
        </div>
      </section>
    </main>
  );
}