export interface PicDivDashboardData {
  division: { id: string; code: string; name: string };
  students: PicDivStudent[];
  pendingWeekly: PicDivWeeklyItem[];
  atRisk: PicDivRiskItem[];
  lowProgress: PicDivProgressItem[];
  averageSowProgress: number;
  projectStats: Record<string, number>;
  totalProjects: number;
  mandatoryProjects: number;
  mood: { good: number; okay: number; tough: number; total: number };
}

export interface PicDivStudent {
  pengabdianId: string;
  code: string;
  name: string;
}

export interface PicDivWeeklyItem {
  reportId: string;
  studentName: string;
  studentCode: string;
  week: string;
  sowStatus: string;
  highlight: string | null;
  lowlight: string | null;
}

export interface PicDivRiskItem {
  pengabdianId: string;
  studentName: string;
  studentCode: string;
  gyr: "Yellow" | "Red";
  sowProgress: number;
  adabScore: number;
  learnCount: number;
  note: string | null;
}

export interface PicDivProgressItem {
  pengabdianId: string;
  studentName: string;
  studentCode: string;
  sowProgress: number;
  note: string | null;
}
