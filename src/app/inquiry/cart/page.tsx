/**
 * 文件作用：
 * 定义询单清单页。
 * 当前版本使用浏览器 localStorage 保存伪购物车清单，支持修改数量和删除产品。
 */

import { PageHero } from "@/components/common/page-hero";
import { InquiryCartClient } from "@/components/inquiry/inquiry-cart-client";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function InquiryCartPage() {
  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <PageHero
          eyebrow="Inquiry Cart"
          title="询单清单"
          description="这里用于整理您感兴趣的产品和数量信息，确认后可继续提交正式询单。"
        />

        <section className="section">
          <div className="container">
            <InquiryCartClient />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}