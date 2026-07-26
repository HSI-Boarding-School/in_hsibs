-- Import helper untuk src/prd/csv/learn_sessions.csv ke tabel public.pengabdian_learn_session.
-- 1. Jalankan migration 17_Create_pengabdian_monitoring_calendar_learn.sql.
-- 2. Import CSV learn_sessions.csv ke public.staging_learn_sessions lewat Supabase Table Editor.
-- 3. Jalankan script ini.

create table if not exists public.staging_learn_sessions (
  "Session Code" text,
  "Month #" text,
  "Schedule" text,
  "Phase" text,
  "Phase English" text,
  "Theme" text,
  "Title" text,
  "Speaker Ideal" text,
  "Type" text,
  "Status" text
);

insert into public.pengabdian_learn_session (
  kode_sesi,
  tipe,
  phase,
  phase_english,
  bulan_ke,
  quarter,
  schedule_label,
  tanggal_sesi,
  tema,
  theme_cls,
  judul,
  subjudul,
  deskripsi_what,
  peserta_who,
  tujuan_why,
  lokasi_where,
  metode_how,
  pemateri,
  status
)
select
  trim("Session Code") as kode_sesi,
  case when lower(trim("Type")) = 'role-specific' then 'rolespec' else 'mandatory' end as tipe,
  case when lower(trim("Type")) = 'role-specific' then 'rs' else nullif(trim("Month #"), '') end as phase,
  nullif(trim("Phase English"), '') as phase_english,
  nullif(trim("Month #"), '')::int as bulan_ke,
  case when lower(trim("Type")) = 'role-specific' then nullif(trim("Schedule"), '') else null end as quarter,
  nullif(trim("Schedule"), '') as schedule_label,
  case
    when nullif(trim("Month #"), '') is not null
      then to_date('01 ' || trim("Schedule"), 'DD Mon YYYY')
    else null
  end as tanggal_sesi,
  nullif(trim("Theme"), '') as tema,
  case
    when lower(trim("Theme")) like '%it%' then 'c-it'
    when lower(trim("Theme")) like '%dkv%' then 'c-dkv'
    when lower(trim("Theme")) like '%ops%' or lower(trim("Theme")) like '%pkbm%' then 'c-ops'
    when lower(trim("Theme")) like '%academic%' then 'c-ac'
    else 'c-deen'
  end as theme_cls,
  trim("Title") as judul,
  null as subjudul,
  trim("Title") as deskripsi_what,
  case when lower(trim("Type")) = 'role-specific' then 'Santri sesuai role/divisi' else 'Semua santri' end as peserta_who,
  null as tujuan_why,
  case when lower(trim("Type")) = 'role-specific' then 'Online / On-site' else 'Online' end as lokasi_where,
  null as metode_how,
  nullif(trim("Speaker Ideal"), '') as pemateri,
  case when lower(coalesce("Status", '')) like 'done%' then 'Done' else 'Planned' end as status
from public.staging_learn_sessions
where nullif(trim("Session Code"), '') is not null
on conflict (kode_sesi) do update set
  tipe = excluded.tipe,
  phase = excluded.phase,
  phase_english = excluded.phase_english,
  bulan_ke = excluded.bulan_ke,
  quarter = excluded.quarter,
  schedule_label = excluded.schedule_label,
  tanggal_sesi = excluded.tanggal_sesi,
  tema = excluded.tema,
  theme_cls = excluded.theme_cls,
  judul = excluded.judul,
  peserta_who = excluded.peserta_who,
  lokasi_where = excluded.lokasi_where,
  pemateri = excluded.pemateri,
  status = excluded.status,
  diperbarui_pada = now();

insert into public.pengabdian_calendar_event (
  tanggal_event,
  judul,
  subjudul,
  tipe,
  status,
  learn_session_id,
  deskripsi
)
select
  coalesce(ls.tanggal_sesi, current_date) as tanggal_event,
  ls.judul,
  'Learn ' || ls.kode_sesi as subjudul,
  'learn' as tipe,
  'scheduled' as status,
  ls.id as learn_session_id,
  ls.deskripsi_what as deskripsi
from public.pengabdian_learn_session ls
where not exists (
  select 1
  from public.pengabdian_calendar_event existing
  where existing.learn_session_id = ls.id
);

-- Optional setelah import selesai:
-- truncate table public.staging_learn_sessions;
