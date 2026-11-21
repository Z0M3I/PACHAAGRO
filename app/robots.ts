import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/biblioteca", "/alertas", "/whatsapp", "/cobertura"],
        disallow: ["/panel", "/admin", "/api", "/auth"],
      },
    ],
    sitemap: `${env.appUrl}/sitemap.xml`,
  };
}
