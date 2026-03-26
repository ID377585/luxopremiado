import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/rifas",
          "/sorteios",
          "/leiloes",
          "/r/",
          "/sobre",
          "/contato",
          "/privacidade",
          "/termos",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/app",
          "/app/",
          "/api/",
          "/login",
          "/checkout",
          "/checkout/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}