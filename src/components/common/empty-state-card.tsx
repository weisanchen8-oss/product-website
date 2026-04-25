/**
 * 文件作用：
 * 定义统一的占位卡片组件，用于当前阶段页面未接入真实数据时展示说明和后续扩展提示。
 */

type EmptyStateCardProps = {
  title: string;
  description: string;
};

export function EmptyStateCard({
  title,
  description,
}: EmptyStateCardProps) {
  return (
    <div className="empty-state-card">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}