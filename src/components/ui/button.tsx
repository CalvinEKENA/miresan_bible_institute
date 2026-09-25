import Link from "next/link";
import { type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "gold" | "outline" | "outline-light" | "ghost" | "quiet";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2.5 whitespace-nowrap font-sans font-semibold tracking-[0.01em] transition-[background-color,color,border-color,box-shadow,transform] duration-(--duration-quick) ease-(--ease-soft) active:translate-y-px disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary: "bg-forest-800 text-ivory-50 hover:bg-forest-700 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]",
  gold: "bg-gold-500 text-ink-900 hover:bg-gold-300 shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_10px_30px_-12px_rgb(207_174_98/0.6)]",
  outline: "border border-line-strong text-text hover:border-forest-700 hover:bg-forest-800/5",
  "outline-light": "border border-ivory-50/30 text-ivory-50 hover:border-gold-300/70 hover:bg-ivory-50/5",
  ghost: "text-text hover:bg-forest-800/6",
  quiet: "text-text-soft hover:text-text underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[0.8125rem] rounded-sm",
  md: "h-11 px-5 text-sm rounded-sm",
  lg: "h-13 px-6 text-[0.9375rem] rounded-sm",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface Common {
  variant?: Variant;
  size?: Size;
  /** Flèche éditoriale qui glisse au survol. */
  arrow?: boolean;
  children: ReactNode;
}

function Arrow() {
  return (
    <svg aria-hidden viewBox="0 0 20 10" className="h-2.5 w-5 transition-transform duration-(--duration-base) ease-(--ease-editorial) group-hover/btn:translate-x-1">
      <path d="M0 5h18M14 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function Button({ variant, size, arrow, className, children, ...props }: Common & ComponentProps<"button">) {
  return (
    <button className={buttonClass(variant, size, className)} {...props}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}

export function ButtonLink({ variant, size, arrow, className, children, ...props }: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

/** Lien éditorial : texte souligné d'un filet qui se dessine au survol. */
export function TextLink({ className, children, arrow = true, ...props }: ComponentProps<typeof Link> & { arrow?: boolean }) {
  return (
    <Link
      className={cn(
        "group/btn inline-flex items-center gap-2 font-semibold text-sm tracking-[0.01em] bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-bottom-left bg-no-repeat pb-1 transition-[background-size] duration-(--duration-base) ease-(--ease-editorial) hover:bg-[length:100%_1px]",
        className,
      )}
      {...props}
    >
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}
