import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getWeatherAlertById } from "@/services/weather-alerts";
import {
  getCommunities,
  getDepartments,
  getMunicipalities,
} from "@/services/reference";
import { AlertForm } from "@/features/admin/components/alert-form";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Editar alerta" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAlertPage({ params }: PageProps) {
  await requireAdmin("/admin/alertas");
  const { id } = await params;
  const [alert, departments, municipalities, communities] = await Promise.all([
    getWeatherAlertById(id),
    getDepartments(),
    getMunicipalities(),
    getCommunities(),
  ]);

  if (!alert) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Módulo meteorológico"
        title="Editar alerta"
        description={alert.title}
      />
      <Card>
        <CardBody>
          <AlertForm
            initial={alert}
            departments={departments}
            municipalities={municipalities}
            communities={communities}
          />
        </CardBody>
      </Card>
    </div>
  );
}
