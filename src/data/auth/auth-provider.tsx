"use client";

import { createContext, use, useEffect, useMemo, useState, type ReactNode } from "react";
import { DATA_MODE } from "@/lib/env";
import { type AuthAdapter, type AuthState, type SessionUser } from "./types";

interface AuthContextValue {
  state: AuthState;
  signIn: (identifier: string, password: string, remember: boolean) => Promise<SessionUser>;
  signOut: () => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

let adapterPromise: Promise<AuthAdapter> | undefined;
function loadAdapter(): Promise<AuthAdapter> {
  adapterPromise ??=
    DATA_MODE === "firebase"
      ? import("./firebase-auth").then((m) => new m.FirebaseAuthAdapter())
      : import("./demo-auth").then((m) => new m.DemoAuth());
  return adapterPromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    void loadAdapter().then((adapter) => {
      if (!cancelled) unsubscribe = adapter.subscribe(setState);
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      signIn: async (identifier, password, remember) => (await loadAdapter()).signIn(identifier, password, remember),
      signOut: async () => (await loadAdapter()).signOut(),
      changePassword: async (current, next) => (await loadAdapter()).changePassword(current, next),
    }),
    [state],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé sous <AuthProvider>.");
  return ctx;
}

/** Utilisateur connecté (à utiliser sous un garde d'accès). */
export function useSessionUser(): SessionUser {
  const { state } = useAuth();
  if (state.status !== "signed-in") throw new Error("Aucune session active.");
  return state.user;
}
