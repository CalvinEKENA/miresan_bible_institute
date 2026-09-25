import { Logo, Monogram, Rays } from "@/components/brand/brand";
import { PillarLegend, ProgrammeToc } from "@/components/public/programme-toc";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { OFFICIAL_COURSES } from "@/data/catalog";
import { GOVERNANCE, SLOGANS } from "@/data/institution";
import { capitalize, formatHHmm, formatXAF, initials, weekdayName } from "@/domain/format";
import { type InstitutionSettings } from "@/domain/types";

/* ── Chiffres clés : réels, jamais arbitraires ─────────────────────────── */
export function KeyFacts({ settings }: { settings: InstitutionSettings }) {
  const facts = [
    { value: "2", label: "années de formation", note: "Diplôme de Théologie" },
    { value: "3", label: "trimestres par année", note: "D’octobre à juillet" },
    { value: String(OFFICIAL_COURSES.length), label: "enseignements", note: "18 par année" },
    { value: String(settings.schedule.length), label: "journées de cours", note: settings.schedule.map((s) => capitalize(weekdayName(s.weekday))).join(" & ") },
  ];
  return (
    <section aria-label="L’Institut en chiffres" className="border-y border-line bg-paper-raised">
      <dl className="container-wide grid grid-cols-2 lg:grid-cols-4">
        {facts.map((f, i) => (
          <Reveal key={f.label} delay={i * 70} className="border-line py-8 odd:border-r lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 [&:nth-child(-n+2)]:border-b lg:[&:nth-child(-n+2)]:border-b-0 even:pl-5 lg:even:pl-8">
            <dt className="sr-only">{f.label}</dt>
            <dd>
              <span className="font-display numeric block text-[clamp(3rem,2rem+3vw,4.8rem)] leading-none">{f.value}</span>
              <span className="mt-3 block font-semibold">{f.label}</span>
              <span className="mt-0.5 block text-sm text-text-muted">{f.note}</span>
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}

/* ── Programme (table des matières) ────────────────────────────────────── */
export function ProgrammeSection() {
  return (
    <section id="programme" aria-labelledby="programme-title" className="section-y bg-ivory-50">
      <div className="container-wide">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Eyebrow rule>Programme · Diplôme de Théologie</Eyebrow>
            <h2 id="programme-title" className="font-display mt-6 text-5xl">
              Les <em className="text-accent">enseignements</em>
            </h2>
          </Reveal>
          <Reveal delay={100} className="flex flex-col justify-end gap-6 lg:col-span-6 lg:col-start-7">
            <p className="text-lg text-text-soft">
              Trente-six cours répartis sur deux années : les Écritures, la doctrine, les langues, la vie de l’Église et la
              pratique du ministère. Chaque enseignement se rattache à l’un des trois piliers de la devise.
            </p>
            <PillarLegend />
          </Reveal>
        </div>
        <Reveal delay={120} className="mt-14">
          <ProgrammeToc courses={OFFICIAL_COURSES} />
        </Reveal>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
          <p className="max-w-xl text-sm text-text-muted">
            La répartition des cours par trimestre est fixée par la Direction des études. L’offre de formation pourra
            s’élargir à d’autres cycles et certificats.
          </p>
          <ButtonLink href="/programme" variant="outline" arrow>
            Programme détaillé
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/* ── Formez-vous pour servir ───────────────────────────────────────────── */
export function AudienceSection({ settings }: { settings: InstitutionSettings }) {
  return (
    <section aria-labelledby="audience-title" className="relative isolate overflow-hidden bg-forest-900 text-ivory-50 section-y">
      <div aria-hidden className="absolute top-1/2 left-1/2 -z-10 size-[70rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.12]">
        <Rays className="size-full" count={96} />
      </div>
      <div className="container-wide">
        <Reveal>
          <Eyebrow className="text-gold-300" rule>
            Pour qui ?
          </Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <h2 id="audience-title" className="font-display mt-6 max-w-5xl text-[clamp(2.4rem,1.3rem+4.6vw,6rem)] leading-[0.98]">
            Formez-vous pour servir <em className="text-gold-300">Dieu</em> et son Église.
          </h2>
        </Reveal>
        <Reveal delay={160} className="mt-12 max-w-5xl">
          <p className="font-display text-[clamp(1.35rem,1rem+1.2vw,2rem)] leading-[1.5] text-ivory-50/85">
            {settings.audiences.map((a, i) => (
              <span key={a}>
                {a}
                {i < settings.audiences.length - 1 && <span aria-hidden className="mx-3 inline-block size-1.5 -translate-y-1 rounded-full bg-gold-500 align-middle" />}
              </span>
            ))}
          </p>
        </Reveal>
        <Reveal delay={220} className="mt-14 flex flex-wrap gap-4">
          <p className="eyebrow max-w-md text-ivory-50/60">Une formation flexible pour ceux qui servent déjà.</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Vie académique ────────────────────────────────────────────────────── */
export function AcademicLifeSection({ settings }: { settings: InstitutionSettings }) {
  const scheduleNotice = settings.notices.find((n) => n.id === "thursday-hours");
  const blocks = [
    {
      title: "Trois trimestres",
      text: "L’année académique court généralement d’octobre à juillet. Chaque trimestre se clôt par une session d’examens.",
    },
    {
      title: "Évaluation sur 20",
      text: `Contrôle continu et examen de fin de trimestre. Une matière est validée à partir de ${settings.grading.passMark}/${settings.grading.scale} ; une session de rattrapage est prévue.`,
    },
    {
      title: "Assiduité",
      text: `Au-delà de ${Math.round(settings.attendance.maxAbsenceRate * 100)} % d’absences dans une matière, l’accès à l’examen est refusé. ${settings.attendance.latesPerAbsence} retards non justifiés valent une absence.`,
    },
    {
      title: "Tenue",
      text: "Le nœud papillon distingue les promotions : bleu en première année, vert en deuxième année.",
    },
  ];
  return (
    <section id="vie-academique" aria-labelledby="academic-title" className="section-y bg-ivory-100">
      <div className="container-wide grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <Eyebrow rule>Vie académique</Eyebrow>
            <h2 id="academic-title" className="font-display mt-6 text-5xl">
              Un rythme pensé pour ceux qui <em className="text-accent">servent déjà</em>.
            </h2>
          </Reveal>

          <Reveal delay={120} className="mt-10 rounded-md bg-forest-800 p-7 text-ivory-50 shadow-lifted">
            <p className="eyebrow text-gold-300">Horaires des cours</p>
            <ul className="mt-5 divide-y divide-ivory-50/10">
              {settings.schedule.map((slot) => (
                <li key={slot.id} className="flex items-baseline justify-between gap-4 py-3">
                  <span className="font-display text-2xl">{capitalize(weekdayName(slot.weekday))}</span>
                  <span className="numeric text-lg text-gold-100">
                    {formatHHmm(slot.start)} – {formatHHmm(slot.end)}
                  </span>
                </li>
              ))}
            </ul>
            {scheduleNotice && <p className="mt-4 text-xs leading-relaxed text-ivory-50/55">Horaires susceptibles d’ajustement : se référer aux communications du secrétariat.</p>}
          </Reveal>
        </div>

        <ol className="grid gap-x-10 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
          {blocks.map((b, i) => (
            <Reveal as="li" key={b.title} delay={i * 80} className="border-t border-line-strong py-8">
              <span className="font-display text-sm text-accent italic">§ {i + 1}</span>
              <h3 className="font-display mt-2 text-2xl">{b.title}</h3>
              <p className="mt-3 text-text-soft">{b.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Formation ministérielle ───────────────────────────────────────────── */
export function MinistrySection() {
  return (
    <section aria-labelledby="ministry-title" className="section-y bg-ivory-50">
      <div className="container-wide">
        <Reveal className="mx-auto max-w-5xl text-center">
          <Eyebrow className="justify-center">Formation ministérielle</Eyebrow>
          <h2 id="ministry-title" className="font-display mt-6 text-[clamp(2.2rem,1.2rem+4vw,5.2rem)] leading-[1.02]">
            De l’appel à l’équipement, <br className="hidden md:block" />
            de l’équipement au <em className="text-accent">déploiement</em>.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-md bg-line lg:grid-cols-3">
          {[
            {
              k: "Stage pratique",
              t: "Dans une Église locale ou une œuvre agréée, sous la responsabilité d’un encadrant. Il donne lieu à un rapport et à une attestation.",
            },
            {
              k: "Mémoire",
              t: "En deuxième année : un sujet validé au plus tard à la fin du premier trimestre, soutenu devant un jury d’au moins deux enseignants.",
            },
            {
              k: "Diplôme",
              t: "Attestation de fin de première année, relevés annuels, puis diplôme de l’Institut à l’issue du cycle.",
            },
          ].map((item, i) => (
            <Reveal key={item.k} delay={i * 90} className="bg-paper-raised p-8 lg:p-10">
              <span className="numeric font-display text-5xl text-gold-600/70">{["I", "II", "III"][i]}</span>
              <h3 className="font-display mt-6 text-2xl">{item.k}</h3>
              <p className="mt-3 text-text-soft">{item.t}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Gouvernance & enseignants ─────────────────────────────────────────── */
export function GovernanceSection() {
  return (
    <section aria-labelledby="governance-title" className="section-y border-t border-line bg-ivory-50">
      <div className="container-wide grid gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <Eyebrow rule>Gouvernance & enseignants</Eyebrow>
          <h2 id="governance-title" className="font-display mt-6 text-4xl">
            Une direction pastorale et académique.
          </h2>
          <p className="mt-5 text-text-soft">
            L’Institut est administré par un Conseil d’administration, un Conseil académique, une Direction générale, une
            Direction des études, une Direction administrative et financière et un Secrétariat académique.
          </p>
        </Reveal>
        <ul className="grid gap-px self-start overflow-hidden rounded-md bg-line sm:grid-cols-3 lg:col-span-8">
          {GOVERNANCE.map((g, i) => (
            <Reveal as="li" key={g.name} delay={i * 90} className="flex flex-col items-start bg-paper-raised p-7">
              <Monogram initials={initials(g.name)} size={68} />
              <p className="eyebrow mt-6 text-accent">{g.role}</p>
              <p className="font-display mt-2 text-xl leading-snug">{g.name}</p>
            </Reveal>
          ))}
          <li className="bg-paper-sunken p-7 text-sm text-text-muted sm:col-span-3">
            Le corps enseignant, composé de pasteurs et d’enseignants qualifiés, sera présenté prochainement.
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ── Admissions ────────────────────────────────────────────────────────── */
export function AdmissionsSection({ settings }: { settings: InstitutionSettings }) {
  const steps = [
    { t: "Prise de contact", d: "Par téléphone ou au secrétariat, pour recevoir le formulaire d’inscription." },
    { t: "Entretien préalable", d: "Un échange sur votre parcours, votre Église et votre appel." },
    { t: "Dépôt du dossier", d: "Pièces requises et frais d’inscription." },
    { t: "Rentrée", d: settings.academicYear.startLabel },
  ];
  return (
    <section id="admissions" aria-labelledby="admissions-title" className="section-y paper-grain bg-ivory-100">
      <div className="container-wide">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <Eyebrow rule>Admissions · {settings.academicYear.label}</Eyebrow>
            <h2 id="admissions-title" className="font-display mt-6 text-5xl">
              Prépare-toi pour le service, <em className="text-accent">Dieu a une œuvre pour toi</em>.
            </h2>
          </Reveal>
          <Reveal delay={100} className="self-end text-lg text-text-soft lg:col-span-5 lg:col-start-8">
            L’admission est ouverte à toute personne née de nouveau et membre active d’une Église locale. Elle passe par un
            entretien préalable.
          </Reveal>
        </div>

        <ol className="mt-16 grid gap-0 md:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 90} className="relative border-l border-line-strong pb-10 pl-7 md:border-t md:border-l-0 md:pt-8 md:pr-6 md:pl-0">
              <span aria-hidden className="absolute top-0 -left-[5px] size-[9px] rounded-full bg-gold-600 ring-4 ring-ivory-100 md:-top-[5px] md:left-0" />
              <span className="numeric text-xs font-semibold text-accent">Étape {i + 1}</span>
              <h3 className="font-display mt-2 text-2xl">{s.t}</h3>
              <p className="mt-2 text-sm text-text-muted">{s.d}</p>
            </Reveal>
          ))}
        </ol>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <Reveal className="rounded-md bg-paper-raised p-7 shadow-paper ring-1 ring-line lg:col-span-7 lg:p-9">
            <h3 className="eyebrow text-accent">Pièces du dossier</h3>
            <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {settings.admissionRequirements.map((r) => (
                <li key={r} className="flex gap-3 text-[0.9375rem]">
                  <svg aria-hidden viewBox="0 0 16 16" className="mt-1 size-3.5 shrink-0 text-forest-600">
                    <path d="M2 8.5 6 12l8-8" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100} className="rounded-md bg-forest-800 p-7 text-ivory-50 shadow-lifted lg:col-span-5 lg:p-9">
            <h3 className="eyebrow text-gold-300">Scolarité</h3>
            <ul className="mt-6 space-y-4">
              {settings.fees.map((fee) => (
                <li key={fee.id}>
                  <div className="flex items-baseline gap-3">
                    <span>{fee.label}</span>
                    <span aria-hidden className="leader text-ivory-50" />
                    <span className="numeric font-display text-xl text-gold-100">{formatXAF(fee.amount)}</span>
                  </div>
                  {fee.note && <p className="mt-1 text-xs text-ivory-50/55">{fee.note}</p>}
                </li>
              ))}
            </ul>
            <ButtonLink href="/#contact" variant="gold" arrow className="mt-8 w-full">
              Demander un entretien
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── Actualités ───────────────────────────────────────────────────────── */
export function NewsSection({ settings }: { settings: InstitutionSettings }) {
  const items = [
    { date: settings.academicYear.startLabel, tag: "Calendrier", title: "Rentrée académique", text: "Accueil de la nouvelle promotion au Complexe El Dorado, Nkomo." },
    { date: "Dès maintenant", tag: "Admissions", title: "Les inscriptions sont ouvertes", text: "Retirez votre formulaire au secrétariat et préparez les pièces du dossier." },
    { date: "Campus numérique", tag: "Institut", title: "Un espace d’étude en ligne", text: "Cours, leçons, évaluations et résultats bientôt accessibles depuis un téléphone." },
  ];
  return (
    <section id="actualites" aria-labelledby="news-title" className="section-y bg-ivory-50">
      <div className="container-wide">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <Eyebrow rule>Actualités</Eyebrow>
            <h2 id="news-title" className="font-display mt-6 text-5xl">
              À l’Institut
            </h2>
          </Reveal>
          <p className="font-display max-w-sm text-xl text-text-muted italic">« {SLOGANS[2]} »</p>
        </div>
        <ul className="mt-12 border-t border-line-strong">
          {items.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 80} className="group grid gap-3 border-b border-line py-8 md:grid-cols-12 md:items-baseline md:gap-8">
              <p className="numeric text-sm font-semibold text-accent md:col-span-3">{item.date}</p>
              <div className="md:col-span-6">
                <h3 className="font-display text-3xl transition-colors group-hover:text-forest-700">{item.title}</h3>
                <p className="mt-2 text-text-soft">{item.text}</p>
              </div>
              <p className="eyebrow text-text-muted md:col-span-3 md:text-right">{item.tag}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── Contact & appel final ─────────────────────────────────────────────── */
export function ContactSection({ settings, email }: { settings: InstitutionSettings; email: string }) {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Complexe El Dorado Nkomo Yaoundé")}`;
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative isolate overflow-hidden bg-forest-800 text-ivory-50 section-y">
      <div aria-hidden className="absolute -right-40 -bottom-40 -z-10 size-[44rem] opacity-[0.16]">
        <Rays className="size-full" />
      </div>
      <div className="container-wide grid gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <Eyebrow className="text-gold-300" rule>
            Contact
          </Eyebrow>
          <h2 id="contact-title" className="font-display mt-6 text-[clamp(2.6rem,1.4rem+4.2vw,5.6rem)] leading-[0.98]">
            Une vision. Une formation. <em className="text-gold-300">Un impact.</em>
          </h2>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={`tel:${settings.phones[0]?.replace(/\s/g, "") ?? ""}`} variant="gold" size="lg" arrow>
              Appeler le secrétariat
            </ButtonLink>
            <ButtonLink href="/connexion" variant="outline-light" size="lg">
              Espace étudiant
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-5 lg:col-start-8">
          <div className="flex items-center gap-4 border-b border-ivory-50/10 pb-8">
            <Logo size={72} className="size-[4.5rem] object-contain" />
            <p className="font-display text-xl leading-snug">
              {settings.englishName}
              <span className="block text-sm text-ivory-50/60 not-italic">{settings.address.city} — {settings.address.country}</span>
            </p>
          </div>
          <dl className="divide-y divide-ivory-50/10">
            <div className="grid grid-cols-3 gap-4 py-5">
              <dt className="eyebrow pt-1 text-gold-300/85">Adresse</dt>
              <dd className="col-span-2">
                {settings.address.line}
                <br />
                <TextLink href={maps} className="mt-2 text-gold-300" target="_blank" rel="noopener">
                  Itinéraire
                </TextLink>
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-4 py-5">
              <dt className="eyebrow pt-1 text-gold-300/85">Téléphone</dt>
              <dd className="col-span-2 space-y-1">
                {settings.phones.map((p) => (
                  <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="numeric block hover:text-gold-100">
                    {p}
                  </a>
                ))}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-4 py-5">
              <dt className="eyebrow pt-1 text-gold-300/85">E-mail</dt>
              <dd className="col-span-2 break-all">
                <a href={`mailto:${email}`} className="hover:text-gold-100">
                  {email}
                </a>
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-4 py-5">
              <dt className="eyebrow pt-1 text-gold-300/85">Web</dt>
              <dd className="col-span-2">{settings.website}</dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
