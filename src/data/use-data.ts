"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getStore, type DataStore } from "./store";

type Status = "loading" | "ready" | "error";

const cache = new Map<string, unknown>();

/**
 * Chargement de données avec cache mémoire par clé (navigation instantanée
 * entre pages déjà visitées, pas de requête réseau redondante sur mobile).
 */
export function useData<T>(key: string | null, fetcher: (store: DataStore) => Promise<T>) {
  const [state, setState] = useState<{ status: Status; data: T | undefined; error?: unknown }>(() =>
    key && cache.has(key) ? { status: "ready", data: cache.get(key) as T } : { status: "loading", data: undefined },
  );
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const load = useCallback(async () => {
    if (!key) return;
    try {
      const data = await fetcherRef.current(await getStore());
      cache.set(key, data);
      setState({ status: "ready", data });
    } catch (error) {
      console.error(error);
      setState((s) => ({ status: s.data === undefined ? "error" : "ready", data: s.data, error }));
    }
  }, [key]);

  useEffect(() => {
    // Chargement asynchrone : l'état est mis à jour après résolution, pas pendant le rendu.
    void load();
  }, [load]);

  return { ...state, reload: load };
}

export function invalidate(prefix: string) {
  for (const k of cache.keys()) if (k.startsWith(prefix)) cache.delete(k);
}
