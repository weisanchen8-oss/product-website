/**
 * 文件作用：
 * 促销活动列表操作按钮。
 * 这是客户端组件，负责停止和删除促销活动。
 */

"use client";

import { useRouter } from "next/navigation";

type PromotionListActionsProps = {
  promotionId: number;
  isActive: boolean;
};

export function PromotionListActions({
  promotionId,
  isActive,
}: PromotionListActionsProps) {
  const router = useRouter();

  async function handleStop() {
    if (!confirm("确定要停止这个促销活动吗？停止后该活动将不再生效。")) {
      return;
    }

    const res = await fetch("/api/admin/promotions", {
      method: "PATCH",
      body: JSON.stringify({
        action: "stop",
        promotionId,
      }),
    });

    if (!res.ok) {
      alert("停止失败，请稍后重试。");
      return;
    }

    router.refresh();
  }

  async function handleEnable() {
    if (!confirm("确定要重新启用这个促销活动吗？")) {
      return;
    }

    const res = await fetch("/api/admin/promotions", {
      method: "PATCH",
      body: JSON.stringify({
        action: "enable",
        promotionId,
      }),
    });

    if (!res.ok) {
      alert("启用失败，请稍后重试。");
      return;
    }

    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("确定要删除这个促销活动吗？删除后不可恢复，已绑定产品关系也会一起删除。")) {
      return;
    }

    const res = await fetch("/api/admin/promotions", {
      method: "DELETE",
      body: JSON.stringify({
        promotionId,
      }),
    });

    if (!res.ok) {
      alert("删除失败，请稍后重试。");
      return;
    }

    router.refresh();
  }

  return (
    <div className="promotion-card-actions">
      {isActive ? (
        <button type="button" onClick={handleStop} className="promotion-stop-btn">
          停止
        </button>
      ) : (
        <button type="button" onClick={handleEnable} className="promotion-enable-btn">
          启用
        </button>
      )}

      <button type="button" onClick={handleDelete} className="promotion-delete-btn">
        删除
      </button>
    </div>
  );
}