import type {
  Role,
  NavigationItem,
  Stat,
  SidebarStat,
  Activity,
  RoleDashboardContentMap,
} from "../types";

export const roles: Role[] = [
  { id: "admin", label: "Admin", hint: "Kelola semua data pengabdian" },
  { id: "pic-div", label: "PIC Div", hint: "Pantau divisi dan laporan harian" },
  { id: "pic-reg", label: "PIC Reg", hint: "Pantau wilayah dan penempatan" },
  { id: "siswa", label: "Siswa", hint: "Lihat tugas dan progres pribadi" },
];

export const navigationItems: NavigationItem[] = [
  {
    id: "home",
    label: "Home",
    shortcut: "HM",
    icon: "solar:home-angle-bold-duotone",
  },
  {
    id: "mapping",
    label: "Mapping",
    shortcut: "MP",
    icon: "solar:widget-4-bold-duotone",
  },
  {
    id: "monitoring",
    label: "Monitoring",
    shortcut: "MN",
    icon: "solar:calendar-minimalistic-bold-duotone",
  },
  {
    id: "report",
    label: "Report",
    shortcut: "RP",
    icon: "solar:file-text-bold-duotone",
  },
  {
    id: "settings",
    label: "Settings",
    shortcut: "ST",
    icon: "solar:settings-bold-duotone",
  },
];

export const stats: Stat[] = [
  { label: "Total Santri", value: "248", tone: "green" },
  { label: "Aktif Pengabdian", value: "221", tone: "blue" },
  { label: "Butuh Follow Up", value: "17", tone: "orange" },
  { label: "Laporan Masuk", value: "86%", tone: "purple" },
];

export const sidebarStats: SidebarStat[] = [
  { label: "Divisi", value: "12" },
  { label: "Regional", value: "8" },
  { label: "Terlambat Lapor", value: "9" },
];

export const activities: Activity[] = [
  {
    name: "Ahmad Fikri",
    location: "Pondok Al-Huda",
    division: "Pendidikan",
    status: "Aman",
    progress: "92%",
  },
  {
    name: "Nabila Zahra",
    location: "Kantor Regional Timur",
    division: "Administrasi",
    status: "Review",
    progress: "74%",
  },
  {
    name: "Raka Maulana",
    location: "Masjid Baiturrahman",
    division: "Dakwah",
    status: "Follow Up",
    progress: "61%",
  },
  {
    name: "Siti Aisyah",
    location: "Unit Tahfidz Utara",
    division: "Tahfidz",
    status: "Aman",
    progress: "88%",
  },
];

export const pageCopy = {
  home: {
    title: "Dashboard Admin",
    description:
      "Ringkasan monitoring santri pengabdian dari semua divisi dan regional.",
  },
  mapping: {
    title: "Mapping",
    description:
      "Kelola mapping santri, divisi, dan regional penempatan pengabdian.",
  },
  monitoring: {
    title: "Monitoring",
    description:
      "Pantau status, progres, dan lokasi santri yang sedang menjalani pengabdian.",
  },
  report: {
    title: "Laporan",
    description:
      "Cek laporan masuk, laporan tertunda, dan catatan follow up dari PIC.",
  },
  settings: {
    title: "Pengaturan",
    description: "Kelola konfigurasi sistem, akun, dan preferensi tampilan.",
  },
};

export const roleDashboardContent: RoleDashboardContentMap = {
  "pic-div": {
    stats: [
      { label: "Santri Divisi", value: "42", tone: "blue" },
      { label: "Laporan Masuk", value: "31", tone: "green" },
      { label: "Perlu Review", value: "7", tone: "orange" },
      { label: "Target Pekan Ini", value: "86%", tone: "purple" },
    ],
    sidebarStats: [
      { label: "Anggota Aktif", value: "42" },
      { label: "Unit Kerja", value: "6" },
      { label: "Review Tertunda", value: "7" },
    ],
    title: "Dashboard PIC Divisi",
    description:
      "Fokus ke progres siswa dalam divisi, validasi laporan, dan kebutuhan follow up.",
    panelTitle: "Agenda Divisi",
    panelItems: [
      "Review laporan harian",
      "Cek progres tugas divisi",
      "Koordinasi siswa yang tertunda",
    ],
  },
  "pic-reg": {
    stats: [
      { label: "Santri Regional", value: "68", tone: "blue" },
      { label: "Lokasi Aktif", value: "14", tone: "green" },
      { label: "Kunjungan PIC", value: "9", tone: "purple" },
      { label: "Butuh Bantuan", value: "5", tone: "orange" },
    ],
    sidebarStats: [
      { label: "Regional", value: "1" },
      { label: "Lokasi", value: "14" },
      { label: "Follow Up", value: "5" },
    ],
    title: "Dashboard PIC Regional",
    description:
      "Fokus ke monitoring wilayah, penempatan siswa, dan koordinasi lokasi pengabdian.",
    panelTitle: "Agenda Regional",
    panelItems: [
      "Validasi data lokasi",
      "Pantau laporan tiap wilayah",
      "Jadwalkan kunjungan follow up",
    ],
  },
  siswa: {
    stats: [
      { label: "Tugas Aktif", value: "5", tone: "blue" },
      { label: "Laporan Terkirim", value: "18", tone: "green" },
      { label: "Catatan PIC", value: "2", tone: "orange" },
      { label: "Progres Pribadi", value: "78%", tone: "purple" },
    ],
    sidebarStats: [
      { label: "Tugas", value: "5" },
      { label: "Laporan", value: "18" },
      { label: "Catatan", value: "2" },
    ],
    title: "Dashboard Siswa",
    description:
      "Fokus ke tugas pribadi, laporan pengabdian, dan catatan dari PIC.",
    panelTitle: "Agenda Pribadi",
    panelItems: [
      "Kirim laporan hari ini",
      "Selesaikan tugas prioritas",
      "Baca catatan dari PIC",
    ],
  },
};
