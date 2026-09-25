"use client";

import { useSessionUser } from "@/data/auth/auth-provider";
import { THEOLOGY_DIPLOMA } from "@/data/institution";
import { loadStudentOverview } from "@/data/repositories";
import { useData } from "@/data/use-data";
import { type UserProfile } from "@/domain/types";

/** Profil étudiant ; pour le personnel en prévisualisation : 1re année du diplôme. */
export function useStudentProfile(): UserProfile {
  const { profile } = useSessionUser();
  if (profile.role === "student") return profile;
  return { ...profile, programId: profile.programId ?? THEOLOGY_DIPLOMA.id, level: profile.level ?? 1 };
}

export function useStudentOverview() {
  const profile = useStudentProfile();
  return { profile, ...useData(`overview:${profile.uid}`, (store) => loadStudentOverview(store, profile)) };
}
