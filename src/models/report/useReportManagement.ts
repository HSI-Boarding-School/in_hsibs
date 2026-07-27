import { useCallback, useEffect, useState } from "react";
import { getReportManagementData } from "./report.repository";
import type { ReportManagementData } from "./report.model";

const emptyData: ReportManagementData = { queue: [], missing: [], history: [] };

export function useReportManagement() {
  const [data, setData] = useState<ReportManagementData>(emptyData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      setData(await getReportManagementData());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat Report Management.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void refresh().catch(() => undefined); }, [refresh]);
  return { data, isLoading, error, refresh };
}
