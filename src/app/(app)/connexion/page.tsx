import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Logo, Rays } from "@/components/brand/brand";
import { LoginForm } from "@/components/auth/login-form";
import { getPublicSettings, primaryEmail } from "@/data/public-settings";
import { DATA_MODE } from "@/lib/env";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Accéder à l’espace numérique de l’Institut Biblique de la MIRESAN.",
};

export default async function LoginPage() {
  const settings = await getPublicSettings();
  return (
    <main id="contenu" className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-forest-900 text-ivory-50">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgb(27_102_71/0.55),transparent_70%),radial-gradient(70%_50%_at_50%_100%,rgb(156_122_46/0.22),transparent_70%),linear-gradient(#0b2a1f,#06110c)]" />
        <div className="absolute top-[-22rem] left-1/2 size-[62rem] -translate-x-1/2 opacity-[0.2] sm:top-[-26rem] sm:size-[74rem]">
          <Rays className="size-full" />
        </div>
        <div className="paper-grain absolute inset-0 opacity-50 mix-blend-soft-light" />
      </div>

      <header className="container-wide flex h-(--header-height) items-center justify-between">
        <Link href="/" className="group flex items-center gap-2 text-sm text-ivory-50/70 transition-colors hover:text-ivory-50">
          <svg aria-hidden viewBox="0 0 20 10" className="h-2.5 w-5 transition-transform group-hover:-translate-x-1">
            <path d="M20 5H2M6 1 2 5l4 4" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          Retour au site
        </Link>
        <p className="eyebrow hidden text-gold-300/80 sm:block">Campus numérique</p>
      </header>

      <div className="flex flex-1 items-start justify-center px-4 pt-6 pb-12 sm:items-center sm:pt-2">
        <div className="reveal w-full max-w-[27rem]">
          {/* Arche : l'entrée de l'Institut */}
          <div className="relative rounded-t-[14rem] rounded-b-md bg-ivory-50 text-ink-900 shadow-overlay">
            <div aria-hidden className="pointer-events-none absolute inset-2 rounded-t-[13.5rem] rounded-b-sm border border-gold-500/35" />
            <div className="relative px-6 pt-10 pb-8 sm:px-10 sm:pt-12">
              <div className="flex flex-col items-center text-center">
                <Logo size={96} priority className="size-[5.5rem] object-contain" />
                <p className="eyebrow mt-5 text-gold-800">Institut Biblique de la MIRESAN</p>
                <h1 className="font-display mt-3 text-[2.35rem] leading-[1.02]">
                  Entrer dans <em className="text-forest-700">l’Institut</em>
                </h1>
              </div>
              <Suspense>
                <LoginForm demo={DATA_MODE === "demo"} phones={settings.phones} email={primaryEmail(settings)} />
              </Suspense>
            </div>
          </div>
          <p className="font-display mt-8 flex items-center justify-center gap-3 text-center text-lg text-gold-100/80 italic">
            {settings.motto.map((w, i) => (
              <span key={w} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden className="size-1 rounded-full bg-gold-500" />}
                {w}
              </span>
            ))}
          </p>
        </div>
      </div>
    </main>
  );
}
