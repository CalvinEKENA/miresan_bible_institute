import { type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Eyebrow({ className, children, rule = false }: { className?: string; children: ReactNode; rule?: boolean }) {
  return (
    <p className={cn("eyebrow flex items-center gap-3 text-accent", className)}>
      {rule && <span aria-hidden className="h-px w-8 bg-current opacity-60" />}
      {children}
    </p>
  );
}

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: "neutral" | "gold" | "forest" | "danger" | "warning" | "info";
  className?: string;
  children: ReactNode;
}) {
  const tones = {
    neutral: "bg-paper-sunken text-text-soft ring-line",
    gold: "bg-gold-100/70 text-gold-800 ring-gold-500/30",
    forest: "bg-success-100 text-forest-700 ring-forest-600/20",
    danger: "bg-danger-100 text-danger-600 ring-danger-600/20",
    warning: "bg-warning-100 text-warning-600 ring-warning-600/25",
    info: "bg-info-100 text-info-600 ring-info-600/20",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-xs px-2 py-0.5 text-[0.6875rem] font-semibold tracking-[0.04em] uppercase ring-1 ring-inset", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Card({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("rounded-md bg-paper-raised shadow-paper ring-1 ring-line", className)} {...props}>
      {children}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton h-4", className)} />;
}

export function ProgressBar({ value, className, tone = "forest", label }: { value: number; className?: string; tone?: "forest" | "gold" | "light"; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const fill = { forest: "bg-forest-600", gold: "bg-gold-500", light: "bg-gold-300" }[tone];
  const track = tone === "light" ? "bg-ivory-50/15" : "bg-line";
  return (
    <div role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label} className={cn("h-1 w-full overflow-hidden rounded-full", track, className)}>
      <div className={cn("h-full rounded-full transition-[width] duration-(--duration-slow) ease-(--ease-editorial)", fill)} style={{ width: `${v}%` }} />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 64,
  stroke = 3,
  className,
  children,
  tone = "forest",
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  children?: ReactNode;
  tone?: "forest" | "gold";
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }} role="img" aria-label={label ?? `${Math.round(v)} %`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone === "gold" ? "var(--color-gold-500)" : "var(--color-forest-600)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          className="transition-[stroke-dashoffset] duration-(--duration-reveal) ease-(--ease-editorial)"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-md border border-dashed border-line-strong px-6 py-12 text-center">
      <svg aria-hidden viewBox="0 0 48 32" className="mb-4 h-8 w-12 text-accent">
        <path d="M24 6C18 2 9 2 2 4v24c7-2 16-2 22 2 6-4 15-4 22-2V4c-7-2-16-2-22 2Zm0 0v24" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <p className="font-display text-2xl">{title}</p>
      {children && <div className="mt-2 max-w-sm text-sm text-text-muted">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, children, className }: { eyebrow?: string; title: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <header className={cn("max-w-3xl", className)}>
      {eyebrow && <Eyebrow rule>{eyebrow}</Eyebrow>}
      <h2 className="font-display mt-5 text-4xl">{title}</h2>
      {children && <div className="mt-5 text-lg text-text-soft">{children}</div>}
    </header>
  );
}

export function DemoNotice({ className, children = "Contenu de démonstration — ne constitue pas un enseignement officiel." }: { className?: string; children?: ReactNode }) {
  return (
    <p className={cn("inline-flex items-center gap-2 rounded-xs border border-dashed border-gold-600/50 bg-gold-100/40 px-2.5 py-1 text-[0.72rem] font-medium text-gold-800", className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-gold-600" />
      {children}
    </p>
  );
}
