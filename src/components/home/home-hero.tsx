/**
 * 文件作用：
 * 定义首页顶部主视觉区域。
 * 当前版本支持从数据库读取 Banner 标题、副标题和按钮内容。
 */

import Link from "next/link";

type HomeHeroProps = {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
};

export function HomeHero({
  title = "简洁、大气、可信赖的企业产品展示与询单平台",
  description = "为企业提供统一的产品展示、热销推荐、搜索浏览与询单入口，后续可平滑扩展后台管理、AI 图片处理和真实业务数据能力。",
  primaryButtonText = "查看产品",
  primaryButtonLink = "/products",
  secondaryButtonText = "热销推荐",
  secondaryButtonLink = "/search",
}: HomeHeroProps) {
  return (
    <section className="home-hero">
      <div className="container home-hero-inner">
        <div className="home-hero-content">
          <p className="eyebrow">B2B Product Showcase</p>
          <h1>{title}</h1>
          <p>{description}</p>

          <div className="hero-actions">
            <Link href={primaryButtonLink} className="primary-button inline-button-link">
              {primaryButtonText}
            </Link>

            <Link href={secondaryButtonLink} className="ghost-button inline-button-link">
              {secondaryButtonText}
            </Link>
          </div>
        </div>

        <div className="home-hero-visual">Banner / 宣传图 / 品牌视觉预留区</div>
      </div>
    </section>
  );
}