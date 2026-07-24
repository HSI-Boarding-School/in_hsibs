import { supabase } from "../client";
import type { PengabdianSantri, PengabdianStatus } from "../types";

// Helper — typed table access
const table = () => supabase.from("pengabdian_santri");

// ── Read ─────────────────────────────────────────────────────

export async function getAllSantriAktif(): Promise<PengabdianSantri[]> {
  const { data, error } = await table()
    .select("*")
    .eq("status", "Aktif")
    .order("dibuat_pada", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PengabdianSantri[];
}

export async function getSantriByBatch(
  batchId: string,
): Promise<PengabdianSantri[]> {
  const { data, error } = await table()
    .select("*")
    .eq("batch_id", batchId)
    .order("kode_santri");
  if (error) throw error;
  return (data ?? []) as PengabdianSantri[];
}

export async function getSantriById(id: string): Promise<PengabdianSantri> {
  const { data, error } = await table().select("*").eq("id", id).single();
  if (error) throw error;
  return data as PengabdianSantri;
}

export async function getSantriByAuthUser(
  authUserId: string,
): Promise<PengabdianSantri | null> {
  const { data, error } = await table()
    .select("*")
    .eq("auth_user_id", authUserId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as PengabdianSantri;
}

// ── Stats ────────────────────────────────────────────────────

export async function countSantriByStatus(): Promise<
  Record<PengabdianStatus, number>
> {
  const { data, error } = await table().select("status");
  if (error) throw error;

  const counts: Record<PengabdianStatus, number> = {
    Aktif: 0,
    Selesai: 0,
    Ditangguhkan: 0,
    Dibatalkan: 0,
  };
  (data ?? []).forEach((row) => {
    const s = (row as { status: string }).status as PengabdianStatus;
    counts[s]++;
  });
  return counts;
}

// ── Create ───────────────────────────────────────────────────

export async function createSantriPengabdian(
  payload: Pick<
    PengabdianSantri,
    "siswa_id" | "batch_id" | "kode_santri" | "tanggal_masuk"
  > & {
    auth_user_id?: string;
  },
): Promise<PengabdianSantri> {
  const { data, error } = await table()
    .insert(payload as never)
    .select()
    .single();
  if (error) throw error;
  return data as PengabdianSantri;
}

// ── Update ───────────────────────────────────────────────────

export async function updateSantriStatus(
  id: string,
  status: PengabdianStatus,
): Promise<PengabdianSantri> {
  const { data, error } = await table()
    .update({ status } as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as PengabdianSantri;
}

export async function linkSantriToAuthUser(
  id: string,
  authUserId: string,
): Promise<PengabdianSantri> {
  const { data, error } = await table()
    .update({ auth_user_id: authUserId } as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as PengabdianSantri;
}
