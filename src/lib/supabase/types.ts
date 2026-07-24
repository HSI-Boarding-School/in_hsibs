// ============================================================
// Supabase Database Types — IN_HSIBS
// Generate ulang dengan: npx supabase gen types typescript
// setelah schema di Supabase sudah final
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ── Enum types ───────────────────────────────────────────────

export type PengabdianStatus =
  | "Aktif"
  | "Selesai"
  | "Ditangguhkan"
  | "Dibatalkan";
export type ApprovalStatus = "Pending" | "Disetujui" | "Ditolak" | "Dibatalkan";
export type GyrStatus = "Green" | "Yellow" | "Red";
export type MoodStatus = "Good" | "Okay" | "Tough";
export type ReportStatus =
  | "Draft"
  | "Terkirim"
  | "Divalidasi"
  | "Perlu_Revisi"
  | "Disetujui"
  | "Ditolak";
export type AssignmentLevel = "Primary" | "Secondary" | "Additional";
export type StaffRole = "Admin" | "PIC_Div" | "PIC_Reg" | "Viewer";

// ── Row types (satu row dari tabel) ─────────────────────────

export interface PengabdianStaff {
  id: string;
  kode_staff: string;
  nama_lengkap: string;
  foto_url: string | null;
  telegram_id: string | null;
  role_pengabdian: StaffRole;
  divisi_id: string | null;
  region_id: string | null;
  aktif: boolean;
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface PengabdianBatch {
  id: string;
  angkatan_id: string;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  deskripsi: string | null;
  target_peserta: number | null;
  aktif: boolean;
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface PengabdianSantri {
  id: string;
  siswa_id: string;
  auth_user_id: string | null;
  batch_id: string;
  kode_santri: string | null;
  status: PengabdianStatus;
  tanggal_masuk: string;
  tanggal_selesai: string | null;
  catatan: string | null;
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface EvaluasiBulanan {
  id: string;
  pengabdian_id: string;
  bulan: number;
  tahun: number;
  pct_sow: number | null;
  skor_adab: number | null;
  skor_kedisiplinan: number | null;
  jumlah_learn: number;
  jumlah_project_acc: number;
  jumlah_checkin: number;
  status_gyr: GyrStatus | null;
  eligible_mukafaah: boolean;
  catatan_pic_div: string | null;
  catatan_pic_reg: string | null;
  pic_div_id: string | null;
  pic_reg_id: string | null;
  difinalisasi_pada: string | null;
  diperbarui_pada: string;
}

export interface LogHarian {
  id: string;
  pengabdian_id: string;
  tanggal_log: string;
  sesi: "Pagi" | "Sore" | null;
  rencana: string | null;
  recap: string | null;
  kendala: string | null;
  mood: MoodStatus | null;
  foto_url: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  gps_valid: boolean | null;
  dibuat_pada: string;
}

export interface LaporanMingguan {
  id: string;
  pengabdian_id: string;
  minggu_label: string;
  tanggal_laporan: string;
  progres_sow: string | null;
  highlight: string | null;
  lowlight: string | null;
  status: ReportStatus;
  catatan_pic: string | null;
  divalidasi_oleh: string | null;
  divalidasi_pada: string | null;
  diperbarui_pada: string;
}

export interface AdminTask {
  id: string;
  dibuat_oleh: string | null;
  ditugaskan_ke: string | null;
  teks: string;
  selesai: boolean;
  prioritas: "high" | "medium" | "low";
  selesai_pada: string | null;
  dibuat_pada: string;
  diperbarui_pada: string;
}

// ── Database type (untuk createClient<Database>) ─────────────

export interface Database {
  public: {
    Tables: {
      pengabdian_staff: {
        Row: PengabdianStaff;
        Insert: Omit<PengabdianStaff, "dibuat_pada" | "diperbarui_pada">;
        Update: Partial<Omit<PengabdianStaff, "id">>;
      };
      pengabdian_batch: {
        Row: PengabdianBatch;
        Insert: Omit<PengabdianBatch, "id" | "dibuat_pada" | "diperbarui_pada">;
        Update: Partial<Omit<PengabdianBatch, "id">>;
      };
      pengabdian_santri: {
        Row: PengabdianSantri;
        Insert: Omit<
          PengabdianSantri,
          "id" | "dibuat_pada" | "diperbarui_pada"
        >;
        Update: Partial<Omit<PengabdianSantri, "id">>;
      };
      evaluasi_bulanan: {
        Row: EvaluasiBulanan;
        Insert: Omit<EvaluasiBulanan, "id" | "diperbarui_pada">;
        Update: Partial<Omit<EvaluasiBulanan, "id">>;
      };
      log_harian: {
        Row: LogHarian;
        Insert: Omit<LogHarian, "id" | "dibuat_pada">;
        Update: Partial<Omit<LogHarian, "id">>;
      };
      laporan_mingguan: {
        Row: LaporanMingguan;
        Insert: Omit<LaporanMingguan, "id" | "diperbarui_pada">;
        Update: Partial<Omit<LaporanMingguan, "id">>;
      };
      admin_task: {
        Row: AdminTask;
        Insert: Omit<AdminTask, "id" | "dibuat_pada" | "diperbarui_pada">;
        Update: Partial<Omit<AdminTask, "id">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
