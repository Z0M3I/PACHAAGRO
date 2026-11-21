import Link from "next/link";
import {
  CalendarDays,
  CloudSun,
  MapPin,
  Megaphone,
  Users,
} from "lucide-react";
import type { Announcement } from "@/types/domain";
import { Badge, DemoBadge } from "@/components/ui/badge";
import {
  ANNOUNCEMENT_TYPE_LABELS,
  locationLabel,
} from "@/lib/labels";
import { formatDate, cn } from "@/lib/utils";

const icons = {
  announcement: Megaphone,
  communique: Megaphone,
  weather: CloudSun,
  meeting: Users,
  event: CalendarDays,
} as const;

export function AnnouncementCard({
  announcement,
  href,
  className,
}: {
  announcement: Announcement;
  href?: string;
  className?: string;
}) {
  const Icon = icons[announcement.type];
  const content = (
    <article
      className={cn(
        "group flex h-full flex-col rounded-2xl border border-pacha-900/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-pacha-700/25 hover:shadow-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pacha-100 text-pacha-800">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {announcement.isDemo && <DemoBadge />}
          <Badge tone="neutral">
            {ANNOUNCEMENT_TYPE_LABELS[announcement.type]}
          </Badge>
        </div>
      </div>
      <h3 className="mt-4 text-balance font-display text-lg font-semibold leading-snug text-pacha-950 group-hover:text-pacha-800">
        {announcement.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/60">
        {announcement.summary}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 text-xs text-ink/50">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {locationLabel(announcement)}
        </span>
        <span>·</span>
        <span>
          {formatDate(announcement.publishedAt ?? announcement.createdAt)}
        </span>
      </div>
    </article>
  );

  if (!href) return content;
  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}
