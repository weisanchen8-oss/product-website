/**
 * 文件作用：
 * 后台表单提交按钮组件。
 * 支持提交前确认弹窗、提交中 loading 文案和防重复点击。
 */

"use client";

import { useFormStatus } from "react-dom";

type ConfirmSubmitActionButtonProps = {
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
  confirmMessage: string;
  formAction?: (formData: FormData) => void | Promise<void>;
};

export function ConfirmSubmitActionButton({
  children,
  className,
  loadingText = "处理中...",
  confirmMessage,
  formAction,
}: ConfirmSubmitActionButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      formAction={formAction}
      onClick={(event) => {
        const confirmed = window.confirm(confirmMessage);

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      {pending ? loadingText : children}
    </button>
  );
}