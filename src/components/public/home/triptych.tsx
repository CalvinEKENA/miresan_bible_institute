import { PillarGlyph } from "@/components/brand/brand";
import { OFFICIAL_COURSES } from "@/data/catalog";
import { type Pillar, PILLAR_LABELS } from "@/domain/types";
import { cn } from "@/lib/cn";

const PANELS: {
  pillar: Pillar;
  lead: string;
  text: string;
  verse: { ref: string; text: string };
  tone: string;
  muted: string;
  accent: string;
}[] = [
  {
    pillar: "discover",
    lead: "Entrer dans l’Écriture.",
    text: "Connaître la Parole de Dieu dans son ensemble : ses livres, son histoire, ses coutumes et son message. Tout ministère commence par une rencontre attentive avec le texte.",
    verse: { ref: "Psaume 119:105", text: "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier." },
    tone: "bg-ivory-100 text-ink-900",
    muted: "text-stone-500",
    accent: "text-gold-700",
  },
  {
    pillar: "develop",
    lead: "Grandir en profondeur.",
    text: "Approfondir la doctrine, former le caractère, acquérir les langues et les outils du serviteur. La connaissance devient maturité.",
    verse: { ref: "2 Pierre 3:18", text: "Croissez dans la grâce et dans la connaissance de notre Seigneur et Sauveur Jésus-Christ." },
    tone: "bg-sage-200 text-ink-900",
    muted: "text-forest-800/70",
    accent: "text-forest-700",
  },
  {
    pillar: "deploy",
    lead: "Servir avec compétence.",
    text: "Prêcher, conduire, accompagner, administrer, implanter : être envoyé là où Dieu appelle, avec un stage pratique et un mémoire de fin de cycle.",
    verse: { ref: "Matthieu 28:19", text: "Allez, faites de toutes les nations des disciples." },
    tone: "bg-forest-800 text-ivory-50",
    muted: "text-ivory-50/65",
    accent: "text-gold-300",
  },
];

export function Triptych() {
  return (
    <section aria-label="Découvrir, développer, déployer" className="relative bg-ivory-50">
      {PANELS.map((panel, i) => {
        const { label, numeral } = PILLAR_LABELS[panel.pillar];
        const courses = OFFICIAL_COURSES.filter((c) => c.pillar === panel.pillar);
        const names = [...new Set(courses.map((c) => c.title.replace(/^Théologie \d : /, "")))];
        return (
          <article
            key={panel.pillar}
            className={cn(
              "relative overflow-hidden border-t border-black/5 md:sticky md:min-h-[82svh] md:rounded-t-[1.75rem]",
              panel.tone,
              i > 0 && "md:-mt-8 md:shadow-[0_-20px_50px_-30px_rgb(6_17_12/0.28)]",
            )}
            style={{ top: `calc(var(--header-height) + ${i * 1.5}rem)` }}
          >
            <div className="container-wide grid gap-10 py-16 md:py-20 lg:grid-cols-12 lg:gap-8 lg:py-24">
              <div className="lg:col-span-6">
                <p className={cn("eyebrow flex items-center gap-3", panel.accent)}>
                  <PillarGlyph pillar={panel.pillar} className="size-5" />
                  Pilier {numeral} / III
                </p>
                <h2 className="font-display mt-6 text-[clamp(3.4rem,1.5rem+8vw,9.5rem)] leading-[0.86]">
                  {label}
                  <span className={panel.accent}>.</span>
                </h2>
                <p className="font-display mt-6 text-3xl italic">{panel.lead}</p>
              </div>

              <div className="flex flex-col justify-end lg:col-span-5 lg:col-start-8">
                <p className="text-lg leading-relaxed">{panel.text}</p>
                <blockquote className={cn("mt-8 border-l pl-5", panel.pillar === "deploy" ? "border-gold-500/60" : "border-current/25")}>
                  <p className="font-display text-xl italic">« {panel.verse.text} »</p>
                  <footer className={cn("eyebrow mt-2", panel.muted)}>{panel.verse.ref}</footer>
                </blockquote>
                <div className="mt-10">
                  <p className={cn("eyebrow", panel.muted)}>
                    Dans le cursus · {courses.length} enseignements
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-1.5 text-sm">
                    {names.slice(0, 7).map((name, j) => (
                      <li key={name} className="flex items-center gap-2">
                        {j > 0 && <span aria-hidden className="size-1 rounded-full bg-current opacity-40" />}
                        {name}
                      </li>
                    ))}
                    <li className={panel.muted}>…</li>
                  </ul>
                </div>
              </div>
            </div>
            <span
              aria-hidden
              className={cn("font-display pointer-events-none absolute right-[-0.05em] bottom-[-0.22em] text-[clamp(10rem,30vw,26rem)] leading-none opacity-[0.06] select-none")}
            >
              {numeral}
            </span>
          </article>
        );
      })}
    </section>
  );
}
