import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { listAnnouncements } from "@/services/announcements";
import { listEducationalContents } from "@/services/education";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [announcements, contents] = await Promise.all([
    listAnnouncements({ limit: 100 }),
    listEducationalContents({ limit: 100 }),
  ]);

  const staticRoutes = [
    "",
    "/alertas",
    "/biblioteca",
    "/whatsapp",
    "/cobertura",
    "/privacidad",
    "/terminos",
    "/login",
    "/registro",
  ].map((path) => ({
    url: `${env.appUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  return [
    ...staticRoutes,
    ...announcements.map((item) => ({
      url: `${env.appUrl}/alertas/${item.slug}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...contents.map((item) => ({
      url: `${env.appUrl}/biblioteca/${item.slug}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
