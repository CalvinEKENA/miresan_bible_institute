import Image from "next/image";
import { cn } from "@/lib/cn";
import { type Pillar } from "@/domain/types";

/** Logo officiel (variantes webp générées par `npm run assets`). */
export function Logo({ size = 44, className, priority = false }: { size?: number; className?: string; priority?: boolean }) {
  const src = size <= 48 ? "/branding/logo-ib-miresan-96.webp" : size <= 96 ? "/branding/logo-ib-miresan-192.webp" : size <= 192 ? "/branding/logo-ib-miresan-384.webp" : "/branding/logo-ib-miresan-640.webp";
  return (
    <Image
      src={src}
      alt="Logo de l’Institut Biblique de la MIRESAN"
      width={size}
      height={Math.round((size * 512) / 550)}
      priority={priority}
      unoptimized
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
  const rays = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const long = i % 2 === 0;
    const inner = 118;
    const outer = long ? 500 : 330 + ((i * 37) % 90);
    return {
      x1: 500 + Math.cos(angle) * inner,
      y1: 500 + Math.sin(angle) * inner,
      x2: 500 + Math.cos(angle) * outer,
      y2: 500 + Math.sin(angle) * outer,
      w: long ? 1.1 : 0.6,
    };
  });
  return (
    <svg aria-hidden viewBox="0 0 1000 1000" className={cn("pointer-events-none", className)}>
      <defs>
        <radialGradient id="ray-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0.2" stopColor="var(--color-gold-300)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--color-gold-300)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className={cn(spin && "origin-center animate-rays motion-reduce:animate-none")} style={{ transformBox: "fill-box" }} stroke="url(#ray-fade)">
        {rays.map((r, i) => (
          <line key={i} x1={r.x1.toFixed(1)} y1={r.y1.toFixed(1)} x2={r.x2.toFixed(1)} y2={r.y2.toFixed(1)} strokeWidth={r.w} />
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
        <radialGradient id="spine-glow" cx="50%" cy="40%" r="55%">
          <stop offset="0" stopColor="var(--color-gold-300)" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="var(--color-gold-500)" stopOpacity="0.12" />
          <stop offset="1" stopColor="var(--color-gold-500)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="page-stroke" x1="0" x2="1">
          <stop offset="0" stopColor="var(--color-gold-300)" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="var(--color-gold-300)" stopOpacity="0.8" />
          <stop offset="1" stopColor="var(--color-gold-300)" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <ellipse cx={spineX} cy={180} rx={520} ry={240} fill="url(#spine-glow)" />
      {/* tranche : feuillets empilés */}
      {[18, 12, 6].map((lift) => (
        <g key={lift} opacity={0.35 + lift / 60}>
          <path d={page(-1, lift)} stroke="url(#page-stroke)" strokeWidth={0.8} />
          <path d={page(1, lift)} stroke="url(#page-stroke)" strokeWidth={0.8} />
        </g>
      ))}
      <path d={page(-1, 0)} stroke="url(#page-stroke)" strokeWidth={1.2} fill="rgb(251 248 241 / 0.025)" />
      <path d={page(1, 0)} stroke="url(#page-stroke)" strokeWidth={1.2} fill="rgb(251 248 241 / 0.025)" />
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
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <line key={i} x1={12 + Math.cos(a) * 7} y1={12 + Math.sin(a) * 7} x2={12 + Math.cos(a) * 10.5} y2={12 + Math.sin(a) * 10.5} />;
          })}
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
