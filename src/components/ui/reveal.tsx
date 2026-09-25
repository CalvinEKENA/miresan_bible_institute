"use client";

import { type ElementType, type ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Révélation au scroll : un seul IntersectionObserver partagé pour toute la page,
 * transitions CSS (aucune bibliothèque d'animation), visible d'emblée sans JS.
 */
let observer: IntersectionObserver | undefined;
function shared(): IntersectionObserver | undefined {
  if (typeof IntersectionObserver === "undefined") return undefined;
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-inview", "true");
          observer?.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  );
  return observer;
}

export function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  children,
}: {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    const io = shared();
    if (!el) return;
    if (!io) {
      el.setAttribute("data-inview", "true");
      return;
    }
    io.observe(el);
    return () => io.unobserve(el);
  }, []);
  return (
    <Tag ref={ref} className={cn("reveal-on-scroll", className)} style={{ "--reveal-delay": delay } as React.CSSProperties}>
      {children}
    </Tag>
  );
}
