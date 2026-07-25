-- Import helper untuk src/prd/csv/roles.csv ke public.pengabdian_role.
-- CSV tetap memakai "Division Code"; table final tetap menyimpan divisi_id sebagai FK.
-- Flow Supabase UI:
-- 1. Jalankan CREATE TABLE staging di bawah.
-- 2. Import roles.csv lewat Table Editor ke public.staging_pengabdian_role.
-- 3. Jalankan INSERT mapping ke public.pengabdian_role.
-- 4. Opsional: truncate public.staging_pengabdian_role.

create table if not exists public.staging_pengabdian_role (
  "Role ID" text not null,
  "Division Code" text not null,
  "Role Name" text not null,
  "Default SoW Summary" text,
  "Self-Study" text,
  "Status" text default 'Active',
  imported_at timestamptz default now()
);

insert into public.pengabdian_role (
  role_code,
  divisi_id,
  nama_role,
  default_sow_summary,
  self_study,
  status,
  aktif
)
select
  r."Role ID",
  d.id,
  r."Role Name",
  r."Default SoW Summary",
  r."Self-Study",
  coalesce(nullif(r."Status", ''), 'Active'),
  coalesce(nullif(r."Status", ''), 'Active') = 'Active'
from public.staging_pengabdian_role r
join public.pengabdian_divisi d
  on d.kode_divisi = r."Division Code"
on conflict (role_code) do update set
  divisi_id = excluded.divisi_id,
  nama_role = excluded.nama_role,
  default_sow_summary = excluded.default_sow_summary,
  self_study = excluded.self_study,
  status = excluded.status,
  aktif = excluded.aktif;

-- Cek kode divisi CSV yang belum match dengan public.pengabdian_divisi.kode_divisi.
select r."Division Code", r."Role ID", r."Role Name"
from public.staging_pengabdian_role r
left join public.pengabdian_divisi d
  on d.kode_divisi = r."Division Code"
where d.id is null;

-- Opsional setelah import sukses:
-- truncate table public.staging_pengabdian_role;
