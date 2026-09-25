"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PillarGlyph } from "@/components/brand/brand";
import { Icon, type IconName } from "@/components/ui/icons";
import { DemoNotice } from "@/components/ui/primitives";
import { saveLessonProgress } from "@/data/repositories";
import { getStore } from "@/data/store";
import { invalidate } from "@/data/use-data";
import { type Course, type Highlight, type Lesson, type LessonProgress, PILLAR_LABELS } from "@/domain/types";
import { cn } from "@/lib/cn";
import { LessonBlockView } from "./blocks";
import { READING_SIZES, type ReaderTheme, useReaderPrefs } from "./use-reader-prefs";

interface Props {
  uid: string;
  course: Course;
  lesson: Lesson;
  lessons: Lesson[];
  progress: LessonProgress | null;
  highlights: Highlight[];
}

type Panel = "toc" | "notes" | "settings" | null;

const THEMES: { id: ReaderTheme; label: string; swatch: string }[] = [
  { id: "paper", label: "Papier", swatch: "bg-ivory-50 ring-ink-900/15" },
  { id: "sepia", label: "Sépia", swatch: "bg-sepia-50 ring-ink-900/15" },
  { id: "night", label: "Nuit", swatch: "bg-ink-950 ring-ivory-50/30" },
];

export function StudyReader({ uid, course, lesson, lessons, progress, highlights: initialHighlights }: Props) {
  const [prefs, setPrefs] = useReaderPrefs();
  const [panel, setPanel] = useState<Panel>(null);
  const [highlights, setHighlights] = useState(initialHighlights);
  const [percent, setPercent] = useState(progress?.percent ?? 0);
  const [completed, setCompleted] = useState(progress?.completed ?? false);
  const [barHidden, setBarHidden] = useState(false);
  const [readRatio, setReadRatio] = useState(0);
  const [selection, setSelection] = useState<{ blockId: string; text: string; x: number; y: number; below: boolean } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [resumeBlock] = useState(() => (progress && !progress.completed && progress.percent > 5 ? progress.lastBlockId : undefined));
  const [resumeOffer, setResumeOffer] = useState(!!resumeBlock);
  const articleRef = useRef<HTMLElement>(null);
  const lastBlock = useRef<string | undefined>(progress?.lastBlockId);
  const maxPercent = useRef(progress?.percent ?? 0);

  const index = lessons.findIndex((l) => l.id === lesson.id);
  const prev = index > 0 ? lessons[index - 1] : undefined;
  const next = index >= 0 ? lessons[index + 1] : undefined;
  const headings = lesson.blocks.filter((b): b is Extract<typeof b, { type: "heading" }> => b.type === "heading");
  const reflections = useMemo(() => Object.fromEntries(highlights.filter((h) => !h.text && h.note).map((h) => [h.blockId, h.note ?? ""])), [highlights]);
  const annotations = highlights.filter((h) => h.text);

  /* ── Enregistrement de la progression (débounce) ──────────────────── */
  const persist = useCallback(
    async (value: number, done: boolean) => {
      const store = await getStore();
      await saveLessonProgress(store, { uid, courseId: course.id, lessonId: lesson.id, percent: value, completed: done, lastBlockId: lastBlock.current });
      invalidate(`overview:${uid}`);
      invalidate(`course:${uid}:${course.id}`);
      invalidate(`lesson:${uid}:`);
    },
    [uid, course.id, lesson.id],
  );

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;
    const blocks = [...article.querySelectorAll<HTMLElement>("[data-block]")];
    const total = blocks.length;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = blocks.indexOf(entry.target as HTMLElement);
          const value = Math.min(99, Math.round(((i + 1) / total) * 100));
          lastBlock.current = (entry.target as HTMLElement).dataset.block;
          if (value > maxPercent.current) {
            maxPercent.current = value;
            setPercent(value);
            clearTimeout(timer);
            timer = setTimeout(() => void persist(value, false), 2500);
          }
        }
      },
      { rootMargin: "0px 0px -40% 0px" },
    );
    blocks.forEach((b) => io.observe(b));
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [persist]);

  /* ── Barre supérieure : masquée en descendant, révélée en remontant ─ */
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setBarHidden(y > 120 && y > lastY);
        lastY = y;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setReadRatio(max > 0 ? Math.min(1, y / max) : 0);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* ── Sélection de texte → barre d'outils ──────────────────────────── */
  useEffect(() => {
    const onSelect = () => {
      const sel = window.getSelection();
      const text = sel?.toString().trim() ?? "";
      if (!sel || sel.rangeCount === 0 || text.length < 3 || text.length > 600) return setSelection(null);
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer instanceof Element ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
      const block = container?.closest<HTMLElement>("[data-block]");
      if (!block || !articleRef.current?.contains(block)) return setSelection(null);
      const rect = range.getBoundingClientRect();
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      setSelection({ blockId: block.dataset.block ?? "", text, x: rect.left + rect.width / 2, y: coarse ? rect.bottom : rect.top, below: coarse });
    };
    let t: ReturnType<typeof setTimeout> | undefined;
    const debounced = () => {
      clearTimeout(t);
      t = setTimeout(onSelect, 120);
    };
    document.addEventListener("selectionchange", debounced);
    return () => {
      clearTimeout(t);
      document.removeEventListener("selectionchange", debounced);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  async function saveHighlight(h: Highlight) {
    setHighlights((list) => [...list.filter((x) => x.id !== h.id), h]);
    const store = await getStore();
    await store.set("highlights", h.id, h);
    invalidate(`lesson:${uid}:${lesson.id}`);
  }

  async function removeHighlight(id: string) {
    setHighlights((list) => list.filter((x) => x.id !== id));
    const store = await getStore();
    await store.remove("highlights", id);
    invalidate(`lesson:${uid}:${lesson.id}`);
  }

  function addHighlight(withNote: boolean) {
    if (!selection) return;
    const h: Highlight = {
      id: `${uid}_${lesson.id}_${Date.now().toString(36)}`,
      uid,
      lessonId: lesson.id,
      blockId: selection.blockId,
      text: selection.text,
      createdAt: new Date().toISOString(),
    };
    void saveHighlight(h);
    window.getSelection()?.removeAllRanges();
    setSelection(null);
    if (withNote) setPanel("notes");
    else setToast("Passage surligné");
  }

  async function copySelection() {
    if (!selection) return;
    const ref = `${selection.text}\n— ${course.title}, leçon ${lesson.order} (IB-MIRESAN)`;
    try {
      await navigator.clipboard.writeText(ref);
      setToast("Citation copiée");
    } catch {
      setToast("Copie impossible sur cet appareil");
    }
    setSelection(null);
  }

  async function markComplete() {
    maxPercent.current = 100;
    setPercent(100);
    setCompleted(true);
    await persist(100, true);
  }

  const size = READING_SIZES[prefs.size];
  const sideVisible = !prefs.focus;

  return (
    <div data-theme={prefs.theme} className="min-h-dvh bg-paper text-text transition-colors duration-(--duration-base)">
      {/* Filet de progression de lecture */}
      <div aria-hidden className="fixed inset-x-0 top-0 z-(--z-toast) h-[2px] bg-transparent">
        <div className="h-full origin-left bg-gold-500" style={{ transform: `scaleX(${readRatio})` }} />
      </div>

      {/* Barre supérieure */}
      <header
        className={cn(
          "sticky top-0 z-(--z-header) border-b border-line bg-paper/92 backdrop-blur-md transition-transform duration-(--duration-base) ease-(--ease-soft)",
          barHidden && !panel && "-translate-y-full",
        )}
      >
        <div className="mx-auto flex h-14 max-w-(--container-wide) items-center gap-2 px-3 sm:px-5">
          <Link href={`/campus/cours/${course.id}`} className="grid size-10 place-items-center rounded-sm hover:bg-paper-sunken" aria-label={`Retour au cours ${course.title}`}>
            <Icon name="arrowLeft" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.6875rem] font-semibold tracking-[0.12em] text-accent uppercase">
              {course.code} · Leçon {lesson.order}/{lessons.length}
            </p>
            <p className="truncate text-sm font-medium">{course.title}</p>
          </div>
          <ToolButton icon="book" label="Sommaire" active={panel === "toc"} onClick={() => setPanel(panel === "toc" ? null : "toc")} className="xl:hidden" />
          <ToolButton icon="note" label="Notes et glossaire" active={panel === "notes"} onClick={() => setPanel(panel === "notes" ? null : "notes")} className={cn(sideVisible && "xl:hidden")} count={annotations.length} />
          <ToolButton icon="type" label="Affichage" active={panel === "settings"} onClick={() => setPanel(panel === "settings" ? null : "settings")} />
          <ToolButton icon="focus" label={prefs.focus ? "Quitter le mode Focus" : "Mode Focus"} active={prefs.focus} onClick={() => setPrefs({ focus: !prefs.focus })} className="hidden sm:grid" />
        </div>
      </header>

      <div className={cn("mx-auto grid max-w-(--container-wide) gap-10 px-5 sm:px-8", sideVisible ? "xl:grid-cols-[15rem_minmax(0,1fr)_17rem]" : "xl:grid-cols-[1fr]")}>
        {/* Sommaire (desktop) */}
        {sideVisible && (
          <aside className="hidden xl:block">
            <div className="sticky top-24 pb-10">
              <TableOfContents course={course} lesson={lesson} lessons={lessons} headings={headings} />
            </div>
          </aside>
        )}

        {/* Colonne de lecture */}
        <article ref={articleRef} className="mx-auto w-full max-w-[40rem] pt-10 pb-40 sm:pt-16" style={{ "--reading-size": size } as React.CSSProperties}>
          <header className="mb-12 font-sans">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-accent uppercase">
              <PillarGlyph pillar={course.pillar} className="size-4" />
              {PILLAR_LABELS[course.pillar].label} · Leçon {lesson.order}
            </p>
            <h1 className="font-display mt-4 text-[clamp(2.3rem,1.6rem+3vw,3.6rem)] leading-[1.02]">{lesson.title}</h1>
            <p className="mt-4 text-lg text-text-soft">{lesson.summary}</p>
            <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
              <span className="flex items-center gap-1.5">
                <Icon name="clock" className="size-4" /> {lesson.durationMinutes} min de lecture
              </span>
              <span className="numeric">{percent} % parcouru</span>
            </p>
            {lesson.demo && <DemoNotice className="mt-5" />}
          </header>

          <div className="prose-reading">
            {lesson.blocks.map((block) => (
              <LessonBlockView
                key={block.id}
                block={block}
                highlights={annotations}
                reflection={reflections[block.id]}
                onReflection={(blockId, value) =>
                  void saveHighlight({
                    id: `${uid}_${lesson.id}_${blockId}_reflection`,
                    uid,
                    lessonId: lesson.id,
                    blockId,
                    text: "",
                    note: value,
                    createdAt: new Date().toISOString(),
                  })
                }
              />
            ))}
          </div>

          {/* Fin de leçon */}
          <footer className="mt-20 border-t border-line pt-12 text-center font-sans">
            {completed ? (
              <div className="reveal flex flex-col items-center">
                <CompletionSeal />
                <p className="font-display mt-5 text-3xl">Leçon achevée</p>
                <p className="mt-2 text-text-muted">Votre progression est enregistrée.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="font-display text-2xl">Avez-vous terminé cette leçon ?</p>
                <button type="button" onClick={() => void markComplete()} className="mt-5 inline-flex h-12 items-center gap-2 rounded-sm bg-forest-800 px-6 text-sm font-semibold text-ivory-50 hover:bg-forest-700 dark:bg-gold-500 dark:text-ink-950">
                  <Icon name="check" className="size-4" /> Marquer comme achevée
                </button>
              </div>
            )}
            <nav aria-label="Leçons" className="mt-12 grid gap-3 text-left sm:grid-cols-2">
              {prev ? (
                <Link href={`/campus/cours/${course.id}/${prev.id}`} className="rounded-md p-4 ring-1 ring-line transition-colors hover:bg-paper-sunken">
                  <span className="text-xs text-text-muted">← Leçon précédente</span>
                  <span className="font-display mt-1 block text-lg leading-snug">{prev.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link href={`/campus/cours/${course.id}/${next.id}`} className="rounded-md bg-paper-raised p-4 text-right ring-1 ring-line transition-colors hover:ring-accent/50 sm:col-start-2">
                  <span className="text-xs text-text-muted">Leçon suivante →</span>
                  <span className="font-display mt-1 block text-lg leading-snug">{next.title}</span>
                </Link>
              )}
            </nav>
          </footer>
        </article>

        {/* Marge : glossaire & notes (desktop) */}
        {sideVisible && (
          <aside className="hidden xl:block">
            <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pb-10">
              <NotesPanel lesson={lesson} annotations={annotations} onNote={(h, note) => void saveHighlight({ ...h, note })} onRemove={(id) => void removeHighlight(id)} />
            </div>
          </aside>
        )}
      </div>

      {/* Tiroirs (mobile, tablette) et réglages */}
      {panel && (
        <div className="fixed inset-0 z-(--z-drawer)" role="dialog" aria-modal="true" aria-label={panel === "toc" ? "Sommaire" : panel === "notes" ? "Notes" : "Affichage"}>
          <button type="button" aria-label="Fermer" className="animate-fade absolute inset-0 bg-ink-950/45" onClick={() => setPanel(null)} />
          <div
            className={cn(
              "safe-bottom absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-y-auto rounded-t-xl bg-paper-raised p-6 shadow-overlay sm:inset-x-auto sm:top-0 sm:right-0 sm:bottom-0 sm:max-h-none sm:w-[24rem] sm:rounded-none",
              panel === "toc" && "sm:right-auto sm:left-0",
            )}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-line-strong sm:hidden" />
            <div className="mb-4 flex justify-end">
              <button type="button" onClick={() => setPanel(null)} className="grid size-9 place-items-center rounded-sm hover:bg-paper-sunken" aria-label="Fermer">
                <Icon name="close" className="size-4" />
              </button>
            </div>
            {panel === "toc" && <TableOfContents course={course} lesson={lesson} lessons={lessons} headings={headings} onNavigate={() => setPanel(null)} />}
            {panel === "notes" && <NotesPanel lesson={lesson} annotations={annotations} onNote={(h, note) => void saveHighlight({ ...h, note })} onRemove={(id) => void removeHighlight(id)} />}
            {panel === "settings" && (
              <div className="font-sans">
                <p className="eyebrow text-accent">Affichage</p>
                <fieldset className="mt-5">
                  <legend className="text-sm font-semibold">Thème de lecture</legend>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {THEMES.map((t) => (
                      <button key={t.id} type="button" onClick={() => setPrefs({ theme: t.id })} aria-pressed={prefs.theme === t.id} className={cn("flex flex-col items-center gap-2 rounded-md p-3 text-sm ring-1 transition-colors", prefs.theme === t.id ? "ring-2 ring-accent" : "ring-line hover:ring-line-strong")}>
                        <span className={cn("size-8 rounded-full ring-1", t.swatch)} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="mt-6">
                  <legend className="text-sm font-semibold">Taille du texte</legend>
                  <div className="mt-3 flex items-center gap-3">
                    <button type="button" className="grid size-10 place-items-center rounded-sm ring-1 ring-line disabled:opacity-40" onClick={() => setPrefs({ size: Math.max(0, prefs.size - 1) as 0 })} disabled={prefs.size === 0} aria-label="Réduire">
                      <span className="font-display text-sm">A</span>
                    </button>
                    <div className="flex flex-1 gap-1.5" aria-hidden>
                      {READING_SIZES.map((_, i) => (
                        <span key={i} className={cn("h-1 flex-1 rounded-full", i <= prefs.size ? "bg-accent" : "bg-line")} />
                      ))}
                    </div>
                    <button type="button" className="grid size-10 place-items-center rounded-sm ring-1 ring-line disabled:opacity-40" onClick={() => setPrefs({ size: Math.min(3, prefs.size + 1) as 3 })} disabled={prefs.size === 3} aria-label="Agrandir">
                      <span className="font-display text-xl">A</span>
                    </button>
                  </div>
                </fieldset>
                <label className="mt-6 flex items-center justify-between gap-4 rounded-md p-3 ring-1 ring-line">
                  <span>
                    <span className="block text-sm font-semibold">Mode Focus</span>
                    <span className="text-xs text-text-muted">Masque les marges et les outils.</span>
                  </span>
                  <input type="checkbox" checked={prefs.focus} onChange={(e) => setPrefs({ focus: e.target.checked })} className="size-5 accent-forest-700" />
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Barre d'outils de sélection */}
      {selection && (
        <div
          role="toolbar"
          aria-label="Outils de sélection"
          className="animate-fade fixed z-(--z-popover) flex -translate-x-1/2 items-center gap-0.5 rounded-md bg-ink-900 p-1 font-sans text-ivory-50 shadow-overlay"
          style={{ left: Math.min(Math.max(selection.x, 120), (typeof window !== "undefined" ? window.innerWidth : 400) - 120), top: selection.below ? selection.y + 14 : selection.y - 52 }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <SelectionAction icon="highlight" label="Surligner" onClick={() => addHighlight(false)} />
          <SelectionAction icon="note" label="Note" onClick={() => addHighlight(true)} />
          <SelectionAction icon="document" label="Copier" onClick={() => void copySelection()} />
        </div>
      )}

      {/* Reprise de lecture */}
      {resumeOffer && resumeBlock && (
        <div className="safe-bottom fixed inset-x-3 bottom-3 z-(--z-toast) mx-auto flex max-w-md items-center gap-3 rounded-md bg-ink-900 p-3 pl-4 font-sans text-sm text-ivory-50 shadow-overlay sm:bottom-6">
          <Icon name="bookmark" className="size-4 shrink-0 text-gold-300" />
          <span className="flex-1">Reprendre là où vous vous étiez arrêté ?</span>
          <button
            type="button"
            className="rounded-sm bg-gold-500 px-3 py-1.5 font-semibold text-ink-900"
            onClick={() => {
              document.querySelector(`[data-block="${resumeBlock}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
              setResumeOffer(false);
            }}
          >
            Reprendre
          </button>
          <button type="button" className="grid size-8 place-items-center text-ivory-50/60" aria-label="Ignorer" onClick={() => setResumeOffer(false)}>
            <Icon name="close" className="size-4" />
          </button>
        </div>
      )}

      {toast && (
        <p role="status" className="animate-fade fixed bottom-6 left-1/2 z-(--z-toast) -translate-x-1/2 rounded-md bg-ink-900 px-4 py-2.5 font-sans text-sm text-ivory-50 shadow-overlay">
          {toast}
        </p>
      )}
    </div>
  );
}

function ToolButton({ icon, label, active, onClick, className, count }: { icon: IconName; label: string; active?: boolean; onClick: () => void; className?: string; count?: number }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} aria-pressed={active} className={cn("relative grid size-10 place-items-center rounded-sm transition-colors", active ? "bg-paper-sunken text-accent" : "hover:bg-paper-sunken", className)}>
      <Icon name={icon} className="size-[1.2rem]" />
      {!!count && <span className="numeric absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-accent text-[0.6rem] font-bold text-paper">{count}</span>}
    </button>
  );
}

function SelectionAction({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-10 items-center gap-2 rounded-sm px-3 text-sm hover:bg-ivory-50/10">
      <Icon name={icon} className="size-4 text-gold-300" />
      {label}
    </button>
  );
}

function TableOfContents({ course, lesson, lessons, headings, onNavigate }: { course: Course; lesson: Lesson; lessons: Lesson[]; headings: { id: string; text: string; level: 2 | 3 }[]; onNavigate?: () => void }) {
  return (
    <nav aria-label="Sommaire" className="font-sans text-sm">
      <p className="eyebrow text-accent">Dans cette leçon</p>
      <ol className="mt-3 space-y-1 border-l border-line">
        {headings.map((h) => (
          <li key={h.id}>
            <a href={`#section-${h.id}`} onClick={onNavigate} className={cn("-ml-px block border-l border-transparent py-1 text-text-soft hover:border-accent hover:text-text", h.level === 3 ? "pl-7 text-[0.8125rem]" : "pl-4")}>
              {h.text}
            </a>
          </li>
        ))}
        {headings.length === 0 && <li className="pl-4 text-text-muted">Leçon d’un seul tenant.</li>}
      </ol>
      <p className="eyebrow mt-8 text-text-muted">{course.title}</p>
      <ol className="mt-3 space-y-1">
        {lessons.map((l) => (
          <li key={l.id}>
            <Link href={`/campus/cours/${course.id}/${l.id}`} onClick={onNavigate} aria-current={l.id === lesson.id ? "page" : undefined} className={cn("flex gap-3 rounded-sm px-2 py-1.5 leading-snug", l.id === lesson.id ? "bg-paper-sunken font-semibold text-text" : "text-text-soft hover:bg-paper-sunken")}>
              <span className="numeric w-5 shrink-0 text-accent">{l.order}.</span>
              {l.title}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function NotesPanel({ lesson, annotations, onNote, onRemove }: { lesson: Lesson; annotations: Highlight[]; onNote: (h: Highlight, note: string) => void; onRemove: (id: string) => void }) {
  return (
    <div className="space-y-10 font-sans text-sm">
      <section>
        <p className="eyebrow text-accent">Mes annotations</p>
        {annotations.length === 0 ? (
          <p className="mt-3 leading-relaxed text-text-muted">Sélectionnez un passage du texte pour le surligner ou y ajouter une note.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {annotations.map((h) => (
              <li key={h.id} className="rounded-md bg-paper-sunken p-3">
                <p className="font-display text-[0.95rem] leading-snug">
                  <mark className="bg-highlight text-inherit">{h.text}</mark>
                </p>
                <label className="sr-only" htmlFor={`note-${h.id}`}>
                  Note
                </label>
                <textarea id={`note-${h.id}`} defaultValue={h.note} onBlur={(e) => e.target.value !== (h.note ?? "") && onNote(h, e.target.value)} placeholder="Ajouter une note…" rows={2} className="mt-2 w-full resize-none rounded-sm bg-paper-raised p-2 text-[0.8125rem] ring-1 ring-line outline-none focus:ring-accent" />
                <button type="button" onClick={() => onRemove(h.id)} className="mt-1 text-xs text-text-muted hover:text-danger-600">
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      {lesson.glossary.length > 0 && (
        <section>
          <p className="eyebrow text-accent">Glossaire</p>
          <dl className="mt-3 space-y-4">
            {lesson.glossary.map((g) => (
              <div key={g.term}>
                <dt className="font-display text-lg">{g.term}</dt>
                <dd className="mt-0.5 leading-relaxed text-text-soft">{g.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}

function CompletionSeal() {
  return (
    <svg viewBox="0 0 120 120" className="size-28 text-accent" aria-hidden>
      <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="60" cy="60" r="47" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 3" />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return <line key={i} x1={60 + Math.cos(a) * 30} y1={60 + Math.sin(a) * 30} x2={60 + Math.cos(a) * 40} y2={60 + Math.sin(a) * 40} stroke="currentColor" strokeWidth="0.7" opacity="0.6" />;
      })}
      <path d="M46 61l9 9 19-20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
