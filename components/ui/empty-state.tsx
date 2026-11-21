import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-pacha-900/20 bg-pacha-50/40 px-6 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white text-pacha-700 shadow-sm">
          {icon}
        </span>
      )}
      <h3 className="font-display text-lg font-semibold text-pacha-950">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-md text-sm leading-relaxed text-ink/60">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-pacha-900/10",
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-4 pb-6",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="text-balance text-2xl font-semibold sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-pretty text-sm leading-relaxed text-ink/60 sm:text-[15px]">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
