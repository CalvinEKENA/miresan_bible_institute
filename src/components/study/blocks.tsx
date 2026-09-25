"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icons";
import { type Highlight, type LessonBlock } from "@/domain/types";
import { cn } from "@/lib/cn";
import { RichText } from "./inline";

type Props = {
  block: LessonBlock;
  highlights: Highlight[];
  reflection?: string;
  onReflection?: (blockId: string, value: string) => void;
};

function MediaUnavailable({ label }: { label: string }) {
  return <p className="rounded-sm bg-paper-sunken px-4 py-3 font-sans text-sm text-text-muted">{label} — ressource bientôt disponible.</p>;
}

function formatDuration(sec?: number) {
  if (!sec) return null;
  const m = Math.floor(sec / 60);
  return `${m} min`;
}

/** Rendu d'un bloc de leçon. Chaque bloc porte `data-block` pour la progression et les surlignages. */
export function LessonBlockView({ block, highlights, reflection, onReflection }: Props) {
  const marks = highlights.filter((h) => h.blockId === block.id).map((h) => ({ id: h.id, text: h.text }));

  switch (block.type) {
    case "heading":
      return block.level === 2 ? (
        <h2 id={`section-${block.id}`} data-block={block.id}>
          {block.text}
        </h2>
      ) : (
        <h3 id={`section-${block.id}`} data-block={block.id}>
          {block.text}
        </h3>
      );

    case "paragraph":
      return (
        <p data-block={block.id} className={cn(block.dropCap && "first-letter:float-left first-letter:mt-[0.08em] first-letter:mr-3 first-letter:font-display first-letter:text-[4.6em] first-letter:leading-[0.78] first-letter:text-accent")}>
          <RichText text={block.text} highlights={marks} />
        </p>
      );

    case "verse":
      return (
        <figure data-block={block.id} className="relative my-10! border-y border-line py-7 text-center">
          <span aria-hidden className="absolute -top-[0.7em] left-1/2 -translate-x-1/2 bg-paper px-3 font-display text-lg text-accent">
            ✦
          </span>
          <blockquote className="mx-auto max-w-[34ch] text-[1.12em] leading-[1.55] italic">
            <RichText text={`« ${block.text} »`} highlights={marks} />
          </blockquote>
          <figcaption className="mt-4 flex items-center justify-center gap-3 font-sans text-xs">
            <span className="font-semibold tracking-[0.16em] text-accent uppercase">{block.reference}</span>
            <span className="text-text-muted">{block.version}</span>
          </figcaption>
        </figure>
      );

    case "quote":
      return (
        <figure data-block={block.id} className="border-l-2 border-accent/60 pl-6">
          <blockquote className="font-display text-[1.25em] leading-snug italic">
            <RichText text={block.text} highlights={marks} />
          </blockquote>
          {block.source && <figcaption className="mt-2 font-sans text-xs font-semibold tracking-[0.12em] text-text-muted uppercase">{block.source}</figcaption>}
        </figure>
      );

    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag data-block={block.id}>
          {block.items.map((item, i) => (
            <li key={i}>
              <RichText text={item} highlights={marks} />
            </li>
          ))}
        </Tag>
      );
    }

    case "callout": {
      const tone = {
        key: "bg-gold-100/50 ring-gold-600/25 dark:bg-gold-500/10",
        note: "bg-paper-sunken ring-line",
        warning: "bg-warning-100 ring-warning-600/20",
      }[block.tone];
      return (
        <aside data-block={block.id} className={cn("rounded-md px-6 py-5 font-sans text-[0.9375rem] leading-relaxed ring-1", tone)}>
          <p className="eyebrow mb-2 text-accent">{block.title}</p>
          <p className="text-text">
            <RichText text={block.text} highlights={marks} />
          </p>
        </aside>
      );
    }

    case "image":
      return (
        <figure data-block={block.id}>
          {/* eslint-disable-next-line @next/next/no-img-element -- images de leçon hébergées sur Storage, dimensions connues */}
          <img src={block.src} alt={block.alt} width={block.width} height={block.height} loading="lazy" decoding="async" className="h-auto w-full rounded-md" />
          {block.caption && <figcaption className="mt-2 font-sans text-xs text-text-muted">{block.caption}</figcaption>}
        </figure>
      );

    case "video":
      return block.url ? (
        <figure data-block={block.id} className="font-sans">
          <video controls preload="none" poster={block.poster} className="aspect-video w-full rounded-md bg-ink-950" src={block.url}>
            <track kind="captions" />
          </video>
          <figcaption className="mt-2 flex items-center gap-2 text-xs text-text-muted">
            <Icon name="video" className="size-4" /> {block.title} {formatDuration(block.durationSec) && `· ${formatDuration(block.durationSec)}`} · chargement à la demande
          </figcaption>
        </figure>
      ) : (
        <MediaUnavailable label={block.title} />
      );

    case "audio":
      return block.url ? (
        <figure data-block={block.id} className="rounded-md bg-paper-sunken p-4 font-sans">
          <figcaption className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Icon name="headphones" className="size-4 text-accent" /> {block.title}
          </figcaption>
          <audio controls preload="none" src={block.url} className="w-full" />
        </figure>
      ) : (
        <MediaUnavailable label={block.title} />
      );

    case "pdf":
      return block.url ? (
        <a data-block={block.id} href={block.url} target="_blank" rel="noopener" className="flex items-center gap-4 rounded-md bg-paper-raised p-4 font-sans no-underline! ring-1 ring-line transition-shadow hover:shadow-paper">
          <Icon name="pdf" className="size-8 text-accent" />
          <span className="flex-1">
            <span className="block text-sm font-semibold text-text">{block.title}</span>
            <span className="text-xs text-text-muted">PDF{block.sizeKb ? ` · ${Math.round(block.sizeKb)} Ko` : ""}</span>
          </span>
          <Icon name="arrowRight" className="size-4 text-text-muted" />
        </a>
      ) : (
        <MediaUnavailable label={block.title} />
      );

    case "reflection":
      return <Reflection blockId={block.id} prompt={block.prompt} value={reflection} onChange={onReflection} />;

    case "quiz":
      return (
        <aside data-block={block.id} className="my-12! overflow-hidden rounded-md bg-forest-800 font-sans text-ivory-50 dark:ring-1 dark:ring-gold-500/30">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-gold-300">Quiz intégré</p>
              <p className="font-display mt-1 text-2xl">{block.title}</p>
              <p className="mt-1 text-sm text-ivory-50/65">Correction immédiate · quelques minutes</p>
            </div>
            <Link href={`/campus/evaluations/${block.assessmentId}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-gold-500 px-5 text-sm font-semibold text-ink-900 no-underline! hover:bg-gold-300">
              Commencer <Icon name="arrowRight" className="size-4" />
            </Link>
          </div>
        </aside>
      );
  }
}

function Reflection({ blockId, prompt, value, onChange }: { blockId: string; prompt: string; value?: string; onChange?: (id: string, v: string) => void }) {
  const [draft, setDraft] = useState(value ?? "");
  const [saved, setSaved] = useState(false);
  return (
    <aside data-block={blockId} className="rounded-md border border-dashed border-accent/40 p-5 font-sans sm:p-6">
      <p className="eyebrow flex items-center gap-2 text-accent">
        <Icon name="quill" className="size-4" /> Question de réflexion
      </p>
      <p className="font-display mt-3 text-[1.15rem] leading-snug text-text">{prompt}</p>
      <label className="sr-only" htmlFor={`reflection-${blockId}`}>
        Votre réponse
      </label>
      <textarea
        id={`reflection-${blockId}`}
        rows={3}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setSaved(false);
        }}
        onBlur={() => {
          onChange?.(blockId, draft);
          if (draft) setSaved(true);
        }}
        placeholder="Écrivez votre réflexion personnelle…"
        className="ruled mt-4 w-full resize-y border-0 bg-transparent p-0 text-[0.9375rem] leading-[1.75rem] text-text outline-none placeholder:text-text-muted"
      />
      <p className="mt-2 h-4 text-xs text-text-muted" aria-live="polite">
        {saved ? "Enregistrée dans vos notes personnelles." : "Visible par vous seul."}
      </p>
    </aside>
  );
}
