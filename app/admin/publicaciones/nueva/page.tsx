import type { Metadata } from "next";
import { requireAdminPanel } from "@/lib/auth/session";
import {
  getCommunities,
  getCrops,
  getDepartments,
  getMunicipalities,
} from "@/services/reference";
import { AnnouncementForm } from "@/features/admin/components/announcement-form";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Nueva publicación" };

export default async function NewAnnouncementPage() {
  await requireAdminPanel("/admin/publicaciones/nueva");
  const [departments, municipalities, communities, crops] = await Promise.all([
    getDepartments(),
    getMunicipalities(),
    getCommunities(),
    getCrops(),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Centro de comunicación"
        title="Nueva publicación"
        description="Define el tipo, el alcance y la vigencia. El contenido se mostrará según la ubicación y los cultivos de cada productor."
      />
      <Card>
        <CardBody>
          <AnnouncementForm
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
