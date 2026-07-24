import { supabase } from "../client";
import type { EvaluasiBulanan, GyrStatus } from "../types";

const table = () => supabase.from("evaluasi_bulanan");

// ── Read ─────────────────────────────────────────────────────

export async function getEvaluasiByPengabdian(
  pengabdianId: string,
): Promise<EvaluasiBulanan[]> {
  const { data, error } = await table()
    .select("*")
    .eq("pengabdian_id", pengabdianId)
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false });
  if (error) throw error;
  return (data ?? []) as EvaluasiBulanan[];
}

export async function getEvaluasiByBulan(
  bulan: number,
  tahun: number,
): Promise<EvaluasiBulanan[]> {
  const { data, error } = await table()
    .select("*")
    .eq("bulan", bulan)
    .eq("tahun", tahun);
  if (error) throw error;
  return (data ?? []) as EvaluasiBulanan[];
}

export async function getAtRiskSantri(
  bulan: number,
  tahun: number,
): Promise<EvaluasiBulanan[]> {
  const { data, error } = await table()
    .select("*")
    .eq("bulan", bulan)
    .eq("tahun", tahun)
    .in("status_gyr", ["Yellow", "Red"]);
  if (error) throw error;
  return (data ?? []) as EvaluasiBulanan[];
}

export async function getMukafaahEligible(
  bulan: number,
  tahun: number,
): Promise<EvaluasiBulanan[]> {
  const { data, error } = await table()
    .select("*")
    .eq("bulan", bulan)
    .eq("tahun", tahun)
    .eq("eligible_mukafaah", true)
    .is("difinalisasi_pada", null);
  if (error) throw error;
  return (data ?? []) as EvaluasiBulanan[];
}

// ── GYR stats ────────────────────────────────────────────────

export async function getGyrStats(bulan: number, tahun: number) {
  const { data, error } = await table()
    .select("status_gyr")
    .eq("bulan", bulan)
    .eq("tahun", tahun);
  if (error) throw error;

  const stats = { Green: 0, Yellow: 0, Red: 0, total: (data ?? []).length };
  (data ?? []).forEach((row) => {
    const gyr = (row as { status_gyr: string | null })
      .status_gyr as GyrStatus | null;
    if (gyr) stats[gyr]++;
  });
  return stats;
}

// ── Create / Update ───────────────────────────────────────────

export async function upsertEvaluasi(
  payload: Omit<EvaluasiBulanan, "id" | "diperbarui_pada">,
): Promise<EvaluasiBulanan> {
  const { data, error } = await table()
    .upsert(payload as never, { onConflict: "pengabdian_id,bulan,tahun" })
    .select()
    .single();
  if (error) throw error;
  return data as EvaluasiBulanan;
}

export async function finalizeEvaluasi(id: string): Promise<EvaluasiBulanan> {
  const { data, error } = await table()
    .update({ difinalisasi_pada: new Date().toISOString() } as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as EvaluasiBulanan;
}
