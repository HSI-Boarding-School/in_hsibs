import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from "react";

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
  const stateRef = useRef(state);

  const setStoredState = useCallback<Dispatch<SetStateAction<T>>>((nextValue) => {
    const next = typeof nextValue === "function"
      ? (nextValue as (current: T) => T)(stateRef.current)
      : nextValue;
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(next));
    } catch (error) {
      const detail = error instanceof Error && error.message ? ` ${error.message}` : "";
      throw new Error(`Pengaturan tidak dapat disimpan ke browser.${detail}`);
    }
    stateRef.current = next;
    setState(next);
  }, [key]);

  return [state, setStoredState] as const;
}
