import { supabase } from "./client";
import type { PengabdianStaff } from "./types";

// ── Login & Logout ────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ── Session ──────────────────────────────────────────────────

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

// ── Staff profile — role & scope ─────────────────────────────

export async function getStaffProfile(): Promise<PengabdianStaff | null> {
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("pengabdian_staff")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    // PGRST116 = row not found — bukan error kritis, user mungkin bukan staff
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

// ── Cek role ─────────────────────────────────────────────────

export async function isAdmin(): Promise<boolean> {
  const profile = await getStaffProfile();
  return profile?.role_pengabdian === "Admin" && (profile?.aktif ?? false);
}

export async function isPicDiv(): Promise<boolean> {
  const profile = await getStaffProfile();
  return profile?.role_pengabdian === "PIC_Div" && (profile?.aktif ?? false);
}

export async function isPicReg(): Promise<boolean> {
  const profile = await getStaffProfile();
  return profile?.role_pengabdian === "PIC_Reg" && (profile?.aktif ?? false);
}

// ── Listen perubahan session (untuk AuthProvider) ────────────

export function onAuthStateChange(
  callback: (event: string, session: unknown) => void,
) {
  return supabase.auth.onAuthStateChange(callback);
}
