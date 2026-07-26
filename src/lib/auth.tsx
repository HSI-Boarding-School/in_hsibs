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
//   - profile.role_staff dari pengabdian_staff
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
import type { Session } from "../types";
import {
  restoreStaffAuth,
  signInStaff,
  signOutStaff,
  type StaffProfileModel,
} from "../models/auth";

interface AuthContextValue {
  session: Session | null;
  sbSession: SupabaseSession | null;
  profile: StaffProfileModel | null;
  loading: boolean;
  login: (credentials: Session) => void;
  loginWithSupabase: (
    email: string,
    password: string,
    expectedRole: Session["role"],
  ) => Promise<Session>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sbSession, setSbSession] = useState<SupabaseSession | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<StaffProfileModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSbSession(data.session);
      if (data.session?.user) {
        const auth = await restoreStaffAuth(data.session.user);
        setProfile(auth?.profile ?? null);
        setSession(auth?.session ?? null);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSbSession) => {
        setSbSession(newSbSession);
        if (newSbSession?.user) {
          const auth = await restoreStaffAuth(newSbSession.user);
          setProfile(auth?.profile ?? null);
          setSession(auth?.session ?? null);
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
  async function loginWithSupabase(
    email: string,
    password: string,
    expectedRole: Session["role"],
  ) {
    setLoading(true);
    try {
      const auth = await signInStaff({ email, password, expectedRole });
      const { data } = await supabase.auth.getSession();
      setSbSession(data.session);
      setProfile(auth.profile);
      setSession(auth.session);
      return auth.session;
    } finally {
      setLoading(false);
    }
  }

  // Login lama (mock/demo — untuk LoginPage yang belum pakai Supabase)
  // Tetap ada agar routing.tsx tidak error saat demo
  function login(credentials: Session) {
    setSession(credentials);
  }

  async function logout() {
    await signOutStaff();
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
