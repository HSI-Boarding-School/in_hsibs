-- Import helper untuk santri.csv dan santri_division_assignments.csv.
-- Prinsip:
-- 1. Tidak membuat tabel master santri baru.
-- 2. Master santri tetap public.kesiswaan.
-- 3. CSV hanya dipakai sebagai staging mapping pengabdian.
-- 4. Division/region/lokasi/unit dijoin ke tabel referensi pengabdian yang sudah ada.
--
-- Flow Supabase UI:
-- 1. Jalankan CREATE TABLE staging di bawah.
-- 2. Import santri.csv ke public.staging_santri_csv.
-- 3. Import mapping Short ID -> NIS ke public.staging_santri_identity_map.
-- 4. Import santri_division_assignments.csv ke public.staging_santri_division_assignments_csv.
-- 5. Jalankan INSERT mapping ke tabel final.
-- 6. Opsional: truncate staging tables.
--
-- Asumsi penting:
-- - staging_santri_identity_map."Short ID" match ke staging_santri_csv."Short ID".
-- - staging_santri_identity_map.nis match ke public.kesiswaan.nis.
-- - public.kesiswaan.tahun_ajaran_id sudah terisi untuk filter tahun ajaran.
-- - public.kesiswaan.jenis_kelamin dipakai untuk filter laki-laki/perempuan.
-- - Tidak memakai pengabdian_batch; tahun ajaran/angkatan diambil dari public.kesiswaan.

create table if not exists public.staging_santri_csv (
  "Santri ID" text not null,
  "Short ID" text not null,
  "Full Name" text not null,
  "Batch" text,
  "Program Year" text,
  "Unit" text,
  "Location" text,
  "Region" text,
  "PIC Reg" text,
  "Division Mapping" text,
  "Primary Division" text,
  "Status" text,
  "Notes" text,
  imported_at timestamptz default now()
);

create table if not exists public.staging_santri_division_assignments_csv (
  "Assignment ID" text not null,
  "Santri ID" text not null,
  "Full Name" text,
  "Unit" text,
  "Location" text,
  "Region" text,
  "Division Code" text not null,
  "Assignment Level" text not null,
  "Default PIC Div" text,
  "PIC Reg" text,
  "Role Strategy" text,
  "Status" text,
  "Editable By" text,
  "Santri Permission" text,
  imported_at timestamptz default now()
);

create table if not exists public.staging_santri_identity_map (
  "Short ID" text primary key,
  nis text not null,
  imported_at timestamptz default now()
);

-- Import santri.csv ke staging_santri_csv via Supabase Table Editor / CSV import.
-- Import mapping Short ID -> NIS ke staging_santri_identity_map.
-- Import santri_division_assignments.csv ke staging_santri_division_assignments_csv.

-- 1) Insert pengabdian_santri dari kesiswaan existing.
-- Short ID tetap dipakai sebagai kode pengabdian, NIS tetap diambil dari kesiswaan.
insert into public.pengabdian_santri (
  siswa_id,
  kode_santri,
  status,
  catatan
)
select
  k.id as siswa_id,
  s."Santri ID" as kode_santri,
  case
    when coalesce(s."Status", 'Active') = 'Active' then 'Aktif'::pengabdian_status_enum
    else 'Ditangguhkan'::pengabdian_status_enum
  end as status,
  s."Notes" as catatan
from public.staging_santri_csv s
join public.staging_santri_identity_map map
  on map."Short ID" = s."Short ID"
join public.kesiswaan k
  on k.nis = map.nis
on conflict (siswa_id) do update set
  kode_santri = excluded.kode_santri,
  status = excluded.status,
  catatan = excluded.catatan,
  diperbarui_pada = now();

-- 2) Insert/update penempatan_santri dari unit + lokasi.
insert into public.penempatan_santri (
  pengabdian_id,
  unit_id,
  lokasi_id,
  pic_reg_id,
  status,
  tanggal_efektif
)
select
  ps.id as pengabdian_id,
  u.id as unit_id,
  l.id as lokasi_id,
  pic_reg.id as pic_reg_id,
  case
    when coalesce(s."Status", 'Active') = 'Active' then 'Aktif'::pengabdian_status_enum
    else 'Ditangguhkan'::pengabdian_status_enum
  end as status,
  current_date as tanggal_efektif
from public.staging_santri_csv s
join public.staging_santri_identity_map map
  on map."Short ID" = s."Short ID"
join public.kesiswaan k
  on k.nis = map.nis
join public.pengabdian_santri ps
  on ps.siswa_id = k.id
left join public.pengabdian_unit u
  on u.nama_unit = s."Unit" or u.kode_unit = s."Unit"
left join public.pengabdian_lokasi l
  on l.nama_lokasi = s."Location"
left join public.pengabdian_staff pic_reg
  on lower(trim(pic_reg.nama_lengkap)) = lower(trim(s."PIC Reg"))
where not exists (
  select 1
  from public.penempatan_santri existing
  where existing.pengabdian_id = ps.id
);

-- 3) Insert penugasan_divisi dari assignment CSV.
insert into public.penugasan_divisi (
  penempatan_id,
  divisi_id,
  pic_div_id,
  level,
  status,
  tanggal_efektif,
  catatan
)
select
  p.id as penempatan_id,
  d.id as divisi_id,
  pic_div.id as pic_div_id,
  a."Assignment Level"::assignment_level_enum as level,
  case
    when coalesce(a."Status", 'Active') = 'Active' then 'Aktif'::pengabdian_status_enum
    else 'Ditangguhkan'::pengabdian_status_enum
  end as status,
  current_date as tanggal_efektif,
  concat_ws(' | ', a."Assignment ID", a."Role Strategy", a."Santri Permission") as catatan
from public.staging_santri_division_assignments_csv a
join public.staging_santri_csv s
  on s."Santri ID" = a."Santri ID"
join public.staging_santri_identity_map map
  on map."Short ID" = s."Short ID"
join public.kesiswaan k
  on k.nis = map.nis
join public.pengabdian_santri ps
  on ps.siswa_id = k.id
join public.penempatan_santri p
  on p.pengabdian_id = ps.id
join public.pengabdian_divisi d
  on d.kode_divisi = a."Division Code"
left join public.pengabdian_staff pic_div
  on lower(trim(pic_div.nama_lengkap)) = lower(trim(a."Default PIC Div"))
where not exists (
  select 1
  from public.penugasan_divisi existing
  where existing.penempatan_id = p.id
    and existing.divisi_id = d.id
    and existing.level = a."Assignment Level"::assignment_level_enum
);

-- Check 1: santri CSV yang belum punya mapping Short ID -> NIS.
select s."Santri ID", s."Short ID", s."Full Name"
from public.staging_santri_csv s
left join public.staging_santri_identity_map map
  on map."Short ID" = s."Short ID"
where map.nis is null;

-- Check 2: mapping NIS yang tidak ketemu di kesiswaan.
select s."Santri ID", s."Short ID", s."Full Name"
from public.staging_santri_csv s
join public.staging_santri_identity_map map
  on map."Short ID" = s."Short ID"
left join public.kesiswaan k
  on k.nis = map.nis
where k.id is null;

-- Check 3: unit/lokasi/divisi yang tidak match ke referensi.
select distinct s."Unit"
from public.staging_santri_csv s
left join public.pengabdian_unit u
  on u.nama_unit = s."Unit" or u.kode_unit = s."Unit"
where u.id is null;

select distinct s."Location"
from public.staging_santri_csv s
left join public.pengabdian_lokasi l
  on l.nama_lokasi = s."Location"
where l.id is null;

select distinct a."Division Code"
from public.staging_santri_division_assignments_csv a
left join public.pengabdian_divisi d
  on d.kode_divisi = a."Division Code"
where d.id is null;

-- Check 4: nama PIC di CSV yang belum match ke pengabdian_staff.
-- Ini tidak memblokir import; relasi PIC akan null kalau tidak match.
select distinct s."PIC Reg"
from public.staging_santri_csv s
left join public.pengabdian_staff staff
  on lower(trim(staff.nama_lengkap)) = lower(trim(s."PIC Reg"))
where nullif(trim(coalesce(s."PIC Reg", '')), '') is not null
  and staff.id is null;

select distinct a."Default PIC Div"
from public.staging_santri_division_assignments_csv a
left join public.pengabdian_staff staff
  on lower(trim(staff.nama_lengkap)) = lower(trim(a."Default PIC Div"))
where nullif(trim(coalesce(a."Default PIC Div", '')), '') is not null
  and staff.id is null;

-- Query contoh untuk web:
-- load santri pengabdian sesuai tahun ajaran dan gender user/login.
-- Parameter yang dibutuhkan dari UI/API:
-- Ganti literal UUID dan jenis kelamin sesuai context user/app.
select
  ps.id as pengabdian_id,
  ps.kode_santri,
  k.id as siswa_id,
  k.nis,
  k.nama_lengkap,
  k.jenis_kelamin,
  k.tahun_ajaran_id,
  u.nama_unit,
  l.nama_lokasi,
  r.nama_region,
  pic_reg.nama_lengkap as pic_reg,
  pd.nama_divisi,
  pic_div.nama_lengkap as pic_div,
  tg.level
from public.pengabdian_santri ps
join public.kesiswaan k
  on k.id = ps.siswa_id
left join public.penempatan_santri p
  on p.pengabdian_id = ps.id
left join public.pengabdian_unit u
  on u.id = p.unit_id
left join public.pengabdian_lokasi l
  on l.id = p.lokasi_id
left join public.pengabdian_region r
  on r.id = l.region_id
left join public.pengabdian_staff pic_reg
  on pic_reg.id = p.pic_reg_id
left join public.penugasan_divisi tg
  on tg.penempatan_id = p.id
left join public.pengabdian_divisi pd
  on pd.id = tg.divisi_id
left join public.pengabdian_staff pic_div
  on pic_div.id = tg.pic_div_id
where k.tahun_ajaran_id = '00000000-0000-0000-0000-000000000000'::uuid
  and lower(coalesce(k.jenis_kelamin, '')) = lower('laki-laki')
  and k.status = 'aktif';

-- Opsional setelah import sukses:
-- truncate table public.staging_santri_csv;
-- truncate table public.staging_santri_identity_map;
-- truncate table public.staging_santri_division_assignments_csv;
