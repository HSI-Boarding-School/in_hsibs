import { supabase } from "../client";
import type { LogHarian, LaporanMingguan } from "../types";

// ── Log Harian ───────────────────────────────────────────────

export async function getLogHarian(pengabdianId: string, tanggal: string) {
  const { data, error } = await supabase
    .from("log_harian")
    .select("*")
    .eq("pengabdian_id", pengabdianId)
    .eq("tanggal_log", tanggal);
  if (error) throw error;
  return data;
}

export async function getLogHarianRange(
  pengabdianId: string,
  dari: string,
  sampai: string,
) {
  const { data, error } = await supabase
    .from("log_harian")
    .select("*")
    .eq("pengabdian_id", pengabdianId)
    .gte("tanggal_log", dari)
    .lte("tanggal_log", sampai)
    .order("tanggal_log", { ascending: false });
  if (error) throw error;
  return data;
}

export async function upsertLogHarian(
  payload: Omit<LogHarian, "id" | "dibuat_pada">,
) {
  const { data, error } = await supabase
    .from("log_harian")
    .upsert(payload, { onConflict: "pengabdian_id,tanggal_log,sesi" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Laporan Mingguan ─────────────────────────────────────────

export async function getLaporanMingguan(pengabdianId: string) {
  const { data, error } = await supabase
    .from("laporan_mingguan")
    .select("*")
    .eq("pengabdian_id", pengabdianId)
    .order("minggu_label", { ascending: false });
  if (error) throw error;
  return data;
}

// Semua laporan mingguan pending validasi (untuk PIC)
export async function getLaporanPendingValidasi() {
  const { data, error } = await supabase
    .from("laporan_mingguan")
    .select("*")
    .eq("status", "Terkirim")
    .order("tanggal_laporan", { ascending: true });
  if (error) throw error;
  return data;
}

export async function upsertLaporanMingguan(
  payload: Omit<LaporanMingguan, "id" | "diperbarui_pada">,
) {
  const { data, error } = await supabase
    .from("laporan_mingguan")
    .upsert(payload, { onConflict: "pengabdian_id,minggu_label" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function validasiLaporan(
  id: string,
  validatorId: string,
  catatan?: string,
) {
  const { data, error } = await supabase
    .from("laporan_mingguan")
    .update({
      status: "Divalidasi",
      catatan_pic: catatan ?? null,
      divalidasi_oleh: validatorId,
      divalidasi_pada: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
