import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase/client";
import type { PengabdianStaff } from "../../lib/supabase/types";
import {
  getStaffRoleLabel,
  mapStaffRole,
  type StaffAuthModel,
  type StaffLoginInput,
  type StaffProfileModel,
} from "./auth.model";

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

function buildStaffAuth(user: User, profile: StaffProfileModel): StaffAuthModel {
  return {
    profile,
    session: {
      userId: profile.code || user.email || user.id.slice(0, 8),
      role: mapStaffRole(profile.role),
      roleLabel: getStaffRoleLabel(profile.role),
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
  if (mapStaffRole(profile.role) !== input.expectedRole) {
    await supabase.auth.signOut();
    throw new Error(`Akun ini terdaftar sebagai ${getStaffRoleLabel(profile.role)}, bukan portal yang dipilih.`);
  }

  return buildStaffAuth(data.user, profile);
}

export async function restoreStaffAuth(user: User): Promise<StaffAuthModel | null> {
  const profile = await getStaffByUserId(user.id);
  if (!profile?.active) return null;
  return buildStaffAuth(user, profile);
}

export async function signOutStaff() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
