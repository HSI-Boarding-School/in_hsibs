import type { MoodStatus, ReportStatus } from "../../lib/supabase/types";

export type ReportScope = "Daily" | "Weekly" | "Monthly";

export interface ReportQueueItem {
  id: string;
  pengabdianId: string;
  studentCode: string;
  studentName: string;
  scope: ReportScope;
  periodStart: string;
  periodEnd: string;
  status: ReportStatus;
  version: number;
  submittedAt: string | null;
  updatedAt: string;
  summary: string;
  details: ReportDetailItem[];
  mood?: MoodStatus | null;
  hasBlocker: boolean;
  latestNote: string | null;
}

export interface ReportDetailItem {
  label: string;
  value: string;
}

export interface MissingReportItem {
  id: string;
  pengabdianId: string;
  studentCode: string;
  studentName: string;
  scope: ReportScope;
  periodStart: string;
  periodLabel: string;
  remindedAt: string | null;
}

export interface ReportHistoryItem {
  id: string;
  reportId: string;
  studentName: string;
  studentCode: string;
  scope: ReportScope;
  action: string;
  statusBefore: ReportStatus | null;
  statusAfter: ReportStatus;
  note: string | null;
  actor: string;
  createdAt: string;
}

export interface ReportManagementData {
  queue: ReportQueueItem[];
  missing: MissingReportItem[];
  history: ReportHistoryItem[];
}
