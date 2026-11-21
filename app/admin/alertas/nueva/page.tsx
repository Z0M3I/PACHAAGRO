import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import {
  getCommunities,
  getDepartments,
  getMunicipalities,
} from "@/services/reference";
import { AlertForm } from "@/features/admin/components/alert-form";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Nueva alerta" };

export default async function NewAlertPage() {
  await requireAdmin("/admin/alertas/nueva");
  const [departments, municipalities, communities] = await Promise.all([
    getDepartments(),
    getMunicipalities(),
    getCommunities(),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Módulo meteorológico"
        title="Nueva alerta"
        description="La fuente es obligatoria. Si no hay información verificada, no cree la alerta."
      />
      <Card>
        <CardBody>
          <AlertForm
            departments={departments}
            municipalities={municipalities}
            communities={communities}
          />
        </CardBody>
      </Card>
    </div>
  );
}
