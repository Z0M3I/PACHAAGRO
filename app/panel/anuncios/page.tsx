import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listAnnouncementsForUser } from "@/services/announcements";
import { AnnouncementCard } from "@/components/announcements/announcement-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/empty-state";
import { ANNOUNCEMENT_TYPE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Anuncios" };

const filters = [
  { value: "", label: "Todos" },
  ...Object.entries(ANNOUNCEMENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

interface PageProps {
  searchParams: Promise<{ tipo?: string }>;
}

export default async function PanelAnnouncementsPage({
  searchParams,
}: PageProps) {
  const user = await requireUser("/panel/anuncios");
  const params = await searchParams;
  const announcements = await listAnnouncementsForUser(user, {
    type: params.tipo,
    limit: 60,
  });

  return (
    <div>
      <PageHeader
        eyebrow="Centro de comunicación"
        title="Anuncios para tu comunidad"
        description="Publicaciones dirigidas a tu departamento, municipio, comunidad o cultivos de interés. También verás los avisos nacionales."
      />

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => {
          const active = (params.tipo ?? "") === filter.value;
          return (
            <Link
              key={filter.value || "todos"}
              href={
                filter.value
                  ? `/panel/anuncios?tipo=${filter.value}`
                  : "/panel/anuncios"
              }
              className={cn(
                "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-bold transition",
                active
                  ? "border-pacha-800 bg-pacha-800 text-white"
                  : "border-pacha-900/12 bg-white text-ink/60 hover:border-pacha-600 hover:text-pacha-900",
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <p className="mt-2 text-xs text-ink/45">
        {announcements.length}{" "}
        {announcements.length === 1 ? "publicación" : "publicaciones"}
      </p>

      {announcements.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              href={`/panel/anuncios/${announcement.id}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-5"
          icon={<Megaphone className="h-5 w-5" />}
          title="No hay anuncios con este filtro"
          description="Prueba con otro tipo de publicación o revisa más tarde."
        />
      )}
    </div>
  );
}
