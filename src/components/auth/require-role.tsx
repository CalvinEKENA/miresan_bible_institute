"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Logo } from "@/components/brand/brand";
import { ButtonLink } from "@/components/ui/button";
import { useAuth } from "@/data/auth/auth-provider";
import { homePathFor, type Role } from "@/domain/roles";

export function AppSplash({ label = "Ouverture de votre espace…" }: { label?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-paper" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-5">
        <Logo size={96} priority className="size-20 animate-pulse object-contain motion-reduce:animate-none" />
        <p className="eyebrow text-text-muted">{label}</p>
      </div>
    </div>
  );
}

/**
 * Garde d'accès côté interface. Il améliore l'expérience (redirections), mais la
 * protection effective des données est assurée par firestore.rules et les custom claims.
 */
export function RequireRole({ allow, children }: { allow: readonly Role[]; children: ReactNode }) {
  const { state } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (state.status === "signed-out") router.replace(`/connexion?suite=${encodeURIComponent(pathname)}`);
  }, [state.status, pathname, router]);

  if (state.status !== "signed-in") return <AppSplash />;

  if (!allow.includes(state.user.role)) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper px-6 text-center">
        <div className="max-w-md">
          <p className="eyebrow text-accent">Accès réservé</p>
          <h1 className="font-display mt-4 text-4xl">Cet espace ne correspond pas à votre profil.</h1>
          <p className="mt-4 text-text-muted">Votre compte vous donne accès à un autre espace de l’Institut.</p>
          <ButtonLink href={homePathFor(state.user.role)} className="mt-8" arrow>
            Aller à mon espace
          </ButtonLink>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
