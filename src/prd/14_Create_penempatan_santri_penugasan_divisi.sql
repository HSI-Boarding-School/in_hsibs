-- Membuat tabel penempatan_santri dan penugasan_divisi untuk modul pengabdian.
-- Aman dijalankan setelah tabel berikut sudah ada:
-- - public.pengabdian_santri
-- - public.pengabdian_unit
-- - public.pengabdian_lokasi
-- - public.pengabdian_divisi
-- - auth.users

do $$ begin
  create type pengabdian_status_enum as enum (
    'Aktif', 'Selesai', 'Ditangguhkan', 'Dibatalkan'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type assignment_level_enum as enum (
    'Primary', 'Secondary', 'Additional'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.penempatan_santri (
  id uuid primary key default gen_random_uuid(),
  pengabdian_id uuid not null references public.pengabdian_santri(id) on delete cascade,
  unit_id uuid references public.pengabdian_unit(id) on delete set null,
  lokasi_id uuid references public.pengabdian_lokasi(id) on delete set null,
  status pengabdian_status_enum default 'Aktif',
  tanggal_efektif date default current_date,
  dibuat_pada timestamptz default now(),
  diperbarui_pada timestamptz default now(),
  constraint penempatan_santri_pengabdian_unique unique (pengabdian_id)
);

create index if not exists idx_penempatan_santri_pengabdian
  on public.penempatan_santri using btree (pengabdian_id);

create index if not exists idx_penempatan_santri_unit
  on public.penempatan_santri using btree (unit_id);

create index if not exists idx_penempatan_santri_lokasi
  on public.penempatan_santri using btree (lokasi_id);

create table if not exists public.penugasan_divisi (
  id uuid primary key default gen_random_uuid(),
  penempatan_id uuid not null references public.penempatan_santri(id) on delete cascade,
  divisi_id uuid not null references public.pengabdian_divisi(id) on delete restrict,
  level assignment_level_enum not null default 'Primary',
  status pengabdian_status_enum default 'Aktif',
  ditugaskan_oleh uuid references auth.users(id) on delete set null,
  disetujui_oleh uuid references auth.users(id) on delete set null,
  tanggal_efektif date default current_date,
  catatan text,
  dibuat_pada timestamptz default now(),
  diperbarui_pada timestamptz default now(),
  constraint penugasan_divisi_unique unique (penempatan_id, divisi_id, level)
);

create index if not exists idx_penugasan_divisi_penempatan
  on public.penugasan_divisi using btree (penempatan_id);

create index if not exists idx_penugasan_divisi_divisi
  on public.penugasan_divisi using btree (divisi_id);

create index if not exists idx_penugasan_divisi_level
  on public.penugasan_divisi using btree (level);

-- Trigger timestamp opsional, kalau function fn_update_ts sudah ada.
do $$ begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'fn_update_ts'
      and n.nspname = 'public'
  ) then
    drop trigger if exists trg_penempatan_santri_ts on public.penempatan_santri;
    create trigger trg_penempatan_santri_ts
      before update on public.penempatan_santri
      for each row execute function public.fn_update_ts();

    drop trigger if exists trg_penugasan_divisi_ts on public.penugasan_divisi;
    create trigger trg_penugasan_divisi_ts
      before update on public.penugasan_divisi
      for each row execute function public.fn_update_ts();
  end if;
end $$;
