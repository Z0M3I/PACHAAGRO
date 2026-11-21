import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "green"
  | "gold"
  | "red"
  | "orange"
  | "blue"
  | "neutral"
  | "outline";

const tones: Record<Tone, string> = {
  green: "bg-pacha-100 text-pacha-900 border-pacha-700/15",
  gold: "bg-gold-100 text-gold-800 border-gold-500/25",
  red: "bg-red-50 text-red-800 border-red-200",
  orange: "bg-orange-50 text-orange-800 border-orange-200",
  blue: "bg-sky-50 text-sky-800 border-sky-200",
  neutral: "bg-mist text-ink/70 border-ink/10",
  outline: "bg-transparent text-current border-current/25",
};

export function Badge({
  children,
  tone = "green",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold leading-5",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge tone="gold" className={className}>
      DEMO
    </Badge>
  );
}
