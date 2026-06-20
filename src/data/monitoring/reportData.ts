export interface DailyEntry {
  sid: string;
  date: string;
  loc: string;
  plan: string;
  done: string;
  blocker: string;
  mood: "Good" | "Okay" | "Tough";
}

export interface WeeklyEntry {
  sid: string;
  week: string;
  sowProgress: "On Track" | "Behind" | "Ahead";
  highlight: string;
  lowlight: string;
  picNote: string;
  validated: boolean;
}

export interface MonthlyEntry {
  sid: string;
  month: string;
  learnAtt: number;
  projApproved: number;
  sowPct: number;
  adab: number;
  issues: string;
  followUp: string;
  picDivNote: string;
  picRegNote: string;
  status: "TBD" | "Green" | "Yellow" | "Red";
}

const s = (id: string) => id;

export const dailyEntries: DailyEntry[] = [
  { sid: s("S01"), date: "15/06", loc: "Pandeglang", plan: "Review materi Fikrah", done: "Selesai review", blocker: "Clear", mood: "Good" },
  { sid: s("S02"), date: "15/06", loc: "Sukabumi", plan: "Desain konten IG", done: "3 draft selesai", blocker: "Clear", mood: "Good" },
  { sid: s("S03"), date: "15/06", loc: "Purworejo", plan: "Coding fitur auth", done: "Login page selesai", blocker: "Butuh review API", mood: "Okay" },
  { sid: s("S04"), date: "15/06", loc: "Solo", plan: "Edit video kultum", done: "50% selesai", blocker: "Clear", mood: "Good" },
  { sid: s("S05"), date: "15/06", loc: "Bekasi", plan: "Rekap data BOS", done: "Selesai rekap", blocker: "Clear", mood: "Good" },
  { sid: s("S06"), date: "14/06", loc: "Solo", plan: "Persiapan mentoring", done: "Modul siap", blocker: "Clear", mood: "Good" },
  { sid: s("S07"), date: "14/06", loc: "Purworejo", plan: "SOP kepegawaian", done: "Draft awal", blocker: "Menunggu data", mood: "Okay" },
  { sid: s("S08"), date: "14/06", loc: "Sukabumi", plan: "Bug fixing", done: "2 bug fixed", blocker: "Clear", mood: "Good" },
  { sid: s("S09"), date: "14/06", loc: "Solo", plan: "Buat soal tahfidz", done: "20 soal selesai", blocker: "Clear", mood: "Good" },
  { sid: s("S10"), date: "13/06", loc: "Sukabumi", plan: "Membuat wireframe", done: "Belum selesai", blocker: "Kurang paham brief", mood: "Tough" },
];

export const weeklyEntries: WeeklyEntry[] = [
  { sid: s("S01"), week: "W24", sowProgress: "On Track", highlight: "Review Fikrah beres", lowlight: "-", picNote: "Good", validated: true },
  { sid: s("S02"), week: "W24", sowProgress: "Ahead", highlight: "Content selesai lebih cepat", lowlight: "-", picNote: "Keep it up", validated: true },
  { sid: s("S03"), week: "W24", sowProgress: "Behind", highlight: "Auth flow jalan", lowlight: "API integration lambat", picNote: "Butuh bantuan backend", validated: false },
  { sid: s("S04"), week: "W24", sowProgress: "On Track", highlight: "Video editing on progress", lowlight: "-", picNote: "", validated: true },
  { sid: s("S05"), week: "W24", sowProgress: "On Track", highlight: "Rekap selesai", lowlight: "-", picNote: "", validated: false },
  { sid: s("S06"), week: "W24", sowProgress: "Ahead", highlight: "Modul mentoring fix", lowlight: "-", picNote: "Excellent", validated: true },
  { sid: s("S07"), week: "W24", sowProgress: "Behind", highlight: "-", lowlight: "Data belum lengkap", picNote: "Koordinasi dengan PIC", validated: false },
  { sid: s("S08"), week: "W24", sowProgress: "On Track", highlight: "Bug fixing progress", lowlight: "-", picNote: "", validated: true },
  { sid: s("S09"), week: "W24", sowProgress: "On Track", highlight: "Soal tahfidz jadi 20", lowlight: "-", picNote: "On track", validated: true },
  { sid: s("S10"), week: "W24", sowProgress: "Behind", highlight: "-", lowlight: "Wireframe stuck", picNote: "Perlu brief ulang", validated: false },
];

export const monthlyEntries: MonthlyEntry[] = [
  { sid: s("S01"), month: "Jun 2025", learnAtt: 1, projApproved: 2, sowPct: 75, adab: 4, issues: "", followUp: "", picDivNote: "Baik", picRegNote: "", status: "Green" },
  { sid: s("S02"), month: "Jun 2025", learnAtt: 1, projApproved: 1, sowPct: 80, adab: 5, issues: "", followUp: "", picDivNote: "Konsisten", picRegNote: "", status: "Green" },
  { sid: s("S03"), month: "Jun 2025", learnAtt: 1, projApproved: 0, sowPct: 50, adab: 3, issues: "API integration lambat", followUp: "Diskusi dengan Kak Andy", picDivNote: "Perlu bimbingan teknis", picRegNote: "Follow up pekan depan", status: "Yellow" },
  { sid: s("S04"), month: "Jun 2025", learnAtt: 1, projApproved: 0, sowPct: 60, adab: 4, issues: "", followUp: "", picDivNote: "Progress baik", picRegNote: "", status: "Green" },
  { sid: s("S05"), month: "Jun 2025", learnAtt: 1, projApproved: 0, sowPct: 70, adab: 4, issues: "", followUp: "", picDivNote: "", picRegNote: "", status: "Green" },
  { sid: s("S06"), month: "Jun 2025", learnAtt: 1, projApproved: 1, sowPct: 90, adab: 5, issues: "", followUp: "", picDivNote: "Excellent", picRegNote: "", status: "Green" },
  { sid: s("S07"), month: "Jun 2025", learnAtt: 1, projApproved: 0, sowPct: 40, adab: 3, issues: "Data tidak lengkap", followUp: "Koordinasi dengan unit", picDivNote: "Perlu dorongan", picRegNote: "Butuh perhatian", status: "Yellow" },
  { sid: s("S08"), month: "Jun 2025", learnAtt: 1, projApproved: 0, sowPct: 65, adab: 4, issues: "", followUp: "", picDivNote: "Teknis oke", picRegNote: "", status: "Green" },
  { sid: s("S09"), month: "Jun 2025", learnAtt: 1, projApproved: 0, sowPct: 55, adab: 4, issues: "", followUp: "", picDivNote: "Aman", picRegNote: "", status: "Green" },
  { sid: s("S10"), month: "Jun 2025", learnAtt: 0, projApproved: 0, sowPct: 30, adab: 2, issues: "Kurang paham brief projek", followUp: "Brief ulang dengan PIC Div", picDivNote: "Membutuhkan arahan", picRegNote: "Intervensi ringan", status: "Yellow" },
];
