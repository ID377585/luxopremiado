import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  const routes = [
    "",
    "/rifas",
    "/sorteios",
    "/leiloes",
    "/privacidade",
    "/termos",
    "/sobre",
    "/contato",
    "/r/bigode-das-rifas",
  ];

  const now = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency:
      route === "" || route === "/rifas" || route === "/r/bigode-das-rifas"
        ? "daily"
        : "weekly",
    priority:
      route === ""
        ? 1
        : route === "/r/bigode-das-rifas"
          ? 0.95
          : route === "/rifas"
            ? 0.9
            : route === "/privacidade" || route === "/termos"
              ? 0.5
              : 0.7,
  }));
}