import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminPanel } from "@/lib/auth/session";
import { getAnnouncementById } from "@/services/announcements";
import {
  getCommunities,
  getCrops,
  getDepartments,
  getMunicipalities,
} from "@/services/reference";
import { AnnouncementForm } from "@/features/admin/components/announcement-form";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Editar publicación" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAnnouncementPage({ params }: PageProps) {
  await requireAdminPanel("/admin/publicaciones");
  const { id } = await params;
  const [announcement, departments, municipalities, communities, crops] =
    await Promise.all([
      getAnnouncementById(id),
      getDepartments(),
      getMunicipalities(),
      getCommunities(),
      getCrops(),
    ]);

  if (!announcement) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Centro de comunicación"
        title="Editar publicación"
        description={announcement.title}
      />
      <Card>
        <CardBody>
          <AnnouncementForm
            initial={announcement}
            departments={departments}
            municipalities={municipalities}
            communities={communities}
            crops={crops}
          />
        </CardBody>
      </Card>
    </div>
  );
}
