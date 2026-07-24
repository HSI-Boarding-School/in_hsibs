// ============================================================
// lib/auth.tsx — Bridge antara Supabase Auth dan routing lama
//
// routing.tsx pakai:
//   - session.role (dari tipe Session lama)
//   - login(credentials: Session)
//   - logout()
//
// Supabase Auth memberi:
//   - session dari auth.users
//   - profile.role_pengabdian dari pengabdian_staff
//
// File ini menjembatani keduanya agar routing.tsx tidak perlu diubah.
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session as SupabaseSession } from "@supabase/supabase-js";
import { supabase } from "./supabase/client";
import type { PengabdianStaff } from "./supabase/types";
import type { Session } from "../types";

// Map role Supabase → role lama yang dipakai routing
function mapRole(role: PengabdianStaff["role_pengabdian"]): Session["role"] {
  const map: Record<string, Session["role"]> = {
    Admin: "admin",
    PIC_Div: "pic-div",
    PIC_Reg: "pic-reg",
    Viewer: "siswa", // fallback
  };
  return map[role] ?? "siswa";
}

interface AuthContextValue {
  session: Session | null;
  sbSession: SupabaseSession | null;
  profile: PengabdianStaff | null;
  loading: boolean;
  login: (credentials: Session) => void; // compat lama (untuk LoginPage mock)
  loginWithSupabase: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sbSession, setSbSession] = useState<SupabaseSession | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<PengabdianStaff | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string): Promise<PengabdianStaff | null> {
    const { data, error } = await supabase
      .from("pengabdian_staff")
      .select("*")
      .eq("id", userId)
      .single();
    if (error && error.code !== "PGRST116") {
      console.error("fetchProfile error:", error.message);
    }
    return data ?? null;
  }

  async function buildSession(
    sbUser: SupabaseSession["user"],
    staffProfile: PengabdianStaff | null,
  ): Promise<Session> {
    return {
      userId: staffProfile?.kode_staff ?? sbUser.id.slice(0, 8),
      role: staffProfile ? mapRole(staffProfile.role_pengabdian) : "siswa",
      roleLabel: staffProfile?.role_pengabdian ?? "Viewer",
      password: "", // tidak relevan setelah login
    };
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSbSession(data.session);
      if (data.session?.user) {
        const p = await fetchProfile(data.session.user.id);
        setProfile(p);
        setSession(await buildSession(data.session.user, p));
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSbSession) => {
        setSbSession(newSbSession);
        if (newSbSession?.user) {
          const p = await fetchProfile(newSbSession.user.id);
          setProfile(p);
          setSession(await buildSession(newSbSession.user, p));
        } else {
          setProfile(null);
          setSession(null);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login via Supabase (email + password)
  async function loginWithSupabase(email: string, password: string) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setLoading(false);
      throw error;
    }
    // session akan di-set oleh onAuthStateChange
    setLoading(false);
  }

  // Login lama (mock/demo — untuk LoginPage yang belum pakai Supabase)
  // Tetap ada agar routing.tsx tidak error saat demo
  function login(credentials: Session) {
    setSession(credentials);
  }

  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setSbSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        sbSession,
        profile,
        loading,
        login,
        loginWithSupabase,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
