import { supabase } from "../client";
import type { EvaluasiBulanan, GyrStatus } from "../types";

// ── Read ─────────────────────────────────────────────────────

export async function getEvaluasiByPengabdian(pengabdianId: string) {
  const { data, error } = await supabase
    .from("evaluasi_bulanan")
    .select("*")
    .eq("pengabdian_id", pengabdianId)
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getEvaluasiByBulan(bulan: number, tahun: number) {
  const { data, error } = await supabase
    .from("evaluasi_bulanan")
    .select("*")
    .eq("bulan", bulan)
    .eq("tahun", tahun);
  if (error) throw error;
  return data;
}

// Semua santri at-risk (Yellow/Red) bulan ini
export async function getAtRiskSantri(bulan: number, tahun: number) {
  const { data, error } = await supabase
    .from("evaluasi_bulanan")
    .select("*")
    .eq("bulan", bulan)
    .eq("tahun", tahun)
    .in("status_gyr", ["Yellow", "Red"] satisfies GyrStatus[]);
  if (error) throw error;
  return data;
}

// Santri yang eligible mukafaah tapi belum difinalisasi
export async function getMukafaahEligible(bulan: number, tahun: number) {
  const { data, error } = await supabase
    .from("evaluasi_bulanan")
    .select("*")
    .eq("bulan", bulan)
    .eq("tahun", tahun)
    .eq("eligible_mukafaah", true)
    .is("difinalisasi_pada", null);
  if (error) throw error;
  return data;
}

// ── GYR stats (untuk dashboard) ──────────────────────────────

export async function getGyrStats(bulan: number, tahun: number) {
  const { data, error } = await supabase
    .from("evaluasi_bulanan")
    .select("status_gyr")
    .eq("bulan", bulan)
    .eq("tahun", tahun);
  if (error) throw error;

  const stats = { Green: 0, Yellow: 0, Red: 0, total: data.length };
  data.forEach((row) => {
    if (row.status_gyr) stats[row.status_gyr as GyrStatus]++;
  });
  return stats;
}

// ── Create / Update ───────────────────────────────────────────

export async function upsertEvaluasi(
  payload: Omit<EvaluasiBulanan, "id" | "diperbarui_pada">,
) {
  const { data, error } = await supabase
    .from("evaluasi_bulanan")
    .upsert(payload, { onConflict: "pengabdian_id,bulan,tahun" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function finalizeEvaluasi(id: string) {
  const { data, error } = await supabase
    .from("evaluasi_bulanan")
    .update({ difinalisasi_pada: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
