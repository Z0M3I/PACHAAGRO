import Link from "next/link";
import { FlaskConical, ArrowRight } from "lucide-react";

export function DemoBanner({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`border-b border-gold-500/30 bg-gold-50 text-gold-900 ${className}`}
      role="status"
    >
      <div className="container-page flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs sm:text-[13px]">
        <p className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 shrink-0" aria-hidden />
          <span>
            <strong>Modo demostración.</strong>{" "}
            {compact
              ? "Datos no oficiales. Los cambios son temporales."
              : "Los datos, alertas y mensajes son de ejemplo y no oficiales. Los cambios se guardan solo mientras el servidor esté activo."}
          </span>
        </p>
        <Link
          href="/api/health"
          className="inline-flex items-center gap-1 font-bold underline-offset-2 hover:underline"
        >
          Estado técnico <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
