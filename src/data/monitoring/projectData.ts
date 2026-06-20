export interface Project {
  id: string;
  name: string;
  track: string;
  div: string;
  owners: string[];
  platform: string;
  link: string;
  reviewer: string;
  status: "Idea" | "In Progress" | "Submitted" | "Approved" | "Archived";
  wajib: boolean;
}

export const projects: Project[] = [
  {
    id: "P001", name: "30 Days Design Challenge",
    track: "Design Showcase", div: "DKV",
    owners: ["S01", "S10", "S12"],
    platform: "Behance", link: "", reviewer: "Kak Abdur · Ust. Raakin",
    status: "Idea", wajib: true,
  },
  {
    id: "P002", name: "Kultum Series — Santri Speaks",
    track: "Dakwah & Public Speaking", div: "All",
    owners: ["S02", "S06", "S21"],
    platform: "YouTube / Instagram", link: "", reviewer: "Ust. Haidar · Ust. Raakin",
    status: "Idea", wajib: true,
  },
  {
    id: "P003", name: "IN_HSIBS Web App Feature",
    track: "Technical Builder", div: "IT",
    owners: ["S03", "S08", "S11", "S17", "S19"],
    platform: "GitHub / IN_HSIBS", link: "", reviewer: "Kak Andy · Kak Ari",
    status: "Idea", wajib: true,
  },
  {
    id: "P004", name: "Modul Ajar Tahfidz Digital",
    track: "Teaching & Knowledge", div: "AC",
    owners: ["S09", "S15", "S21"],
    platform: "Notion / YouTube", link: "", reviewer: "Ust. Zicko · Kak Ari",
    status: "Idea", wajib: true,
  },
  {
    id: "P005", name: "SOP Operasional Unit HSI BS",
    track: "Operational Service", div: "OPS",
    owners: ["S05", "S07", "S16"],
    platform: "Notion / Google Docs", link: "", reviewer: "Mr. Azis · Ust. Raakin",
    status: "Idea", wajib: true,
  },
  {
    id: "P006", name: "Laporan BOS & ARKAS Q1",
    track: "PKBM Output", div: "PKBM",
    owners: ["S05", "S16"],
    platform: "Sistem PKBM", link: "", reviewer: "Pak Aryo · Ust. Raakin",
    status: "Idea", wajib: true,
  },
  {
    id: "P007", name: "LinkedIn Storyteller — 30 Days",
    track: "Storyteller", div: "DKV",
    owners: ["S04", "S12"],
    platform: "LinkedIn", link: "", reviewer: "Kak Abdur · Kak Ari",
    status: "Idea", wajib: false,
  },
  {
    id: "P008", name: "IT Helpdesk Internal Tool",
    track: "Technical Builder", div: "IT",
    owners: ["S13", "S14"],
    platform: "GitHub", link: "", reviewer: "Kak Andy · Ust. Raakin",
    status: "Idea", wajib: false,
  },
];

export const trackColors: Record<string, string> = {
  Storyteller: "bg-purple/10 text-purple",
  "Design Showcase": "bg-[#f3e5f5] text-[#6b21a8]",
  "Technical Builder": "bg-amber/10 text-amber-dark",
  "Teaching & Knowledge": "bg-blue/10 text-blue",
  "Operational Service": "bg-pink/10 text-pink-dark",
  "Dakwah & Public Speaking": "bg-orange/10 text-orange",
  "PKBM Output": "bg-emerald/10 text-emerald",
};

export const statusBadge: Record<string, string> = {
  Idea: "bg-muted/10 text-muted",
  "In Progress": "bg-amber/10 text-amber-dark",
  Submitted: "bg-blue/10 text-blue",
  Approved: "bg-green/10 text-green",
  Archived: "bg-surface-strong text-muted",
};
