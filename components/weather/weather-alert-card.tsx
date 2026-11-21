import { AlertTriangle, Clock, MapPin, ShieldAlert } from "lucide-react";
import type { WeatherAlert } from "@/types/domain";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { SEVERITY_LABELS, SEVERITY_TONE } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils";

export function WeatherAlertCard({ alert }: { alert: WeatherAlert }) {
  const tone = SEVERITY_TONE[alert.severity];
  return (
    <article className="flex h-full flex-col rounded-2xl border border-pacha-900/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span
          className={`grid h-10 w-10 place-items-center rounded-xl ${
            alert.severity === "severe" || alert.severity === "extreme"
              ? "bg-red-50 text-red-700"
              : alert.severity === "moderate"
                ? "bg-gold-100 text-gold-800"
                : "bg-pacha-100 text-pacha-800"
          }`}
        >
          {alert.severity === "severe" || alert.severity === "extreme" ? (
            <ShieldAlert className="h-5 w-5" aria-hidden />
          ) : (
            <AlertTriangle className="h-5 w-5" aria-hidden />
          )}
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {alert.isDemo && <DemoBadge />}
          <Badge tone={tone}>{SEVERITY_LABELS[alert.severity]}</Badge>
        </div>
      </div>
      <h3 className="mt-4 text-balance font-display text-lg font-semibold leading-snug text-pacha-950">
        {alert.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/60">
        {alert.description}
      </p>
      <div className="mt-auto space-y-1.5 pt-4 text-xs text-ink/50">
        <p className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {alert.municipalityName ?? alert.departmentName ?? "Toda Bolivia"}
        </p>
        <p className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          Hasta {alert.endsAt ? formatDateTime(alert.endsAt) : "nuevo aviso"}
        </p>
        <p className="truncate pt-1 text-[10px] uppercase tracking-wide text-ink/35">
          Fuente: {alert.source}
        </p>
      </div>
    </article>
  );
}
