import { useCallback, useEffect, useState } from "react";
import type { PicDivDashboardData } from "./picDiv.model";
import { getPicDivDashboard } from "./picDiv.repository";

export function usePicDivDashboard(divisionId: string | null | undefined) {
  const [data, setData] = useState<PicDivDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(divisionId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!divisionId) { setData(null); setIsLoading(false); return; }
    setIsLoading(true);
    setError(null);
    try { setData(await getPicDivDashboard(divisionId)); }
    catch (err) { setError(err instanceof Error ? err.message : "Gagal memuat dashboard divisi."); throw err; }
    finally { setIsLoading(false); }
  }, [divisionId]);

  useEffect(() => { void refresh().catch(() => undefined); }, [refresh]);
  return { data, isLoading, error, refresh };
}
