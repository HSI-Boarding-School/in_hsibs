import { useEffect, useState } from "react";
import type { AdminDataFilter, AdminMappingData } from "./admin.model";
import { getAdminMappingData } from "./admin.repository";

export function useAdminMappingData(filter: AdminDataFilter = {}) {
  const [data, setData] = useState<AdminMappingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const snapshot = await getAdminMappingData(filter);
        if (!ignore) setData(snapshot);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Gagal memuat data mapping.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [filter.academicYearId, filter.gender]);

  return { data, isLoading, error };
}
