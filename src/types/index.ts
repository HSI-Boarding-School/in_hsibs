export type RoleId = "admin" | "pic-div" | "pic-reg" | "siswa";

export interface Role {
  id: RoleId;
  label: string;
  hint: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  shortcut: string;
  icon: string;
}

export type Tone = "green" | "blue" | "orange" | "purple";

export interface Stat {
  label: string;
  value: string;
  tone?: Tone;
}

export interface SidebarStat {
  label: string;
  value: string;
}

export interface Activity {
  name: string;
  location: string;
  division: string;
  status: string;
  progress: string;
}

export interface PageCopy {
  title: string;
  description: string;
}

export interface PageCopyMap {
  overview: PageCopy;
  santri: PageCopy;
  laporan: PageCopy;
  penempatan: PageCopy;
}

export interface RoleDashboardStats {
  stats: Stat[];
  sidebarStats: SidebarStat[];
  title: string;
  description: string;
  panelTitle: string;
  panelItems: string[];
}

export interface RoleDashboardContentMap {
  "pic-div": RoleDashboardStats;
  "pic-reg": RoleDashboardStats;
  siswa: RoleDashboardStats;
}

export interface LoginCredentials {
  userId: string;
  role: RoleId;
  roleLabel: string;
  password: string;
  avatar?: string;
}

export interface Session extends LoginCredentials {}
