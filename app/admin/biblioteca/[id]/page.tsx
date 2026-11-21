import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminPanel } from "@/lib/auth/session";
import { getContentById } from "@/services/education";
import {
  getContentCategories,
  getCrops,
  getDepartments,
} from "@/services/reference";
import { ContentForm } from "@/features/admin/components/content-form";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Editar contenido" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContentPage({ params }: PageProps) {
  await requireAdminPanel("/admin/biblioteca");
  const { id } = await params;
  const [content, categories, crops, departments] = await Promise.all([
    getContentById(id),
    getContentCategories(),
    getCrops(),
    getDepartments(),
  ]);

  if (!content) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Biblioteca educativa"
        title="Editar contenido"
        description={content.title}
      />
      <Card>
        <CardBody>
          <ContentForm
            initial={content}
            categories={categories}
            crops={crops}
            departments={departments}
          />
        </CardBody>
      </Card>
    </div>
  );
}
