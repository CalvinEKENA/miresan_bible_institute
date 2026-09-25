import type { MetadataRoute } from "next";
import { PREVIEW_MODE, SITE_URL } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  // Preview client : aucune indexation.
  if (PREVIEW_MODE) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/campus", "/enseignant", "/admin", "/connexion", "/verifier"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
