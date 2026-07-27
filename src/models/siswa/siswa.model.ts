import type { MoodStatus, ReportStatus } from "../../lib/supabase/types";

export type StudentActionId = "daily" | "weekly" | "monthly" | "special" | "evidence" | "remind";

export interface StudentWorkspaceData {
  profile: {
    pengabdianId: string;
    code: string;
    name: string;
    avatarUrl: string | null;
    unit: string;
    location: string;
    divisions: string[];
    roles: string[];
    sow: Record<string, string[]>;
    picDivisions: string[];
    picRegional: string;
  };
  reports: StudentReportItem[];
  latestEvaluation: StudentEvaluation | null;
  projects: StudentProjectItem[];
  latestPicNote: { note: string; actor: string; createdAt: string } | null;
  openClarifications: number;
  evidenceCount: number;
  specialReportCount: number;
  primaryAssignmentId: string | null;
  primaryPicDivisionId: string | null;
}

export interface StudentReportItem {
  id: string;
  type: "Daily" | "Weekly" | "Monthly";
  status: ReportStatus;
  periodStart: string;
  periodEnd: string;
  submittedAt: string | null;
  summary: string;
}

export interface StudentEvaluation {
  period: string;
  sowProgress: number;
  adabScore: number;
  disciplineScore: number;
  learnCount: number;
  projectCount: number;
  checkinCount: number;
  gyr: string | null;
  mukafaahReady: boolean;
}

export interface StudentProjectItem {
  id: string;
  name: string;
  status: string;
  progress: number;
  platform: string;
  link: string;
}

export interface DailyReportInput { plan: string; recap: string; blocker: string; mood: MoodStatus; }
export interface WeeklyReportInput { progressStatus: "On Track" | "Behind" | "Ahead"; progressPercent: number; highlight: string; lowlight: string; reflection: string; }
export interface MonthlyReportInput { reflection: string; achievement: string; challenge: string; nextPlan: string; }
export interface SpecialReportInput { category: string; title: string; description: string; }
export interface EvidenceInput { reportId: string; file: File; }
export interface RemindPicInput { reportId: string | null; message: string; }
