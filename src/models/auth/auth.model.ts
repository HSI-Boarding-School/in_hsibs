import type { RoleId, Session } from "../../types";

export type StaffDatabaseRole = "Admin" | "PIC_Div" | "PIC_Reg" | "Viewer";

export interface StaffProfileModel {
  id: string;
  code: string;
  name: string;
  avatarUrl: string | null;
  role: StaffDatabaseRole;
  divisionId: string | null;
  regionId: string | null;
  active: boolean;
}

export interface StaffLoginInput {
  email: string;
  password: string;
  expectedRole: RoleId;
}

export interface StaffAuthModel {
  session: Session;
  profile: StaffProfileModel;
}

export function mapStaffRole(role: StaffDatabaseRole): RoleId {
  const roles: Record<StaffDatabaseRole, RoleId> = {
    Admin: "admin",
    PIC_Div: "pic-div",
    PIC_Reg: "pic-reg",
    Viewer: "siswa",
  };
  return roles[role];
}

export function getStaffRoleLabel(role: StaffDatabaseRole) {
  const labels: Record<StaffDatabaseRole, string> = {
    Admin: "Admin",
    PIC_Div: "PIC Divisi",
    PIC_Reg: "PIC Regional",
    Viewer: "Viewer",
  };
  return labels[role];
}
