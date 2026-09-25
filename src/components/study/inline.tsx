import { Fragment, type ReactNode } from "react";

/**
 * Rendu du texte enrichi inline (sous-ensemble Markdown : **gras**, *italique*)
 * avec surlignages appliqués sur le texte « visible » (sans marqueurs).
 */
interface Token {
  text: string;
  bold: boolean;
  italic: boolean;
}

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  for (const match of source.matchAll(re)) {
    const index = match.index ?? 0;
    if (index > last) tokens.push({ text: source.slice(last, index), bold: false, italic: false });
    const raw = match[0];
    if (raw.startsWith("**")) tokens.push({ text: raw.slice(2, -2), bold: true, italic: false });
    else tokens.push({ text: raw.slice(1, -1), bold: false, italic: true });
    last = index + raw.length;
  }
  if (last < source.length) tokens.push({ text: source.slice(last), bold: false, italic: false });
  return tokens;
}

export function plainText(source: string): string {
  return tokenize(source)
    .map((t) => t.text)
    .join("");
}

interface Range {
  start: number;
  end: number;
  id: string;
}

/** Plages de surlignage : première occurrence de chaque extrait dans le texte visible. */
export function highlightRanges(plain: string, snippets: { id: string; text: string }[]): Range[] {
  const ranges: Range[] = [];
  for (const s of snippets) {
    const needle = s.text.trim();
    if (!needle) continue;
    const start = plain.indexOf(needle);
    if (start >= 0) ranges.push({ start, end: start + needle.length, id: s.id });
  }
  return ranges.sort((a, b) => a.start - b.start);
}

export function RichText({ text, highlights = [] }: { text: string; highlights?: { id: string; text: string }[] }) {
  const tokens = tokenize(text);
  const ranges = highlightRanges(
    tokens.map((t) => t.text).join(""),
    highlights,
  );
  const out: ReactNode[] = [];
  let offset = 0;
  tokens.forEach((token, ti) => {
    const tokenStart = offset;
    const tokenEnd = offset + token.text.length;
    // Découpe le jeton aux frontières des surlignages.
    const cuts = new Set<number>([tokenStart, tokenEnd]);
    for (const r of ranges) {
      if (r.start > tokenStart && r.start < tokenEnd) cuts.add(r.start);
      if (r.end > tokenStart && r.end < tokenEnd) cuts.add(r.end);
    }
    const points = [...cuts].sort((a, b) => a - b);
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i]!;
      const b = points[i + 1]!;
      const piece = token.text.slice(a - tokenStart, b - tokenStart);
      const hit = ranges.find((r) => a >= r.start && b <= r.end);
      let node: ReactNode = piece;
      if (token.bold) node = <strong>{node}</strong>;
      if (token.italic) node = <em>{node}</em>;
      if (hit) node = <mark data-highlight={hit.id}>{node}</mark>;
      out.push(<Fragment key={`${ti}-${i}`}>{node}</Fragment>);
    }
    offset = tokenEnd;
  });
  return <>{out}</>;
}
