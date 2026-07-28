export interface AdminDataFilter {
  academicYearId?: string;
  gender?: string;
  divisionId?: string;
}

export interface AdminDashboardSnapshot {
  totalStudents: number;
  activeStudents: number;
  totalPlacements: number;
  totalDivisionAssignments: number;
  pendingApprovals: number;
  completenessScore: number;
  divisionLoad: AdminLoadItem[];
  locationLoad: AdminLoadItem[];
  alerts: AdminAlert[];
  auditLogs: AdminAuditLog[];
}

export interface AdminLoadItem {
  label: string;
  value: number;
}

export interface AdminAlert {
  id: string;
  title: string;
  detail: string;
  level: "High" | "Medium" | "Info";
}

export interface AdminAuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
}

export interface AdminMappingDivisionOption {
  id: string;
  code: string;
  label: string;
}

export interface AdminMappingMasterOption {
  id: string;
  code?: string;
  label: string;
  regionId?: string | null;
}

export interface AdminMappingData {
  santri: import("../../data/santriData").Santri[];
  units: string[];
  divisions: AdminMappingDivisionOption[];
  locations: string[];
  scopeDivision?: AdminMappingDivisionOption;
  unitRecords: AdminMappingMasterOption[];
  locationRecords: AdminMappingMasterOption[];
  staffRecords: AdminMappingMasterOption[];
}
