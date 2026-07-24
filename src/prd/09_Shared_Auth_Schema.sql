-- ============================================================
-- IN_HSIBS — Shared Auth Integration
-- Satu auth.users, dua aplikasi, dua role system
--
-- ASUMSI:
--   - Supabase project SAMA dengan aplikasi inti
--   - Tabel user_hibro sudah ada dengan kolom user_id → auth.users(id)
--   - Tabel siswa sudah ada dengan relasi ke user_hibro
-- ============================================================


-- ============================================================
-- BAGIAN 1: LIHAT DULU STRUKTUR YANG SUDAH ADA
-- Jalankan ini untuk memahami schema existing sebelum lanjut
-- ============================================================

/*
-- Cek tabel user_hibro yang sudah ada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_hibro'       -- sesuaikan nama tabel
ORDER BY ordinal_position;

-- Cek tabel siswa
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'siswa'            -- sesuaikan nama tabel
ORDER BY ordinal_position;

-- Cek apakah user_hibro sudah punya FK ke auth.users
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND kcu.table_name = 'user_hibro';
*/


-- ============================================================
-- BAGIAN 2: STAFF PROFILES MODUL PENGABDIAN
-- Berelasi ke auth.users yang SAMA dengan aplikasi inti
-- Tidak duplikasi user, hanya tambah role baru
-- ============================================================

CREATE TABLE IF NOT EXISTS pengabdian_staff (
  -- FK ke auth.users yang sudah dipakai aplikasi inti
  -- User yang sama bisa punya role berbeda di tiap aplikasi
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  kode_staff      text UNIQUE NOT NULL,
  nama_lengkap    text NOT NULL,
  foto_url        text,
  telegram_id     text,

  -- Role khusus modul pengabdian — BERBEDA dari role di aplikasi inti
  role_pengabdian text NOT NULL DEFAULT 'Viewer'
    CHECK (role_pengabdian IN ('Admin','PIC_Div','PIC_Reg','Viewer')),

  -- Scope kerja
  divisi_id       uuid,   -- FK ke pengabdian_divisi
  region_id       uuid,   -- FK ke pengabdian_region

  aktif           boolean DEFAULT true,
  dibuat_pada     timestamptz DEFAULT now(),
  diperbarui_pada timestamptz DEFAULT now()
);

-- Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_pengabdian_staff_role
  ON pengabdian_staff(role_pengabdian);


-- ============================================================
-- BAGIAN 3: RELASI SANTRI PENGABDIAN KE DATA LAMA
-- Menghubungkan siswa alumni ke modul pengabdian
-- Tanpa mengubah tabel aplikasi inti
-- ============================================================

CREATE TABLE IF NOT EXISTS pengabdian_batch (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_batch      text NOT NULL,
  tahun_ajaran    text NOT NULL,
  tanggal_mulai   date,
  tanggal_selesai date,
  aktif           boolean DEFAULT true,
  dibuat_pada     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pengabdian_santri (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ── RELASI KE SISWA DI APLIKASI INTI ─────────────────────
  -- Pilih salah satu sesuai struktur tabel lama:

  -- OPSI A: Jika siswa punya user_id (sudah terhubung ke auth.users)
  -- Gunakan ini jika siswa bisa login ke aplikasi inti
  auth_user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  -- OPSI B: Jika siswa di-referensi via id tabel siswa langsung
  -- Uncomment dan sesuaikan tipe data:
  -- siswa_id     integer REFERENCES siswa(id) ON DELETE RESTRICT,

  -- Dalam praktiknya, isi KEDUANYA jika data tersedia:
  -- auth_user_id untuk link ke akun login
  -- siswa_id untuk link ke data akademik

  -- ── DATA PENGABDIAN ───────────────────────────────────────
  batch_id        uuid NOT NULL REFERENCES pengabdian_batch(id),
  kode_santri     text UNIQUE,                  -- "IN_HSIBS_0042"
  status          text NOT NULL DEFAULT 'Aktif'
    CHECK (status IN ('Aktif','Selesai','Ditangguhkan','Dibatalkan')),

  tanggal_masuk   date NOT NULL DEFAULT CURRENT_DATE,
  tanggal_selesai date,
  catatan         text,

  dibuat_pada     timestamptz DEFAULT now(),
  diperbarui_pada timestamptz DEFAULT now(),

  -- Satu user hanya aktif di satu batch sekaligus
  UNIQUE (auth_user_id, batch_id)
);


-- ============================================================
-- BAGIAN 4: FUNCTION — Cara sistem tahu siapa yang login
-- dan apa role-nya di modul pengabdian
-- ============================================================

-- Cek apakah user yang login adalah staff pengabdian
CREATE OR REPLACE FUNCTION pengabdian_is_staff()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM pengabdian_staff
    WHERE id = auth.uid()
      AND aktif = true
  );
$$;

-- Ambil role pengabdian dari user yang sedang login
CREATE OR REPLACE FUNCTION pengabdian_get_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT role_pengabdian
  FROM pengabdian_staff
  WHERE id = auth.uid();
$$;

-- Cek apakah user yang login adalah santri pengabdian aktif
CREATE OR REPLACE FUNCTION pengabdian_is_santri()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM pengabdian_santri
    WHERE auth_user_id = auth.uid()
      AND status = 'Aktif'
  );
$$;

-- Ambil pengabdian_id santri yang sedang login
CREATE OR REPLACE FUNCTION pengabdian_get_my_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT id FROM pengabdian_santri
  WHERE auth_user_id = auth.uid()
    AND status = 'Aktif'
  LIMIT 1;
$$;

-- View lengkap: siapapun yang login, tampilkan identitasnya
-- Berguna untuk header/navbar aplikasi pengabdian
CREATE OR REPLACE VIEW v_current_user_pengabdian AS
  SELECT
    -- Data dari auth.users
    au.id             AS auth_id,
    au.email,
    au.raw_user_meta_data->>'full_name' AS nama_auth,

    -- Role di aplikasi inti (dari user_hibro yang sudah ada)
    -- SESUAIKAN nama tabel dan kolom
    uh.role           AS role_aplikasi_inti,

    -- Role di modul pengabdian
    ps.role_pengabdian,
    ps.aktif          AS staff_aktif,

    -- Jika santri pengabdian
    peng.id           AS pengabdian_id,
    peng.kode_santri,
    peng.status       AS status_pengabdian,

    -- Tipe user di modul pengabdian
    CASE
      WHEN ps.id IS NOT NULL          THEN 'staff'
      WHEN peng.auth_user_id IS NOT NULL THEN 'santri'
      ELSE 'unknown'
    END AS tipe_di_pengabdian

  FROM auth.users au
  -- Join ke tabel aplikasi inti
  LEFT JOIN user_hibro uh           -- SESUAIKAN nama tabel
    ON uh.user_id = au.id           -- SESUAIKAN nama kolom FK
  -- Join ke modul pengabdian
  LEFT JOIN pengabdian_staff ps
    ON ps.id = au.id
  LEFT JOIN pengabdian_santri peng
    ON peng.auth_user_id = au.id
  WHERE au.id = auth.uid();


-- ============================================================
-- BAGIAN 5: CARA ASSIGN STAFF PENGABDIAN
-- User yang sudah ada di aplikasi inti bisa langsung di-assign
-- sebagai PIC/Admin tanpa harus bikin akun baru
-- ============================================================

/*
  CONTOH: Guru A (user_id = 'abc-123') di aplikasi inti
  sekarang juga jadi PIC_Div di modul pengabdian.

  Cukup INSERT ke pengabdian_staff dengan id yang sama:

  INSERT INTO pengabdian_staff (id, kode_staff, nama_lengkap, role_pengabdian)
  VALUES (
    'abc-123',                    -- UUID yang sama dari auth.users
    'PIC-IT-01',
    'Ahmad Fatih',
    'PIC_Div'
  );

  Selesai. Tidak perlu buat akun baru.
  Saat dia login, sistem baca role dari dua tempat:
    - user_hibro → role di aplikasi inti
    - pengabdian_staff → role di modul pengabdian
*/


-- ============================================================
-- BAGIAN 6: CARA ASSIGN SANTRI PENGABDIAN
-- Santri yang sudah punya akun di aplikasi inti (status alumni)
-- langsung bisa didaftarkan ke pengabdian
-- ============================================================

/*
  CONTOH: Alumni B sudah punya akun di aplikasi inti.
  Auth user_id-nya adalah 'def-456'.
  Dia daftarkan ke batch pengabdian:

  INSERT INTO pengabdian_santri (
    auth_user_id,
    batch_id,
    kode_santri,
    tanggal_masuk
  ) VALUES (
    'def-456',                    -- UUID yang sama dari auth.users
    '<batch_uuid>',
    'IN_HSIBS_0001',
    '2025-07-01'
  );

  Santri bisa langsung login dengan akun lamanya.
  Tidak ada reset password, tidak ada akun baru.
*/


-- ============================================================
-- BAGIAN 7: RLS — Akses berdasarkan role
-- ============================================================

ALTER TABLE pengabdian_staff  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengabdian_santri ENABLE ROW LEVEL SECURITY;

-- pengabdian_staff: bisa baca semua jika staff, atau hanya diri sendiri
CREATE POLICY pol_staff_select ON pengabdian_staff
  FOR SELECT USING (
    id = auth.uid()
    OR pengabdian_get_role() = 'Admin'
  );

CREATE POLICY pol_staff_admin_write ON pengabdian_staff
  FOR ALL USING (pengabdian_get_role() = 'Admin');

-- pengabdian_santri: santri lihat punyanya, staff lihat semua
CREATE POLICY pol_santri_select ON pengabdian_santri
  FOR SELECT USING (
    auth_user_id = auth.uid()
    OR pengabdian_is_staff()
  );

CREATE POLICY pol_santri_staff_write ON pengabdian_santri
  FOR INSERT WITH CHECK (pengabdian_is_staff());

CREATE POLICY pol_santri_staff_update ON pengabdian_santri
  FOR UPDATE USING (pengabdian_is_staff());


-- ============================================================
-- BAGIAN 8: QUICK REFERENCE — Alur kerja
-- ============================================================

/*
  ┌─────────────────────────────────────────────────────────┐
  │                    ALUR LOGIN                           │
  ├─────────────────────────────────────────────────────────┤
  │                                                         │
  │  User masukkan email + password                         │
  │           ↓                                             │
  │  Supabase Auth validasi (auth.users)                    │
  │           ↓                                             │
  │  JWT token diterima (berisi auth.uid())                 │
  │           ↓                                             │
  │  Frontend query v_current_user_pengabdian               │
  │           ↓                                             │
  │  ┌────────────────────┬────────────────────────────┐   │
  │  │  role_aplikasi_inti │  role_pengabdian           │   │
  │  │  (dari user_hibro) │  (dari pengabdian_staff)   │   │
  │  ├────────────────────┼────────────────────────────┤   │
  │  │  'guru'            │  'PIC_Div'                 │   │
  │  │  'kepala_sekolah'  │  'PIC_Reg'                 │   │
  │  │  'admin'           │  'Admin'                   │   │
  │  │  'siswa' (alumni)  │  'santri' (pengabdian)     │   │
  │  └────────────────────┴────────────────────────────┘   │
  │           ↓                                             │
  │  Frontend render UI sesuai role_pengabdian              │
  │                                                         │
  └─────────────────────────────────────────────────────────┘

  PENTING:
  - Satu login, dua role system
  - Tidak ada password baru
  - Tidak ada akun duplikat
  - auth.users tetap satu sumber kebenaran
*/
