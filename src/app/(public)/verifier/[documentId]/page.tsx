import type { Metadata } from "next";
import { Logo } from "@/components/brand/brand";
import { ButtonLink } from "@/components/ui/button";
import { decodeFirestoreValue } from "@/data/public-settings";
import { formatDate } from "@/domain/format";
import { DATA_MODE, FIREBASE_CONFIG } from "@/lib/env";

export const metadata: Metadata = {
  title: "Vérification d’un document",
  robots: { index: false, follow: false },
};

interface Verification {
  fullName: string;
  documentType: string;
  issuedAt: string;
  status: "valid" | "revoked";
}

/** Lecture de la fiche publique minimale `certificateVerifications/{id}` (API REST, sans SDK client). */
async function lookup(id: string): Promise<Verification | null> {
  if (DATA_MODE !== "firebase" || !/^[A-Za-z0-9_-]{6,64}$/.test(id)) return null;
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/certificateVerifications/${id}?key=${FIREBASE_CONFIG.apiKey}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { fields?: Record<string, never> };
    return decodeFirestoreValue({ mapValue: { fields: json.fields } }) as Verification;
  } catch {
    return null;
  }
}

export default async function VerifyPage({ params }: PageProps<"/verifier/[documentId]">) {
  const { documentId } = await params;
  const doc = await lookup(documentId);
  const valid = doc?.status === "valid";

  return (
    <section className="grid min-h-dvh place-items-center bg-forest-900 px-4 pt-[var(--header-height)] pb-16 text-ink-900">
      <div className="w-full max-w-lg rounded-md bg-ivory-50 p-8 text-center shadow-overlay sm:p-10">
        <Logo size={96} className="mx-auto size-20 object-contain" />
        <p className="eyebrow mt-5 text-gold-700">Vérification de document</p>
        {doc ? (
          <>
            <p className={`font-display mt-4 text-4xl ${valid ? "text-forest-700" : "text-danger-600"}`}>{valid ? "Document authentique" : "Document révoqué"}</p>
            <dl className="mt-8 divide-y divide-ink-900/10 text-left text-sm">
              {[
                ["Titulaire", doc.fullName],
                ["Document", doc.documentType],
                ["Délivré le", formatDate(doc.issuedAt)],
                ["Référence", documentId],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3">
                  <dt className="text-stone-500">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <>
            <p className="font-display mt-4 text-3xl">Référence introuvable</p>
            <p className="mt-3 text-stone-600">
              Aucun document ne correspond à la référence <span className="numeric font-semibold">{documentId}</span>. Vérifiez la saisie ou contactez le
              secrétariat académique.
            </p>
          </>
        )}
        <ButtonLink href="/" variant="outline" className="mt-8">
          Retour au site
        </ButtonLink>
      </div>
    </section>
  );
}
