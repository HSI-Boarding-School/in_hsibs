import { supabase } from "../client";
import type { AdminTask } from "../types";

// ── Read ─────────────────────────────────────────────────────

export async function getAllTasks() {
  const { data, error } = await supabase
    .from("admin_task")
    .select("*")
    .order("dibuat_pada", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getTasksByUser(userId: string) {
  const { data, error } = await supabase
    .from("admin_task")
    .select("*")
    .or(`dibuat_oleh.eq.${userId},ditugaskan_ke.eq.${userId}`)
    .order("dibuat_pada", { ascending: false });
  if (error) throw error;
  return data;
}

// ── Create ───────────────────────────────────────────────────

export async function createTask(
  payload: Pick<AdminTask, "teks" | "prioritas"> & {
    dibuat_oleh?: string;
    ditugaskan_ke?: string;
  },
) {
  const { data, error } = await supabase
    .from("admin_task")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Update ───────────────────────────────────────────────────

export async function toggleTask(id: number, done: boolean) {
  const { data, error } = await supabase
    .from("admin_task")
    .update({
      selesai: done,
      selesai_pada: done ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTaskText(id: number, teks: string) {
  const { data, error } = await supabase
    .from("admin_task")
    .update({ teks })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Delete ───────────────────────────────────────────────────

export async function deleteTask(id: number) {
  const { error } = await supabase.from("admin_task").delete().eq("id", id);
  if (error) throw error;
}
