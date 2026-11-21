import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getMeetingById } from "@/services/meetings";
import {
  getCommunities,
  getCrops,
  getDepartments,
  getMunicipalities,
} from "@/services/reference";
import { MeetingForm } from "@/features/admin/components/meeting-form";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Editar reunión" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMeetingPage({ params }: PageProps) {
  await requireAdmin("/admin/reuniones");
  const { id } = await params;
  const [meeting, departments, municipalities, communities, crops] =
    await Promise.all([
      getMeetingById(id),
      getDepartments(),
      getMunicipalities(),
      getCommunities(),
      getCrops(),
    ]);

  if (!meeting) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Comunidad"
        title="Editar reunión"
        description={meeting.title}
      />
      <Card>
        <CardBody>
          <MeetingForm
            initial={meeting}
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
