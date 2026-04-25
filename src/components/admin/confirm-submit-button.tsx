"use client";

type ConfirmSubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  message: string;
};

export function ConfirmSubmitButton({
  children,
  className,
  message,
}: ConfirmSubmitButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        const confirmed = window.confirm(message);

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}