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
  restoreStudentAuth,
  signInStudent,
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
  loginSiswaWithSupabase: (email: string, password: string) => Promise<Session>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const legacySessionStorageKey = "in_hsibs.auth.legacySession";

function readLegacySession(): Session | null {
  try {
    const value = window.localStorage.getItem(legacySessionStorageKey);
    if (!value) return null;
    const stored = JSON.parse(value) as Partial<Session>;
    if (stored.role !== "siswa" || !stored.userId || !stored.roleLabel) return null;
    return { ...stored, password: "" } as Session;
  } catch {
    window.localStorage.removeItem(legacySessionStorageKey);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sbSession, setSbSession] = useState<SupabaseSession | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<StaffProfileModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const { data } = await supabase.auth.getSession();
        setSbSession(data.session);
        if (data.session?.user) {
          const studentSession = await restoreStudentAuth(data.session.user);
          const auth = studentSession ? null : await restoreStaffAuth(data.session.user);
          setProfile(auth?.profile ?? null);
          setSession(auth?.session ?? studentSession);
        } else {
          setSession(readLegacySession());
        }
      } catch {
        setSbSession(null);
        setProfile(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    }

    void restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSbSession) => {
        setSbSession(newSbSession);
        if (newSbSession?.user) {
          try {
            const studentSession = await restoreStudentAuth(newSbSession.user);
            const auth = studentSession ? null : await restoreStaffAuth(newSbSession.user);
            setProfile(auth?.profile ?? null);
            setSession(auth?.session ?? studentSession);
          } catch {
            setProfile(null);
            setSession(null);
          }
        } else {
          setProfile(null);
          setSession(readLegacySession());
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
    const auth = await signInStaff({ email, password, expectedRole });
    window.localStorage.removeItem(legacySessionStorageKey);
    const { data } = await supabase.auth.getSession();
    setSbSession(data.session);
    setProfile(auth.profile);
    setSession(auth.session);
    return auth.session;
  }

  async function loginSiswaWithSupabase(email: string, password: string) {
    const studentSession = await signInStudent(email, password);
    window.localStorage.removeItem(legacySessionStorageKey);
    const { data } = await supabase.auth.getSession();
    setSbSession(data.session);
    setProfile(null);
    setSession(studentSession);
    return studentSession;
  }

  // Login lama (mock/demo — untuk LoginPage yang belum pakai Supabase)
  // Tetap ada agar routing.tsx tidak error saat demo
  function login(credentials: Session) {
    const safeSession = { ...credentials, password: "" };
    window.localStorage.setItem(legacySessionStorageKey, JSON.stringify(safeSession));
    setSession(safeSession);
  }

  async function logout() {
    await signOutStaff();
    setSession(null);
    setProfile(null);
    setSbSession(null);
    window.localStorage.removeItem(legacySessionStorageKey);
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
        loginSiswaWithSupabase,
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
