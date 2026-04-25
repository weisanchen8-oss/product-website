/**
 * 文件作用：
 * 定义前台各页面顶部的统一标题区组件，用于展示页面标题、说明文字和基础页面氛围。
 */

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
}: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="page-hero-card">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
    </section>
  );
}