import { type Role } from "@/domain/roles";
import { type UserProfile } from "@/domain/types";

export interface SessionUser {
  uid: string;
  username: string;
  role: Role;
  profile: UserProfile;
}

export type AuthState =
  | { status: "loading"; user: null }
  | { status: "signed-out"; user: null }
  | { status: "signed-in"; user: SessionUser };

export type SignInErrorCode = "invalid-credentials" | "too-many-requests" | "network" | "disabled" | "no-role" | "unknown";

export class SignInError extends Error {
  constructor(public readonly code: SignInErrorCode) {
    super(code);
  }
}

export interface AuthAdapter {
  /** S'abonne aux changements de session ; renvoie la fonction de désabonnement. */
  subscribe(listener: (state: AuthState) => void): () => void;
  signIn(identifier: string, password: string, remember: boolean): Promise<SessionUser>;
  signOut(): Promise<void>;
  changePassword(current: string, next: string): Promise<void>;
}

export const SIGN_IN_MESSAGES: Record<SignInErrorCode, string> = {
  "invalid-credentials": "Identifiant ou mot de passe incorrect.",
  "too-many-requests": "Trop de tentatives. Patientez quelques minutes avant de réessayer.",
  network: "Connexion au serveur impossible. Vérifiez votre réseau puis réessayez.",
  disabled: "Ce compte est suspendu. Contactez le secrétariat académique.",
  "no-role": "Votre compte n’a pas encore de rôle attribué. Contactez le secrétariat académique.",
  unknown: "Une erreur inattendue est survenue. Réessayez.",
};
