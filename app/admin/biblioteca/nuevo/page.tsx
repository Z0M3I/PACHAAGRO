import type { Metadata } from "next";
import { requireAdminPanel } from "@/lib/auth/session";
import {
  getContentCategories,
  getCrops,
  getDepartments,
} from "@/services/reference";
import { ContentForm } from "@/features/admin/components/content-form";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Nuevo contenido" };

export default async function NewContentPage() {
  await requireAdminPanel("/admin/biblioteca/nuevo");
  const [categories, crops, departments] = await Promise.all([
    getContentCategories(),
    getCrops(),
    getDepartments(),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Biblioteca educativa"
        title="Nuevo contenido"
        description="Redacta con lenguaje claro. Incluye una nota de fuente y evita presentar recomendaciones generales como instrucciones oficiales."
      />
      <Card>
        <CardBody>
          <ContentForm
            categories={categories}
            crops={crops}
            departments={departments}
          />
        </CardBody>
      </Card>
    </div>
  );
}
