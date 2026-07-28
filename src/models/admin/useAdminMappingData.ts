import { useCallback, useEffect, useState } from "react";
import type { AdminDataFilter, AdminMappingData } from "./admin.model";
import { getAdminMappingData } from "./admin.repository";

export function useAdminMappingData(filter: AdminDataFilter = {}) {
  const [data, setData] = useState<AdminMappingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { setData(await getAdminMappingData(filter)); }
    catch (err) { setError(err instanceof Error ? err.message : "Gagal memuat data mapping."); throw err; }
    finally { setIsLoading(false); }
  }, [filter.academicYearId, filter.gender, filter.divisionId]);

  useEffect(() => { void refresh().catch(() => undefined); }, [refresh]);

  return { data, isLoading, error, refresh };
}
