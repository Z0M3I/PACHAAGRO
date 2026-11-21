import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import {
  getCommunities,
  getCrops,
  getDepartments,
  getMunicipalities,
} from "@/services/reference";
import { MeetingForm } from "@/features/admin/components/meeting-form";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Nueva reunión" };

export default async function NewMeetingPage() {
  await requireAdmin("/admin/reuniones/nueva");
  const [departments, municipalities, communities, crops] = await Promise.all([
    getDepartments(),
    getMunicipalities(),
    getCommunities(),
    getCrops(),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Comunidad"
        title="Nueva reunión"
        description="Define fecha, lugar y alcance. Si es virtual, el enlace debe usar https."
      />
      <Card>
        <CardBody>
          <MeetingForm
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
