"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Logo, Monogram } from "@/components/brand/brand";
import { Icon, type IconName } from "@/components/ui/icons";
import { useAuth, useSessionUser } from "@/data/auth/auth-provider";
import { capitalize, formatDate, initials } from "@/domain/format";
import { ROLE_LABELS } from "@/domain/roles";
import { cn } from "@/lib/cn";
import { DATA_MODE } from "@/lib/env";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  /** Correspondance exacte (pour la racine d'un espace). */
  exact?: boolean;
  badge?: string;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export interface ShellConfig {
  space: string; // « Campus », « Administration »…
  home: string;
  groups: NavGroup[];
  /** Barre de navigation basse (mobile) : 4 entrées max + « Plus ». */
  bottom?: string[];
}

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SidebarLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-sm px-3 text-[0.875rem] transition-colors duration-(--duration-quick)",
        active ? "bg-ivory-50/[0.07] text-ivory-50" : "text-ivory-50/62 hover:bg-ivory-50/[0.04] hover:text-ivory-50",
      )}
    >
      <span aria-hidden className={cn("absolute top-2 bottom-2 -left-4 w-[2px] rounded-full bg-gold-500 transition-opacity", active ? "opacity-100" : "opacity-0")} />
      <Icon name={item.icon} className={cn("size-[1.15rem] shrink-0", active ? "text-gold-300" : "text-ivory-50/50 group-hover:text-ivory-50/80")} />
      <span className="truncate">{item.label}</span>
      {item.badge && <span className="numeric ml-auto rounded-full bg-gold-500 px-1.5 text-[0.6875rem] font-bold text-ink-900">{item.badge}</span>}
    </Link>
  );
}

function Sidebar({ config, pathname, onNavigate }: { config: ShellConfig; pathname: string; onNavigate?: () => void }) {
  const user = useSessionUser();
  const { signOut } = useAuth();
  const router = useRouter();
  return (
    <div className="relative flex h-full flex-col bg-forest-900 text-ivory-50">
      {/* Dos de livre : double filet doré */}
      <span aria-hidden className="absolute inset-y-0 right-0 w-[5px] border-x border-gold-500/25" />
      <span aria-hidden className="paper-grain pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light" />

      <div className="relative flex items-center gap-3 px-5 pt-5 pb-6">
        <Logo size={44} className="size-11 object-contain" />
        <div className="leading-none">
          <p className="font-display text-[1.1rem]">
            IB-<em>Miresan</em>
          </p>
          <p className="eyebrow mt-1.5 text-[0.58rem] text-gold-300/80">{config.space}</p>
        </div>
      </div>

      <nav aria-label={config.space} className="scrollbar-none relative flex-1 overflow-y-auto px-4 pb-6">
        {config.groups.map((group, g) => (
          <div key={g} className={cn(g > 0 && "mt-6")}>
            {group.label && <p className="eyebrow mb-2 px-3 text-[0.6rem] text-ivory-50/35">{group.label}</p>}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <SidebarLink item={item} active={isActive(pathname, item)} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="relative border-t border-ivory-50/10 p-4">
        <div className="flex items-center gap-3">
          <Monogram initials={initials(user.profile.displayName)} size={38} className="bg-forest-800 text-[0.8rem] text-gold-300" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.profile.displayName}</p>
            <p className="truncate text-xs text-ivory-50/50">{ROLE_LABELS[user.role]}</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              router.replace("/connexion");
            }}
            className="grid size-9 place-items-center rounded-sm text-ivory-50/55 transition-colors hover:bg-ivory-50/5 hover:text-ivory-50"
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <Icon name="logout" className="size-[1.1rem]" />
          </button>
        </div>
        {DATA_MODE === "demo" && <p className="mt-3 rounded-xs border border-dashed border-gold-500/30 px-2 py-1 text-center text-[0.65rem] text-gold-300/80">Mode démonstration · données fictives</p>}
      </div>
    </div>
  );
}

export function AppShell({ config, children }: { config: ShellConfig; children: ReactNode }) {
  const pathname = usePathname();
  const user = useSessionUser();
  const [drawer, setDrawer] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const all = config.groups.flatMap((g) => g.items);
  const current = all.find((i) => isActive(pathname, i)) ?? all[0];
  const bottom = (config.bottom ?? []).map((href) => all.find((i) => i.href === href)).filter((i): i is NavItem => !!i);
  const bottomHasCurrent = bottom.some((i) => isActive(pathname, i));

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setDrawer(false);
  }

  useEffect(() => {
    if (!drawer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawer]);

  const today = capitalize(formatDate(new Date().toISOString(), { weekday: "long", day: "numeric", month: "long" }));

  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[17rem_1fr]">
      {/* Barre latérale (desktop) */}
      <aside className="sticky top-0 hidden h-dvh lg:block">
        <Sidebar config={config} pathname={pathname} />
      </aside>

      {/* Tiroir (mobile / tablette) */}
      <div hidden={!drawer} className="fixed inset-0 z-(--z-drawer) lg:hidden">
        <button type="button" aria-label="Fermer le menu" className="animate-fade absolute inset-0 bg-ink-950/55" onClick={() => setDrawer(false)} />
        <div ref={drawerRef} role="dialog" aria-modal="true" aria-label="Menu" className="absolute inset-y-0 left-0 w-[min(20rem,86vw)] shadow-overlay">
          <Sidebar config={config} pathname={pathname} onNavigate={() => setDrawer(false)} />
        </div>
      </div>

      <div className="min-w-0">
        {/* Barre supérieure */}
        <header className="sticky top-0 z-(--z-header) border-b border-line bg-paper/90 backdrop-blur-md supports-[not(backdrop-filter:blur(1px))]:bg-paper">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:h-16 lg:px-10">
            <button type="button" onClick={() => setDrawer(true)} className="-ml-1 grid size-10 place-items-center rounded-sm text-text lg:hidden" aria-label="Ouvrir le menu" aria-expanded={drawer}>
              <Icon name="menu" />
            </button>
            <Link href={config.home} className="flex items-center gap-2 lg:hidden" aria-label="Accueil de l’espace">
              <Logo size={32} className="size-8 object-contain" />
            </Link>
            <p className="truncate font-display text-lg lg:hidden">{current?.label}</p>
            <p className="hidden text-sm text-text-muted lg:block">
              <span className="text-text">{today}</span>
              <span className="mx-2 text-line-strong">/</span>
              {config.space}
            </p>
            <div className="ml-auto flex items-center gap-1">
              <button type="button" className="relative grid size-10 place-items-center rounded-sm text-text-soft hover:bg-paper-sunken" aria-label="Notifications">
                <Icon name="bell" className="size-[1.2rem]" />
                <span aria-hidden className="absolute top-2.5 right-2.5 size-1.5 rounded-full bg-gold-600 ring-2 ring-paper" />
              </button>
              <Link href={config.groups.flatMap((g) => g.items).find((i) => i.icon === "person")?.href ?? config.home} className="ml-1 rounded-full" aria-label="Mon profil">
                <Monogram initials={initials(user.profile.displayName)} size={34} className="bg-paper-raised text-[0.75rem]" />
              </Link>
            </div>
          </div>
        </header>

        {user.profile.mustChangePassword && (
          <div className="border-b border-warning-600/20 bg-warning-100 px-4 py-2.5 text-sm text-warning-600 sm:px-6 lg:px-10">
            <strong>Sécurité :</strong> veuillez remplacer votre mot de passe initial.{" "}
            <Link href={`${config.home}/profil`} className="font-semibold underline underline-offset-2">
              Changer mon mot de passe
            </Link>
          </div>
        )}

        <main id="contenu" className={cn("px-4 pt-6 pb-10 sm:px-6 lg:px-10 lg:pt-10 lg:pb-16", bottom.length > 0 && "pb-[calc(var(--bottom-nav-height)+2.5rem)] lg:pb-16")}>
          {children}
        </main>
      </div>

      {/* Navigation basse (mobile) */}
      {bottom.length > 0 && (
        <nav aria-label="Navigation rapide" className="safe-bottom fixed inset-x-0 bottom-0 z-(--z-nav) border-t border-line bg-paper-raised/95 backdrop-blur-md lg:hidden">
          <ul className="grid h-(--bottom-nav-height)" style={{ gridTemplateColumns: `repeat(${bottom.length + 1}, minmax(0, 1fr))` }}>
            {bottom.map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={active ? "page" : undefined} className={cn("relative flex h-full flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium", active ? "text-forest-700" : "text-text-muted")}>
                    <span aria-hidden className={cn("absolute top-0 h-[2px] w-8 rounded-full bg-gold-600 transition-opacity", active ? "opacity-100" : "opacity-0")} />
                    <Icon name={item.icon} className="size-[1.35rem]" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <button type="button" onClick={() => setDrawer(true)} className={cn("flex h-full w-full flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium", !bottomHasCurrent ? "text-forest-700" : "text-text-muted")}>
                <Icon name="more" className="size-[1.35rem]" strokeWidth={2.4} />
                Plus
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
