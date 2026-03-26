import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { getAllRaffleSlugs } from "@/lib/raffles-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  const staticRoutes = [
    "",
    "/rifas",
    "/sorteios",
    "/vip",
    "/privacidade",
    "/termos",
    "/sobre",
    "/contato",
  ];

  const raffleRoutes = getAllRaffleSlugs().map((slug) => `/r/${slug}`);
  const routes = [...staticRoutes, ...raffleRoutes];

  const now = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency:
      route === "" || route === "/rifas" || route.startsWith("/r/")
        ? "daily"
        : "weekly",
    priority:
      route === ""
        ? 1
        : route.startsWith("/r/")
          ? 0.95
          : route === "/rifas"
            ? 0.9
            : route === "/privacidade" || route === "/termos"
              ? 0.5
              : 0.7,
  }));
}