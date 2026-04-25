/**
 * 文件作用：
 * 定义公司介绍页，当前阶段先提供企业简介、品牌说明和联系方式的展示骨架。
 */

import { PageHero } from "@/components/common/page-hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function CompanyPage() {
  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <PageHero
          eyebrow="Company"
          title="公司介绍"
          description="该页面用于展示企业背景、品牌理念、核心优势和服务能力，增强客户信任感。"
        />

        <section className="section">
          <div className="container">
            <div className="content-two-column">
              <div className="content-card">
                <h2>企业简介</h2>
                <p>
                  这里用于展示公司的基本介绍、主营方向、服务范围和业务定位。
                  后续可由后台内容管理统一维护。
                </p>
                <p>
                  页面整体将保持简洁、专业、可信赖的表达方式，兼顾品牌展示和产品业务承接。
                </p>
              </div>

              <div className="content-visual-placeholder">
                公司形象图 / 办公环境图 / 品牌图预留区
              </div>
            </div>
          </div>
        </section>

        <section className="section section-muted">
          <div className="container">
            <div className="advantage-grid">
              <div className="advantage-card">
                <h3>专业服务能力</h3>
                <p>用于展示企业在产品、交付和业务配合上的专业能力。</p>
              </div>
              <div className="advantage-card">
                <h3>稳定合作流程</h3>
                <p>用于说明询单、沟通、确认和后续合作的清晰流程。</p>
              </div>
              <div className="advantage-card">
                <h3>品牌可信度</h3>
                <p>用于体现公司形象、案例积累和长期合作价值。</p>
              </div>
              <div className="advantage-card">
                <h3>可持续扩展</h3>
                <p>用于承接更多产品展示、推荐位和业务拓展能力。</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}