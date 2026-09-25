import { useId } from "react";
import { cn } from "@/lib/cn";
import { type Pillar } from "@/domain/types";

const LOGO_WIDTHS = [96, 192, 384, 640] as const;

/**
 * Coordonnées SVG arrondies au centième : le rendu ne dépend jamais de la
 * dernière décimale de Math.cos/Math.sin, qui varie selon les moteurs JS.
 */
const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Identifiant SVG unique par instance (gradients, masques), stable entre le
 * serveur et le client. `useId` est disponible dans les Server Components.
 */
function useSvgId(prefix: string) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

/**
 * Logo officiel (variantes webp générées par `npm run assets`), servi en srcset :
 * le navigateur choisit la plus petite variante suffisante pour l'écran.
 */
export function Logo({ size = 44, className, priority = false, sizes, alt = "Logo de l’Institut Biblique de la MIRESAN" }: { size?: number; className?: string; priority?: boolean; sizes?: string; alt?: string }) {
  const fallback = LOGO_WIDTHS.find((w) => w >= size * 2) ?? 640;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- variantes pré-optimisées, srcset natif sans optimiseur d'images
    <img
      src={`/branding/logo-ib-miresan-${fallback}.webp`}
      srcSet={LOGO_WIDTHS.map((w) => `/branding/logo-ib-miresan-${w}.webp ${w}w`).join(", ")}
      sizes={sizes ?? `${size}px`}
      alt={alt}
      width={size}
      height={Math.round((size * 512) / 550)}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={cn("select-none", className)}
      draggable={false}
    />
  );
}

/** Mot-symbole typographique IB-MIRESAN. */
export function Wordmark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("flex flex-col leading-none whitespace-nowrap", className)}>
      <span className={cn("font-display text-[1.15rem] tracking-[-0.01em]", light ? "text-ivory-50" : "text-text")}>
        IB-<span className="italic">Miresan</span>
      </span>
      <span className={cn("mt-1 text-[0.58rem] font-semibold tracking-[0.24em] uppercase", light ? "text-gold-300/80" : "text-accent")}>
        Bible Institute
      </span>
    </span>
  );
}

/** Rayons dorés issus du logo — SVG statique, rotation CSS très lente. */
export function Rays({ className, count = 72, spin = true }: { className?: string; count?: number; spin?: boolean }) {
  const fadeId = useSvgId("ray-fade-");
  const rays = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const long = i % 2 === 0;
    const inner = 118;
    const outer = long ? 500 : 330 + ((i * 37) % 90);
    return {
      x1: r2(500 + Math.cos(angle) * inner),
      y1: r2(500 + Math.sin(angle) * inner),
      x2: r2(500 + Math.cos(angle) * outer),
      y2: r2(500 + Math.sin(angle) * outer),
      w: long ? 1.1 : 0.6,
    };
  });
  return (
    <svg aria-hidden viewBox="0 0 1000 1000" className={cn("pointer-events-none", className)}>
      <defs>
        <radialGradient id={fadeId} cx="50%" cy="50%" r="50%">
          <stop offset="0.2" stopColor="var(--color-gold-300)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--color-gold-300)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className={cn(spin && "origin-center animate-rays motion-reduce:animate-none")} style={{ transformBox: "fill-box" }} stroke={`url(#${fadeId})`}>
        {rays.map((r, i) => (
          <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} strokeWidth={r.w} />
        ))}
      </g>
    </svg>
  );
}

/**
 * Bible ouverte en trait fin : pages courbes, lignes réglées, tranche en éventail.
 * Entièrement vectorielle (≈3 Ko), aucune image.
 */
export function OpenBible({ className }: { className?: string }) {
  const glowId = useSvgId("spine-glow-");
  const strokeId = useSvgId("page-stroke-");
  const W = 1200;
  const spineX = W / 2;
  const lines = Array.from({ length: 14 }, (_, i) => i);
  const page = (side: -1 | 1, lift: number) => {
    const outer = spineX + side * (540 - lift * 4);
    return `M${spineX},${96 + lift} C${spineX + side * 150},${36 + lift} ${spineX + side * 380},${40 + lift} ${outer},${78 + lift} L${outer},${392 + lift} C${spineX + side * 380},${352 + lift} ${spineX + side * 150},${350 + lift} ${spineX},${412 + lift} Z`;
  };
  const textLine = (side: -1 | 1, i: number) => {
    const y = 120 + i * 19;
    const start = spineX + side * 46;
    const end = spineX + side * (i % 5 === 4 ? 300 : 488);
    const sag = 20 - i * 0.6;
    return `M${start},${y + 4} C${spineX + side * 170},${y - sag} ${spineX + side * 360},${y - sag + 2} ${end},${y + 2}`;
  };
  return (
    <svg aria-hidden viewBox={`0 0 ${W} 470`} className={cn("pointer-events-none", className)} fill="none">
      <defs>
        <radialGradient id={glowId} cx="50%" cy="40%" r="55%">
          <stop offset="0" stopColor="var(--color-gold-300)" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="var(--color-gold-500)" stopOpacity="0.12" />
          <stop offset="1" stopColor="var(--color-gold-500)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={strokeId} x1="0" x2="1">
          <stop offset="0" stopColor="var(--color-gold-300)" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="var(--color-gold-300)" stopOpacity="0.8" />
          <stop offset="1" stopColor="var(--color-gold-300)" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <ellipse cx={spineX} cy={180} rx={520} ry={240} fill={`url(#${glowId})`} />
      {/* tranche : feuillets empilés */}
      {[18, 12, 6].map((lift) => (
        <g key={lift} opacity={0.35 + lift / 60}>
          <path d={page(-1, lift)} stroke={`url(#${strokeId})`} strokeWidth={0.8} />
          <path d={page(1, lift)} stroke={`url(#${strokeId})`} strokeWidth={0.8} />
        </g>
      ))}
      <path d={page(-1, 0)} stroke={`url(#${strokeId})`} strokeWidth={1.2} fill="rgb(251 248 241 / 0.025)" />
      <path d={page(1, 0)} stroke={`url(#${strokeId})`} strokeWidth={1.2} fill="rgb(251 248 241 / 0.025)" />
      <g stroke="var(--color-ivory-50)" strokeOpacity={0.16} strokeWidth={0.9} strokeLinecap="round">
        {lines.map((i) => (
          <path key={`l${i}`} d={textLine(-1, i)} />
        ))}
        {lines.map((i) => (
          <path key={`r${i}`} d={textLine(1, i)} />
        ))}
      </g>
      {/* signet */}
      <path d={`M${spineX + 14},${100} L${spineX + 14},${460} L${spineX + 22},${448} L${spineX + 30},${460} L${spineX + 30},${98}`} stroke="var(--color-gold-500)" strokeOpacity={0.7} strokeWidth={1} />
      <path d={`M${spineX},96 L${spineX},412`} stroke="var(--color-gold-300)" strokeOpacity={0.55} strokeWidth={1} />
    </svg>
  );
}

/** Rayons du pictogramme « Déployer » (8 × 45°), en valeurs littérales. */
const DEPLOY_RAYS: [number, number, number, number][] = [
  [19, 12, 22.5, 12],
  [16.95, 16.95, 19.42, 19.42],
  [12, 19, 12, 22.5],
  [7.05, 16.95, 4.58, 19.42],
  [5, 12, 1.5, 12],
  [7.05, 7.05, 4.58, 4.58],
  [12, 5, 12, 1.5],
  [16.95, 7.05, 19.42, 4.58],
];

/** Pictogrammes abstraits des trois piliers (graine, croissance, envoi). */
export function PillarGlyph({ pillar, className }: { pillar: Pillar; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn("size-5", className)} fill="none" stroke="currentColor" strokeWidth={1.2}>
      {pillar === "discover" && (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
        </>
      )}
      {pillar === "develop" && (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
        </>
      )}
      {pillar === "deploy" && (
        <>
          <circle cx="12" cy="12" r="4.5" />
          {DEPLOY_RAYS.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </>
      )}
    </svg>
  );
}

/** Monogramme dans un double anneau doré (gouvernance, avatars sans photo). */
export function Monogram({ initials, size = 72, className }: { initials: string; size?: number; className?: string }) {
  return (
    <span
      className={cn("relative inline-grid shrink-0 place-items-center rounded-full font-display text-gold-800 ring-1 ring-gold-500/60", className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      <span className="absolute inset-[3px] rounded-full ring-1 ring-gold-500/30" />
      {initials}
    </span>
  );
}
