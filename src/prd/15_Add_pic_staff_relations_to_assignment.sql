-- Migration khusus untuk relasi PIC pada penempatan dan penugasan.
-- Jalankan setelah tabel berikut sudah ada:
-- - public.penempatan_santri
-- - public.penugasan_divisi
-- - public.pengabdian_staff
--
-- Tidak menyentuh public.kesiswaan.

alter table public.penempatan_santri
  add column if not exists pic_reg_id uuid references public.pengabdian_staff(id) on delete set null;

create index if not exists idx_penempatan_santri_pic_reg
  on public.penempatan_santri using btree (pic_reg_id);

alter table public.penugasan_divisi
  add column if not exists pic_div_id uuid references public.pengabdian_staff(id) on delete set null;

create index if not exists idx_penugasan_divisi_pic_div
  on public.penugasan_divisi using btree (pic_div_id);

-- Optional backfill dari staging CSV kalau data sudah pernah diimport sebelum kolom PIC dibuat.
-- Aman: kalau nama PIC tidak match ke pengabdian_staff, value tetap null.

update public.penempatan_santri p
set pic_reg_id = staff.id
from public.pengabdian_santri ps
join public.kesiswaan k
  on k.id = ps.siswa_id
join public.staging_santri_identity_map map
  on map.nis = k.nis
join public.staging_santri_csv s
  on s."Short ID" = map."Short ID"
left join public.pengabdian_staff staff
  on lower(trim(staff.nama_lengkap)) = lower(trim(s."PIC Reg"))
where p.pengabdian_id = ps.id
  and p.pic_reg_id is null
  and staff.id is not null;

update public.penugasan_divisi pd
set pic_div_id = staff.id
from public.penempatan_santri p
join public.pengabdian_santri ps
  on ps.id = p.pengabdian_id
join public.kesiswaan k
  on k.id = ps.siswa_id
join public.staging_santri_identity_map map
  on map.nis = k.nis
join public.staging_santri_csv s
  on s."Short ID" = map."Short ID"
join public.staging_santri_division_assignments_csv a
  on a."Santri ID" = s."Santri ID"
join public.pengabdian_divisi d
  on d.kode_divisi = a."Division Code"
left join public.pengabdian_staff staff
  on lower(trim(staff.nama_lengkap)) = lower(trim(a."Default PIC Div"))
where pd.penempatan_id = p.id
  and pd.divisi_id = d.id
  and pd.level = a."Assignment Level"::assignment_level_enum
  and pd.pic_div_id is null
  and staff.id is not null;
