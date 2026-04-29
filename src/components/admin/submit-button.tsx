"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
};

export function SubmitButton({
  children,
  className,
  loadingText = "处理中...",
  formAction,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      formAction={formAction}
      style={{
        opacity: pending ? 0.6 : 1,
        cursor: pending ? "not-allowed" : "pointer",
      }}
    >
      {pending ? loadingText : children}
    </button>
  );
}