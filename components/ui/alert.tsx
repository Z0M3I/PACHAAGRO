import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "warning" | "info";

const styles: Record<Tone, string> = {
  success: "border-pacha-700/20 bg-pacha-50 text-pacha-900",
  error: "border-red-200 bg-red-50 text-red-900",
  warning: "border-gold-500/30 bg-gold-50 text-gold-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
};

const icons: Record<Tone, ReactNode> = {
  success: <CheckCircle2 className="h-4.5 w-4.5 shrink-0" aria-hidden />,
  error: <XCircle className="h-4.5 w-4.5 shrink-0" aria-hidden />,
  warning: <AlertTriangle className="h-4.5 w-4.5 shrink-0" aria-hidden />,
  info: <Info className="h-4.5 w-4.5 shrink-0" aria-hidden />,
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-relaxed",
        styles[tone],
        className,
      )}
    >
      {icons[tone]}
      <div>
        {title && <p className="font-bold">{title}</p>}
        <div className={title ? "mt-0.5 opacity-90" : "opacity-90"}>{children}</div>
      </div>
    </div>
  );
}
