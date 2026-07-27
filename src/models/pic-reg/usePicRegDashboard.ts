import { useCallback, useEffect, useState } from "react";
import type { PicRegDashboardData } from "./picReg.model";
import type { PicRegMappingData } from "./picReg.model";
import { getPicRegDashboard, getPicRegMappingData } from "./picReg.repository";

export function usePicRegDashboard(regionId: string | null | undefined) {
  const [data, setData] = useState<PicRegDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(regionId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!regionId) { setData(null); setIsLoading(false); return; }
    setIsLoading(true);
    setError(null);
    try { setData(await getPicRegDashboard(regionId)); }
    catch (err) { setError(err instanceof Error ? err.message : "Gagal memuat dashboard regional."); throw err; }
    finally { setIsLoading(false); }
  }, [regionId]);

  useEffect(() => { void refresh().catch(() => undefined); }, [refresh]);
  return { data, isLoading, error, refresh };
}

export function usePicRegMapping(regionId: string | null | undefined) {
  const [data, setData] = useState<PicRegMappingData | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(regionId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!regionId) { setData(null); setIsLoading(false); return; }
    setIsLoading(true);
    setError(null);
    try { setData(await getPicRegMappingData(regionId)); }
    catch (err) { setError(err instanceof Error ? err.message : "Gagal memuat mapping regional."); throw err; }
    finally { setIsLoading(false); }
  }, [regionId]);

  useEffect(() => { void refresh().catch(() => undefined); }, [refresh]);
  return { data, isLoading, error, refresh };
}
