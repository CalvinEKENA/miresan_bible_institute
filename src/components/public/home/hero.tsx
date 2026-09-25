import { Logo, OpenBible, Rays } from "@/components/brand/brand";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { type InstitutionSettings } from "@/domain/types";

const MARGINALIA = [
  { ref: "Mt 28:19", text: "Allez, faites de toutes les nations des disciples", side: "left" as const },
  { ref: "2 Tm 2:2", text: "Confie-le à des hommes fidèles, capables de l’enseigner", side: "right" as const },
];

export function Hero({ settings }: { settings: InstitutionSettings }) {
  const ticker = [
    `Rentrée académique · ${settings.academicYear.startLabel}`,
    "Inscriptions ouvertes",
    "2 années · 3 trimestres · 36 enseignements",
    "Formation biblique · théologique · ministérielle",
    settings.tagline,
    `${settings.address.city} — ${settings.address.country}`,
  ];

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-forest-900 text-ivory-50">
      {/* Fond : lumière contrôlée, grain, colonnes de mise en page */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_78%_18%,rgb(20_80_57/0.9),transparent_60%),radial-gradient(90%_70%_at_50%_110%,rgb(156_122_46/0.28),transparent_60%),linear-gradient(180deg,#0b2a1f_0%,#0a2219_55%,#06110c_100%)]" />
        <div className="paper-grain absolute inset-0 opacity-60 mix-blend-soft-light" />
        <div className="container-wide absolute inset-0 hidden grid-cols-12 lg:grid">
          {[3, 6, 9].map((c) => (
            <span key={c} className="h-full border-r border-ivory-50/[0.045]" style={{ gridColumn: `${c} / span 1` }} />
          ))}
        </div>
      </div>

      <div className="container-wide relative pt-[calc(var(--header-height)+2.5rem)] md:pt-[calc(var(--header-height)+4.5rem)]">
        {/* Sceau et rayons */}
        <div
          aria-hidden
          className="parallax pointer-events-none absolute top-[calc(var(--header-height)-1rem)] right-[-30vw] size-[110vw] sm:right-[-12vw] sm:size-[70vw] lg:top-[calc(var(--header-height)-8rem)] lg:right-[-6rem] lg:size-[56rem]"
          style={{ "--parallax-distance": "10vh" } as React.CSSProperties}
        >
          <Rays className="size-full opacity-[0.22]" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 text-ivory-50/70">
          <p className="eyebrow reveal flex items-center gap-3 text-gold-300" style={{ "--reveal-delay": 80 } as React.CSSProperties}>
            <span aria-hidden className="h-px w-8 bg-current opacity-60" />
            Formation biblique · théologique · ministérielle
          </p>
          <p className="eyebrow reveal hidden text-ivory-50/60 md:block" style={{ "--reveal-delay": 160 } as React.CSSProperties}>
            {settings.address.city} — {settings.address.country}
          </p>
        </div>

        <div className="relative mt-10 md:mt-14">
          <div className="absolute top-1 right-0 animate-fade [animation-delay:400ms] lg:top-[-0.5rem] lg:right-[4%]">
            <div className="relative grid place-items-center">
              <span aria-hidden className="absolute size-[160%] rounded-full bg-[radial-gradient(circle,rgb(226_202_143/0.32),transparent_65%)]" />
              <Logo size={220} priority className="relative size-[5.5rem] object-contain drop-shadow-[0_20px_40px_rgb(0_0_0/0.35)] sm:size-32 lg:size-[12.5rem]" />
            </div>
          </div>

          <h1 id="hero-title" className="font-display text-display max-w-[14ch] pr-24 sm:pr-40 lg:max-w-none lg:pr-0">
            <span className="reveal block" style={{ "--reveal-delay": 120 } as React.CSSProperties}>
              Institut <span className="block sm:inline">biblique</span>
            </span>
            <span className="reveal block sm:pl-[0.9em]" style={{ "--reveal-delay": 260 } as React.CSSProperties}>
              de la <em className="font-[360] text-gold-300">Miresan</em>
            </span>
          </h1>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          <div className="reveal lg:col-span-4" style={{ "--reveal-delay": 420 } as React.CSSProperties}>
            <p className="eyebrow text-ivory-50/80">
              {settings.englishName} <span className="text-gold-300/80">({settings.acronym})</span>
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-x-3 font-display text-2xl text-gold-100 italic">
              {settings.motto.map((word, i) => (
                <span key={word} className="flex items-center gap-3">
                  {i > 0 && <span aria-hidden className="size-1.5 rounded-full bg-gold-500 not-italic" />}
                  {word}
                </span>
              ))}
            </p>
          </div>

          <p className="reveal max-w-xl text-[1.0625rem] leading-relaxed text-ivory-50/78 lg:col-span-4 lg:col-start-6" style={{ "--reveal-delay": 520 } as React.CSSProperties}>
            Une école de formation de la Bible, de théologie, des ministères et du leadership chrétien, pour celles et ceux qui
            désirent approfondir leur connaissance de la Parole de Dieu et développer leurs capacités ministérielles.
          </p>

          <div className="reveal flex flex-col items-start gap-3 lg:col-span-3 lg:col-start-10" style={{ "--reveal-delay": 620 } as React.CSSProperties}>
            <ButtonLink href="/#admissions" variant="gold" size="lg" arrow className="w-full sm:w-auto lg:w-full">
              Commencer ma formation
            </ButtonLink>
            <ButtonLink href="/#institut" variant="outline-light" size="lg" className="w-full sm:w-auto lg:w-full">
              Découvrir l’Institut
            </ButtonLink>
            <TextLink href="/programme" className="mt-2 text-gold-300">
              Explorer les enseignements
            </TextLink>
          </div>
        </div>
      </div>

      {/* Bible ouverte, lumière du savoir */}
      <div className="relative mt-10 md:mt-6">
        <div className="relative mx-auto max-w-[78rem] px-4">
          <OpenBible className="reveal mx-auto w-full [--reveal-delay:500]" />
          {MARGINALIA.map((m) => (
            <p
              key={m.ref}
              className={`reveal absolute top-[18%] hidden max-w-[13rem] font-display text-sm leading-snug text-ivory-50/60 italic xl:block ${
                m.side === "left" ? "left-0 text-right" : "right-0"
              }`}
              style={{ "--reveal-delay": 900 } as React.CSSProperties}
            >
              <span className="eyebrow mb-1.5 block text-[0.625rem] text-gold-300/85 not-italic">{m.ref}</span>« {m.text} »
            </p>
          ))}
        </div>
      </div>

      {/* Bandeau défilant */}
      <div className="relative border-t border-ivory-50/10 bg-ink-950/40 py-4 text-ivory-50/75">
        <div className="flex w-max animate-ticker motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
              {ticker.map((item) => (
                <li key={item} className="flex items-center gap-8 pr-8 text-[0.8125rem] font-medium tracking-[0.04em] whitespace-nowrap">
                  <span aria-hidden className="text-gold-500">✦</span>
                  {item}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
