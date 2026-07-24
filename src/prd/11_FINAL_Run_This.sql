-- ============================================================
-- IN_HSIBS — FINAL SCHEMA (Satu file, langsung jalankan)
-- Gabungan semua keputusan dari file 05 s/d 10
-- 
-- SEBELUM JALANKAN, ganti semua placeholder:
--   [TABEL_SISWA]     → nama tabel siswa di db lama
--   [TABEL_ANGKATAN]  → nama tabel angkatan_santri di db lama
--   [TABEL_USER]      → nama tabel user aplikasi inti (user_hibro, dll)
--   [FK_USER_KOLOM]   → nama kolom FK ke auth.users di tabel user lama
--   [ID_TYPE_SISWA]   → tipe data id tabel siswa (integer / uuid / bigint)
--   [ID_TYPE_ANGKATAN]→ tipe data id tabel angkatan
--   [STATUS_ALUMNI]   → value status alumni ('alumni', 'Alumni', dll)
-- ============================================================


-- ── STEP 0: Cek placeholder belum diganti ────────────────────
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Pastikan semua placeholder sudah diganti!';
  RAISE NOTICE 'Cari teks [TABEL_SISWA], [TABEL_ANGKATAN],';
  RAISE NOTICE '[TABEL_USER], [ID_TYPE_SISWA], dll';
  RAISE NOTICE '============================================';
END $$;


-- ============================================================
-- BAGIAN 1: ENUMS
-- Gunakan DO block agar tidak error jika type sudah ada
-- ============================================================

DO $$ BEGIN
  CREATE TYPE pengabdian_status_enum AS ENUM (
    'Aktif', 'Selesai', 'Ditangguhkan', 'Dibatalkan'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE approval_status_enum AS ENUM (
    'Pending', 'Disetujui', 'Ditolak', 'Dibatalkan'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE gyr_enum AS ENUM ('Green', 'Yellow', 'Red');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE mood_enum AS ENUM ('Good', 'Okay', 'Tough');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE report_status_enum AS ENUM (
    'Draft', 'Terkirim', 'Divalidasi', 'Perlu_Revisi', 'Disetujui', 'Ditolak'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE assignment_level_enum AS ENUM (
    'Primary', 'Secondary', 'Additional'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE staff_role_enum AS ENUM (
    'Admin', 'PIC_Div', 'PIC_Reg', 'Viewer'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ============================================================
-- BAGIAN 2: FUNCTION UTILITIES
-- ============================================================

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION fn_update_ts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.diperbarui_pada = now(); RETURN NEW; END;
$$;


-- ============================================================
-- BAGIAN 3: STAFF PENGABDIAN
-- Relasi ke auth.users yang sama dengan aplikasi inti
-- ============================================================

CREATE TABLE IF NOT EXISTS pengabdian_staff (
  id                uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  kode_staff        text UNIQUE NOT NULL,
  nama_lengkap      text NOT NULL,
  foto_url          text,
  telegram_id       text,
  role_pengabdian   staff_role_enum NOT NULL DEFAULT 'Viewer',
  divisi_id         uuid,  -- diisi setelah tabel pengabdian_divisi dibuat
  region_id         uuid,  -- diisi setelah tabel pengabdian_region dibuat
  aktif             boolean DEFAULT true,
  dibuat_pada       timestamptz DEFAULT now(),
  diperbarui_pada   timestamptz DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_staff_ts ON pengabdian_staff;
CREATE TRIGGER trg_staff_ts
  BEFORE UPDATE ON pengabdian_staff
  FOR EACH ROW EXECUTE FUNCTION fn_update_ts();

-- Auto-buat staff profile saat user baru login/invite
CREATE OR REPLACE FUNCTION fn_on_auth_user_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO pengabdian_staff (id, kode_staff, nama_lengkap, role_pengabdian)
  VALUES (
    NEW.id,
    'STF-' || UPPER(SUBSTR(NEW.id::text, 1, 6)),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1),
      'User Baru'
    ),
    'Viewer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Pasang trigger ke auth.users
-- Catatan: butuh akses service_role untuk buat trigger di schema auth
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION fn_on_auth_user_created();


-- ============================================================
-- BAGIAN 4: DATA REFERENSI
-- ============================================================

CREATE TABLE IF NOT EXISTS pengabdian_region (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_region   text UNIQUE NOT NULL,
  pic_reg_id    uuid REFERENCES pengabdian_staff(id) ON DELETE SET NULL,
  dibuat_pada   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pengabdian_lokasi (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_lokasi   text NOT NULL,
  region_id     uuid REFERENCES pengabdian_region(id),
  gps_lat       numeric(10,7),
  gps_lng       numeric(10,7),
  gps_radius_m  int DEFAULT 200,
  is_remote     boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS pengabdian_unit (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_unit   text UNIQUE NOT NULL,
  nama_unit   text NOT NULL,
  deskripsi   text
);

CREATE TABLE IF NOT EXISTS pengabdian_divisi (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_divisi   text UNIQUE NOT NULL,
  nama_divisi   text NOT NULL,
  deskripsi     text,
  aktif         boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS pengabdian_role (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  divisi_id   uuid NOT NULL REFERENCES pengabdian_divisi(id),
  nama_role   text NOT NULL,
  deskripsi   text,
  aktif       boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS sow_template (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id       uuid NOT NULL REFERENCES pengabdian_role(id),
  item_sow      text NOT NULL,
  tipe_evidence text,
  versi         int DEFAULT 1,
  aktif         boolean DEFAULT true
);

-- Update FK scope di staff setelah tabel region & divisi ada
ALTER TABLE pengabdian_staff
  DROP CONSTRAINT IF EXISTS fk_staff_divisi,
  DROP CONSTRAINT IF EXISTS fk_staff_region;

ALTER TABLE pengabdian_staff
  ADD CONSTRAINT fk_staff_divisi
    FOREIGN KEY (divisi_id) REFERENCES pengabdian_divisi(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_staff_region
    FOREIGN KEY (region_id) REFERENCES pengabdian_region(id) ON DELETE SET NULL;


-- ============================================================
-- BAGIAN 5: BATCH PENGABDIAN
-- Berelasi ke tabel angkatan_santri yang sudah ada
-- ============================================================

CREATE TABLE IF NOT EXISTS pengabdian_batch (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ← GANTI [ID_TYPE_ANGKATAN] dengan integer / uuid / bigint
  -- ← GANTI [TABEL_ANGKATAN] dengan nama tabel angkatan di db lama
  angkatan_id       uuid NOT NULL
                    REFERENCES angkatan_santri(id)
                    ON DELETE RESTRICT ON UPDATE CASCADE,

  tanggal_mulai     date,
  tanggal_selesai   date,
  deskripsi         text,
  target_peserta    int,
  aktif             boolean DEFAULT true,
  dibuat_pada       timestamptz DEFAULT now(),
  diperbarui_pada   timestamptz DEFAULT now(),

  UNIQUE (angkatan_id)   -- satu angkatan = satu batch pengabdian
);

DROP TRIGGER IF EXISTS trg_batch_ts ON pengabdian_batch;
CREATE TRIGGER trg_batch_ts
  BEFORE UPDATE ON pengabdian_batch
  FOR EACH ROW EXECUTE FUNCTION fn_update_ts();


-- ============================================================
-- BAGIAN 6: SANTRI PENGABDIAN
-- Relasi ke tabel siswa lama + auth.users + batch
-- ============================================================

CREATE TABLE IF NOT EXISTS pengabdian_santri (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ← GANTI [ID_TYPE_SISWA] dengan integer / uuid / bigint
  -- ← GANTI [TABEL_SISWA] dengan nama tabel siswa di db lama
  siswa_id        uuid NOT NULL
                  REFERENCES kesiswaan(id)
                  ON DELETE RESTRICT ON UPDATE CASCADE,

  -- Akun login — diisi jika santri diberi akses portal
  -- NULLABLE karena tidak semua santri perlu login sendiri
  auth_user_id    uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,

  batch_id        uuid NOT NULL REFERENCES pengabdian_batch(id),
  kode_santri     text UNIQUE,    -- "IN_HSIBS_0042"
  status          pengabdian_status_enum NOT NULL DEFAULT 'Aktif',
  tanggal_masuk   date NOT NULL DEFAULT CURRENT_DATE,
  tanggal_selesai date,
  catatan         text,
  dibuat_pada     timestamptz DEFAULT now(),
  diperbarui_pada timestamptz DEFAULT now(),

  UNIQUE (siswa_id, batch_id)
);

DROP TRIGGER IF EXISTS trg_santri_ts ON pengabdian_santri;
CREATE TRIGGER trg_santri_ts
  BEFORE UPDATE ON pengabdian_santri
  FOR EACH ROW EXECUTE FUNCTION fn_update_ts();

-- Validasi: hanya alumni yang boleh didaftarkan
-- ← GANTI [TABEL_SISWA] dan [STATUS_ALUMNI]
CREATE OR REPLACE FUNCTION fn_cek_alumni()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_status text;
BEGIN
  SELECT status INTO v_status
  FROM kesiswaan WHERE id = NEW.siswa_id;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Siswa id % tidak ditemukan', NEW.siswa_id;
  END IF;

  IF v_status != 'alumni' THEN
    RAISE EXCEPTION 'Hanya alumni yang bisa didaftarkan. Status saat ini: %', v_status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cek_alumni ON pengabdian_santri;
CREATE TRIGGER trg_cek_alumni
  BEFORE INSERT ON pengabdian_santri
  FOR EACH ROW EXECUTE FUNCTION fn_cek_alumni();


-- ============================================================
-- BAGIAN 7: PENEMPATAN
-- ============================================================

CREATE TABLE IF NOT EXISTS penempatan_santri (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pengabdian_id   uuid NOT NULL REFERENCES pengabdian_santri(id) ON DELETE CASCADE,
  unit_id         uuid REFERENCES pengabdian_unit(id),
  lokasi_id       uuid REFERENCES pengabdian_lokasi(id),
  status          pengabdian_status_enum DEFAULT 'Aktif',
  tanggal_efektif date,
  dibuat_pada     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS penugasan_divisi (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  penempatan_id   uuid NOT NULL REFERENCES penempatan_santri(id) ON DELETE CASCADE,
  divisi_id       uuid NOT NULL REFERENCES pengabdian_divisi(id),
  level           assignment_level_enum NOT NULL DEFAULT 'Primary',
  status          pengabdian_status_enum DEFAULT 'Aktif',
  ditugaskan_oleh uuid REFERENCES auth.users(id),
  disetujui_oleh  uuid REFERENCES auth.users(id),
  tanggal_efektif date,
  catatan         text
);

CREATE TABLE IF NOT EXISTS penugasan_role (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  penugasan_div_id uuid NOT NULL REFERENCES penugasan_divisi(id) ON DELETE CASCADE,
  role_id         uuid NOT NULL REFERENCES pengabdian_role(id),
  status          pengabdian_status_enum DEFAULT 'Aktif'
);

CREATE TABLE IF NOT EXISTS sow_assignment (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  penugasan_role_id uuid NOT NULL REFERENCES penugasan_role(id) ON DELETE CASCADE,
  sow_template_id uuid REFERENCES sow_template(id),
  progres_pct     int DEFAULT 0 CHECK (progres_pct BETWEEN 0 AND 100),
  evidence_url    text,
  catatan_pic     text,
  status          report_status_enum DEFAULT 'Draft',
  dikirim_pada    timestamptz,
  diperbarui_pada timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS request_perubahan_penempatan (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pengabdian_id     uuid NOT NULL REFERENCES pengabdian_santri(id),
  diminta_oleh      uuid REFERENCES auth.users(id),
  payload_perubahan jsonb NOT NULL,  -- {dari: {...}, ke: {...}}
  alasan            text NOT NULL,
  status            approval_status_enum DEFAULT 'Pending',
  diproses_oleh     uuid REFERENCES auth.users(id),
  diproses_pada     timestamptz,
  dibuat_pada       timestamptz DEFAULT now()
);


-- ============================================================
-- BAGIAN 8: LAPORAN
-- ============================================================

CREATE TABLE IF NOT EXISTS log_harian (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pengabdian_id   uuid NOT NULL REFERENCES pengabdian_santri(id) ON DELETE CASCADE,
  tanggal_log     date NOT NULL,
  sesi            text CHECK (sesi IN ('Pagi','Sore')),
  rencana         text,
  recap           text,
  kendala         text,
  mood            mood_enum,
  foto_url        text,
  gps_lat         numeric(10,7),
  gps_lng         numeric(10,7),
  gps_valid       boolean,
  dibuat_pada     timestamptz DEFAULT now(),
  UNIQUE (pengabdian_id, tanggal_log, sesi)
);

CREATE TABLE IF NOT EXISTS laporan_mingguan (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pengabdian_id   uuid NOT NULL REFERENCES pengabdian_santri(id) ON DELETE CASCADE,
  minggu_label    text NOT NULL,           -- format: '2025-W28'
  tanggal_laporan date NOT NULL,
  progres_sow     text,
  highlight       text,
  lowlight        text,
  status          report_status_enum DEFAULT 'Draft',
  catatan_pic     text,
  divalidasi_oleh uuid REFERENCES auth.users(id),
  divalidasi_pada timestamptz,
  diperbarui_pada timestamptz DEFAULT now(),
  UNIQUE (pengabdian_id, minggu_label)
);

CREATE TABLE IF NOT EXISTS evaluasi_bulanan (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pengabdian_id       uuid NOT NULL REFERENCES pengabdian_santri(id) ON DELETE CASCADE,
  bulan               int NOT NULL CHECK (bulan BETWEEN 1 AND 12),
  tahun               int NOT NULL,
  pct_sow             int CHECK (pct_sow BETWEEN 0 AND 100),
  skor_adab           int CHECK (skor_adab BETWEEN 1 AND 5),
  skor_kedisiplinan   int CHECK (skor_kedisiplinan BETWEEN 1 AND 5),
  jumlah_learn        int DEFAULT 0,
  jumlah_project_acc  int DEFAULT 0,
  jumlah_checkin      int DEFAULT 0,
  status_gyr          gyr_enum,
  eligible_mukafaah   boolean DEFAULT false,
  catatan_pic_div     text,
  catatan_pic_reg     text,
  pic_div_id          uuid REFERENCES auth.users(id),
  pic_reg_id          uuid REFERENCES auth.users(id),
  difinalisasi_pada   timestamptz,
  diperbarui_pada     timestamptz DEFAULT now(),
  UNIQUE (pengabdian_id, bulan, tahun)
);

CREATE TABLE IF NOT EXISTS mukafaah (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pengabdian_id       uuid NOT NULL REFERENCES pengabdian_santri(id) ON DELETE CASCADE,
  bulan               int NOT NULL,
  tahun               int NOT NULL,
  snapshot_kriteria   jsonb NOT NULL,    -- semua nilai saat dihitung
  eligible            boolean NOT NULL,
  nominal_idr         numeric(12,2),
  catatan             text,
  difinalisasi_oleh   uuid REFERENCES auth.users(id),
  difinalisasi_pada   timestamptz,
  dibuat_pada         timestamptz DEFAULT now(),
  UNIQUE (pengabdian_id, bulan, tahun)
);


-- ============================================================
-- BAGIAN 9: LEARN & PROJECT
-- ============================================================

CREATE TABLE IF NOT EXISTS learn_session (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id        uuid REFERENCES pengabdian_batch(id),
  kode_sesi       text UNIQUE NOT NULL,
  bulan           int,
  label_jadwal    text,
  fase            text,
  tema            text,
  judul           text NOT NULL,
  tipe_sesi       text,
  dibuat_pada     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learn_attendance (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesi_id         uuid NOT NULL REFERENCES learn_session(id),
  pengabdian_id   uuid NOT NULL REFERENCES pengabdian_santri(id) ON DELETE CASCADE,
  status          text DEFAULT 'Belum' CHECK (status IN ('Hadir','Tidak_Hadir','Izin','Belum')),
  evidence_url    text,
  divalidasi_oleh uuid REFERENCES auth.users(id),
  UNIQUE (sesi_id, pengabdian_id)
);

CREATE TABLE IF NOT EXISTS project_track (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_track  text UNIQUE NOT NULL,
  deskripsi   text
);

CREATE TABLE IF NOT EXISTS project (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pemilik_id       uuid NOT NULL REFERENCES pengabdian_santri(id),
  divisi_id        uuid REFERENCES pengabdian_divisi(id),
  batch_id         uuid REFERENCES pengabdian_batch(id),
  track_id         uuid REFERENCES project_track(id),
  nama_project     text NOT NULL,
  deskripsi        text,
  output_url       text,
  status           report_status_enum DEFAULT 'Draft',
  wajib            boolean DEFAULT false,
  review_pic_div   uuid REFERENCES auth.users(id),
  review_pic_reg   uuid REFERENCES auth.users(id),
  dibuat_pada      timestamptz DEFAULT now(),
  diperbarui_pada  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_member (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  pengabdian_id   uuid NOT NULL REFERENCES pengabdian_santri(id),
  peran           text,
  UNIQUE (project_id, pengabdian_id)
);

CREATE TABLE IF NOT EXISTS laporan_khusus (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pengabdian_id   uuid NOT NULL REFERENCES pengabdian_santri(id),
  batch_id        uuid REFERENCES pengabdian_batch(id),
  tipe_laporan    text NOT NULL,   -- 'Izin', 'Dispensasi', 'Permohonan', dll
  payload         jsonb,
  status          report_status_enum DEFAULT 'Draft',
  review_pic_div  uuid REFERENCES auth.users(id),
  review_pic_reg  uuid REFERENCES auth.users(id),
  dibuat_pada     timestamptz DEFAULT now(),
  diperbarui_pada timestamptz DEFAULT now()
);


-- ============================================================
-- BAGIAN 10: SISTEM — Admin tasks, notifikasi, audit
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_task (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dibuat_oleh     uuid REFERENCES auth.users(id),
  ditugaskan_ke   uuid REFERENCES auth.users(id),
  teks            text NOT NULL,
  selesai         boolean DEFAULT false,
  prioritas       text DEFAULT 'medium' CHECK (prioritas IN ('high','medium','low')),
  selesai_pada    timestamptz,
  dibuat_pada     timestamptz DEFAULT now(),
  diperbarui_pada timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifikasi_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid REFERENCES auth.users(id),
  channel         text DEFAULT 'Telegram',
  pesan           text,
  status          text,
  retry_count     int DEFAULT 0,
  error_message   text,
  dikirim_pada    timestamptz,
  dibuat_pada     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aktor_id        uuid REFERENCES auth.users(id),
  tipe_entitas    text NOT NULL,
  id_entitas      uuid,
  aksi            text NOT NULL,   -- 'INSERT', 'UPDATE', 'DELETE'
  data_sebelum    jsonb,
  data_sesudah    jsonb,
  alasan          text,
  dibuat_pada     timestamptz DEFAULT now()
);

-- Trigger admin_task timestamp
DROP TRIGGER IF EXISTS trg_admin_task_ts ON admin_task;
CREATE TRIGGER trg_admin_task_ts
  BEFORE UPDATE ON admin_task
  FOR EACH ROW EXECUTE FUNCTION fn_update_ts();


-- ============================================================
-- BAGIAN 11: HELPER FUNCTIONS (untuk RLS & aplikasi)
-- ============================================================

-- Cek apakah user yang login adalah staff pengabdian aktif
CREATE OR REPLACE FUNCTION pengabdian_is_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM pengabdian_staff
    WHERE id = auth.uid() AND aktif = true
  );
$$;

-- Ambil role pengabdian user yang sedang login
CREATE OR REPLACE FUNCTION pengabdian_get_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT role_pengabdian::text
  FROM pengabdian_staff
  WHERE id = auth.uid();
$$;

-- Cek apakah user yang login adalah santri pengabdian aktif
CREATE OR REPLACE FUNCTION pengabdian_is_santri()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM pengabdian_santri
    WHERE auth_user_id = auth.uid() AND status = 'Aktif'
  );
$$;

-- Ambil pengabdian_id santri yang sedang login
CREATE OR REPLACE FUNCTION pengabdian_get_my_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT id FROM pengabdian_santri
  WHERE auth_user_id = auth.uid() AND status = 'Aktif'
  LIMIT 1;
$$;


-- ============================================================
-- BAGIAN 12: VIEWS
-- ============================================================

-- View utama: santri aktif dengan data lengkap dari tabel lama
-- ← SESUAIKAN kolom s.nama, s.nis, ang.nama_angkatan, ang.tahun_ajaran
CREATE OR REPLACE VIEW v_santri_aktif AS
SELECT
  ps.id                AS pengabdian_id,
  ps.kode_santri,
  ps.status            AS status_pengabdian,
  ps.tanggal_masuk,
  ps.auth_user_id,

  -- Data dari tabel siswa lama (SESUAIKAN kolom)
  ps.siswa_id,
  s.nama_lengkap       AS nama_santri,
  s.nis,

  -- Data angkatan dari tabel lama (SESUAIKAN kolom)
  ang.nama_angkatan,
  ang.tahun_masuk,

  -- Data batch pengabdian
  pb.id                AS batch_id,
  pb.tanggal_mulai     AS batch_mulai,
  pb.tanggal_selesai   AS batch_selesai,

  -- Apakah sudah punya akun login
  CASE
    WHEN ps.auth_user_id IS NOT NULL THEN true
    ELSE false
  END AS punya_akun_login

FROM pengabdian_santri ps
JOIN kesiswaan s              ON s.id = ps.siswa_id    -- ← SESUAIKAN
JOIN pengabdian_batch pb          ON pb.id = ps.batch_id
JOIN angkatan_santri ang         ON ang.id = pb.angkatan_id  -- ← SESUAIKAN
WHERE ps.status = 'Aktif';


-- View: siapa yang sedang login dan role-nya di modul pengabdian
-- View: siapa yang sedang login dan role-nya di modul pengabdian
CREATE OR REPLACE VIEW v_current_user AS
SELECT
  au.id                               AS auth_id,
  au.email,
  au.raw_user_meta_data->>'full_name' AS nama,

  -- Role di modul pengabdian (dari pengabdian_staff)
  ps.role_pengabdian,
  ps.nama_lengkap,
  ps.aktif                            AS staff_aktif,

  -- Jika santri pengabdian
  peng.id                             AS pengabdian_id,
  peng.kode_santri,
  peng.status                         AS status_pengabdian,

  CASE
    WHEN ps.id IS NOT NULL              THEN 'staff'
    WHEN peng.auth_user_id IS NOT NULL  THEN 'santri'
    ELSE 'tamu'
  END AS tipe_di_pengabdian

FROM auth.users au
LEFT JOIN pengabdian_staff ps
  ON ps.id = au.id
LEFT JOIN pengabdian_santri peng
  ON peng.auth_user_id = au.id
WHERE au.id = auth.uid();


-- View: batch dengan jumlah santri
CREATE OR REPLACE VIEW v_batch_summary AS
SELECT
  pb.id,
  pb.aktif,
  pb.tanggal_mulai,
  pb.tanggal_selesai,
  pb.target_peserta,
  ang.nama_angkatan,                    -- ← SESUAIKAN kolom
  ang.tahun_masuk,                     -- ← SESUAIKAN kolom
  COUNT(ps.id) FILTER (WHERE ps.status = 'Aktif')    AS santri_aktif,
  COUNT(ps.id) FILTER (WHERE ps.status = 'Selesai')  AS santri_selesai,
  COUNT(ps.id)                                        AS total_santri

FROM pengabdian_batch pb
JOIN angkatan_santri ang ON ang.id = pb.angkatan_id  -- ← SESUAIKAN
LEFT JOIN pengabdian_santri ps ON ps.batch_id = pb.id
GROUP BY pb.id, pb.aktif, pb.tanggal_mulai, pb.tanggal_selesai,
         pb.target_peserta, ang.nama_angkatan, ang.tahun_masuk;


-- ============================================================
-- BAGIAN 13: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE pengabdian_staff      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengabdian_santri     ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_harian            ENABLE ROW LEVEL SECURITY;
ALTER TABLE laporan_mingguan      ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluasi_bulanan      ENABLE ROW LEVEL SECURITY;
ALTER TABLE mukafaah              ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_task            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log             ENABLE ROW LEVEL SECURITY;

-- ── pengabdian_staff ────────────────────────────────────────
CREATE POLICY pol_staff_self_read ON pengabdian_staff
  FOR SELECT USING (id = auth.uid() OR pengabdian_get_role() = 'Admin');

CREATE POLICY pol_staff_self_update ON pengabdian_staff
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY pol_staff_admin_all ON pengabdian_staff
  FOR ALL USING (pengabdian_get_role() = 'Admin');

-- ── pengabdian_santri ────────────────────────────────────────
CREATE POLICY pol_santri_read ON pengabdian_santri
  FOR SELECT USING (
    auth_user_id = auth.uid() OR pengabdian_is_staff()
  );

CREATE POLICY pol_santri_insert ON pengabdian_santri
  FOR INSERT WITH CHECK (pengabdian_is_staff());

CREATE POLICY pol_santri_update ON pengabdian_santri
  FOR UPDATE USING (pengabdian_is_staff());

-- ── log_harian ───────────────────────────────────────────────
CREATE POLICY pol_log_read ON log_harian
  FOR SELECT USING (
    pengabdian_id = pengabdian_get_my_id() OR pengabdian_is_staff()
  );

CREATE POLICY pol_log_insert ON log_harian
  FOR INSERT WITH CHECK (
    pengabdian_id = pengabdian_get_my_id()
  );

-- ── evaluasi_bulanan ─────────────────────────────────────────
CREATE POLICY pol_eval_read ON evaluasi_bulanan
  FOR SELECT USING (
    pengabdian_id = pengabdian_get_my_id() OR pengabdian_is_staff()
  );

CREATE POLICY pol_eval_write ON evaluasi_bulanan
  FOR ALL USING (pengabdian_is_staff());

-- ── mukafaah ─────────────────────────────────────────────────
CREATE POLICY pol_mukafaah_read ON mukafaah
  FOR SELECT USING (
    pengabdian_id = pengabdian_get_my_id() OR pengabdian_is_staff()
  );

CREATE POLICY pol_mukafaah_write ON mukafaah
  FOR ALL USING (
    pengabdian_get_role() IN ('Admin', 'PIC_Reg')
  );

-- ── admin_task ───────────────────────────────────────────────
CREATE POLICY pol_admin_task ON admin_task
  FOR ALL USING (pengabdian_is_staff());

-- ── audit_log ────────────────────────────────────────────────
CREATE POLICY pol_audit_read ON audit_log
  FOR SELECT USING (pengabdian_get_role() = 'Admin');

-- audit_log tidak boleh di-insert manual dari client
-- hanya via server-side / Edge Functions


-- ============================================================
-- BAGIAN 14: RINGKASAN TABEL YANG TERBUAT
-- ============================================================

/*
  TABEL BARU (27 total):
  ─────────────────────────────────────────────────────────
  AUTH & USER
    pengabdian_staff          — PIC Div, PIC Reg, Admin

  REFERENSI (6)
    pengabdian_batch          — periode pengabdian → angkatan_santri
    pengabdian_unit           — unit penempatan
    pengabdian_region         — regional
    pengabdian_lokasi         — lokasi + GPS
    pengabdian_divisi         — divisi kerja
    pengabdian_role           — role dalam divisi
    sow_template              — template SoW per role

  SANTRI & PENEMPATAN (6)
    pengabdian_santri         — santri aktif → siswa (tabel lama) + auth.users
    penempatan_santri         — santri di unit + lokasi mana
    penugasan_divisi          — santri di divisi apa
    penugasan_role            — role santri dalam divisi
    sow_assignment            — SoW per santri
    request_perubahan_penempatan

  LAPORAN (5)
    log_harian
    laporan_mingguan
    evaluasi_bulanan
    mukafaah
    laporan_khusus

  LEARN & PROJECT (4)
    learn_session
    learn_attendance
    project
    project_member
    project_track

  SISTEM (3)
    admin_task
    notifikasi_log
    audit_log

  TIDAK DIBUAT (sudah ada di db lama):
    auth.users    — shared, dipakai bersama
    siswa         — [TABEL_SISWA]
    angkatan_santri — [TABEL_ANGKATAN]
    user aplikasi inti — [TABEL_USER]
  ─────────────────────────────────────────────────────────

  PLACEHOLDER YANG HARUS DIGANTI SEBELUM DIJALANKAN:
    [TABEL_SISWA]       nama tabel siswa
    [TABEL_ANGKATAN]    nama tabel angkatan
    [TABEL_USER]        nama tabel user aplikasi inti
    [FK_USER_KOLOM]     kolom FK ke auth.users di tabel user lama
    [ID_TYPE_SISWA]     integer / uuid / bigint
    [ID_TYPE_ANGKATAN]  integer / uuid / bigint
    [STATUS_ALUMNI]     value status alumni yang sebenarnya
*/
