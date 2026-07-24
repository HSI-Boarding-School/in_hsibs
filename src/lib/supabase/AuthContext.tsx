import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./client";
import { signIn, signOut } from "./auth";
import type { PengabdianStaff } from "./types";

// ── Types ─────────────────────────────────────────────────────

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: PengabdianStaff | null;
  loading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isPicDiv: boolean;
  isPicReg: boolean;
  isStaff: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PengabdianStaff | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch staff profile setelah user diketahui
  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from("pengabdian_staff")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching staff profile:", error.message);
    }
    setProfile(data ?? null);
  }

  useEffect(() => {
    // Cek session saat mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        fetchProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Subscribe perubahan auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      await signIn(email, password);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await signOut();
    setProfile(null);
  }

  const isAdmin =
    profile?.role_pengabdian === "Admin" && (profile?.aktif ?? false);
  const isPicDiv =
    profile?.role_pengabdian === "PIC_Div" && (profile?.aktif ?? false);
  const isPicReg =
    profile?.role_pengabdian === "PIC_Reg" && (profile?.aktif ?? false);
  const isStaff = !!profile && (profile?.aktif ?? false);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        isLoggedIn: !!session,
        isAdmin,
        isPicDiv,
        isPicReg,
        isStaff,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus dipakai di dalam SupabaseAuthProvider");
  }
  return ctx;
}
