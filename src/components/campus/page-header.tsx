import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageHeader({ eyebrow, title, children, actions, className }: { eyebrow?: ReactNode; title: ReactNode; children?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <header className={cn("mb-8 flex flex-col gap-5 border-b border-line pb-7 md:flex-row md:items-end md:justify-between lg:mb-10", className)}>
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow text-accent">{eyebrow}</p>}
        <h1 className="font-display mt-3 text-4xl">{title}</h1>
        {children && <div className="mt-3 text-text-muted">{children}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({ title, action, className, children, tone = "paper" }: { title?: ReactNode; action?: ReactNode; className?: string; children: ReactNode; tone?: "paper" | "sunken" }) {
  return (
    <section className={cn("rounded-md p-5 sm:p-6", tone === "paper" ? "bg-paper-raised shadow-paper ring-1 ring-line" : "bg-paper-sunken", className)}>
      {(title || action) && (
        <header className="mb-4 flex items-baseline justify-between gap-4">
          {title && <h2 className="eyebrow text-text-muted">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
