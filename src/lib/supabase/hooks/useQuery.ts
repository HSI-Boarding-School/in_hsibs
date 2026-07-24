import { useEffect, useState, useCallback } from "react";

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Generic hook untuk query Supabase.
 * Otomatis fetch saat mount, bisa di-refetch manual.
 *
 * @example
 * const { data, loading, error, refetch } = useQuery(
 *   () => getAllSantriAktif(),
 *   []
 * );
 */
export function useQuery<T>(queryFn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await queryFn();
      setState({ data, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setState({ data: null, loading: false, error: message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...state, refetch: fetch };
}

/**
 * Generic hook untuk mutation (insert/update/delete).
 * Tidak auto-fetch, dipanggil manual.
 *
 * @example
 * const { mutate, loading, error } = useMutation(
 *   (teks: string) => createTask({ teks, prioritas: 'high' })
 * );
 * await mutate("Review laporan harian");
 */
export function useMutation<TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (args: TArgs): Promise<TResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutationFn(args);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Terjadi kesalahan";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn],
  );

  return { mutate, loading, error };
}
