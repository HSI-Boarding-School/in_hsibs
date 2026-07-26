import { useQuery } from "../../lib/supabase/hooks/useQuery";
import { getAdminDashboardSnapshot } from "./admin.repository";
import type { AdminDataFilter } from "./admin.model";

export function useAdminDashboard(filter: AdminDataFilter = {}) {
  return useQuery(
    () => getAdminDashboardSnapshot(filter),
    [filter.academicYearId, filter.gender],
  );
}
