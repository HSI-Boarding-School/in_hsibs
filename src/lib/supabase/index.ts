// Client
export { supabase } from "./client";

// Auth functions
export {
  signIn,
  signOut,
  getSession,
  getUser,
  getStaffProfile,
  onAuthStateChange,
} from "./auth";

// Context & hook
export { SupabaseAuthProvider, useAuth } from "./AuthContext";

// React hooks
export * from "./hooks";

// Query functions
export * from "./queries";

// Types
export type {
  Database,
  PengabdianStaff,
  PengabdianBatch,
  PengabdianSantri,
  EvaluasiBulanan,
  LogHarian,
  LaporanMingguan,
  AdminTask,
  PengabdianStatus,
  ApprovalStatus,
  GyrStatus,
  MoodStatus,
  ReportStatus,
  AssignmentLevel,
  StaffRole,
  Json,
} from "./types";
