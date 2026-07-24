-- ============================================================
-- IN_HSIBS — Batch Pengabdian berelasi ke angkatan_santri
-- Tidak duplikasi data angkatan, hanya extend dengan
-- informasi khusus program pengabdian
-- ============================================================

-- ── ASUMSI TABEL LAMA ────────────────────────────────────────
-- Tabel angkatan_santri sudah ada dengan struktur kira-kira:
--
--   CREATE TABLE angkatan_santri (
--     id            serial PRIMARY KEY,  -- atau uuid
--     nama_angkatan text,                -- "Angkatan 12"
--     tahun_ajaran  text,                -- "2024/2025"
--     tahun_masuk   int,
--     status        text,                -- 'aktif', 'alumni', dll
--     ...
--   );
--
-- Kita TIDAK mengubah tabel ini.
-- ─────────────────────────────────────────────────────────────


-- ============================================================
-- PENGABDIAN BATCH — extend dari angkatan_santri
-- ============================================================

CREATE TABLE IF NOT EXISTS pengabdian_batch (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ── RELASI KE TABEL ANGKATAN LAMA ────────────────────────
  -- Sesuaikan tipe data dengan id di tabel angkatan_santri
  -- (integer jika serial, uuid jika uuid)
  angkatan_id         integer NOT NULL
                      REFERENCES angkatan_santri(id)   -- ← SESUAIKAN nama tabel
                      ON DELETE RESTRICT
                      ON UPDATE CASCADE,

  -- ── DATA TAMBAHAN KHUSUS PENGABDIAN ──────────────────────
  -- Kolom di bawah ini tidak ada di angkatan_santri,
  -- tapi dibutuhkan untuk program pengabdian

  -- Periode pengabdian (bisa berbeda dari tahun ajaran akademik)
  tanggal_mulai       date,
  tanggal_selesai     date,

  -- Keterangan tambahan
  deskripsi           text,
  target_peserta      int,        -- estimasi jumlah santri yang ikut
  aktif               boolean DEFAULT true,

  dibuat_pada         timestamptz DEFAULT now(),
  diperbarui_pada     timestamptz DEFAULT now(),

  -- Satu angkatan hanya punya satu batch pengabdian
  UNIQUE (angkatan_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_pengabdian_batch_angkatan
  ON pengabdian_batch(angkatan_id);

CREATE INDEX IF NOT EXISTS idx_pengabdian_batch_aktif
  ON pengabdian_batch(aktif);

-- Trigger update timestamp
CREATE TRIGGER trg_pengabdian_batch_ts
  BEFORE UPDATE ON pengabdian_batch
  FOR EACH ROW EXECUTE FUNCTION fn_update_ts();  -- sudah dibuat di file sebelumnya


-- ============================================================
-- VIEW — batch dengan data lengkap dari angkatan_santri
-- ============================================================

CREATE OR REPLACE VIEW v_pengabdian_batch_lengkap AS
SELECT
  pb.id                   AS batch_id,
  pb.aktif,
  pb.tanggal_mulai,
  pb.tanggal_selesai,
  pb.target_peserta,
  pb.deskripsi,

  -- Data dari tabel angkatan lama
  ang.id                  AS angkatan_id,
  ang.nama_angkatan,              -- SESUAIKAN nama kolom
  ang.tahun_ajaran,               -- SESUAIKAN nama kolom
  -- ang.tahun_masuk,             -- uncomment jika ada
  -- ang.status AS status_angkatan, -- uncomment jika ada

  -- Jumlah santri yang sudah terdaftar di batch ini
  COUNT(ps.id)            AS jumlah_santri_terdaftar

FROM pengabdian_batch pb
JOIN angkatan_santri ang            -- SESUAIKAN nama tabel
  ON ang.id = pb.angkatan_id
LEFT JOIN pengabdian_santri ps
  ON ps.batch_id = pb.id
  AND ps.status = 'Aktif'
GROUP BY
  pb.id, pb.aktif, pb.tanggal_mulai, pb.tanggal_selesai,
  pb.target_peserta, pb.deskripsi,
  ang.id, ang.nama_angkatan, ang.tahun_ajaran;


-- ============================================================
-- UPDATE pengabdian_santri — tambah relasi batch yang baru
-- Jika sudah ada tabel pengabdian_santri dari file sebelumnya,
-- tidak perlu ubah apapun — batch_id sudah ada di sana.
-- Relasi ke angkatan sekarang otomatis via pengabdian_batch.
-- ============================================================

-- Diagram relasi lengkap sekarang:
--
--   angkatan_santri ──────→ pengabdian_batch ──────→ pengabdian_santri
--   (tabel lama)             angkatan_id FK            batch_id FK
--                            + tanggal_mulai           + auth_user_id FK → auth.users
--                            + tanggal_selesai         + siswa_id FK → siswa (tabel lama)
--                            + target_peserta


-- ============================================================
-- QUERY BERGUNA
-- ============================================================

-- Semua santri aktif beserta info angkatan dan batch
/*
SELECT
  ps.kode_santri,
  s.nama,                           -- dari tabel siswa lama
  s.nis,                            -- dari tabel siswa lama
  ang.nama_angkatan,                -- dari tabel angkatan lama
  ang.tahun_ajaran,                 -- dari tabel angkatan lama
  pb.tanggal_mulai,
  pb.tanggal_selesai,
  ps.status AS status_pengabdian

FROM pengabdian_santri ps
JOIN pengabdian_batch pb          ON pb.id = ps.batch_id
JOIN angkatan_santri ang          ON ang.id = pb.angkatan_id   -- SESUAIKAN
JOIN siswa s                      ON s.id = ps.siswa_id        -- SESUAIKAN
WHERE ps.status = 'Aktif'
ORDER BY ang.tahun_ajaran DESC, s.nama;
*/

-- Batch pengabdian mana yang sedang aktif
/*
SELECT * FROM v_pengabdian_batch_lengkap
WHERE aktif = true;
*/

-- Angkatan yang belum punya batch pengabdian
-- (berguna saat mau buat batch baru)
/*
SELECT
  ang.id,
  ang.nama_angkatan,
  ang.tahun_ajaran
FROM angkatan_santri ang           -- SESUAIKAN
WHERE ang.status = 'alumni'        -- SESUAIKAN
  AND ang.id NOT IN (
    SELECT angkatan_id FROM pengabdian_batch
  )
ORDER BY ang.tahun_ajaran DESC;
*/
