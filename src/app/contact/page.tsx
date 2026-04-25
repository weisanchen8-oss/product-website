/**
 * 文件作用：
 * 定义联系我们页面，当前阶段提供企业基础联系信息和地址信息展示。
 */

import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function ContactPage() {
  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <PageHero
          eyebrow="Contact"
          title="联系我们"
          description="如果您希望了解产品信息、采购流程或合作方式，可通过以下方式与我们联系。"
        />

        <section className="section">
          <div className="container">
            <div className="contact-grid">
              <div className="content-card">
                <h2>联系方式</h2>
                <p>联系人：公司工作人员</p>
                <p>联系电话：000-00000000</p>
                <p>电子邮箱：contact@example.com</p>
                <p>企业微信：后续由后台配置</p>
              </div>

              <div className="content-card">
                <h2>地址信息</h2>
                <p>这里用于展示公司办公地址、仓储地址或来访说明。</p>
                <p>后续可补充地图能力或更详细的地理位置内容。</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}