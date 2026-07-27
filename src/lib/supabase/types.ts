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

export interface PengabdianLearnAttendanceRow {
  id: string;
  learn_session_id: string;
  pengabdian_id: string;
  status: "Hadir" | "Izin" | "Alpha";
  catatan: string | null;
  dicatat_oleh: string | null;
  dicatat_pada: string | null;
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

export interface PengabdianTrackRow {
  id: number;
  Track?: string | null;
  track?: string | null;
  nama_track?: string | null;
  track_name?: string | null;
  description?: string | null;
}

export interface PengabdianProjectRow {
  id: string;
  track_id: number | null;
  project_name: string | null;
  divisi_id: string | null;
  status: string | null;
  platform: string | null;
  reviewer: string | null;
  link: string | null;
  is_wajib: boolean | null;
  created_at: string;
}

export interface PengabdianProjectOwnerRow {
  id: string;
  project_id: string;
  pengabdian_id: string;
  role_owner: string | null;
  ditambahkan_pada: string | null;
}

export interface PengabdianRiskReportRow {
  id: string;
  pengabdian_id: string;
  dilaporkan_oleh: string;
  peran_pelapor: "Admin" | "PIC_Div" | "PIC_Reg";
  kategori: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  judul: string;
  deskripsi: string;
  indikator: Json;
  rekomendasi_tindakan: string | null;
  tindak_lanjut: string | null;
  status: "Open" | "In_Review" | "Monitoring" | "Resolved" | "Closed";
  ditugaskan_kepada: string | null;
  report_id: string | null;
  project_id: string | null;
  target_selesai: string | null;
  diselesaikan_oleh: string | null;
  diselesaikan_pada: string | null;
  catatan_penyelesaian: string | null;
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface PengabdianReportRow {
  id: string;
  pengabdian_id: string;
  tipe: "Daily" | "Weekly" | "Monthly";
  periode_mulai: string;
  periode_selesai: string;
  status: ReportStatus;
  versi: number;
  dikirim_pada: string | null;
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface PengabdianReportMonthlyEvaluationRow {
  id: string;
  report_id: string;
  pct_sow: number | null;
  skor_adab: number | null;
  skor_kedisiplinan: number | null;
  jumlah_learn: number;
  jumlah_project_acc: number;
  jumlah_checkin: number;
  status_gyr: string | null;
  eligible_mukafaah: boolean;
  catatan_pic_div: string | null;
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface PengabdianReportDailyRow {
  report_id: string;
  tanggal: string;
  rencana: string | null;
  pagi_dikirim_pada: string | null;
  recap: string | null;
  kendala: string | null;
  mood: MoodStatus | null;
  sore_dikirim_pada: string | null;
}

export interface PengabdianReportWeeklyRow {
  report_id: string;
  minggu_label: string;
  progres_sow_status: string | null;
  progres_sow_pct: number | null;
  highlight: string | null;
  lowlight: string | null;
  refleksi: string | null;
}

export interface PengabdianReportMonthlyRow {
  report_id: string;
  bulan: number;
  tahun: number;
  refleksi: string | null;
  pencapaian: string | null;
  tantangan: string | null;
  rencana_bulan_depan: string | null;
}

export interface PengabdianReportReviewRow {
  id: string;
  report_id: string;
  aktor_user_id: string | null;
  aktor_staff_id: string | null;
  status_sebelum: ReportStatus | null;
  status_sesudah: ReportStatus;
  aksi: string | null;
  catatan: string | null;
  dibuat_pada: string;
}

export interface PengabdianReportReminderRow {
  id: string;
  pengabdian_id: string;
  report_id: string | null;
  tipe_report: "Daily" | "Weekly" | "Monthly";
  periode_mulai: string;
  channel: string;
  pesan: string | null;
  dikirim_oleh: string | null;
  dikirim_pada: string;
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
      pengabdian_learn_attendance: {
        Row: PengabdianLearnAttendanceRow;
        Insert: Omit<PengabdianLearnAttendanceRow, "id" | "dicatat_pada"> & { id?: string; dicatat_pada?: string };
        Update: Partial<Omit<PengabdianLearnAttendanceRow, "id">>;
      };
      pengabdian_calendar_event: {
        Row: PengabdianCalendarEventRow;
        Insert: Omit<PengabdianCalendarEventRow, "id"> & { id?: string };
        Update: Partial<Omit<PengabdianCalendarEventRow, "id">>;
      };
      pengabdian_track: {
        Row: PengabdianTrackRow;
        Insert: Omit<PengabdianTrackRow, "id"> & { id?: number };
        Update: Partial<Omit<PengabdianTrackRow, "id">>;
      };
      pengabdian_projects: {
        Row: PengabdianProjectRow;
        Insert: Omit<PengabdianProjectRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<PengabdianProjectRow, "id">>;
      };
      pengabdian_project_owner: {
        Row: PengabdianProjectOwnerRow;
        Insert: Omit<PengabdianProjectOwnerRow, "id" | "ditambahkan_pada"> & { id?: string; ditambahkan_pada?: string };
        Update: Partial<Omit<PengabdianProjectOwnerRow, "id">>;
      };
      pengabdian_risk_report: {
        Row: PengabdianRiskReportRow;
        Insert: Omit<PengabdianRiskReportRow, "id" | "dibuat_pada" | "diperbarui_pada"> & { id?: string; dibuat_pada?: string; diperbarui_pada?: string };
        Update: Partial<Omit<PengabdianRiskReportRow, "id">>;
      };
      pengabdian_report: {
        Row: PengabdianReportRow;
        Insert: Partial<PengabdianReportRow> & Pick<PengabdianReportRow, "pengabdian_id" | "tipe" | "periode_mulai" | "periode_selesai">;
        Update: Partial<Omit<PengabdianReportRow, "id">>;
      };
      pengabdian_report_monthly_evaluation: {
        Row: PengabdianReportMonthlyEvaluationRow;
        Insert: Partial<PengabdianReportMonthlyEvaluationRow> & Pick<PengabdianReportMonthlyEvaluationRow, "report_id">;
        Update: Partial<Omit<PengabdianReportMonthlyEvaluationRow, "id">>;
      };
      pengabdian_report_daily: {
        Row: PengabdianReportDailyRow;
        Insert: Partial<PengabdianReportDailyRow> & Pick<PengabdianReportDailyRow, "report_id" | "tanggal">;
        Update: Partial<Omit<PengabdianReportDailyRow, "report_id">>;
      };
      pengabdian_report_weekly: {
        Row: PengabdianReportWeeklyRow;
        Insert: Partial<PengabdianReportWeeklyRow> & Pick<PengabdianReportWeeklyRow, "report_id" | "minggu_label">;
        Update: Partial<Omit<PengabdianReportWeeklyRow, "report_id">>;
      };
      pengabdian_report_monthly: {
        Row: PengabdianReportMonthlyRow;
        Insert: Partial<PengabdianReportMonthlyRow> & Pick<PengabdianReportMonthlyRow, "report_id" | "bulan" | "tahun">;
        Update: Partial<Omit<PengabdianReportMonthlyRow, "report_id">>;
      };
      pengabdian_report_review: {
        Row: PengabdianReportReviewRow;
        Insert: Omit<PengabdianReportReviewRow, "id" | "dibuat_pada"> & { id?: string; dibuat_pada?: string };
        Update: Partial<Omit<PengabdianReportReviewRow, "id">>;
      };
      pengabdian_report_reminder: {
        Row: PengabdianReportReminderRow;
        Insert: Omit<PengabdianReportReminderRow, "id" | "dikirim_pada"> & { id?: string; dikirim_pada?: string };
        Update: Partial<Omit<PengabdianReportReminderRow, "id">>;
      };
      audit_log: {
        Row: AuditLogRow;
        Insert: Omit<AuditLogRow, "id"> & { id?: string };
        Update: Partial<Omit<AuditLogRow, "id">>;
      };
    };
    Views: {
      v_pengabdian_report_progress: {
        Row: import("../../models/monitoring/monitoring.model").PengabdianReportProgressViewRow;
      };
      v_pengabdian_risk_report: {
        Row: import("../../models/monitoring/monitoring.model").PengabdianRiskReportViewRow;
      };
    };
    Functions: {
      pengabdian_set_report_status: {
        Args: {
          p_report_id: string;
          p_status: ReportStatus;
          p_catatan?: string | null;
          p_aksi?: string | null;
        };
        Returns: PengabdianReportRow;
      };
    };
    Enums: Record<string, never>;
  };
}
