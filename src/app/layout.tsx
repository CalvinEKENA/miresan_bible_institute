import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Newsreader } from "next/font/google";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { PREVIEW_MODE, SITE_URL } from "@/lib/env";
import "./globals.css";

// Sous-ensemble « latin » uniquement : il couvre le français (é, è, ç, œ, « », ’).
// L'axe optique (opsz) est volontairement omis : il double le poids des fichiers.
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Institut Biblique de la MIRESAN — Découvrir • Développer • Déployer",
    template: "%s · IB-MIRESAN",
  },
  description:
    "Institut Biblique de la MIRESAN (MIRESAN Bible Institute), Yaoundé : formation biblique, théologique et ministérielle en deux ans. Découvrir • Développer • Déployer.",
  applicationName: "IB-MIRESAN",
  keywords: ["institut biblique", "théologie", "Yaoundé", "Cameroun", "formation ministérielle", "MIRESAN", "école biblique"],
  authors: [{ name: "Institut Biblique de la MIRESAN" }],
  openGraph: {
    type: "website",
    locale: "fr_CM",
    siteName: "Institut Biblique de la MIRESAN",
  },
  formatDetection: { telephone: false },
  ...(PREVIEW_MODE ? { robots: { index: false, follow: false, googleBot: { index: false, follow: false } } } : {}),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b2a1f" },
    { media: "(prefers-color-scheme: dark)", color: "#06110c" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${newsreader.variable} ${hanken.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-dvh">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-(--z-toast) focus:rounded-sm focus:bg-gold-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-900"
        >
          Aller au contenu
        </a>
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
