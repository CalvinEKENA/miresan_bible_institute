import { FirebaseError } from "firebase/app";
import {
  EmailAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  onIdTokenChanged,
  reauthenticateWithCredential,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updatePassword,
  type User,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firebaseAuth, firestore } from "@/lib/firebase/client";
import { IDENTITY_DOMAIN } from "@/lib/env";
import { authEmailToUsername, identifierToAuthEmail } from "@/domain/identity";
import { isRole } from "@/domain/roles";
import { type UserProfile } from "@/domain/types";
import { type AuthAdapter, type AuthState, type SessionUser, SignInError } from "./types";

/**
 * Authentification Firebase.
 * - L'identifiant visible (« pasteurarmel ») est converti en identité technique.
 * - Le rôle provient EXCLUSIVEMENT du custom claim `role` (posé par l'Admin SDK),
 *   jamais d'un champ modifiable par l'utilisateur.
 */
export class FirebaseAuthAdapter implements AuthAdapter {
  private listeners = new Set<(s: AuthState) => void>();
  private state: AuthState = { status: "loading", user: null };

  constructor() {
    onIdTokenChanged(firebaseAuth(), (user) => void this.resolve(user));
  }

  private emit(state: AuthState) {
    this.state = state;
    for (const l of this.listeners) l(state);
  }

  private async toSession(user: User): Promise<SessionUser> {
    const token = await user.getIdTokenResult();
    const role = token.claims.role;
    if (!isRole(role)) throw new SignInError("no-role");
    const snap = await getDoc(doc(firestore(), "users", user.uid));
    const username = authEmailToUsername(user.email ?? "", IDENTITY_DOMAIN);
    const profile: UserProfile = snap.exists()
      ? ({ ...(snap.data() as UserProfile), uid: user.uid, role } satisfies UserProfile)
      : {
          uid: user.uid,
          username,
          displayName: user.displayName ?? username,
          firstName: user.displayName?.split(" ")[0] ?? username,
          lastName: "",
          role,
          status: "active",
          mustChangePassword: false,
          createdAt: user.metadata.creationTime ?? new Date().toISOString(),
        };
    return { uid: user.uid, username, role, profile };
  }

  private async resolve(user: User | null) {
    if (!user) return this.emit({ status: "signed-out", user: null });
    try {
      this.emit({ status: "signed-in", user: await this.toSession(user) });
    } catch {
      await fbSignOut(firebaseAuth());
      this.emit({ status: "signed-out", user: null });
    }
  }

  subscribe(listener: (s: AuthState) => void) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  async signIn(identifier: string, password: string, remember: boolean): Promise<SessionUser> {
    const auth = firebaseAuth();
    try {
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      const cred = await signInWithEmailAndPassword(auth, identifierToAuthEmail(identifier, IDENTITY_DOMAIN), password);
      return await this.toSession(cred.user);
    } catch (error) {
      if (error instanceof SignInError) {
        await fbSignOut(auth);
        throw error;
      }
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/invalid-credential":
          case "auth/invalid-email":
          case "auth/user-not-found":
          case "auth/wrong-password":
            throw new SignInError("invalid-credentials");
          case "auth/too-many-requests":
            throw new SignInError("too-many-requests");
          case "auth/network-request-failed":
            throw new SignInError("network");
          case "auth/user-disabled":
            throw new SignInError("disabled");
        }
      }
      throw new SignInError("unknown");
    }
  }

  async signOut() {
    await fbSignOut(firebaseAuth());
  }

  async changePassword(current: string, next: string) {
    const user = firebaseAuth().currentUser;
    if (!user?.email) throw new SignInError("unknown");
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, current));
    await updatePassword(user, next);
    // Les règles n'autorisent que le passage de true → false sur ce champ.
    await updateDoc(doc(firestore(), "users", user.uid), { mustChangePassword: false });
  }
}
