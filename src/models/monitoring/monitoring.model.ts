import type { MoodStatus, ReportStatus } from "../../lib/supabase/types";

export interface MonitoringReportProgress {
  pengabdianId: string;
  siswaId: string;
  code: string;
  name: string;
  daily: {
    id: string | null;
    date: string | null;
    status: ReportStatus | null;
    morningDone: boolean;
    eveningDone: boolean;
    mood: MoodStatus | null;
    blocker: string | null;
    completion: number;
  };
  weekly: {
    id: string | null;
    periodStart: string | null;
    status: ReportStatus | null;
    label: string | null;
    sowStatus: string | null;
    sowProgress: number | null;
  };
  monthly: {
    id: string | null;
    periodStart: string | null;
    status: ReportStatus | null;
    month: number | null;
    year: number | null;
    gyr: string | null;
    mukafaahEligible: boolean;
  };
  compliance: number;
  needsAttention: boolean;
}

export interface PengabdianReportProgressViewRow {
  pengabdian_id: string;
  siswa_id: string;
  kode_santri: string | null;
  status_pengabdian: string;
  daily_report_id: string | null;
  daily_tanggal: string | null;
  daily_status: ReportStatus | null;
  daily_pagi_selesai: boolean | null;
  daily_sore_selesai: boolean | null;
  daily_mood: MoodStatus | null;
  daily_kendala: string | null;
  weekly_report_id: string | null;
  weekly_periode_mulai: string | null;
  weekly_status: ReportStatus | null;
  minggu_label: string | null;
  progres_sow_status: string | null;
  progres_sow_pct: number | null;
  monthly_report_id: string | null;
  monthly_periode_mulai: string | null;
  monthly_status: ReportStatus | null;
  monthly_bulan: number | null;
  monthly_tahun: number | null;
  status_gyr: string | null;
  eligible_mukafaah: boolean | null;
  daily_completion_pct: number;
}

export type RiskSeverity = "Low" | "Medium" | "High" | "Critical";
export type RiskStatus = "Open" | "In_Review" | "Monitoring" | "Resolved" | "Closed";

export interface MonitoringRiskReport {
  id: string;
  pengabdianId: string;
  studentCode: string;
  studentName: string;
  reporterName: string;
  reporterRole: "Admin" | "PIC_Div" | "PIC_Reg";
  category: string;
  severity: RiskSeverity;
  title: string;
  description: string;
  indicators: string[];
  recommendation: string | null;
  followUp: string | null;
  status: RiskStatus;
  assigneeName: string | null;
  targetDate: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PengabdianRiskReportViewRow {
  id: string;
  pengabdian_id: string;
  siswa_id: string;
  kode_santri: string | null;
  nama_santri: string;
  dilaporkan_oleh: string;
  nama_pelapor: string;
  peran_pelapor: "Admin" | "PIC_Div" | "PIC_Reg";
  kategori: string;
  severity: RiskSeverity;
  judul: string;
  deskripsi: string;
  indikator: import("../../lib/supabase/types").Json;
  rekomendasi_tindakan: string | null;
  tindak_lanjut: string | null;
  status: RiskStatus;
  ditugaskan_kepada: string | null;
  nama_assignee: string | null;
  report_id: string | null;
  project_id: string | null;
  target_selesai: string | null;
  diselesaikan_pada: string | null;
  catatan_penyelesaian: string | null;
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface MonitoringSelectOption<T extends string | number = string> {
  value: T;
  label: string;
  description?: string;
  icon?: string;
}

export interface MonitoringProjectOptions {
  tracks: MonitoringSelectOption<number>[];
  divisions: MonitoringSelectOption[];
  owners: MonitoringSelectOption[];
  reviewers: MonitoringSelectOption[];
}

export interface MonitoringProjectInput {
  name: string;
  trackId: number | null;
  divisionId: string | null;
  ownerIds: string[];
  platform: string;
  reviewerId: string | null;
  link: string;
  status: import("../../data/monitoring/projectData").Project["status"];
  wajib: boolean;
}

export interface MonitoringMukafaahRecord {
  evaluationId: string;
  pengabdianId: string;
  studentCode: string;
  studentName: string;
  period: string;
  learnCompleted: number;
  targetLearn: number;
  projectsApproved: number;
  targetProjects: number;
  reportsSubmitted: number;
  targetReports: number;
  adabScore: number;
  targetAdab: number;
  ready: boolean;
  gyr: string | null;
}
