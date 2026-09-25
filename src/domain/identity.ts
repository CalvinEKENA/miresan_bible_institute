/**
 * Identité par identifiant (« pasteurarmel ») : Firebase Auth exige une adresse,
 * on dérive donc une identité technique `<identifiant>@<domaine interne>`.
 * L'utilisateur ne voit et ne saisit que son identifiant.
 */
export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{1,30}[a-z0-9])$/;

export function normalizeUsername(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, ".");
}

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

/** Transforme un identifiant (ou une adresse e-mail) en identité Firebase Auth. */
export function identifierToAuthEmail(identifier: string, domain: string): string {
  const value = identifier.trim().toLowerCase();
  if (value.includes("@")) return value;
  return `${normalizeUsername(value)}@${domain}`;
}

/** Inverse : retrouve l'identifiant visible à partir de l'identité technique. */
export function authEmailToUsername(email: string, domain: string): string {
  const suffix = `@${domain}`;
  return email.endsWith(suffix) ? email.slice(0, -suffix.length) : email;
}

export const PASSWORD_MIN_LENGTH = 8;

/** Règle minimale pour les nouveaux mots de passe choisis par l'utilisateur. */
export function passwordIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < PASSWORD_MIN_LENGTH) issues.push(`Au moins ${PASSWORD_MIN_LENGTH} caractères.`);
  if (!/[A-Za-z]/.test(password)) issues.push("Au moins une lettre.");
  if (!/\d/.test(password)) issues.push("Au moins un chiffre.");
  return issues;
}
