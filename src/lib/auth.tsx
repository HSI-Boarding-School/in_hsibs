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
import { useToast } from "../components/ui/ToastProvider";
import { getErrorMessage } from "./errors";
import { supabase } from "./supabase/client";
import type { Session } from "../types";
import {
  restoreStaffAuth,
  restoreStudentAuth,
  getAuthErrorMessage,
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
const portalRoleStorageKey = "in_hsibs.auth.portalRole";

async function restoreApplicationAuth(user: SupabaseSession["user"]) {
  const studentSession = await restoreStudentAuth(user);
  const staffAuth = studentSession ? null : await restoreStaffAuth(user);
  if (!studentSession && !staffAuth) {
    throw new Error("Sesi ditemukan, tetapi akun tidak terhubung ke staff atau Santri aktif.");
  }
  return { studentSession, staffAuth };
}

function readLegacySession(): Session | null {
  try {
    const value = window.localStorage.getItem(legacySessionStorageKey);
    if (!value) return null;
    const stored = JSON.parse(value) as Partial<Session>;
    if (stored.role !== "siswa" || !stored.userId || !stored.roleLabel) return null;
    return { ...stored, password: "" } as Session;
  } catch (error) {
    let cleanupDetail = "";
    try {
      window.localStorage.removeItem(legacySessionStorageKey);
    } catch (cleanupError) {
      cleanupDetail = ` Data rusak juga gagal dibersihkan: ${getErrorMessage(cleanupError, "kesalahan tidak diketahui")}`;
    }
    throw new Error(`Sesi lokal tidak dapat dibaca: ${getErrorMessage(error, "format data tidak valid")}.${cleanupDetail}`);
  }
}

async function describeRestoreFailure(error: unknown): Promise<string> {
  const message = getErrorMessage(error, "Sesi tidak dapat dipulihkan. Silakan login kembali.");
  try {
    const cleanup = await supabase.auth.signOut();
    return cleanup.error
      ? `${message} Sesi Supabase juga gagal dibersihkan: ${getAuthErrorMessage(cleanup.error, "kesalahan tidak diketahui")}`
      : message;
  } catch (cleanupError) {
    return `${message} Sesi Supabase juga gagal dibersihkan: ${getErrorMessage(cleanupError, "kesalahan tidak diketahui")}`;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [sbSession, setSbSession] = useState<SupabaseSession | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<StaffProfileModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw new Error(getAuthErrorMessage(error, "Gagal memeriksa sesi login."));
        }
        if (data.session?.user) {
          const { studentSession, staffAuth } = await restoreApplicationAuth(data.session.user);
          setSbSession(data.session);
          setProfile(staffAuth?.profile ?? null);
          setSession(staffAuth?.session ?? studentSession);
        } else {
          setSbSession(null);
          setSession(readLegacySession());
        }
      } catch (error) {
        const message = await describeRestoreFailure(error);
        setSbSession(null);
        setProfile(null);
        setSession(null);
        toast.error("Pemulihan sesi gagal", message);
      } finally {
        setLoading(false);
      }
    }

    void restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, newSbSession) => {
        if (event === "INITIAL_SESSION") return;
        if (newSbSession?.user) {
          try {
            const { studentSession, staffAuth } = await restoreApplicationAuth(newSbSession.user);
            setSbSession(newSbSession);
            setProfile(staffAuth?.profile ?? null);
            setSession(staffAuth?.session ?? studentSession);
          } catch (error) {
            const message = await describeRestoreFailure(error);
            setSbSession(null);
            setProfile(null);
            setSession(null);
            toast.error("Pemulihan sesi gagal", message);
          }
        } else {
          try {
            setSbSession(null);
            setProfile(null);
            setSession(readLegacySession());
          } catch (error) {
            setSession(null);
            toast.error("Pemulihan sesi lokal gagal", getErrorMessage(error, "Sesi lokal tidak dapat dipulihkan."));
          }
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
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      const message = getAuthErrorMessage(error, "Gagal memeriksa sesi login staff.");
      let cleanupDetail = "";
      try {
        await signOutStaff();
      } catch (cleanupError) {
        cleanupDetail = ` Sesi login juga gagal dibersihkan: ${getErrorMessage(cleanupError, "kesalahan tidak diketahui")}`;
      }
      throw new Error(`${message}${cleanupDetail}`);
    }
    setSbSession(data.session);
    setProfile(auth.profile);
    setSession(auth.session);
    try {
      window.localStorage.setItem(portalRoleStorageKey, expectedRole);
      window.localStorage.removeItem(legacySessionStorageKey);
    } catch (storageError) {
      toast.error("Preferensi sesi gagal disimpan", getErrorMessage(storageError, "Login berhasil, tetapi pilihan portal tidak dapat disimpan di browser."));
    }
    return auth.session;
  }

  async function loginSiswaWithSupabase(email: string, password: string) {
    const studentSession = await signInStudent(email, password);
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      const message = getAuthErrorMessage(error, "Gagal memeriksa sesi login santri.");
      let cleanupDetail = "";
      try {
        await signOutStaff();
      } catch (cleanupError) {
        cleanupDetail = ` Sesi login juga gagal dibersihkan: ${getErrorMessage(cleanupError, "kesalahan tidak diketahui")}`;
      }
      throw new Error(`${message}${cleanupDetail}`);
    }
    setSbSession(data.session);
    setProfile(null);
    setSession(studentSession);
    try {
      window.localStorage.removeItem(portalRoleStorageKey);
      window.localStorage.removeItem(legacySessionStorageKey);
    } catch (storageError) {
      toast.error("Preferensi sesi gagal dibersihkan", getErrorMessage(storageError, "Login berhasil, tetapi preferensi portal lama tidak dapat dibersihkan."));
    }
    return studentSession;
  }

  // Login lama (mock/demo — untuk LoginPage yang belum pakai Supabase)
  // Tetap ada agar routing.tsx tidak error saat demo
  function login(credentials: Session) {
    const safeSession = { ...credentials, password: "" };
    try {
      window.localStorage.setItem(legacySessionStorageKey, JSON.stringify(safeSession));
    } catch (storageError) {
      const message = getErrorMessage(storageError, "Sesi lokal tidak dapat disimpan.");
      toast.error("Login lokal gagal", message);
      throw new Error(message);
    }
    setSession(safeSession);
  }

  async function logout() {
    await signOutStaff();
    setSession(null);
    setProfile(null);
    setSbSession(null);
    try {
      window.localStorage.removeItem(legacySessionStorageKey);
      window.localStorage.removeItem(portalRoleStorageKey);
    } catch (storageError) {
      toast.error("Data sesi lokal gagal dibersihkan", getErrorMessage(storageError, "Logout berhasil, tetapi data sesi browser tidak dapat dibersihkan."));
    }
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
