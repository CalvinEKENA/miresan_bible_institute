"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo, Wordmark } from "@/components/brand/brand";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { PUBLIC_NAV } from "./nav";


export function SiteHeader({ phones, email }: { phones: string[]; email: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Fermer le menu lors d'un changement de page.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const solid = scrolled && !open;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-(--z-header) transition-[background-color,box-shadow,color] duration-(--duration-base) ease-(--ease-soft)",
          solid ? "bg-ivory-50/92 text-ink-900 shadow-[0_1px_0_rgb(10_27_20/0.08)] backdrop-blur-md supports-[not(backdrop-filter:blur(1px))]:bg-ivory-50" : "text-ivory-50",
        )}
      >
        <div className="container-wide flex h-(--header-height) items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3" aria-label="Institut Biblique de la MIRESAN — accueil">
            <Logo size={40} priority className="size-10 object-contain" />
            <Wordmark light={!solid} />
          </Link>

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {PUBLIC_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative py-2 text-[0.8125rem] font-medium tracking-[0.02em] transition-opacity hover:opacity-100",
                      "after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-(--duration-base) hover:after:scale-x-100",
                      solid ? "opacity-80" : "opacity-85",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden sm:block">
              <Link href="/connexion" className={buttonClass(solid ? "primary" : "outline-light", "sm")}>
                Espace étudiant
              </Link>
            </span>
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls="menu-mobile"
              onClick={() => setOpen((o) => !o)}
              className="flex h-10 items-center gap-3 px-2 text-[0.8125rem] font-semibold tracking-[0.06em] uppercase lg:hidden"
            >
              <span>{open ? "Fermer" : "Menu"}</span>
              <span aria-hidden className="relative block h-2.5 w-6">
                <span className={cn("absolute left-0 h-px w-full bg-current transition-transform duration-(--duration-base)", open ? "top-1/2 rotate-45" : "top-0")} />
                <span className={cn("absolute left-0 h-px bg-current transition-all duration-(--duration-base)", open ? "top-1/2 w-full -rotate-45" : "bottom-0 w-4")} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="menu-mobile"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className="fixed inset-0 z-(--z-drawer) overflow-y-auto bg-forest-900 text-ivory-50 lg:hidden"
      >
        <div className="paper-grain absolute inset-0 opacity-40" aria-hidden />
        <div className="relative container-wide flex min-h-full flex-col pt-[calc(var(--header-height)+2rem)] pb-10">
          <nav aria-label="Navigation mobile">
            <ol className="border-t border-ivory-50/10">
              {PUBLIC_NAV.map((item, i) => (
                <li key={item.href} className="reveal border-b border-ivory-50/10" style={{ "--reveal-delay": 60 + i * 50 } as React.CSSProperties}>
                  <Link href={item.href} onClick={() => setOpen(false)} className="flex items-baseline gap-4 py-4">
                    <span className="numeric w-6 text-xs text-gold-300/70">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-[2rem] leading-none">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          <Link href="/connexion" className={cn(buttonClass("gold", "lg"), "mt-8 w-full")}>
            Accéder à l’espace étudiant
          </Link>
          <div className="mt-auto pt-10 text-sm text-ivory-50/65">
            <p className="eyebrow text-gold-300/80">Nous joindre</p>
            <p className="mt-3 flex flex-col gap-1">
              {phones.map((p) => (
                <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="numeric">
                  {p}
                </a>
              ))}
              <a href={`mailto:${email}`}>{email}</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
