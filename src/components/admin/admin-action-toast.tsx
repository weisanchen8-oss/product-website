/**
 * 文件作用：
 * 定义后台操作结果弹窗提示组件。
 * 当前用于在内容保存成功后，向用户显示轻量弹窗反馈，并支持自动消失与手动关闭。
 */

"use client";

import { useEffect, useState } from "react";

type AdminActionToastProps = {
  message: string;
};

export function AdminActionToast({ message }: AdminActionToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 2500);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="admin-toast" role="status" aria-live="polite">
      <div className="admin-toast-content">
        <span>{message}</span>
        <button
          type="button"
          className="admin-toast-close"
          onClick={() => setVisible(false)}
          aria-label="关闭提示"
        >
          ×
        </button>
      </div>
    </div>
  );
}