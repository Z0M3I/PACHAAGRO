import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Pencil,
  PlusCircle,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { listMeetings } from "@/services/meetings";
import { deleteMeetingAction } from "@/features/admin/actions";
import { DeleteButton } from "@/features/admin/components/delete-button";
import { NotifyButton } from "@/features/admin/components/notify-button";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Reuniones" };

interface PageProps {
  searchParams: Promise<{ ok?: string }>;
}

export default async function AdminMeetingsPage({ searchParams }: PageProps) {
  await requireAdmin("/admin/reuniones");
  const params = await searchParams;
  const meetings = await listMeetings({ includePast: true, limit: 200 });
  const now = Date.now();
  const upcoming = meetings.filter(
    (meeting) => new Date(meeting.startsAt).getTime() >= now,
  );
  const past = meetings.filter(
    (meeting) => new Date(meeting.startsAt).getTime() < now,
  );

  return (
    <div>
      <PageHeader
        eyebrow="Comunidad"
        title="Reuniones"
        description="Programa asambleas, talleres y encuentros. Usa el botón Notificar para enviar una plantilla aprobada a quienes dieron su consentimiento."
        actions={
          <ButtonLink href="/admin/reuniones/nueva" size="sm">
            <PlusCircle className="h-4 w-4" aria-hidden />
            Nueva reunión
          </ButtonLink>
        }
      />

      {params.ok && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-pacha-700/20 bg-pacha-50 px-4 py-3 text-sm text-pacha-900">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Reunión {params.ok === "creado" ? "creada" : "actualizada"} correctamente.
        </div>
      )}

      {meetings.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-5 w-5" />}
          title="No hay reuniones registradas"
          description="Crea la primera reunión para tu comunidad o asociación."
          action={
            <ButtonLink href="/admin/reuniones/nueva" size="sm">
              <PlusCircle className="h-4 w-4" aria-hidden />
              Nueva reunión
            </ButtonLink>
          }
        />
      ) : (
        <div className="space-y-6">
          {[
            { title: "Próximas", items: upcoming },
            { title: "Pasadas", items: past },
          ].map((group) => (
            <section key={group.title}>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-ink/45">
                {group.title} ({group.items.length})
              </h2>
              {group.items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-pacha-900/15 px-4 py-4 text-sm text-ink/45">
                  Sin reuniones en esta categoría.
                </p>
              ) : (
                <div className="space-y-2">
                  {group.items.map((meeting) => (
                    <article
                      key={meeting.id}
                      className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-pacha-900/10 bg-white p-4 shadow-sm"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {meeting.isDemo && <DemoBadge />}
                          {meeting.isVirtual && <Badge tone="blue">Virtual</Badge>}
                          <Badge tone="neutral">
                            {meeting.departmentName ?? "Toda Bolivia"}
                          </Badge>
                        </div>
                        <h3 className="mt-1.5 font-display text-base font-semibold">
                          {meeting.title}
                        </h3>
                        <p className="mt-1 text-xs text-ink/55">
                          {formatDateTime(meeting.startsAt)} · {meeting.location}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        <NotifyButton kind="meeting" id={meeting.id} />
                        <ButtonLink
                          href={`/admin/reuniones/${meeting.id}`}
                          variant="ghost"
                          size="sm"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                          Editar
                        </ButtonLink>
                        <DeleteButton
                          action={deleteMeetingAction.bind(null, meeting.id)}
                          confirmMessage="¿Eliminar esta reunión?"
                        />
                        <Link
                          href={`/panel/reuniones/${meeting.id}`}
                          className="rounded-lg px-2 py-1.5 text-xs font-bold text-pacha-800 hover:bg-pacha-50"
                        >
                          Ver
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
