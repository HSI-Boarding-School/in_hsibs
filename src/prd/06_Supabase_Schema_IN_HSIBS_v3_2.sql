-- ============================================================
-- IN_HSIBS v3.2 — Supabase Integration Schema
-- Integrasi dengan auth.users bawaan Supabase
-- dan data siswa/alumni dari database yang sudah ada
-- ============================================================

-- ── ENUMS ────────────────────────────────────────────────────

CREATE TYPE profile_role       AS ENUM ('Santri','PIC_Div','PIC_Reg','Admin','Viewer');
CREATE TYPE assignment_level   AS ENUM ('Primary','Secondary','Additional');
CREATE TYPE assignment_status  AS ENUM ('Active','Proposed','Archived');
CREATE TYPE report_status      AS ENUM ('Draft','Submitted','Validated','Revision','Approved','Rejected');
CREATE TYPE approval_status    AS ENUM ('Pending','Approved','Rejected','Cancelled');
CREATE TYPE gyr_status         AS ENUM ('Green','Yellow','Red');
CREATE TYPE mood_status        AS ENUM ('Good','Okay','Tough');
CREATE TYPE task_priority      AS ENUM ('high','medium','low');

-- ============================================================
-- BAGIAN 1: PROFILES — bridge ke auth.users + data lama
-- ============================================================

CREATE TABLE profiles (
  -- FK ke Supabase auth.users (bukan UUID acak, ikut auth)
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Untuk staff/PIC yang login via Supabase Auth
  -- Untuk santri yang belum punya akun Auth, id diisi manual atau via invite

  user_code       text UNIQUE NOT NULL,     -- kode internal: ADM001, STR042
  full_name       text NOT NULL,
  unique_name     text UNIQUE,              -- username/mention
  role            profile_role NOT NULL,
  pin_hash        text,                     -- PIN untuk santri (bukan password Auth)
  telegram_chat_id text,
  photo_url       text,
  status_active   boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),

  -- ── BRIDGE KE DATABASE LAMA ─────────────────────────────
  -- Isi ini jika santri berasal dari data siswa/alumni lama
  legacy_student_id   text UNIQUE,          -- id/NIS dari tabel siswa lama
  legacy_student_code text,                 -- kode siswa lama jika ada
  imported_from       text DEFAULT 'manual' -- 'legacy_db' | 'manual' | 'invite'
);

-- Otomatis update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── VIEW: santri aktif pengabdian ─────────────────────────
-- Semua santri yang statusnya aktif di program ini
CREATE VIEW active_santri AS
  SELECT p.* FROM profiles p
  WHERE p.role = 'Santri' AND p.status_active = true;

-- ============================================================
-- BAGIAN 2: REFERENSI — batch, unit, region, location, divisi
-- ============================================================

CREATE TABLE batches (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name    text NOT NULL,
  tahun_ajaran  text NOT NULL,
  program_year  text NOT NULL,
  start_date    date,
  end_date      date,
  status_active boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE units (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_code   text UNIQUE NOT NULL,
  unit_name   text NOT NULL,
  description text
);

CREATE TABLE regions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_name         text UNIQUE NOT NULL,
  default_pic_reg_id  uuid REFERENCES profiles(id)
);

CREATE TABLE locations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name  text UNIQUE NOT NULL,
  region_id      uuid REFERENCES regions(id),
  gps_lat        numeric(10,7),
  gps_lng        numeric(10,7),
  gps_radius_m   int DEFAULT 200,
  is_remote      boolean DEFAULT false
);

CREATE TABLE divisions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  division_code  text UNIQUE NOT NULL,
  division_name  text NOT NULL,
  description    text,
  status_active  boolean DEFAULT true
);

CREATE TABLE roles (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id    uuid REFERENCES divisions(id),
  role_name      text NOT NULL,
  description    text,
  status_active  boolean DEFAULT true
);

CREATE TABLE sow_templates (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id        uuid REFERENCES roles(id),
  sow_item       text NOT NULL,
  evidence_type  text,
  version        int DEFAULT 1,
  status_active  boolean DEFAULT true
);

-- ============================================================
-- BAGIAN 3: PENEMPATAN SANTRI
-- ============================================================

CREATE TABLE santri_placements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id       uuid REFERENCES profiles(id),
  batch_id        uuid REFERENCES batches(id),
  unit_id         uuid REFERENCES units(id),
  location_id     uuid REFERENCES locations(id),
  status          assignment_status DEFAULT 'Active',
  effective_date  date,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE TRIGGER trg_placements_updated_at
  BEFORE UPDATE ON santri_placements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE santri_division_assignments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id     uuid REFERENCES santri_placements(id),
  division_id      uuid REFERENCES divisions(id),
  assignment_level assignment_level NOT NULL,
  status           assignment_status DEFAULT 'Active',
  assigned_by      uuid REFERENCES profiles(id),
  approved_by      uuid REFERENCES profiles(id),
  effective_date   date,
  notes            text,
  updated_at       timestamptz DEFAULT now()
);

CREATE TABLE santri_role_assignments (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_division_assignment_id uuid REFERENCES santri_division_assignments(id),
  role_id                       uuid REFERENCES roles(id),
  status                        assignment_status DEFAULT 'Active'
);

CREATE TABLE santri_sow_assignments (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_role_assignment_id uuid REFERENCES santri_role_assignments(id),
  sow_template_id         uuid REFERENCES sow_templates(id),
  progress_pct            int DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  evidence_url            text,
  pic_note                text,
  status                  report_status DEFAULT 'Draft',
  submitted_at            timestamptz,
  updated_at              timestamptz DEFAULT now()
);

-- ============================================================
-- BAGIAN 4: ASSIGNMENT PIC
-- ============================================================

CREATE TABLE pic_assignments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pic_id          uuid REFERENCES profiles(id),
  assignment_type text NOT NULL CHECK (assignment_type IN ('Div','Reg','Candidate')),
  division_id     uuid REFERENCES divisions(id),
  location_id     uuid REFERENCES locations(id),
  region_id       uuid REFERENCES regions(id),
  batch_id        uuid REFERENCES batches(id),      -- v3.2: tambah batch scope
  effective_from  date,
  effective_until date,
  status_active   boolean DEFAULT true
);

CREATE TABLE placement_change_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id       uuid REFERENCES profiles(id),
  requested_by    uuid REFERENCES profiles(id),
  change_payload  jsonb NOT NULL,
  reason          text NOT NULL,
  status          approval_status DEFAULT 'Pending',  -- v3.2: pakai approval_status
  reviewed_by     uuid REFERENCES profiles(id),
  reviewed_at     timestamptz,
  created_at      timestamptz DEFAULT now()
);

-- ============================================================
-- BAGIAN 5: LAPORAN — daily, weekly, monthly
-- ============================================================

CREATE TABLE daily_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id   uuid REFERENCES profiles(id),
  batch_id    uuid REFERENCES batches(id),
  log_date    date NOT NULL,
  session     text CHECK (session IN ('Morning','Evening')),
  plan        text,
  recap       text,
  blocker     text,
  mood        mood_status,
  photo_url   text,
  gps_lat     numeric(10,7),
  gps_lng     numeric(10,7),
  gps_valid   boolean,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (santri_id, log_date, session)
);

CREATE TABLE weekly_reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id     uuid REFERENCES profiles(id),
  batch_id      uuid REFERENCES batches(id),
  week_label    text NOT NULL,         -- v3.2: '2025-W28' (ISO week)
  week_no       int,                   -- nomor minggu dalam batch (opsional)
  report_date   date NOT NULL,
  sow_progress  text,
  highlight     text,
  lowlight      text,
  status        report_status DEFAULT 'Draft',
  pic_note      text,
  validated_by  uuid REFERENCES profiles(id),
  validated_at  timestamptz,
  updated_at    timestamptz DEFAULT now(),
  UNIQUE (santri_id, week_label)
);

CREATE TABLE monthly_reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id    uuid REFERENCES profiles(id),
  batch_id     uuid REFERENCES batches(id),
  month_no     int NOT NULL,
  year_no      int NOT NULL,
  reflection   text,
  file_url     text,
  status       report_status DEFAULT 'Draft',
  submitted_at timestamptz,
  updated_at   timestamptz DEFAULT now(),
  UNIQUE (santri_id, batch_id, month_no, year_no)
);

CREATE TABLE monthly_evaluations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id             uuid REFERENCES profiles(id),
  batch_id              uuid REFERENCES batches(id),   -- v3.2: tambah
  month_no              int NOT NULL,
  year_no               int NOT NULL,
  sow_pct               int CHECK (sow_pct BETWEEN 0 AND 100),
  adab_score            int CHECK (adab_score BETWEEN 1 AND 5),
  discipline_score      int CHECK (discipline_score BETWEEN 1 AND 5),
  learn_count           int DEFAULT 0,
  project_approved_count int DEFAULT 0,
  checkin_count         int DEFAULT 0,
  gyr_status            gyr_status,
  mukafaah_eligible     boolean DEFAULT false,
  pic_div_note          text,
  pic_reg_note          text,
  pic_div_id            uuid REFERENCES profiles(id),
  pic_reg_id            uuid REFERENCES profiles(id),
  finalized_at          timestamptz,
  updated_at            timestamptz DEFAULT now(),
  UNIQUE (santri_id, batch_id, month_no, year_no)
);

-- ============================================================
-- BAGIAN 6: MUKAFAAH — v3.2: tabel terpisah
-- ============================================================

CREATE TABLE mukafaah_records (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id          uuid REFERENCES profiles(id),
  batch_id           uuid REFERENCES batches(id),
  month_no           int NOT NULL,
  year_no            int NOT NULL,
  criteria_snapshot  jsonb NOT NULL,   -- snapshot semua nilai saat dihitung
  eligible           boolean NOT NULL,
  amount_idr         numeric(12,2),    -- nominal jika ada
  notes              text,
  finalized_by       uuid REFERENCES profiles(id),
  finalized_at       timestamptz,
  created_at         timestamptz DEFAULT now(),
  UNIQUE (santri_id, batch_id, month_no, year_no)
);

-- ============================================================
-- BAGIAN 7: LEARN & PROJECT
-- ============================================================

CREATE TABLE learn_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id        uuid REFERENCES batches(id),   -- v3.2: tambah
  session_code    text UNIQUE NOT NULL,
  month_no        int,
  schedule_label  text,
  phase           text,
  phase_en        text,
  theme           text,
  title           text NOT NULL,
  speaker_ideal   text,
  session_type    text
);

CREATE TABLE learn_attendance (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learn_session_id uuid REFERENCES learn_sessions(id),
  santri_id        uuid REFERENCES profiles(id),
  status           text DEFAULT 'Upcoming',
  evidence_url     text,
  validated_by     uuid REFERENCES profiles(id),
  UNIQUE (learn_session_id, santri_id)
);

CREATE TABLE project_tracks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_name  text UNIQUE NOT NULL,
  description text
);

CREATE TABLE projects (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_santri_id  uuid REFERENCES profiles(id),
  home_division_id uuid REFERENCES divisions(id),
  batch_id         uuid REFERENCES batches(id),
  track_id         uuid REFERENCES project_tracks(id),
  project_name     text NOT NULL,
  description      text,
  output_link      text,
  status           report_status DEFAULT 'Draft',
  wajib            boolean DEFAULT false,
  reviewed_by_div  uuid REFERENCES profiles(id),
  reviewed_by_reg  uuid REFERENCES profiles(id),
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE TABLE project_members (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   uuid REFERENCES projects(id),
  santri_id    uuid REFERENCES profiles(id),
  member_role  text,
  UNIQUE (project_id, santri_id)
);

CREATE TABLE project_evidence (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     uuid REFERENCES projects(id),
  evidence_type  text,
  evidence_url   text,
  notes          text,
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE special_reports (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id        uuid REFERENCES profiles(id),
  batch_id         uuid REFERENCES batches(id),
  report_type      text NOT NULL,
  payload          jsonb,
  status           report_status DEFAULT 'Draft',
  reviewed_by_div  uuid REFERENCES profiles(id),
  reviewed_by_reg  uuid REFERENCES profiles(id),
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ============================================================
-- BAGIAN 8: ADMIN TASKS (Command Center todo)
-- ============================================================

CREATE TABLE admin_tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by  uuid REFERENCES profiles(id),
  assigned_to uuid REFERENCES profiles(id),
  text        text NOT NULL,
  done        boolean DEFAULT false,
  priority    task_priority DEFAULT 'medium',
  done_at     timestamptz,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ============================================================
-- BAGIAN 9: NOTIFIKASI & AUDIT
-- ============================================================

CREATE TABLE notification_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid REFERENCES profiles(id),
  channel       text DEFAULT 'Telegram',
  message       text,
  status_send   text,
  retry_count   int DEFAULT 0,
  error_message text,
  sent_at       timestamptz,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE audit_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     uuid REFERENCES profiles(id),
  entity_type  text NOT NULL,
  entity_id    uuid,
  action       text NOT NULL,
  before_data  jsonb,
  after_data   jsonb,
  reason       text,
  created_at   timestamptz DEFAULT now()
);

-- ============================================================
-- BAGIAN 10: MIGRASI DATA ALUMNI → SANTRI PENGABDIAN
-- Script ini dijalankan SETELAH schema di atas dibuat
-- Sesuaikan nama tabel/kolom dengan database lama kamu
-- ============================================================

/*
  LANGKAH MIGRASI:

  Asumsi: database lama punya tabel 'students' dengan kolom:
    - id (int atau text)
    - full_name
    - nis atau student_code
    - status ('alumni', 'active', dll)
    - foto_url (opsional)

  Langkah:
  1. Buat user di auth.users untuk tiap alumni yang akan jadi santri pengabdian
     (bisa via Supabase Admin API atau bulk insert dengan UUID)
  2. Insert ke profiles dengan legacy_student_id

  Contoh script (sesuaikan dengan schema lama kamu):
*/

-- Step 1: Buat profiles dari alumni yang masuk program pengabdian
-- Jalankan ini setelah kamu tau UUID dari auth.users mereka

INSERT INTO profiles (
  id,                   -- UUID dari auth.users yang baru dibuat
  user_code,
  full_name,
  role,
  legacy_student_id,
  legacy_student_code,
  imported_from,
  status_active
)
SELECT
  gen_random_uuid(),    -- GANTI dengan UUID dari auth.users
  'STR' || LPAD(old.id::text, 4, '0'),  -- generate user_code
  old.full_name,
  'Santri',
  old.id::text,
  old.nis,
  'legacy_db',
  true
FROM students old                        -- GANTI 'students' dengan nama tabel lama
WHERE old.status = 'alumni'              -- GANTI 'alumni' dengan value status lama
  AND old.id NOT IN (
    SELECT legacy_student_id::int
    FROM profiles
    WHERE legacy_student_id IS NOT NULL
  );

-- ============================================================
-- BAGIAN 11: ROW LEVEL SECURITY (RLS) untuk Supabase
-- ============================================================

-- Enable RLS di semua tabel sensitif
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews     ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_tasks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs         ENABLE ROW LEVEL SECURITY;

-- ── Profiles: user hanya bisa lihat profilnya sendiri kecuali Admin/PIC ──
CREATE POLICY profiles_self_view ON profiles
  FOR SELECT USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('Admin','PIC_Reg','PIC_Div')
    )
  );

-- ── Daily logs: santri lihat punyanya sendiri, PIC lihat santri binaannya ──
CREATE POLICY daily_logs_santri ON daily_logs
  FOR SELECT USING (
    santri_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('Admin','PIC_Reg','PIC_Div')
    )
  );

CREATE POLICY daily_logs_insert ON daily_logs
  FOR INSERT WITH CHECK (santri_id = auth.uid());

-- ── Monthly evaluations: santri hanya bisa baca, tidak bisa edit ──
CREATE POLICY monthly_eval_read ON monthly_evaluations
  FOR SELECT USING (
    santri_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('Admin','PIC_Reg','PIC_Div')
    )
  );

CREATE POLICY monthly_eval_write ON monthly_evaluations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('Admin','PIC_Reg','PIC_Div')
    )
  );

-- ── Admin tasks: hanya Admin dan PIC bisa akses ──
CREATE POLICY admin_tasks_access ON admin_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('Admin','PIC_Reg','PIC_Div')
    )
  );

-- ── Audit logs: read-only untuk semua, tidak ada yang bisa insert manual ──
CREATE POLICY audit_logs_read ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'Admin'
    )
  );

-- ============================================================
-- BAGIAN 12: HELPER FUNCTION — auto-create profile saat user baru daftar
-- Trigger ini berjalan saat ada INSERT di auth.users (via Supabase Auth)
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Hanya buat profile jika belum ada
  -- Role default 'Viewer', Admin assign role yang benar setelahnya
  INSERT INTO profiles (id, user_code, full_name, role, imported_from)
  VALUES (
    NEW.id,
    'USR' || SUBSTR(NEW.id::text, 1, 8),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'Viewer',
    'auth'
  )
  ON CONFLICT (id) DO NOTHING; -- jangan timpa jika sudah ada dari migrasi
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();
