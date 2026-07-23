-- IN_HSIBS v3.1 Database Schema Draft (PostgreSQL/InsForge-style)

CREATE TYPE profile_role AS ENUM ('Santri','PIC_Div','PIC_Reg','Admin','Viewer');
CREATE TYPE assignment_level AS ENUM ('Primary','Secondary','Additional');
CREATE TYPE assignment_status AS ENUM ('Active','Proposed','Archived');
CREATE TYPE report_status AS ENUM ('Draft','Submitted','Validated','Revision','Approved','Rejected');
CREATE TYPE gyr_status AS ENUM ('Green','Yellow','Red');
CREATE TYPE mood_status AS ENUM ('Good','Okay','Tough');

CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_code text UNIQUE NOT NULL,
  full_name text NOT NULL,
  unique_name text,
  role profile_role NOT NULL,
  pin_hash text,
  telegram_chat_id text,
  photo_url text,
  status_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name text NOT NULL,
  tahun_ajaran text NOT NULL,
  program_year text NOT NULL,
  start_date date,
  end_date date,
  status_active boolean DEFAULT true
);

CREATE TABLE units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_code text UNIQUE NOT NULL,
  unit_name text NOT NULL,
  description text
);

CREATE TABLE regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_name text UNIQUE NOT NULL,
  default_pic_reg_id uuid REFERENCES profiles(id)
);

CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name text UNIQUE NOT NULL,
  region_id uuid REFERENCES regions(id),
  gps_lat numeric(10,7),
  gps_lng numeric(10,7),
  gps_radius_m int DEFAULT 200,
  is_remote boolean DEFAULT false
);

CREATE TABLE divisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  division_code text UNIQUE NOT NULL,
  division_name text NOT NULL,
  description text,
  status_active boolean DEFAULT true
);

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id uuid REFERENCES divisions(id),
  role_name text NOT NULL,
  description text,
  status_active boolean DEFAULT true
);

CREATE TABLE sow_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES roles(id),
  sow_item text NOT NULL,
  evidence_type text,
  version int DEFAULT 1,
  status_active boolean DEFAULT true
);

CREATE TABLE santri_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id uuid REFERENCES profiles(id),
  batch_id uuid REFERENCES batches(id),
  unit_id uuid REFERENCES units(id),
  location_id uuid REFERENCES locations(id),
  status assignment_status DEFAULT 'Active',
  effective_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE santri_division_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id uuid REFERENCES santri_placements(id),
  division_id uuid REFERENCES divisions(id),
  assignment_level assignment_level NOT NULL,
  status assignment_status DEFAULT 'Active',
  assigned_by uuid REFERENCES profiles(id),
  approved_by uuid REFERENCES profiles(id),
  effective_date date,
  notes text
);

CREATE TABLE santri_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_division_assignment_id uuid REFERENCES santri_division_assignments(id),
  role_id uuid REFERENCES roles(id),
  status assignment_status DEFAULT 'Active'
);

CREATE TABLE santri_sow_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_role_assignment_id uuid REFERENCES santri_role_assignments(id),
  sow_template_id uuid REFERENCES sow_templates(id),
  progress_pct int DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  evidence_url text,
  pic_note text,
  status report_status DEFAULT 'Draft'
);

CREATE TABLE pic_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pic_id uuid REFERENCES profiles(id),
  assignment_type text NOT NULL, -- Div, Reg, Candidate
  division_id uuid REFERENCES divisions(id),
  location_id uuid REFERENCES locations(id),
  region_id uuid REFERENCES regions(id),
  status_active boolean DEFAULT true
);

CREATE TABLE pic_assignment_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id uuid REFERENCES divisions(id),
  location_id uuid REFERENCES locations(id),
  default_pic_id uuid REFERENCES profiles(id),
  rule_type text NOT NULL,
  approval_required boolean DEFAULT true
);

CREATE TABLE placement_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id uuid REFERENCES profiles(id),
  requested_by uuid REFERENCES profiles(id),
  change_payload jsonb NOT NULL,
  reason text NOT NULL,
  status report_status DEFAULT 'Submitted',
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id uuid REFERENCES profiles(id),
  log_date date NOT NULL,
  session text CHECK (session IN ('Morning','Evening')),
  plan text,
  recap text,
  blocker text,
  mood mood_status,
  photo_url text,
  gps_lat numeric(10,7),
  gps_lng numeric(10,7),
  gps_valid boolean,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE weekly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id uuid REFERENCES profiles(id),
  week_no int NOT NULL,
  month_no int,
  sow_progress text,
  highlight text,
  lowlight text,
  status report_status DEFAULT 'Draft',
  pic_note text,
  validated_by uuid REFERENCES profiles(id),
  validated_at timestamptz
);

CREATE TABLE monthly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id uuid REFERENCES profiles(id),
  month_no int NOT NULL,
  reflection text,
  file_url text,
  status report_status DEFAULT 'Draft',
  submitted_at timestamptz
);

CREATE TABLE monthly_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id uuid REFERENCES profiles(id),
  month_no int NOT NULL,
  sow_pct int,
  adab_score int CHECK (adab_score BETWEEN 1 AND 5),
  discipline_score int CHECK (discipline_score BETWEEN 1 AND 5),
  learn_count int DEFAULT 0,
  project_approved_count int DEFAULT 0,
  checkin_count int DEFAULT 0,
  gyr_status gyr_status,
  mukafaah_eligible boolean DEFAULT false,
  pic_div_note text,
  pic_reg_note text,
  pic_div_id uuid REFERENCES profiles(id),
  pic_reg_id uuid REFERENCES profiles(id),
  finalized_at timestamptz
);

CREATE TABLE learn_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code text UNIQUE NOT NULL,
  month_no int,
  schedule_label text,
  phase text,
  phase_en text,
  theme text,
  title text NOT NULL,
  speaker_ideal text,
  session_type text
);

CREATE TABLE learn_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learn_session_id uuid REFERENCES learn_sessions(id),
  santri_id uuid REFERENCES profiles(id),
  status text DEFAULT 'Upcoming',
  evidence_url text,
  validated_by uuid REFERENCES profiles(id)
);

CREATE TABLE project_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_name text UNIQUE NOT NULL,
  description text
);

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_santri_id uuid REFERENCES profiles(id),
  home_division_id uuid REFERENCES divisions(id),
  track_id uuid REFERENCES project_tracks(id),
  project_name text NOT NULL,
  description text,
  output_link text,
  status report_status DEFAULT 'Draft',
  wajib boolean DEFAULT false,
  reviewed_by_div uuid REFERENCES profiles(id),
  reviewed_by_reg uuid REFERENCES profiles(id)
);

CREATE TABLE project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  santri_id uuid REFERENCES profiles(id),
  member_role text
);

CREATE TABLE project_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  evidence_type text,
  evidence_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE special_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id uuid REFERENCES profiles(id),
  report_type text NOT NULL,
  payload jsonb,
  status report_status DEFAULT 'Draft',
  reviewed_by_div uuid REFERENCES profiles(id),
  reviewed_by_reg uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id),
  channel text DEFAULT 'Telegram',
  message text,
  status_send text,
  sent_at timestamptz
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES profiles(id),
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  before_data jsonb,
  after_data jsonb,
  reason text,
  created_at timestamptz DEFAULT now()
);
