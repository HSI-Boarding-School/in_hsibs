import { supabase } from "../client";
import type { PengabdianBatch } from "../types";

export async function getAllBatch() {
  const { data, error } = await supabase
    .from("pengabdian_batch")
    .select("*")
    .order("dibuat_pada", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getActiveBatch() {
  const { data, error } = await supabase
    .from("pengabdian_batch")
    .select("*")
    .eq("aktif", true)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function getBatchById(id: string) {
  const { data, error } = await supabase
    .from("pengabdian_batch")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createBatch(
  payload: Omit<PengabdianBatch, "id" | "dibuat_pada" | "diperbarui_pada">,
) {
  const { data, error } = await supabase
    .from("pengabdian_batch")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}
