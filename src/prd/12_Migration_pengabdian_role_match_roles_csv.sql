-- Migration untuk Supabase existing table public.pengabdian_role
-- Tujuan: table sesuai roles.csv tanpa menyimpan division code sebagai data final.
-- Relasi divisi tetap lewat divisi_id -> public.pengabdian_divisi(id).

alter table public.pengabdian_role
  add column if not exists role_code text,
  add column if not exists default_sow_summary text,
  add column if not exists self_study text,
  add column if not exists status text default 'Active',
  add column if not exists aktif boolean default true;

update public.pengabdian_role
set status = case when coalesce(status, true) then 'Active' else 'Inactive' end
where status is null;

alter table public.pengabdian_role
  alter column status set default 'Active';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'pengabdian_role_status_check'
  ) then
    alter table public.pengabdian_role
      add constraint pengabdian_role_status_check
      check (status in ('Active', 'Inactive'));
  end if;
end $$;

create unique index if not exists pengabdian_role_role_code_key
  on public.pengabdian_role (role_code)
  where role_code is not null;

create unique index if not exists pengabdian_role_divisi_nama_unique
  on public.pengabdian_role (divisi_id, nama_role);

-- Setelah semua row lama punya role_code, boleh aktifkan NOT NULL:
-- alter table public.pengabdian_role alter column role_code set not null;
