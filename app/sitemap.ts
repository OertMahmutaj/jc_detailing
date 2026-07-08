import type { MetadataRoute } from "next";
import { serviceItems } from "./data/site";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jcdetailing.ch";

function absoluteUrl(path: string) {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes = [
    {
      path: "/",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      path: "/leistungen",
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      path: "/angebote/de",
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      path: "/gallery",
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      path: "/buchen",
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      path: "/impressum",
      changeFrequency: "yearly",
      priority: 0.25,
    },
    {
      path: "/datenschutz",
      changeFrequency: "yearly",
      priority: 0.25,
    },
    {
      path: "/agb",
      changeFrequency: "yearly",
      priority: 0.25,
    },
  ] as const;

  const serviceRoutes = serviceItems.map((service) => ({
    path: service.path,
    changeFrequency: "monthly",
    priority: 0.85,
  })) as Array<{
    path: string;
    changeFrequency: "monthly";
    priority: number;
  }>;

  const routes = [...staticRoutes, ...serviceRoutes];

  const uniqueRoutes = Array.from(
    new Map(routes.map((route) => [route.path, route])).values(),
  );

  return uniqueRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
