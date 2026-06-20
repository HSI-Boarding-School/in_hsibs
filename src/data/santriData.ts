export interface Santri {
  id: string;
  name: string;
  unit: "HSI BS" | "HSI BO" | "STIT Riyadh";
  loc: string;
  divs: string[];
  roles: string[];
  picDivs: string[];
  picReg: string;
  status: "Active" | "On Hold" | "Inactive" | "Alumni";
}

export const divisions = [
  { code: "AC", label: "Academic", cls: "c-ac" },
  { code: "DEEN", label: "Deen", cls: "c-deen" },
  { code: "DKV", label: "Creative", cls: "c-dkv" },
  { code: "IT", label: "IT", cls: "c-it" },
  { code: "OPS", label: "Operations", cls: "c-ops" },
  { code: "PKBM", label: "PKBM", cls: "c-pkbm" },
];

export const locations = [
  "Sukabumi",
  "Bekasi",
  "Purworejo",
  "Bantul",
  "Solo",
  "Pandeglang",
  "Remote",
];

export const units = ["HSI BS", "HSI BO", "STIT Riyadh"] as const;

const rolesByDiv: Record<string, string[]> = {
  AC: ["Asmen IT", "Asmen B. English", "Pengajar SDIT", "Pengajar TPQ"],
  DEEN: ["Tahfidz", "Arabic", "Musyrif"],
  DKV: ["Designer", "Video Editor", "OBS Operator", "Photographer", "Social Media", "Copywriter"],
  IT: ["Developer", "QA", "IT Helpdesk", "System Admin"],
  OPS: ["Administration", "Customer Service", "Sarpras", "Imam", "Muadzin", "Front Office"],
  PKBM: ["BOS Operator", "ARKAS Operator", "SIMBOS Operator"],
};

function autoRoles(divs: string[]): string[] {
  const roles: string[] = [];
  divs.forEach((d) => {
    (rolesByDiv[d] || []).forEach((r) => {
      if (!roles.includes(r)) roles.push(r);
    });
  });
  return roles;
}

function autoPicDiv(divs: string[], loc: string): string[] {
  const pics = new Set<string>();
  divs.forEach((d) => {
    if (d === "AC") pics.add("Ust. Zicko");
    if (d === "AC") pics.add("Mr. Fadil");
    if (d === "DEEN") pics.add("Ust. Haidar");
    if (d === "DKV") pics.add("Kak Abdur");
    if (d === "IT") pics.add("Kak Andy");
    if (d === "PKBM") pics.add("Pak Aryo");
    if (d === "OPS") {
      if (loc === "Solo") { pics.add("Pak Amirul"); pics.add("Pak Angga"); }
      else if (loc === "Bantul") { pics.add("Pak Gigih"); pics.add("Pak Wahyu"); }
      else if (loc === "Bekasi") pics.add("Pak Gusti");
      else if (loc === "Sukabumi") pics.add("Ust. Alan");
      else if (loc === "Purworejo") pics.add("Mr. Azis");
      else if (loc === "Pandeglang") pics.add("Ust. STITR");
      else if (loc === "Remote") pics.add("Ust. Zicko");
    }
  });
  return [...pics];
}

function autoPicReg(loc: string): string {
  if (["Sukabumi", "Bekasi", "Pandeglang", "Remote"].includes(loc))
    return "Ust. Raakin (West Java)";
  if (["Purworejo", "Bantul", "Solo"].includes(loc))
    return "Kak Ari (Central Java)";
  return "";
}

const raw: [string, string, string, string, string[]][] = [
  ["IN_HSIBS_S01", "Abdullah Al Farros", "STIT Riyadh", "Pandeglang", ["DKV", "OPS"]],
  ["IN_HSIBS_S02", "Abdulloh", "HSI BS", "Sukabumi", ["DEEN", "OPS"]],
  ["IN_HSIBS_S03", "Abdurrahman Hammaam Bariq", "HSI BS", "Purworejo", ["AC", "IT"]],
  ["IN_HSIBS_S04", "Abu Musa Al Asyary", "HSI BO", "Solo", ["DKV", "OPS"]],
  ["IN_HSIBS_S05", "Ahmad Faiz", "HSI BO", "Bekasi", ["OPS", "PKBM"]],
  ["IN_HSIBS_S06", "Ahmad Haidar Hutasuhut", "HSI BO", "Solo", ["DEEN", "OPS"]],
  ["IN_HSIBS_S07", "Ahmad Harits", "HSI BS", "Purworejo", ["OPS"]],
  ["IN_HSIBS_S08", "Ayyub El Kaisi", "HSI BS", "Sukabumi", ["AC", "IT"]],
  ["IN_HSIBS_S09", "Bagus Surya Dimeja", "HSI BO", "Solo", ["AC", "DEEN"]],
  ["IN_HSIBS_S10", "Maulana Aqila Umar Abdul Aziz", "HSI BS", "Sukabumi", ["DKV", "OPS"]],
  ["IN_HSIBS_S11", "Mu'adz Jundyurrahman", "HSI BS", "Purworejo", ["AC", "IT"]],
  ["IN_HSIBS_S12", "Muhammad Afif Hikam", "HSI BO", "Bekasi", ["DKV", "OPS"]],
  ["IN_HSIBS_S13", "Muhammad Atsaal Hakim", "HSI BS", "Sukabumi", ["IT", "OPS"]],
  ["IN_HSIBS_S14", "Muhammad Dafa Al Fatih", "HSI BS", "Sukabumi", ["IT", "OPS"]],
  ["IN_HSIBS_S15", "Muhammad Daffa Al Hafizh", "STIT Riyadh", "Pandeglang", ["DEEN", "IT"]],
  ["IN_HSIBS_S16", "Muhammad Firdaus Abdurrohim", "HSI BS", "Remote", ["OPS", "PKBM"]],
  ["IN_HSIBS_S17", "Muhammad Rabbani Ibnu Ridwan", "HSI BS", "Sukabumi", ["AC", "IT"]],
  ["IN_HSIBS_S18", "Muhammad Sultan Al Faisal", "HSI BO", "Bantul", ["AC", "OPS"]],
  ["IN_HSIBS_S19", "Muhammad Zaki NIF", "HSI BS", "Purworejo", ["AC", "IT"]],
  ["IN_HSIBS_S20", "Mujahiddin Khoirusysyifa", "HSI BS", "Purworejo", ["AC", "OPS"]],
  ["IN_HSIBS_S21", "Tsabit Az Zaqi", "HSI BO", "Bantul", ["AC", "DEEN", "OPS"]],
];

export const santriList: Santri[] = raw.map(([id, name, unit, loc, divs]) => ({
  id,
  name,
  unit: unit as Santri["unit"],
  loc,
  divs,
  roles: autoRoles(divs),
  picDivs: autoPicDiv(divs, loc),
  picReg: autoPicReg(loc),
  status: "Active",
}));

export function getDivLabel(code: string): string {
  return divisions.find((d) => d.code === code)?.label ?? code;
}

export function getUnitColor(unit: string): string {
  if (unit === "HSI BS") return "bg-blue-100 text-blue-800";
  if (unit === "HSI BO") return "bg-purple-100 text-purple-800";
  return "bg-green-100 text-green-800";
}

export function getDivColor(div: string): string {
  const map: Record<string, string> = {
    AC: "bg-blue-100 text-blue-800",
    DEEN: "bg-green-100 text-green-800",
    DKV: "bg-purple-100 text-purple-800",
    IT: "bg-yellow-100 text-yellow-800",
    OPS: "bg-pink-100 text-pink-800",
    PKBM: "bg-emerald-100 text-emerald-800",
  };
  return map[div] ?? "bg-gray-100 text-gray-800";
}

export const picDivList = [
  "Ust. Zicko", "Ust. Haidar", "Ust. Alan", "Kak Abdur", "Kak Andy",
  "Mr. Fadil", "Mr. Azis", "Pak Aryo", "Pak Amirul", "Pak Angga",
  "Pak Gigih", "Pak Wahyu", "Pak Gusti", "Ust. STITR", "Ust. SDIT IQ",
];

export const picRegList = [
  "Kak Ari (Central Java)",
  "Ust. Raakin (West Java)",
];
