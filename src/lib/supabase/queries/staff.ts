import { supabase } from "../client";
import type { PengabdianStaff, StaffRole } from "../types";

const table = () => supabase.from("pengabdian_staff");

// ── Read ─────────────────────────────────────────────────────

export async function getAllStaff(): Promise<PengabdianStaff[]> {
  const { data, error } = await table().select("*").order("nama_lengkap");
  if (error) throw error;
  return (data ?? []) as PengabdianStaff[];
}

export async function getStaffById(id: string): Promise<PengabdianStaff> {
  const { data, error } = await table().select("*").eq("id", id).single();
  if (error) throw error;
  return data as PengabdianStaff;
}

export async function getStaffByRole(
  role: StaffRole,
): Promise<PengabdianStaff[]> {
  const { data, error } = await table()
    .select("*")
    .eq("role_staff", role)
    .eq("aktif", true)
    .order("nama_lengkap");
  if (error) throw error;
  return (data ?? []) as PengabdianStaff[];
}

// ── Update ───────────────────────────────────────────────────

export async function updateStaffRole(
  id: string,
  role: StaffRole,
): Promise<PengabdianStaff> {
  const { data, error } = await table()
    .update({ role_staff: role } as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as PengabdianStaff;
}

export async function updateStaffProfile(
  id: string,
  updates: Partial<
    Pick<PengabdianStaff, "nama_lengkap" | "foto_url" | "telegram_id">
  >,
): Promise<PengabdianStaff> {
  const { data, error } = await table()
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as PengabdianStaff;
}
