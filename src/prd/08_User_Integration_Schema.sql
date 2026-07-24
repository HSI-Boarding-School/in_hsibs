-- ============================================================
-- IN_HSIBS — User Integration Schema
-- Menghubungkan auth.users Supabase dengan:
--   1. Staff (Admin, PIC Div, PIC Reg) → staff_profiles
--   2. Santri pengabdian → pengabdian_santri (via siswa lama)
-- ============================================================


-- ============================================================
-- BAGIAN 1: STAFF PROFILES
-- Siapapun yang login via Supabase Auth (email/password)
-- dianggap staff. Role default 'Viewer', Admin assign setelahnya.
-- ============================================================

CREATE TABLE staff_profiles (
  -- Satu-ke-satu dengan auth.users
  -- Jika user Auth dihapus, profile ikut terhapus
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  kode_staff  text UNIQUE NOT NULL,
  nama_lengkap text NOT NULL,
  foto_url    text,
  telegram_id text,

  role        text NOT NULL DEFAULT 'Viewer'
              CHECK (role IN ('Admin','PIC_Div','PIC_Reg','Viewer')),

  -- Scope kerja (opsional, diisi saat assign role)
  divisi_id   uuid,   -- FK ke pengabdian_divisi (isi jika PIC_Div)
  region_id   uuid,   -- FK ke pengabdian_region (isi jika PIC_Reg)

  aktif       boolean DEFAULT true,
  dibuat_pada timestamptz DEFAULT now(),
  diperbarui_pada timestamptz DEFAULT now()
);

-- Auto-create staff_profile saat user baru register/invite via Supabase Auth
CREATE OR REPLACE FUNCTION fn_on_auth_user_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO staff_profiles (id, kode_staff, nama_lengkap, role)
  VALUES (
    NEW.id,
    -- Kode sementara dari UUID, Admin bisa update nanti
    'STF-' || UPPER(SUBSTR(NEW.id::text, 1, 6)),
    -- Ambil nama dari metadata Supabase jika ada, fallback ke email
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1),
      'User Baru'
    ),
    'Viewer'   -- Default — Admin assign role yang benar setelahnya
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION fn_on_auth_user_created();

-- Update timestamp otomatis
CREATE OR REPLACE FUNCTION fn_update_ts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.diperbarui_pada = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_staff_profiles_ts
  BEFORE UPDATE ON staff_profiles
  FOR EACH ROW EXECUTE FUNCTION fn_update_ts();


-- ============================================================
-- BAGIAN 2: SANTRI PENGABDIAN
-- Berelasi ke tabel kesiswaan lama DAN ke auth.users (opsional)
-- ============================================================

-- auth_user_id NULLABLE karena:
--   - Santri yang belum diberi akses login tidak punya auth.users
--   - Data mereka tetap bisa diisi oleh PIC
--   - Jika santri diberi akses, baru diisi auth_user_id-nya

CREATE TABLE pengabdian_santri (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ── RELASI KE TABEL KESISWAAN LAMA ──────────────────────
  -- Sesuaikan tipe data dengan id di tabel siswa kamu
  siswa_id        integer NOT NULL
                  REFERENCES siswa(id)          -- ← SESUAIKAN nama tabel
                  ON DELETE RESTRICT
                  ON UPDATE CASCADE,

  -- ── RELASI KE SUPABASE AUTH (OPSIONAL) ──────────────────
  -- Diisi hanya jika santri diberi akun untuk login ke portal
  auth_user_id    uuid UNIQUE
                  REFERENCES auth.users(id)
                  ON DELETE SET NULL,           -- jika akun Auth dihapus, data pengabdian tetap ada

  -- ── DATA PENGABDIAN ─────────────────────────────────────
  batch_id        uuid NOT NULL
                  REFERENCES pengabdian_batch(id),

  kode_santri     text UNIQUE,                  -- "IN_HSIBS_0042"
  status          text NOT NULL DEFAULT 'Aktif'
                  CHECK (status IN ('Aktif','Selesai','Ditangguhkan','Dibatalkan')),

  tanggal_masuk   date NOT NULL,
  tanggal_selesai date,
  catatan         text,

  dibuat_pada     timestamptz DEFAULT now(),
  diperbarui_pada timestamptz DEFAULT now(),

  -- Satu siswa hanya boleh aktif di satu batch
  UNIQUE (siswa_id, batch_id)
);

CREATE TRIGGER trg_pengabdian_santri_ts
  BEFORE UPDATE ON pengabdian_santri
  FOR EACH ROW EXECUTE FUNCTION fn_update_ts();

-- Validasi: hanya alumni yang bisa masuk pengabdian
CREATE OR REPLACE FUNCTION fn_cek_status_alumni()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_status text;
BEGIN
  SELECT status INTO v_status          -- SESUAIKAN nama kolom status
  FROM siswa WHERE id = NEW.siswa_id;  -- SESUAIKAN nama tabel

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Siswa id % tidak ditemukan di data kesiswaan', NEW.siswa_id;
  END IF;

  IF v_status != 'alumni' THEN         -- SESUAIKAN value status alumni
    RAISE EXCEPTION
      'Hanya siswa alumni yang dapat didaftarkan ke program pengabdian. Status: %',
      v_status;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cek_alumni
  BEFORE INSERT ON pengabdian_santri
  FOR EACH ROW EXECUTE FUNCTION fn_cek_status_alumni();


-- ============================================================
-- BAGIAN 3: UNIFIED VIEW — satu view untuk semua "pengguna"
-- Berguna untuk fitur search, mention, atau tampilkan profil
-- ============================================================

CREATE OR REPLACE VIEW v_semua_pengguna AS

  -- Staff yang login via Supabase Auth
  SELECT
    sp.id                  AS profile_id,
    sp.id                  AS auth_user_id,
    sp.kode_staff          AS kode,
    sp.nama_lengkap        AS nama,
    sp.foto_url,
    sp.role                AS role,
    sp.aktif,
    NULL::integer          AS siswa_id,
    NULL::text             AS kode_santri,
    'staff'                AS tipe_pengguna
  FROM staff_profiles sp

  UNION ALL

  -- Santri pengabdian (join ke data kesiswaan lama untuk nama & foto)
  SELECT
    ps.id                  AS profile_id,
    ps.auth_user_id,
    ps.kode_santri         AS kode,
    s.nama                 AS nama,      -- SESUAIKAN kolom nama di tabel siswa
    NULL::text             AS foto_url,  -- ganti jika ada kolom foto di tabel lama
    'Santri'               AS role,
    (ps.status = 'Aktif')  AS aktif,
    ps.siswa_id,
    ps.kode_santri,
    'santri'               AS tipe_pengguna
  FROM pengabdian_santri ps
  JOIN siswa s ON s.id = ps.siswa_id;   -- SESUAIKAN nama tabel


-- ============================================================
-- BAGIAN 4: HELPER FUNCTIONS untuk RLS & logika aplikasi
-- ============================================================

-- Cek apakah auth.uid() adalah staff aktif
CREATE OR REPLACE FUNCTION is_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE id = auth.uid() AND aktif = true
  );
$$;

-- Ambil role staff dari auth.uid()
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM staff_profiles WHERE id = auth.uid();
$$;

-- Cek apakah auth.uid() adalah santri aktif
CREATE OR REPLACE FUNCTION is_santri_aktif()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM pengabdian_santri
    WHERE auth_user_id = auth.uid() AND status = 'Aktif'
  );
$$;

-- Ambil pengabdian_id dari auth.uid() (untuk santri)
CREATE OR REPLACE FUNCTION get_my_pengabdian_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id FROM pengabdian_santri
  WHERE auth_user_id = auth.uid() AND status = 'Aktif'
  LIMIT 1;
$$;

-- Cek apakah pengabdian_id tertentu milik user yang sedang login
CREATE OR REPLACE FUNCTION is_my_pengabdian(p_pengabdian_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM pengabdian_santri
    WHERE id = p_pengabdian_id
      AND auth_user_id = auth.uid()
  );
$$;


-- ============================================================
-- BAGIAN 5: ROW LEVEL SECURITY
-- ============================================================

-- ── staff_profiles ──────────────────────────────────────────
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

-- Staff hanya bisa baca/update profilnya sendiri
-- Admin bisa baca semua
CREATE POLICY pol_staff_read ON staff_profiles
  FOR SELECT USING (
    id = auth.uid()
    OR get_my_role() = 'Admin'
  );

CREATE POLICY pol_staff_update_self ON staff_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY pol_staff_admin_all ON staff_profiles
  FOR ALL USING (get_my_role() = 'Admin');

-- ── pengabdian_santri ────────────────────────────────────────
ALTER TABLE pengabdian_santri ENABLE ROW LEVEL SECURITY;

-- Santri hanya baca data pengabdiannya sendiri
-- Staff bisa baca semua, Admin bisa semua
CREATE POLICY pol_peng_santri_read ON pengabdian_santri
  FOR SELECT USING (
    auth_user_id = auth.uid()   -- santri lihat punyanya
    OR is_staff()               -- staff lihat semua
  );

CREATE POLICY pol_peng_santri_insert ON pengabdian_santri
  FOR INSERT WITH CHECK (is_staff());  -- hanya staff yang bisa daftarkan santri

CREATE POLICY pol_peng_santri_update ON pengabdian_santri
  FOR UPDATE USING (is_staff());


-- ============================================================
-- BAGIAN 6: FLOW — Cara memberi akun login ke santri
-- ============================================================

/*
  ALUR PEMBERIAN AKUN UNTUK SANTRI:

  1. PIC / Admin daftarkan santri ke pengabdian_santri
     (auth_user_id masih NULL)

  2. Saat santri perlu akses portal:
     a. Invite via Supabase Auth API (kirim email invite)
        POST /auth/v1/admin/users
        { email: "...", email_confirm: true, user_metadata: { full_name: "..." } }

     b. Setelah user terbuat di auth.users, update pengabdian_santri:
        UPDATE pengabdian_santri
        SET auth_user_id = '<uuid dari auth.users>'
        WHERE id = '<pengabdian_id>';

     c. TIDAK perlu buat staff_profiles untuk santri —
        trigger fn_on_auth_user_created akan buat staff_profiles dengan role 'Viewer'
        tapi itu tidak masalah, karena cek akses santri pakai is_santri_aktif()
        dan get_my_pengabdian_id(), bukan lewat staff_profiles

  ALTERNATIF: Santri login via PIN / Telegram (tanpa email)
     - auth_user_id tetap NULL
     - Sistem verifikasi PIN sendiri (misal via Edge Function)
     - Semua data tetap bisa dikelola PIC tanpa santri login sendiri
*/


-- ============================================================
-- BAGIAN 7: QUERY BERGUNA
-- ============================================================

-- Semua santri pengabdian aktif dengan data lengkap dari kesiswaan
/*
SELECT
  ps.id             AS pengabdian_id,
  ps.kode_santri,
  ps.status,
  ps.auth_user_id,
  s.nama,           -- dari tabel kesiswaan lama
  s.nis,
  s.foto_url,
  b.nama_batch,
  CASE
    WHEN ps.auth_user_id IS NOT NULL THEN 'Punya Akun'
    ELSE 'Belum Ada Akun'
  END AS status_akun
FROM pengabdian_santri ps
JOIN siswa s            ON s.id = ps.siswa_id
JOIN pengabdian_batch b ON b.id = ps.batch_id
WHERE ps.status = 'Aktif'
ORDER BY s.nama;
*/

-- Cek santri mana yang belum punya akun Auth tapi sudah terdaftar pengabdian
/*
SELECT
  ps.id,
  ps.kode_santri,
  s.nama,
  s.nis
FROM pengabdian_santri ps
JOIN siswa s ON s.id = ps.siswa_id
WHERE ps.auth_user_id IS NULL
  AND ps.status = 'Aktif';
*/

-- Cek apakah ada duplikasi — satu siswa di dua batch aktif sekaligus
/*
SELECT siswa_id, COUNT(*) AS jumlah_batch_aktif
FROM pengabdian_santri
WHERE status = 'Aktif'
GROUP BY siswa_id
HAVING COUNT(*) > 1;
*/
