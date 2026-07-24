-- ============================================================
-- IN_HSIBS — Skema Modul Pengabdian
-- Berdiri sendiri, berelasi ke tabel kesiswaan yang sudah ada
-- Jalankan di Supabase setelah tabel kesiswaan sudah ada
-- ============================================================

-- ── ASUMSI TABEL KESISWAAN LAMA ──────────────────────────────
-- Kamu punya tabel seperti ini (sesuaikan nama & kolom):
--
--   CREATE TABLE siswa (
--     id       serial PRIMARY KEY,
--     nis      text UNIQUE,
--     nama     text,
--     status   text,   -- 'alumni', 'aktif', dll
--     ...
--   );
--
-- Kita TIDAK mengubah tabel ini sama sekali.
-- Cukup referensikan id-nya dari tabel pengabdian.
-- ─────────────────────────────────────────────────────────────


-- ── ENUMS ────────────────────────────────────────────────────

CREATE TYPE pengabdian_status     AS ENUM ('Aktif','Selesai','Ditangguhkan','Dibatalkan');
CREATE TYPE approval_status_peng  AS ENUM ('Pending','Disetujui','Ditolak','Dibatalkan');
CREATE TYPE gyr_status_peng       AS ENUM ('Green','Yellow','Red');
CREATE TYPE report_status_peng    AS ENUM ('Draft','Terkirim','Divalidasi','Perlu_Revisi','Disetujui','Ditolak');
CREATE TYPE mood_status_peng      AS ENUM ('Good','Okay','Tough');
CREATE TYPE assignment_level_peng AS ENUM ('Primary','Secondary','Additional');

-- ============================================================
-- TABEL INTI: pengabdian_santri
-- Satu record = satu santri yang sedang/pernah pengabdian
-- Berelasi ke tabel siswa lama via siswa_id
-- ============================================================

CREATE TABLE pengabdian_batch (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_batch    text NOT NULL,                    -- "Batch 2025-A"
  tahun_ajaran  text NOT NULL,                    -- "2024/2025"
  tanggal_mulai date,
  tanggal_selesai date,
  aktif         boolean DEFAULT true,
  dibuat_pada   timestamptz DEFAULT now()
);

CREATE TABLE pengabdian_santri (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ── RELASI KE TABEL KESISWAAN LAMA ──
  -- Ganti 'integer' jika tipe id di tabel siswa berbeda (text, uuid, dll)
  siswa_id        integer NOT NULL,
  -- FK ke tabel siswa: pastikan nama tabel dan schema-nya benar
  -- Jika tabel siswa ada di schema 'public': REFERENCES public.siswa(id)
  -- Jika ada di schema lain, sesuaikan
  CONSTRAINT fk_siswa FOREIGN KEY (siswa_id)
    REFERENCES siswa(id)           -- ← SESUAIKAN dengan nama tabel lama
    ON DELETE RESTRICT             -- jangan hapus data pengabdian jika siswa dihapus
    ON UPDATE CASCADE,

  -- ── DATA PENGABDIAN ──
  batch_id        uuid REFERENCES pengabdian_batch(id),
  status          pengabdian_status DEFAULT 'Aktif',
  tanggal_masuk   date NOT NULL,
  tanggal_selesai date,

  -- Kode unik santri di sistem pengabdian (berbeda dari NIS)
  kode_santri     text UNIQUE,                    -- "IN_HSIBS_0042"

  -- Akun Supabase Auth (opsional — isi jika santri diberi akses login)
  auth_user_id    uuid REFERENCES auth.users(id),

  catatan         text,
  dibuat_pada     timestamptz DEFAULT now(),
  diperbarui_pada timestamptz DEFAULT now(),

  -- Satu siswa hanya bisa aktif di satu batch dalam satu waktu
  UNIQUE (siswa_id, batch_id)
);

-- Trigger update timestamp
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.diperbarui_pada = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_pengabdian_santri_updated
  BEFORE UPDATE ON pengabdian_santri
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- ── CONSTRAINT: hanya alumni yang boleh masuk pengabdian ─────
-- Option 1: CHECK dengan subquery (lebih ketat, langsung di DB)
-- Uncomment jika nama kolom status di tabel siswa adalah 'status'
-- dan nilai alumni adalah 'alumni' (sesuaikan):

/*
ALTER TABLE pengabdian_santri
  ADD CONSTRAINT chk_hanya_alumni
  CHECK (
    (SELECT status FROM siswa WHERE id = siswa_id) = 'alumni'
  );
*/

-- Option 2: Trigger (lebih fleksibel, bisa handle berbagai kondisi)
CREATE OR REPLACE FUNCTION fn_validasi_alumni()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_status text;
BEGIN
  -- Ambil status dari tabel kesiswaan
  -- SESUAIKAN nama kolom status dengan tabel lama kamu
  SELECT status INTO v_status
  FROM siswa                         -- ← SESUAIKAN
  WHERE id = NEW.siswa_id;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Siswa dengan id % tidak ditemukan', NEW.siswa_id;
  END IF;

  -- SESUAIKAN nilai status alumni
  IF v_status != 'alumni' THEN
    RAISE EXCEPTION 'Hanya siswa dengan status alumni yang dapat didaftarkan ke program pengabdian. Status saat ini: %', v_status;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validasi_alumni
  BEFORE INSERT OR UPDATE ON pengabdian_santri
  FOR EACH ROW EXECUTE FUNCTION fn_validasi_alumni();


-- ── VIEW: santri aktif dengan data lengkap dari tabel lama ───
-- View ini menggabungkan data pengabdian + data dari tabel siswa
-- SESUAIKAN kolom yang diambil dari tabel siswa
CREATE OR REPLACE VIEW v_santri_pengabdian_aktif AS
SELECT
  ps.id                AS pengabdian_id,
  ps.kode_santri,
  ps.status            AS status_pengabdian,
  ps.tanggal_masuk,
  ps.auth_user_id,

  -- Data dari tabel kesiswaan lama
  s.id                 AS siswa_id,
  s.nis,
  s.nama,              -- SESUAIKAN nama kolom
  -- s.foto_url,        -- jika ada
  -- s.tanggal_lahir,   -- jika ada
  -- s.asal_kelas,      -- jika ada

  -- Data batch
  pb.nama_batch,
  pb.tahun_ajaran

FROM pengabdian_santri ps
JOIN siswa s              ON s.id = ps.siswa_id    -- SESUAIKAN
JOIN pengabdian_batch pb  ON pb.id = ps.batch_id
WHERE ps.status = 'Aktif';


-- ============================================================
-- TABEL PENEMPATAN — unit, lokasi, divisi
-- ============================================================

CREATE TABLE pengabdian_unit (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_unit   text UNIQUE NOT NULL,
  nama_unit   text NOT NULL,
  deskripsi   text
);

CREATE TABLE pengabdian_region (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_region  text UNIQUE NOT NULL,
  pic_reg_id   uuid REFERENCES auth.users(id)
);

CREATE TABLE pengabdian_lokasi (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_lokasi   text NOT NULL,
  region_id     uuid REFERENCES pengabdian_region(id),
  gps_lat       numeric(10,7),
  gps_lng       numeric(10,7),
  gps_radius_m  int DEFAULT 200,
  is_remote     boolean DEFAULT false
);

CREATE TABLE pengabdian_divisi (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_divisi   text UNIQUE NOT NULL,
  nama_divisi   text NOT NULL,
  deskripsi     text,
  aktif         boolean DEFAULT true
);

-- Penempatan santri ke unit + lokasi
CREATE TABLE penempatan_santri (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pengabdian_id   uuid REFERENCES pengabdian_santri(id) ON DELETE CASCADE,
  unit_id         uuid REFERENCES pengabdian_unit(id),
  lokasi_id       uuid REFERENCES pengabdian_lokasi(id),
  status          pengabdian_status DEFAULT 'Aktif',
  tanggal_efektif date,
  dibuat_pada     timestamptz DEFAULT now()
);

-- Penugasan santri ke divisi (bisa lebih dari satu)
CREATE TABLE penugasan_divisi (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  penempatan_id   uuid REFERENCES penempatan_santri(id) ON DELETE CASCADE,
  divisi_id       uuid REFERENCES pengabdian_divisi(id),
  level_penugasan assignment_level_peng NOT NULL DEFAULT 'Primary',
  status          pengabdian_status DEFAULT 'Aktif',
  ditugaskan_oleh uuid REFERENCES auth.users(id),
  disetujui_oleh  uuid REFERENCES auth.users(id),
  catatan         text,
  tanggal_efektif date
);


-- ============================================================
-- TABEL LAPORAN
-- ============================================================

-- Absensi / check-in harian
CREATE TABLE log_harian (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pengabdian_id   uuid REFERENCES pengabdian_santri(id) ON DELETE CASCADE,
  tanggal_log     date NOT NULL,
  sesi            text CHECK (sesi IN ('Pagi','Sore')),
  rencana         text,
  recap           text,
  kendala         text,
  mood            mood_status_peng,
  foto_url        text,
  gps_lat         numeric(10,7),
  gps_lng         numeric(10,7),
  gps_valid       boolean,
  dibuat_pada     timestamptz DEFAULT now(),
  UNIQUE (pengabdian_id, tanggal_log, sesi)
);

-- Laporan mingguan
CREATE TABLE laporan_mingguan (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pengabdian_id   uuid REFERENCES pengabdian_santri(id) ON DELETE CASCADE,
  minggu_label    text NOT NULL,              -- '2025-W28'
  tanggal_laporan date NOT NULL,
  progres_sow     text,
  highlight       text,
  lowlight        text,
  status          report_status_peng DEFAULT 'Draft',
  catatan_pic     text,
  divalidasi_oleh uuid REFERENCES auth.users(id),
  divalidasi_pada timestamptz,
  diperbarui_pada timestamptz DEFAULT now(),
  UNIQUE (pengabdian_id, minggu_label)
);

-- Evaluasi bulanan
CREATE TABLE evaluasi_bulanan (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pengabdian_id         uuid REFERENCES pengabdian_santri(id) ON DELETE CASCADE,
  bulan                 int NOT NULL CHECK (bulan BETWEEN 1 AND 12),
  tahun                 int NOT NULL,
  pct_sow               int CHECK (pct_sow BETWEEN 0 AND 100),
  skor_adab             int CHECK (skor_adab BETWEEN 1 AND 5),
  skor_kedisiplinan     int CHECK (skor_kedisiplinan BETWEEN 1 AND 5),
  jumlah_learn          int DEFAULT 0,
  jumlah_project_acc    int DEFAULT 0,
  jumlah_checkin        int DEFAULT 0,
  status_gyr            gyr_status_peng,
  eligible_mukafaah     boolean DEFAULT false,
  catatan_pic_div       text,
  catatan_pic_reg       text,
  pic_div_id            uuid REFERENCES auth.users(id),
  pic_reg_id            uuid REFERENCES auth.users(id),
  difinalisasi_pada     timestamptz,
  diperbarui_pada       timestamptz DEFAULT now(),
  UNIQUE (pengabdian_id, bulan, tahun)
);

-- Mukafaah
CREATE TABLE mukafaah (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pengabdian_id       uuid REFERENCES pengabdian_santri(id) ON DELETE CASCADE,
  bulan               int NOT NULL,
  tahun               int NOT NULL,
  snapshot_kriteria   jsonb NOT NULL,   -- semua nilai saat dihitung
  eligible            boolean NOT NULL,
  nominal_idr         numeric(12,2),
  catatan             text,
  difinalisasi_oleh   uuid REFERENCES auth.users(id),
  difinalisasi_pada   timestamptz,
  dibuat_pada         timestamptz DEFAULT now(),
  UNIQUE (pengabdian_id, bulan, tahun)
);

-- Request perubahan penempatan
CREATE TABLE request_perubahan_penempatan (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pengabdian_id   uuid REFERENCES pengabdian_santri(id),
  diminta_oleh    uuid REFERENCES auth.users(id),
  payload_perubahan jsonb NOT NULL,    -- {dari: {...}, ke: {...}}
  alasan          text NOT NULL,
  status          approval_status_peng DEFAULT 'Pending',
  diproses_oleh   uuid REFERENCES auth.users(id),
  diproses_pada   timestamptz,
  dibuat_pada     timestamptz DEFAULT now()
);


-- ============================================================
-- PROFILES STAFF (PIC & Admin) — link ke auth.users
-- Santri tidak wajib ada di sini jika login via PIN/Telegram
-- ============================================================

CREATE TABLE staff_profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  kode_staff  text UNIQUE NOT NULL,
  nama        text NOT NULL,
  role        text NOT NULL CHECK (role IN ('Admin','PIC_Div','PIC_Reg','Viewer')),
  divisi_id   uuid REFERENCES pengabdian_divisi(id),
  region_id   uuid REFERENCES pengabdian_region(id),
  aktif       boolean DEFAULT true,
  dibuat_pada timestamptz DEFAULT now()
);

-- Auto-create staff_profile saat user baru daftar via Supabase Auth
CREATE OR REPLACE FUNCTION fn_auto_staff_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO staff_profiles (id, kode_staff, nama, role)
  VALUES (
    NEW.id,
    'USR-' || SUBSTR(NEW.id::text, 1, 8),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User Baru'),
    'Viewer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_staff_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION fn_auto_staff_profile();


-- ============================================================
-- ADMIN TASKS (Command Center)
-- ============================================================

CREATE TABLE admin_tasks (
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


-- ============================================================
-- RLS — Row Level Security
-- ============================================================

ALTER TABLE pengabdian_santri   ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_harian          ENABLE ROW LEVEL SECURITY;
ALTER TABLE laporan_mingguan    ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluasi_bulanan    ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_tasks         ENABLE ROW LEVEL SECURITY;

-- Helper: cek apakah user adalah staff (PIC/Admin)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE id = auth.uid() AND aktif = true
  );
$$;

-- Helper: cek role spesifik
CREATE OR REPLACE FUNCTION get_staff_role()
RETURNS text LANGUAGE sql SECURITY DEFINER AS $$
  SELECT role FROM staff_profiles WHERE id = auth.uid();
$$;

-- Santri hanya lihat data pengabdian miliknya sendiri
CREATE POLICY pol_pengabdian_santri_self ON pengabdian_santri
  FOR SELECT USING (
    auth_user_id = auth.uid() OR is_staff()
  );

-- Log harian: santri insert punyanya sendiri, staff baca semua
CREATE POLICY pol_log_harian_insert ON log_harian
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pengabdian_santri ps
      WHERE ps.id = pengabdian_id AND ps.auth_user_id = auth.uid()
    )
  );

CREATE POLICY pol_log_harian_read ON log_harian
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pengabdian_santri ps
      WHERE ps.id = pengabdian_id AND ps.auth_user_id = auth.uid()
    )
    OR is_staff()
  );

-- Evaluasi bulanan: hanya staff yang bisa tulis
CREATE POLICY pol_eval_read ON evaluasi_bulanan
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pengabdian_santri ps
      WHERE ps.id = pengabdian_id AND ps.auth_user_id = auth.uid()
    )
    OR is_staff()
  );

CREATE POLICY pol_eval_write ON evaluasi_bulanan
  FOR ALL USING (is_staff());

-- Admin tasks: hanya staff
CREATE POLICY pol_admin_tasks ON admin_tasks
  FOR ALL USING (is_staff());


-- ============================================================
-- AUDIT LOG
-- ============================================================

CREATE TABLE audit_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aktor_id      uuid REFERENCES auth.users(id),
  tipe_entitas  text NOT NULL,
  id_entitas    uuid,
  aksi          text NOT NULL,    -- 'INSERT','UPDATE','DELETE'
  data_sebelum  jsonb,
  data_sesudah  jsonb,
  alasan        text,
  dibuat_pada   timestamptz DEFAULT now()
);
