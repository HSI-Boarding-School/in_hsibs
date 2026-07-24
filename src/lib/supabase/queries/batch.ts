import { supabase } from "../client";
import type { PengabdianBatch } from "../types";

const table = () => supabase.from("pengabdian_batch");

// ── Read ─────────────────────────────────────────────────────

export async function getAllBatch(): Promise<PengabdianBatch[]> {
  const { data, error } = await table()
    .select("*")
    .order("dibuat_pada", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PengabdianBatch[];
}

export async function getActiveBatch(): Promise<PengabdianBatch | null> {
  const { data, error } = await table().select("*").eq("aktif", true).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as PengabdianBatch;
}

export async function getBatchById(id: string): Promise<PengabdianBatch> {
  const { data, error } = await table().select("*").eq("id", id).single();
  if (error) throw error;
  return data as PengabdianBatch;
}

// ── Create ───────────────────────────────────────────────────

export async function createBatch(
  payload: Omit<PengabdianBatch, "id" | "dibuat_pada" | "diperbarui_pada">,
): Promise<PengabdianBatch> {
  const { data, error } = await table()
    .insert(payload as never)
    .select()
    .single();
  if (error) throw error;
  return data as PengabdianBatch;
}
