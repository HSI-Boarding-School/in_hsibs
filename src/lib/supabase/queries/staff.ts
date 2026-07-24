import { supabase } from "../client";
import type { PengabdianStaff, StaffRole } from "../types";

// ── Read ─────────────────────────────────────────────────────

export async function getAllStaff() {
  const { data, error } = await supabase
    .from("pengabdian_staff")
    .select("*")
    .order("nama_lengkap");
  if (error) throw error;
  return data;
}

export async function getStaffById(id: string) {
  const { data, error } = await supabase
    .from("pengabdian_staff")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getStaffByRole(role: StaffRole) {
  const { data, error } = await supabase
    .from("pengabdian_staff")
    .select("*")
    .eq("role_pengabdian", role)
    .eq("aktif", true)
    .order("nama_lengkap");
  if (error) throw error;
  return data;
}

// ── Update ───────────────────────────────────────────────────

export async function updateStaffRole(id: string, role: StaffRole) {
  const { data, error } = await supabase
    .from("pengabdian_staff")
    .update({ role_pengabdian: role })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateStaffProfile(
  id: string,
  updates: Partial<
    Pick<PengabdianStaff, "nama_lengkap" | "foto_url" | "telegram_id">
  >,
) {
  const { data, error } = await supabase
    .from("pengabdian_staff")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
