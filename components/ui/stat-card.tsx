import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  hint,
  tone = "green",
  className,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  hint?: string;
  tone?: "green" | "gold" | "blue" | "clay";
  className?: string;
}) {
  const tones = {
    green: "bg-pacha-100 text-pacha-800",
    gold: "bg-gold-100 text-gold-700",
    blue: "bg-sky-100 text-sky-700",
    clay: "bg-orange-100 text-orange-700",
  } as const;

  return (
    <div
      className={cn(
        "surface flex items-start gap-4 p-5 transition-transform hover:-translate-y-0.5",
        className,
      )}
    >
      <span
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-2xl",
          tones[tone],
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-ink/45">
          {label}
        </p>
        <p className="mt-1 font-display text-3xl font-semibold leading-none text-pacha-950">
          {value}
        </p>
        {hint && <p className="mt-1.5 text-xs text-ink/55">{hint}</p>}
      </div>
    </div>
  );
}
