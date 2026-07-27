import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase/client";
import type { PengabdianStaff } from "../../lib/supabase/types";
import type { Session } from "../../types";
import {
  getStaffRoleLabel,
  mapStaffRole,
  type StaffAuthModel,
  type StaffLoginInput,
  type StaffProfileModel,
} from "./auth.model";

const portalRoleStorageKey = "in_hsibs.auth.portalRole";

function toStaffProfile(row: PengabdianStaff): StaffProfileModel {
  return {
    id: row.id,
    code: row.kode_staff,
    name: row.nama_lengkap,
    avatarUrl: row.foto_url,
    role: row.role_staff,
    divisionId: row.divisi_id,
    regionId: row.region_id,
    active: row.aktif ?? true,
  };
}

async function getStaffByUserId(userId: string) {
  const { data, error } = await supabase
    .from("pengabdian_staff")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat profil staff: ${error.message}`);
  return data ? toStaffProfile(data) : null;
}

function buildStaffAuth(
  user: User,
  profile: StaffProfileModel,
  portalRole = mapStaffRole(profile.role),
): StaffAuthModel {
  return {
    profile,
    session: {
      userId: profile.code || user.email || user.id.slice(0, 8),
      role: portalRole,
      roleLabel:
        profile.role === "Admin" && portalRole !== "admin"
          ? `Admin · ${portalRole === "pic-div" ? "PIC Divisi" : "PIC Regional"}`
          : getStaffRoleLabel(profile.role),
      password: "",
      avatar: profile.avatarUrl ?? undefined,
    },
  };
}

export async function signInStaff(input: StaffLoginInput): Promise<StaffAuthModel> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  });
  if (error) throw new Error(error.message);

  const profile = await getStaffByUserId(data.user.id);
  if (!profile) {
    await supabase.auth.signOut();
    throw new Error("Akun ini tidak terdaftar sebagai staff pengabdian.");
  }
  if (!profile.active) {
    await supabase.auth.signOut();
    throw new Error("Akun staff sedang nonaktif.");
  }
  const actualRole = mapStaffRole(profile.role);
  const adminPortalAccess = profile.role === "Admin" && input.expectedRole !== "siswa";
  if (actualRole !== input.expectedRole && !adminPortalAccess) {
    await supabase.auth.signOut();
    throw new Error(`Akun ini terdaftar sebagai ${getStaffRoleLabel(profile.role)}, bukan portal yang dipilih.`);
  }

  window.localStorage.setItem(portalRoleStorageKey, input.expectedRole);
  return buildStaffAuth(data.user, profile, input.expectedRole);
}

export async function restoreStaffAuth(user: User): Promise<StaffAuthModel | null> {
  const profile = await getStaffByUserId(user.id);
  if (!profile?.active) return null;
  const storedPortalRole = window.localStorage.getItem(portalRoleStorageKey);
  const portalRole =
    profile.role === "Admin"
      && (storedPortalRole === "admin" || storedPortalRole === "pic-div" || storedPortalRole === "pic-reg")
      ? storedPortalRole
      : mapStaffRole(profile.role);
  return buildStaffAuth(user, profile, portalRole);
}

export async function restoreStudentAuth(user: User): Promise<Session | null> {
  const { data, error } = await supabase
    .from("pengabdian_santri")
    .select("id,kode_santri,status")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (error) throw new Error(`Gagal memuat profil santri: ${error.message}`);
  const student = data as unknown as Pick<import("../../lib/supabase/types").PengabdianSantri, "id" | "kode_santri" | "status"> | null;
  if (!student || student.status !== "Aktif") return null;
  return {
    userId: student.kode_santri ?? user.email ?? student.id.slice(0, 8),
    role: "siswa",
    roleLabel: "Santri",
    password: "",
  };
}

export async function signInStudent(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(error.message);
  const session = await restoreStudentAuth(data.user);
  if (!session) {
    await supabase.auth.signOut();
    throw new Error("Akun ini tidak terhubung ke santri pengabdian aktif.");
  }
  window.localStorage.removeItem(portalRoleStorageKey);
  return session;
}

export async function signOutStaff() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  window.localStorage.removeItem(portalRoleStorageKey);
}
