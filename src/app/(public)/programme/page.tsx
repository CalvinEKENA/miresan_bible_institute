import type { Metadata } from "next";
import { Rays } from "@/components/brand/brand";
import { PillarLegend, ProgrammeToc } from "@/components/public/programme-toc";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/primitives";
import { OFFICIAL_COURSES } from "@/data/catalog";
import { THEOLOGY_DIPLOMA } from "@/data/institution";
import { getPublicSettings } from "@/data/public-settings";
import { PILLAR_LABELS, PILLARS } from "@/domain/types";

export const metadata: Metadata = {
  title: "Programme — Diplôme de Théologie",
  description:
    "Les 36 enseignements du Diplôme de Théologie de l’Institut Biblique de la MIRESAN : deux années, trois trimestres par an, stage pratique et mémoire.",
  alternates: { canonical: "/programme" },
};

export default async function ProgrammePage() {
  const settings = await getPublicSettings();
  return (
    <>
      <section className="relative isolate overflow-hidden bg-forest-900 pt-[calc(var(--header-height)+4rem)] pb-20 text-ivory-50 md:pb-28">
        <div aria-hidden className="absolute top-[-18rem] right-[-18rem] -z-10 size-[52rem] opacity-[0.18]">
          <Rays className="size-full" />
        </div>
        <div className="container-wide">
          <Eyebrow className="reveal text-gold-300" rule>
            Programme · {settings.academicYear.label}
          </Eyebrow>
          <h1 className="font-display reveal mt-6 max-w-4xl text-5xl [--reveal-delay:120]">
            {THEOLOGY_DIPLOMA.title.replace("Théologie", "")}
            <em className="text-gold-300">Théologie</em>
          </h1>
          <p className="reveal mt-6 max-w-2xl text-lg text-ivory-50/75 [--reveal-delay:220]">{THEOLOGY_DIPLOMA.description}</p>
          <dl className="reveal mt-12 grid max-w-3xl grid-cols-3 gap-6 border-t border-ivory-50/15 pt-8 [--reveal-delay:320]">
            {[
              ["2", "années"],
              ["3", "trimestres par an"],
              [String(OFFICIAL_COURSES.length), "enseignements"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd>
                  <span className="font-display numeric block text-5xl text-gold-100">{v}</span>
                  <span className="mt-1 block text-sm text-ivory-50/65">{l}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-y bg-ivory-50">
        <div className="container-wide">
          <div className="mb-14 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Eyebrow rule>Trois piliers</Eyebrow>
              <h2 className="font-display mt-5 text-4xl">Chaque cours sert la devise de l’Institut.</h2>
            </div>
            <ul className="grid gap-6 sm:grid-cols-3 lg:col-span-7">
              {PILLARS.map((p) => (
                <li key={p} className="border-t border-line-strong pt-4">
                  <p className="font-display text-2xl">{PILLAR_LABELS[p].label}</p>
                  <p className="mt-1 text-sm text-text-muted">
                    {OFFICIAL_COURSES.filter((c) => c.pillar === p).length} enseignements
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <PillarLegend className="mb-10" />
          <ProgrammeToc courses={OFFICIAL_COURSES} detailed />
          <p className="mt-12 max-w-3xl text-sm leading-relaxed text-text-muted">
            La répartition des cours par trimestre est fixée par la Direction des études ; celle présentée ici est provisoire.
            Les descriptions sont indicatives. L’Institut peut ouvrir d’autres cycles, certificats et formations courtes.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/#admissions" size="lg" arrow>
              Conditions d’admission
            </ButtonLink>
            <ButtonLink href="/#contact" variant="outline" size="lg">
              Nous contacter
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
