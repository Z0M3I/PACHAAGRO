import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listMeetings } from "@/services/meetings";
import { MeetingCard } from "@/components/meetings/meeting-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Reuniones" };

interface PageProps {
  searchParams: Promise<{ pasadas?: string }>;
}

export default async function PanelMeetingsPage({ searchParams }: PageProps) {
  const user = await requireUser("/panel/reuniones");
  const params = await searchParams;
  const showPast = params.pasadas === "1";
  const meetings = await listMeetings({
    departmentId: user.departmentId ?? undefined,
    includePast: true,
    limit: 100,
  });
  const now = Date.now();
  const upcoming = meetings.filter(
    (meeting) => new Date(meeting.startsAt).getTime() >= now,
  );
  const past = meetings
    .filter((meeting) => new Date(meeting.startsAt).getTime() < now)
    .reverse();
  const displayed = showPast ? past : upcoming;

  return (
    <div>
      <PageHeader
        eyebrow="Encuentros comunitarios"
        title="Reuniones y asambleas"
        description="Coordinación de campañas, talleres y encuentros de tu zona. Las reuniones virtuales incluyen su enlace."
      />

      <div className="flex items-center gap-2">
        <Link
          href="/panel/reuniones"
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-bold transition",
            !showPast
              ? "border-pacha-800 bg-pacha-800 text-white"
              : "border-pacha-900/12 bg-white text-ink/60 hover:border-pacha-600",
          )}
        >
          Próximas ({upcoming.length})
        </Link>
        <Link
          href="/panel/reuniones?pasadas=1"
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-bold transition",
            showPast
              ? "border-pacha-800 bg-pacha-800 text-white"
              : "border-pacha-900/12 bg-white text-ink/60 hover:border-pacha-600",
          )}
        >
          Pasadas ({past.length})
        </Link>
      </div>

      {displayed.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {displayed.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              href={`/panel/reuniones/${meeting.id}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-5"
          icon={<CalendarDays className="h-5 w-5" />}
          title={showPast ? "No hay reuniones pasadas" : "No hay reuniones próximas"}
          description={
            showPast
              ? "El historial de reuniones aparecerá aquí."
              : "Cuando se programe una reunión para tu zona, la verás en esta sección."
          }
        />
      )}
    </div>
  );
}
