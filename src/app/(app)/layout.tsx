import type { Metadata } from "next";
import { AuthProvider } from "@/data/auth/auth-provider";

/** Espaces privés : jamais indexés (doublé par l'en-tête X-Robots-Tag de next.config.ts). */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
