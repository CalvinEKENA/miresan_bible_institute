import { DEMO_PASSWORD } from "@/data/demo/accounts";
import { getStore } from "@/data/store";
import { normalizeUsername } from "@/domain/identity";
import { type AuthAdapter, type AuthState, type SessionUser, SignInError } from "./types";

const KEY = "mbi-demo-session";

function readSession(): string | null {
  try {
    return globalThis.localStorage?.getItem(KEY) ?? globalThis.sessionStorage?.getItem(KEY) ?? null;
  } catch {
    return null;
  }
}

/**
 * Authentification de démonstration : comptes fictifs, mot de passe « demo ».
 * Ne connaît aucun identifiant réel et n'a aucun lien avec Firebase Auth.
 */
export class DemoAuth implements AuthAdapter {
  private listeners = new Set<(s: AuthState) => void>();
  private state: AuthState = { status: "loading", user: null };

  constructor() {
    void this.restore();
  }

  private emit(state: AuthState) {
    this.state = state;
    for (const l of this.listeners) l(state);
  }

  private async load(uid: string): Promise<SessionUser | null> {
    const store = await getStore();
    const profile = await store.get("users", uid);
    if (!profile) return null;
    return { uid, username: profile.username, role: profile.role, profile };
  }

  private async restore() {
    const uid = readSession();
    const user = uid ? await this.load(uid) : null;
    this.emit(user ? { status: "signed-in", user } : { status: "signed-out", user: null });
  }

  subscribe(listener: (s: AuthState) => void) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  async signIn(identifier: string, password: string, remember: boolean): Promise<SessionUser> {
    await new Promise((r) => setTimeout(r, 450)); // latence réaliste
    const store = await getStore();
    const username = normalizeUsername(identifier);
    const [profile] = await store.list("users", { where: [["username", "==", username]], limit: 1 });
    if (!profile || password !== DEMO_PASSWORD) throw new SignInError("invalid-credentials");
    if (profile.status === "suspended") throw new SignInError("disabled");
    try {
      (remember ? localStorage : sessionStorage).setItem(KEY, profile.uid);
    } catch {
      /* session limitée à l'onglet */
    }
    const user: SessionUser = { uid: profile.uid, username: profile.username, role: profile.role, profile };
    this.emit({ status: "signed-in", user });
    return user;
  }

  async signOut() {
    try {
      localStorage.removeItem(KEY);
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    this.emit({ status: "signed-out", user: null });
  }

  async changePassword() {
    // En démo, le mot de passe reste « demo ».
  }
}
