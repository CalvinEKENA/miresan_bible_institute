import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Hors ligne", robots: { index: false } };

export default function OfflinePage() {
  return (
    <section className="grid min-h-dvh place-items-center bg-forest-900 px-6 pt-[var(--header-height)] text-center text-ivory-50">
      <div className="max-w-md">
        <p className="eyebrow text-gold-300">Connexion interrompue</p>
        <h1 className="font-display mt-5 text-5xl">Vous êtes hors ligne.</h1>
        <p className="mt-5 text-ivory-50/70">
          Les pages déjà consultées restent accessibles. Vos lectures et réponses seront synchronisées dès le retour du réseau.
        </p>
        <ButtonLink href="/campus" variant="gold" className="mt-8" arrow>
          Réessayer
        </ButtonLink>
      </div>
    </section>
  );
}
