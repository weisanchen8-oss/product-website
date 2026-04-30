/**
 * 文件作用：
 * 提供全站通用 UI 基础组件。
 * 包括页面容器、区块标题、卡片、徽章和按钮。
 * 后续首页、产品页、后台页面都可以复用这些组件，
 * 用于统一圆角、间距、阴影、hover 动效和视觉风格。
 */

import Link from "next/link";
import type { ReactNode } from "react";

type UiCardVariant = "default" | "featured" | "glass";
type UiBadgeVariant = "primary" | "success" | "warning" | "danger" | "neutral";
type UiButtonVariant = "primary" | "secondary" | "ghost";

function mergeClassName(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export function UiPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <main className={mergeClassName("ui-page-enter", className)}>{children}</main>;
}

export function UiContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={mergeClassName("mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

export function UiSectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          {title}
        </h1>

        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function UiCard({
  children,
  className,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  variant?: UiCardVariant;
}) {
  return (
    <section
      className={mergeClassName(
        "ui-card p-5",
        variant === "featured" && "ui-card-featured",
        variant === "glass" && "ui-glass",
        className
      )}
    >
      {children}
    </section>
  );
}

export function UiBadge({
  children,
  variant = "neutral",
  className,
}: {
  children: ReactNode;
  variant?: UiBadgeVariant;
  className?: string;
}) {
  const variantClassMap: Record<UiBadgeVariant, string> = {
    primary: "ui-badge-primary",
    success: "ui-badge-success",
    warning: "ui-badge-warning",
    danger: "ui-badge-danger",
    neutral: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={mergeClassName("ui-badge", variantClassMap[variant], className)}>
      {children}
    </span>
  );
}

export function UiButton({
  children,
  href,
  type = "button",
  variant = "primary",
  className,
}: {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit" | "reset";
  variant?: UiButtonVariant;
  className?: string;
}) {
  const baseClass =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition";

  const variantClassMap: Record<UiButtonVariant, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 shadow-none hover:bg-slate-100",
  };

  const finalClassName = mergeClassName(baseClass, variantClassMap[variant], className);

  if (href) {
    return (
      <Link href={href} className={finalClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={finalClassName}>
      {children}
    </button>
  );
}