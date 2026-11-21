import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "dark" | "light";
  compact?: boolean;
  className?: string;
}

/**
 * Marca PACHAAGRO: sol andino, montañas y hoja de cultivo.
 * Dibujada en SVG para mantener peso mínimo y nitidez.
 */
export function Logo({ variant = "dark", compact = false, className }: LogoProps) {
  const dark = variant === "dark";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 64 64"
        className="h-10 w-10 shrink-0"
        aria-hidden="true"
      >
        <rect
          width="64"
          height="64"
          rx="17"
          fill={dark ? "#145A32" : "#E7F3E8"}
        />
        <circle cx="45" cy="19" r="6.5" fill="#E8B949" />
        <path
          d="M7 46L24 24L34 38L42 28L57 46V57H7V46Z"
          fill={dark ? "#27864A" : "#145A32"}
        />
        <path
          d="M7 50L22 34L32 46L44 32L57 48V57H7V50Z"
          fill={dark ? "#E7F3E8" : "#E7F3E8"}
          opacity="0.92"
        />
        <path
          d="M31 43C31 34.5 35.5 29.5 43.5 27.5C43.5 36 38 41.2 31 43Z"
          fill="#E8B949"
        />
      </svg>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[1.35rem] font-bold tracking-tight",
              dark ? "text-pacha-950" : "text-white",
            )}
          >
            PACHA<span className={dark ? "text-pacha-600" : "text-gold-300"}>AGRO</span>
          </span>
          <span
            className={cn(
              "mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em]",
              dark ? "text-ink/50" : "text-pacha-100/70",
            )}
          >
            Tierra que informa
          </span>
        </span>
      )}
    </span>
  );
}
