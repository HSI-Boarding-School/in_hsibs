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
  role_staff: StaffRole;
  divisi_id: string | null;
  region_id: string | null;
  aktif: boolean | null;
  dibuat_pada: string | null;
  diperbarui_pada: string | null;
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
  batch_id: string | null;
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

export interface KesiswaanRow {
  id: string;
  nis: string;
  nama_lengkap: string;
  jenis_kelamin: string | null;
  tahun_ajaran_id: string | null;
  angkatan_id: string | null;
  user_id: string | null;
  status: string | null;
  foto_url: string | null;
}

export interface PenempatanSantriRow {
  id: string;
  pengabdian_id: string;
  unit_id: string | null;
  lokasi_id: string | null;
  pic_reg_id: string | null;
  status: PengabdianStatus | null;
  tanggal_efektif: string | null;
  dibuat_pada: string | null;
  diperbarui_pada: string | null;
}

export interface PenugasanDivisiRow {
  id: string;
  penempatan_id: string;
  divisi_id: string;
  pic_div_id: string | null;
  level: AssignmentLevel;
  status: PengabdianStatus | null;
  ditugaskan_oleh: string | null;
  disetujui_oleh: string | null;
  tanggal_efektif: string | null;
  catatan: string | null;
  dibuat_pada: string | null;
  diperbarui_pada: string | null;
}

export interface PengabdianDivisiRow {
  id: string;
  kode_divisi: string;
  nama_divisi: string;
  deskripsi: string | null;
  aktif: boolean | null;
}

export interface PengabdianLokasiRow {
  id: string;
  nama_lokasi: string;
  region_id: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  gps_radius_m: number | null;
  is_remote: boolean | null;
}

export interface PengabdianUnitRow {
  id: string;
  kode_unit: string | null;
  nama_unit: string;
}

export interface PengabdianRoleRow {
  id: string;
  divisi_id: string | null;
  nama_role: string;
  role_code: string | null;
  default_sow_summary: string | null;
  self_study: string | null;
  status: string | null;
}

export interface PengabdianLearnSessionRow {
  id: string;
  kode_sesi: string;
  tipe: "mandatory" | "rolespec";
  phase: string | null;
  phase_english: string | null;
  bulan_ke: number | null;
  quarter: string | null;
  schedule_label: string | null;
  tanggal_sesi: string | null;
  tema: string;
  theme_cls: string | null;
  judul: string;
  subjudul: string | null;
  deskripsi_what: string | null;
  peserta_who: string | null;
  tujuan_why: string | null;
  lokasi_where: string | null;
  metode_how: string | null;
  pemateri: string | null;
  status: "Planned" | "Done" | "Cancelled";
  target_peserta: number | null;
}

export interface PengabdianCalendarEventRow {
  id: string;
  tanggal_event: string;
  judul: string;
  subjudul: string | null;
  tipe: "learn" | "project" | "report";
  status: "scheduled" | "submitted" | "due-soon" | "overdue";
  warna: string | null;
  sepanjang_hari: boolean | null;
  mulai_pada: string | null;
  selesai_pada: string | null;
  deskripsi: string | null;
  learn_session_id: string | null;
  project_id: string | null;
  report_id: string | null;
}

export interface AuditLogRow {
  id: string;
  aktor_id: string | null;
  tipe_entitas: string;
  id_entitas: string | null;
  aksi: string;
  data_sebelum: Json | null;
  data_sesudah: Json | null;
  alasan: string | null;
  dibuat_pada: string | null;
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
      kesiswaan: {
        Row: KesiswaanRow;
        Insert: Partial<KesiswaanRow> & Pick<KesiswaanRow, "nis" | "nama_lengkap">;
        Update: Partial<Omit<KesiswaanRow, "id">>;
      };
      pengabdian_penempatan_santri: {
        Row: PenempatanSantriRow;
        Insert: Omit<PenempatanSantriRow, "id"> & { id?: string };
        Update: Partial<Omit<PenempatanSantriRow, "id">>;
      };
      pengabdian_penugasan_divisi: {
        Row: PenugasanDivisiRow;
        Insert: Omit<PenugasanDivisiRow, "id"> & { id?: string };
        Update: Partial<Omit<PenugasanDivisiRow, "id">>;
      };
      pengabdian_divisi: {
        Row: PengabdianDivisiRow;
        Insert: Omit<PengabdianDivisiRow, "id"> & { id?: string };
        Update: Partial<Omit<PengabdianDivisiRow, "id">>;
      };
      pengabdian_lokasi: {
        Row: PengabdianLokasiRow;
        Insert: Omit<PengabdianLokasiRow, "id"> & { id?: string };
        Update: Partial<Omit<PengabdianLokasiRow, "id">>;
      };
      pengabdian_unit: {
        Row: PengabdianUnitRow;
        Insert: Omit<PengabdianUnitRow, "id"> & { id?: string };
        Update: Partial<Omit<PengabdianUnitRow, "id">>;
      };
      pengabdian_role: {
        Row: PengabdianRoleRow;
        Insert: Omit<PengabdianRoleRow, "id"> & { id?: string };
        Update: Partial<Omit<PengabdianRoleRow, "id">>;
      };
      pengabdian_learn_session: {
        Row: PengabdianLearnSessionRow;
        Insert: Omit<PengabdianLearnSessionRow, "id"> & { id?: string };
        Update: Partial<Omit<PengabdianLearnSessionRow, "id">>;
      };
      pengabdian_calendar_event: {
        Row: PengabdianCalendarEventRow;
        Insert: Omit<PengabdianCalendarEventRow, "id"> & { id?: string };
        Update: Partial<Omit<PengabdianCalendarEventRow, "id">>;
      };
      audit_log: {
        Row: AuditLogRow;
        Insert: Omit<AuditLogRow, "id"> & { id?: string };
        Update: Partial<Omit<AuditLogRow, "id">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
