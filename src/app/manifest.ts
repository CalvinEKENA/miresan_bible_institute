import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Institut Biblique de la MIRESAN",
    short_name: "IB-MIRESAN",
    description: "Campus numérique de l’Institut Biblique de la MIRESAN — Découvrir • Développer • Déployer",
    lang: "fr",
    start_url: "/campus",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbf8f1",
    theme_color: "#0b2a1f",
    categories: ["education", "books"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
