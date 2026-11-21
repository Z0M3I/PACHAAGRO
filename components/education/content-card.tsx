import Link from "next/link";
import { ArrowUpRight, BookOpen, Clock, MapPin } from "lucide-react";
import type { EducationalContent } from "@/types/domain";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { CONTENT_TYPE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function ContentCard({
  content,
  href,
  className,
}: {
  content: EducationalContent;
  href: string;
  className?: string;
}) {
  return (
    <Link href={href} className="group block h-full">
      <article
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-2xl border border-pacha-900/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-card",
          className,
        )}
      >
        <div className="relative h-28 overflow-hidden bg-pacha-900 p-5 text-white">
          <div className="absolute inset-0 topo-pattern opacity-80" aria-hidden />
          <svg
            viewBox="0 0 200 60"
            className="absolute bottom-0 left-0 w-full text-pacha-700/70"
            aria-hidden
          >
            <path
              d="M0 50L35 20L60 40L92 12L128 42L160 24L200 50V60H0Z"
              fill="currentColor"
            />
          </svg>
          <div className="relative flex items-start justify-between gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <BookOpen className="h-4.5 w-4.5" aria-hidden />
            </span>
            <div className="flex gap-1.5">
              {content.isDemo && <DemoBadge />}
              <Badge tone="outline" className="border-white/25 text-white">
                {CONTENT_TYPE_LABELS[content.contentType]}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-pacha-700">
            {content.categoryName ?? "Contenido educativo"}
          </p>
          <h3 className="mt-1.5 text-balance font-display text-lg font-semibold leading-snug text-pacha-950">
            {content.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/60">
            {content.summary}
          </p>
          <div className="mt-auto flex items-center justify-between pt-4 text-xs text-ink/50">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {content.readingMinutes} min
              {content.cropName && (
                <>
                  <span>·</span>
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {content.cropName}
                </>
              )}
            </span>
            <ArrowUpRight className="h-4 w-4 text-pacha-700 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </article>
    </Link>
  );
}
