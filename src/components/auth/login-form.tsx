"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/data/auth/auth-provider";
import { SIGN_IN_MESSAGES, SignInError } from "@/data/auth/types";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/data/demo/accounts";
import { homePathFor, ROLE_LABELS } from "@/domain/roles";
import { cn } from "@/lib/cn";

/** N'accepte que des chemins internes (pas de redirection ouverte). */
function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}

const field =
  "peer w-full border-0 border-b border-ink-900/20 bg-transparent px-0 pt-6 pb-2 text-[1.0625rem] text-ink-900 outline-none transition-colors placeholder:text-transparent focus:border-forest-700 focus:ring-0";
const floating =
  "pointer-events-none absolute top-6 left-0 origin-left text-[0.9375rem] text-stone-500 transition-all duration-(--duration-quick) peer-focus:top-0 peer-focus:text-[0.6875rem] peer-focus:font-semibold peer-focus:tracking-[0.14em] peer-focus:text-gold-700 peer-focus:uppercase peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[0.6875rem] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:tracking-[0.14em] peer-[:not(:placeholder-shown)]:uppercase";

export function LoginForm({ demo, phones, email }: { demo: boolean; phones: string[]; email: string }) {
  const { state, signIn, signOut } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const id = useId();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [forgot, setForgot] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!identifier.trim() || !password) {
      setError("Saisissez votre identifiant et votre mot de passe.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const user = await signIn(identifier, password, remember);
      router.replace(safeNext(params.get("suite")) ?? homePathFor(user.role));
    } catch (e) {
      setError(SIGN_IN_MESSAGES[e instanceof SignInError ? e.code : "unknown"]);
      setPending(false);
    }
  }

  if (state.status === "signed-in" && !pending) {
    const { user } = state;
    return (
      <div className="mt-8 text-center">
        <p className="text-stone-600">
          Vous êtes connecté en tant que <strong className="text-ink-900">{user.profile.displayName}</strong>
          <span className="block text-sm">{ROLE_LABELS[user.role]}</span>
        </p>
        <Button className="mt-6 w-full" size="lg" arrow onClick={() => router.push(homePathFor(user.role))}>
          Continuer vers mon espace
        </Button>
        <button type="button" onClick={() => void signOut()} className="mt-4 text-sm text-stone-500 underline-offset-4 hover:underline">
          Changer de compte
        </button>
      </div>
    );
  }

  if (forgot) {
    return (
      <div className="mt-8" aria-live="polite">
        <h2 className="font-display text-2xl">Mot de passe oublié</h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone-600">
          Pour protéger vos données, la réinitialisation est effectuée par le <strong>secrétariat académique</strong>, après
          vérification de votre identité. Un nouveau mot de passe provisoire vous sera remis ; vous le changerez à la
          première connexion.
        </p>
        <ul className="mt-5 space-y-2 border-t border-ink-900/10 pt-5 text-[0.9375rem]">
          {phones.map((p) => (
            <li key={p}>
              <a className="numeric font-semibold text-forest-700 hover:underline" href={`tel:${p.replace(/\s/g, "")}`}>
                {p}
              </a>
            </li>
          ))}
          <li>
            <a className="font-semibold text-forest-700 hover:underline" href={`mailto:${email}?subject=${encodeURIComponent("Réinitialisation de mot de passe")}`}>
              {email}
            </a>
          </li>
        </ul>
        <Button variant="outline" className="mt-7 w-full" onClick={() => setForgot(false)}>
          Revenir à la connexion
        </Button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-6" aria-describedby={error ? `${id}-error` : undefined}>
        <div className="relative">
          <input
            id={`${id}-identifier`}
            name="username"
            className={field}
            placeholder="Identifiant"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            aria-invalid={!!error}
            required
          />
          <label htmlFor={`${id}-identifier`} className={floating}>
            Identifiant
          </label>
        </div>

        <div className="relative">
          <input
            id={`${id}-password`}
            name="password"
            type={showPassword ? "text" : "password"}
            className={cn(field, "pr-20")}
            placeholder="Mot de passe"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!error}
            required
          />
          <label htmlFor={`${id}-password`} className={floating}>
            Mot de passe
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-0 bottom-2 text-xs font-semibold tracking-[0.08em] text-stone-500 uppercase hover:text-ink-900"
            aria-pressed={showPassword}
            aria-controls={`${id}-password`}
          >
            {showPassword ? "Masquer" : "Afficher"}
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2.5 text-stone-600 select-none">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 accent-forest-700" />
            Se souvenir de moi
          </label>
          <button type="button" onClick={() => setForgot(true)} className="font-medium text-forest-700 underline-offset-4 hover:underline">
            Mot de passe oublié ?
          </button>
        </div>

        <p id={`${id}-error`} role="alert" aria-live="assertive" className={cn("min-h-5 text-sm font-medium text-danger-600", !error && "sr-only")}>
          {error}
        </p>

        <Button type="submit" size="lg" className="-mt-2 w-full" disabled={pending} arrow={!pending}>
          {pending ? (
            <>
              <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-ivory-50/30 border-t-ivory-50" />
              Ouverture…
            </>
          ) : (
            "Se connecter"
          )}
        </Button>
      </form>

      {demo && (
        <section aria-labelledby={`${id}-demo`} className="mt-8 border-t border-dashed border-gold-600/40 pt-6">
          <p id={`${id}-demo`} className="eyebrow text-gold-700">
            Mode démonstration
          </p>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-stone-500">
            Données fictives. Choisissez un profil, puis connectez-vous (mot de passe « {DEMO_PASSWORD} »).
          </p>
          <ul className="mt-4 grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <li key={a.username}>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier(a.username);
                    setPassword(DEMO_PASSWORD);
                    setError(null);
                  }}
                  className={cn(
                    "flex h-full w-full flex-col items-start rounded-sm border px-2.5 py-2 text-left transition-colors",
                    identifier === a.username ? "border-forest-700 bg-forest-800/6" : "border-ink-900/12 hover:border-ink-900/30",
                  )}
                >
                  <span className="text-[0.8125rem] font-semibold text-ink-900">{a.label}</span>
                  <span className="mt-0.5 text-[0.6875rem] leading-tight text-stone-500">{a.detail}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
