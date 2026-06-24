import { useEffect, useState } from "react";

type Initializer<T> = T | (() => T);

function resolveInitial<T>(initialValue: Initializer<T>): T {
  return typeof initialValue === "function"
    ? (initialValue as () => T)()
    : initialValue;
}

export function useLocalStorageState<T>(key: string, initialValue: Initializer<T>) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return resolveInitial(initialValue);

    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored) as T;
    } catch {
      // Fall back to initial value if storage is unavailable or corrupted.
    }

    return resolveInitial(initialValue);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Ignore quota/private-mode failures; UI state still works in memory.
    }
  }, [key, state]);

  return [state, setState] as const;
}
