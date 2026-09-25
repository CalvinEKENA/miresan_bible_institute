import Link from "next/link";
import { Logo } from "@/components/brand/brand";
import { type InstitutionSettings } from "@/domain/types";
import { primaryEmail } from "@/data/public-settings";
import { PUBLIC_NAV } from "./nav";

export function SiteFooter({ settings }: { settings: InstitutionSettings }) {
  const email = primaryEmail(settings);
  return (
    <footer className="relative overflow-hidden bg-ink-950 text-ivory-50/75">
      <div className="container-wide pt-20 pb-10 md:pt-28">
        <p className="font-display text-[clamp(2.4rem,1rem+6.5vw,7rem)] leading-[0.92] text-ivory-50">
          Découvrir<span className="text-gold-500">.</span> Développer<span className="text-gold-500">.</span>{" "}
          <em className="text-gold-300">Déployer.</em>
        </p>

        <div className="mt-16 grid gap-12 border-t border-ivory-50/10 pt-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-4">
              <Logo size={64} className="size-16 object-contain" />
              <div>
                <p className="font-display text-xl text-ivory-50">{settings.name}</p>
                <p className="eyebrow mt-1 text-gold-300/80">
                  {settings.englishName} · {settings.acronym}
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed">{settings.legalCover}</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory-50/55">{settings.affiliation.wording}</p>
          </div>

          <nav aria-label="Pied de page" className="md:col-span-3">
            <p className="eyebrow text-gold-300/80">Explorer</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {PUBLIC_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-ivory-50">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/connexion" className="transition-colors hover:text-ivory-50">
                  Espace étudiant
                </Link>
              </li>
            </ul>
          </nav>

          <address className="not-italic md:col-span-4">
            <p className="eyebrow text-gold-300/80">Contact</p>
            <div className="mt-5 space-y-2.5 text-sm">
              <p>
                {settings.address.line}
                <br />
                {settings.address.city}, {settings.address.country}
              </p>
              {settings.phones.map((p) => (
                <p key={p}>
                  <a href={`tel:${p.replace(/\s/g, "")}`} className="numeric transition-colors hover:text-ivory-50">
                    {p}
                  </a>
                </p>
              ))}
              <p>
                <a href={`mailto:${email}`} className="transition-colors hover:text-ivory-50">
                  {email}
                </a>
              </p>
            </div>
          </address>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-ivory-50/10 pt-6 text-xs text-ivory-50/65 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.name}. Tous droits réservés.</p>
          <p>« Équipez le peuple de Dieu pour l’œuvre du ministère » — d’après Éphésiens 4:12</p>
        </div>
      </div>
    </footer>
  );
}
