import { supabase } from "../client";
import type { PengabdianSantri, PengabdianStatus } from "../types";

// ── Read ─────────────────────────────────────────────────────

export async function getAllSantriAktif() {
  const { data, error } = await supabase
    .from("pengabdian_santri")
    .select("*")
    .eq("status", "Aktif")
    .order("dibuat_pada", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getSantriByBatch(batchId: string) {
  const { data, error } = await supabase
    .from("pengabdian_santri")
    .select("*")
    .eq("batch_id", batchId)
    .order("kode_santri");
  if (error) throw error;
  return data;
}

export async function getSantriById(id: string) {
  const { data, error } = await supabase
    .from("pengabdian_santri")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getSantriByAuthUser(authUserId: string) {
  const { data, error } = await supabase
    .from("pengabdian_santri")
    .select("*")
    .eq("auth_user_id", authUserId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

// ── Stats ────────────────────────────────────────────────────

export async function countSantriByStatus(): Promise<
  Record<PengabdianStatus, number>
> {
  const { data, error } = await supabase
    .from("pengabdian_santri")
    .select("status");
  if (error) throw error;

  const counts: Record<PengabdianStatus, number> = {
    Aktif: 0,
    Selesai: 0,
    Ditangguhkan: 0,
    Dibatalkan: 0,
  };
  data.forEach((row) => {
    counts[row.status as PengabdianStatus]++;
  });
  return counts;
}

// ── Create ───────────────────────────────────────────────────

export async function createSantriPengabdian(
  payload: Pick<
    PengabdianSantri,
    "siswa_id" | "batch_id" | "kode_santri" | "tanggal_masuk"
  > & { auth_user_id?: string },
) {
  const { data, error } = await supabase
    .from("pengabdian_santri")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Update ───────────────────────────────────────────────────

export async function updateSantriStatus(id: string, status: PengabdianStatus) {
  const { data, error } = await supabase
    .from("pengabdian_santri")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function linkSantriToAuthUser(id: string, authUserId: string) {
  const { data, error } = await supabase
    .from("pengabdian_santri")
    .update({ auth_user_id: authUserId })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
