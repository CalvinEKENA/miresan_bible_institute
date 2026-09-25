import { Eyebrow } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { MISSION, VALUES, VISION } from "@/data/institution";

/** Texte dont chaque mot « prend l'encre » au fil du scroll (CSS scroll-driven). */
function InkText({ text }: { text: string }) {
  return (
    <span className="scroll-ink">
      {text.split(" ").map((word, i) => (
        <span key={i}>{word} </span>
      ))}
    </span>
  );
}

export function Manifesto() {
  return (
    <section id="institut" aria-labelledby="vision-title" className="paper-grain section-y bg-ivory-50">
      <div className="container-wide grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Eyebrow rule>L’Institut · Vision</Eyebrow>
          <p className="mt-6 max-w-[16rem] text-sm leading-relaxed text-text-muted">
            Établissement privé confessionnel d’enseignement biblique, théologique et ministériel, à Yaoundé.
          </p>
        </div>
        <h2 id="vision-title" className="font-display text-[clamp(1.9rem,1.2rem+3.2vw,4.4rem)] leading-[1.06] lg:col-span-9">
          <InkText text={VISION} />
        </h2>
      </div>

      <div className="container-wide mt-20 grid gap-12 border-t border-line pt-12 lg:mt-28 lg:grid-cols-12">
        <Reveal className="lg:col-span-3">
          <Eyebrow>Mission</Eyebrow>
        </Reveal>
        <Reveal delay={80} className="lg:col-span-5">
          <p className="font-display text-3xl leading-tight">{MISSION}</p>
        </Reveal>
        <Reveal delay={160} className="text-text-soft lg:col-span-4">
          <p>
            L’Institut conjugue l’étude rigoureuse des Écritures, la formation du caractère et l’apprentissage pratique du
            ministère, afin que chaque étudiant serve avec fidélité là où Dieu l’envoie.
          </p>
        </Reveal>
      </div>

      <div className="container-wide mt-20 lg:mt-24">
        <Reveal>
          <Eyebrow>Nos valeurs</Eyebrow>
        </Reveal>
        <ol className="mt-8 grid border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v, i) => (
            <Reveal as="li" key={v.title} delay={i * 60} className="group border-b border-line py-7 sm:odd:pr-8 lg:border-r lg:px-8 lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n+1)]:pl-0">
              <span className="numeric text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 font-display text-2xl">{v.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{v.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
