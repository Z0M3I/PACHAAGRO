import Link from "next/link";
import { CalendarDays, Clock, MapPin, Video } from "lucide-react";
import type { Meeting } from "@/types/domain";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export function MeetingCard({
  meeting,
  href,
}: {
  meeting: Meeting;
  href: string;
}) {
  const upcoming = new Date(meeting.startsAt).getTime() >= Date.now();
  return (
    <Link href={href} className="group block h-full">
      <article className="flex h-full flex-col rounded-2xl border border-pacha-900/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-pacha-700/25 hover:shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-pacha-100 text-pacha-800">
              <CalendarDays className="h-5 w-5" aria-hidden />
            </span>
            {meeting.isVirtual && (
              <Badge tone="blue">
                <Video className="h-3 w-3" aria-hidden />
                Virtual
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            {meeting.isDemo && <DemoBadge />}
            <Badge tone={upcoming ? "green" : "neutral"}>
              {upcoming ? "Próxima" : "Pasada"}
            </Badge>
          </div>
        </div>
        <h3 className="mt-4 text-balance font-display text-lg font-semibold leading-snug text-pacha-950">
          {meeting.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/60">
          {meeting.description}
        </p>
        <div className="mt-auto space-y-1.5 pt-4 text-xs text-ink/50">
          <p className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {formatDateTime(meeting.startsAt)}
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {meeting.location}
          </p>
        </div>
      </article>
    </Link>
  );
}
