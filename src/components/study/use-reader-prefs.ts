"use client";

import { useCallback, useSyncExternalStore } from "react";

export type ReaderTheme = "paper" | "sepia" | "night";
export interface ReaderPrefs {
  theme: ReaderTheme;
  size: 0 | 1 | 2 | 3;
  focus: boolean;
}

const KEY = "mbi-reader-prefs";
const DEFAULTS: ReaderPrefs = { theme: "paper", size: 1, focus: false };
export const READING_SIZES = ["1.0625rem", "1.1875rem", "1.3125rem", "1.4375rem"] as const;

let current: ReaderPrefs | null = null;
const listeners = new Set<() => void>();

function read(): ReaderPrefs {
  if (current) return current;
  try {
    const raw = localStorage.getItem(KEY);
    current = raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ReaderPrefs>) } : DEFAULTS;
  } catch {
    current = DEFAULTS;
  }
  return current;
}

function write(next: ReaderPrefs) {
  current = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* préférences limitées à la session */
  }
  for (const l of listeners) l();
}

/** Préférences de lecture (thème, taille, focus), persistées localement. */
export function useReaderPrefs() {
  const prefs = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => DEFAULTS,
  );
  const update = useCallback((patch: Partial<ReaderPrefs>) => write({ ...read(), ...patch }), []);
  return [prefs, update] as const;
}
