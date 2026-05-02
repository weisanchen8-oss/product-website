/**
 * 文件作用：
 * 促销活动列表操作按钮。
 * 这是客户端组件，负责停止、启用和删除促销活动。
 * 当前版本优化按钮样式，使操作区更正式、更清晰。
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PromotionListActionsProps = {
  promotionId: number;
  isActive: boolean;
};

export function PromotionListActions({
  promotionId,
  isActive,
}: PromotionListActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleStop() {
    if (!confirm("确定要停止这个促销活动吗？停止后该活动将不再生效。")) {
      return;
    }

    setIsPending(true);

    const res = await fetch("/api/admin/promotions", {
      method: "PATCH",
      body: JSON.stringify({
        action: "stop",
        promotionId,
      }),
    });

    setIsPending(false);

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

    setIsPending(true);

    const res = await fetch("/api/admin/promotions", {
      method: "PATCH",
      body: JSON.stringify({
        action: "enable",
        promotionId,
      }),
    });

    setIsPending(false);

    if (!res.ok) {
      alert("启用失败，请稍后重试。");
      return;
    }

    router.refresh();
  }

  async function handleDelete() {
    if (
      !confirm(
        "确定要删除这个促销活动吗？删除后不可恢复，已绑定产品关系也会一起删除。"
      )
    ) {
      return;
    }

    setIsPending(true);

    const res = await fetch("/api/admin/promotions", {
      method: "DELETE",
      body: JSON.stringify({
        promotionId,
      }),
    });

    setIsPending(false);

    if (!res.ok) {
      alert("删除失败，请稍后重试。");
      return;
    }

    router.refresh();
  }

  return (
    <div className="grid gap-2">
      {isActive ? (
        <button
          type="button"
          onClick={handleStop}
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "处理中..." : "停止"}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleEnable}
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "处理中..." : "启用"}
        </button>
      )}

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "处理中..." : "删除"}
      </button>
    </div>
  );
}