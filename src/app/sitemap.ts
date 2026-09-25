import type { MetadataRoute } from "next";
import { PREVIEW_MODE, SITE_URL } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  if (PREVIEW_MODE) return [];
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/programme`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
}
