/**
 * 文件作用：
 * 定义首页各内容区的统一标题组件，便于保持页面标题样式和结构一致。
 */

type HomeSectionTitleProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function HomeSectionTitle({
  eyebrow,
  title,
  description,
}: HomeSectionTitleProps) {
  return (
    <div className="section-title">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}