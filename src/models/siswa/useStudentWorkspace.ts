import { useCallback, useEffect, useState } from "react";
import type { StudentWorkspaceData } from "./siswa.model";
import { getStudentWorkspace } from "./siswa.repository";

export function useStudentWorkspace(authUserId: string | null | undefined) {
  const [data, setData] = useState<StudentWorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(authUserId));
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!authUserId) { setData(null); setIsLoading(false); return; }
    setIsLoading(true); setError(null);
    try { setData(await getStudentWorkspace(authUserId)); }
    catch (err) { setError(err instanceof Error ? err.message : "Gagal memuat ruang kerja Santri."); throw err; }
    finally { setIsLoading(false); }
  }, [authUserId]);
  useEffect(() => { void refresh().catch(() => undefined); }, [refresh]);
  return { data, isLoading, error, refresh };
}
