import Link from "next/link";
import { OpenBible } from "@/components/brand/brand";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="contenu" className="relative grid min-h-dvh place-items-center overflow-hidden bg-forest-900 px-6 text-center text-ivory-50">
      <OpenBible className="pointer-events-none absolute bottom-[-6rem] left-1/2 w-[60rem] max-w-none -translate-x-1/2 opacity-60" />
      <div className="relative">
        <p className="eyebrow text-gold-300">Erreur 404</p>
        <h1 className="font-display mt-5 text-5xl">
          Cette page <em className="text-gold-300">n’est pas au programme</em>.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-ivory-50/70">Le lien est peut-être ancien, ou la page a été déplacée.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" variant="gold" arrow>
            Retour à l’accueil
          </ButtonLink>
          <ButtonLink href="/connexion" variant="outline-light">
            Espace étudiant
          </ButtonLink>
        </div>
        <p className="mt-10 text-sm text-ivory-50/50">
          <Link href="/programme" className="underline-offset-4 hover:underline">
            Consulter le programme
          </Link>
        </p>
      </div>
    </main>
  );
}
