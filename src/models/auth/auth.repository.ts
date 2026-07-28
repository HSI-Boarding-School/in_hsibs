import type { User } from "@supabase/supabase-js";
import { getErrorMessage } from "../../lib/errors";
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

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  const detail = getErrorMessage(error, fallback)
    .replace(/Bearer\s+\S+/gi, "Bearer [disembunyikan]")
    .replace(/\b(password|access[_-]?token|refresh[_-]?token|id[_-]?token)\s*[:=]\s*\S+/gi, "$1=[disembunyikan]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[token disembunyikan]");
  const normalized = detail.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email atau password salah. Periksa kembali data login kamu.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Email belum dikonfirmasi. Buka tautan konfirmasi di email sebelum login.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many requests")) {
    return "Terlalu banyak percobaan login. Tunggu beberapa saat lalu coba lagi.";
  }
  if (
    normalized.includes("failed to fetch")
    || normalized.includes("networkerror")
    || normalized.includes("network request failed")
    || normalized.includes("fetch failed")
  ) {
    return "Tidak dapat terhubung ke layanan autentikasi. Periksa koneksi internet lalu coba lagi.";
  }

  return detail;
}

async function cleanupSupabaseSession(): Promise<string | null> {
  try {
    const { error } = await supabase.auth.signOut();
    return error ? getAuthErrorMessage(error, "Sesi autentikasi gagal dibersihkan.") : null;
  } catch (error) {
    return getAuthErrorMessage(error, "Sesi autentikasi gagal dibersihkan.");
  }
}

async function rejectAuthenticatedAccount(message: string): Promise<never> {
  const cleanupError = await cleanupSupabaseSession();
  throw new Error(cleanupError ? `${message} Sesi login juga gagal dibersihkan: ${cleanupError}` : message);
}

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

  if (error) {
    throw new Error(getAuthErrorMessage(error, "Gagal memuat profil staff."));
  }
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
  if (error) throw new Error(getAuthErrorMessage(error, "Login staff gagal."));

  let profile: StaffProfileModel | null;
  try {
    profile = await getStaffByUserId(data.user.id);
  } catch (profileError) {
    return rejectAuthenticatedAccount(getAuthErrorMessage(profileError, "Login berhasil, tetapi profil staff gagal dimuat."));
  }
  if (!profile) {
    return rejectAuthenticatedAccount("Akun ini tidak terdaftar sebagai staff pengabdian.");
  }
  if (!profile.active) {
    return rejectAuthenticatedAccount("Akun staff sedang nonaktif.");
  }
  const actualRole = mapStaffRole(profile.role);
  const adminPortalAccess = profile.role === "Admin" && input.expectedRole !== "siswa";
  if (actualRole !== input.expectedRole && !adminPortalAccess) {
    return rejectAuthenticatedAccount(`Akun ini terdaftar sebagai ${getStaffRoleLabel(profile.role)}, bukan portal yang dipilih.`);
  }

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
  if (error) {
    throw new Error(getAuthErrorMessage(error, "Gagal memuat profil santri."));
  }
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
  if (error) throw new Error(getAuthErrorMessage(error, "Login santri gagal."));
  let session: Session | null;
  try {
    session = await restoreStudentAuth(data.user);
  } catch (profileError) {
    return rejectAuthenticatedAccount(getAuthErrorMessage(profileError, "Login berhasil, tetapi profil Santri gagal dimuat."));
  }
  if (!session) {
    return rejectAuthenticatedAccount("Akun ini tidak terhubung ke santri pengabdian aktif.");
  }
  return session;
}

export async function signOutStaff() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(getAuthErrorMessage(error, "Logout gagal."));
}
