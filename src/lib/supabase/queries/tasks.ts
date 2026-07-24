import { supabase } from "../client";
import type { AdminTask } from "../types";

const table = () => supabase.from("admin_task");

// ── Read ─────────────────────────────────────────────────────

export async function getAllTasks(): Promise<AdminTask[]> {
  const { data, error } = await table()
    .select("*")
    .order("dibuat_pada", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminTask[];
}

export async function getTasksByUser(userId: string): Promise<AdminTask[]> {
  const { data, error } = await table()
    .select("*")
    .or(`dibuat_oleh.eq.${userId},ditugaskan_ke.eq.${userId}`)
    .order("dibuat_pada", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminTask[];
}

// ── Create ───────────────────────────────────────────────────

export async function createTask(
  payload: Pick<AdminTask, "teks" | "prioritas"> & {
    dibuat_oleh?: string;
    ditugaskan_ke?: string;
  },
): Promise<AdminTask> {
  const { data, error } = await table()
    .insert(payload as never)
    .select()
    .single();
  if (error) throw error;
  return data as AdminTask;
}

// ── Update ───────────────────────────────────────────────────

export async function toggleTask(
  id: string,
  done: boolean,
): Promise<AdminTask> {
  const { data, error } = await table()
    .update({
      selesai: done,
      selesai_pada: done ? new Date().toISOString() : null,
    } as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as AdminTask;
}

export async function updateTaskText(
  id: string,
  teks: string,
): Promise<AdminTask> {
  const { data, error } = await table()
    .update({ teks } as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as AdminTask;
}

// ── Delete ───────────────────────────────────────────────────

export async function deleteTask(id: string): Promise<void> {
  const { error } = await table().delete().eq("id", id);
  if (error) throw error;
}
