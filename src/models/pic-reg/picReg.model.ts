export interface PicRegDashboardData {
  region: { id: string; name: string };
  totalStudents: number;
  atRiskCount: number;
  mukafaahReadyCount: number;
  locations: PicRegLocationSummary[];
  pendingApprovals: PicRegApprovalItem[];
  warnings: PicRegWarningItem[];
  mukafaah: PicRegMukafaahItem[];
}

export interface PicRegMappingData {
  region: { id: string; name: string };
  locations: { id: string; name: string }[];
  students: import("../../data/santriData").Santri[];
}

export interface PicRegLocationSummary {
  id: string;
  name: string;
  totalStudents: number;
  green: number;
  yellow: number;
  red: number;
}

export interface PicRegApprovalItem {
  reportId: string;
  studentName: string;
  studentCode: string;
  location: string;
  period: string;
}

export interface PicRegWarningItem {
  id: string;
  studentName: string;
  location: string;
  title: string;
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
}

export interface PicRegMukafaahItem {
  evaluationId: string;
  reportId: string;
  studentName: string;
  studentCode: string;
  location: string;
  period: string;
  reportStatus: import("../../lib/supabase/types").ReportStatus;
  sowProgress: number;
  adabScore: number;
  learnCount: number;
  projectCount: number;
  ready: boolean;
  gyr: string | null;
}
