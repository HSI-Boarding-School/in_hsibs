-- Monitoring calendar + learn session schema untuk modul pengabdian.
-- Jalankan setelah tabel inti pengabdian tersedia.

create table if not exists public.pengabdian_learn_session (
  id uuid primary key default gen_random_uuid(),
  kode_sesi text unique not null,
  tipe text not null default 'mandatory',
  phase text,
  phase_english text,
  bulan_ke int,
  quarter text,
  schedule_label text,
  tanggal_sesi date,
  tema text not null,
  theme_cls text,
  judul text not null,
  subjudul text,
  deskripsi_what text,
  peserta_who text,
  tujuan_why text,
  lokasi_where text,
  metode_how text,
  pemateri text,
  status text not null default 'Planned',
  target_peserta int default 0,
  dibuat_oleh uuid references auth.users(id) on delete set null,
  dibuat_pada timestamptz default now(),
  diperbarui_pada timestamptz default now(),
  constraint pengabdian_learn_session_tipe_check check (tipe in ('mandatory', 'rolespec')),
  constraint pengabdian_learn_session_status_check check (status in ('Planned', 'Done', 'Cancelled'))
);

create index if not exists idx_pengabdian_learn_session_tanggal
  on public.pengabdian_learn_session using btree (tanggal_sesi);

create index if not exists idx_pengabdian_learn_session_tipe
  on public.pengabdian_learn_session using btree (tipe);

create index if not exists idx_pengabdian_learn_session_status
  on public.pengabdian_learn_session using btree (status);

create table if not exists public.pengabdian_learn_attendance (
  id uuid primary key default gen_random_uuid(),
  learn_session_id uuid not null references public.pengabdian_learn_session(id) on delete cascade,
  pengabdian_id uuid not null references public.pengabdian_santri(id) on delete cascade,
  status text not null default 'Hadir',
  catatan text,
  dicatat_oleh uuid references auth.users(id) on delete set null,
  dicatat_pada timestamptz default now(),
  constraint pengabdian_learn_attendance_unique unique (learn_session_id, pengabdian_id),
  constraint pengabdian_learn_attendance_status_check check (status in ('Hadir', 'Izin', 'Alpha'))
);

create index if not exists idx_pengabdian_learn_attendance_session
  on public.pengabdian_learn_attendance using btree (learn_session_id);

create index if not exists idx_pengabdian_learn_attendance_pengabdian
  on public.pengabdian_learn_attendance using btree (pengabdian_id);

create table if not exists public.pengabdian_calendar_event (
  id uuid primary key default gen_random_uuid(),
  tanggal_event date not null,
  judul text not null,
  subjudul text,
  tipe text not null,
  status text not null default 'scheduled',
  warna text,
  sepanjang_hari boolean default true,
  mulai_pada timestamptz,
  selesai_pada timestamptz,
  deskripsi text,
  learn_session_id uuid references public.pengabdian_learn_session(id) on delete set null,
  project_id uuid,
  report_id uuid,
  dibuat_oleh uuid references auth.users(id) on delete set null,
  dibuat_pada timestamptz default now(),
  diperbarui_pada timestamptz default now(),
  constraint pengabdian_calendar_event_tipe_check check (tipe in ('learn', 'project', 'report')),
  constraint pengabdian_calendar_event_status_check check (status in ('scheduled', 'submitted', 'due-soon', 'overdue'))
);

create index if not exists idx_pengabdian_calendar_event_tanggal
  on public.pengabdian_calendar_event using btree (tanggal_event);

create index if not exists idx_pengabdian_calendar_event_tipe
  on public.pengabdian_calendar_event using btree (tipe);

create index if not exists idx_pengabdian_calendar_event_learn
  on public.pengabdian_calendar_event using btree (learn_session_id);

do $$ begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'fn_update_ts'
      and n.nspname = 'public'
  ) then
    drop trigger if exists trg_pengabdian_learn_session_ts on public.pengabdian_learn_session;
    create trigger trg_pengabdian_learn_session_ts
      before update on public.pengabdian_learn_session
      for each row execute function public.fn_update_ts();

    drop trigger if exists trg_pengabdian_calendar_event_ts on public.pengabdian_calendar_event;
    create trigger trg_pengabdian_calendar_event_ts
      before update on public.pengabdian_calendar_event
      for each row execute function public.fn_update_ts();
  end if;
end $$;

alter table public.pengabdian_learn_session enable row level security;
alter table public.pengabdian_learn_attendance enable row level security;
alter table public.pengabdian_calendar_event enable row level security;

do $$ begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'pengabdian_is_staff'
      and n.nspname = 'public'
  ) then
    drop policy if exists pol_pengabdian_learn_session_staff_read on public.pengabdian_learn_session;
    drop policy if exists pol_pengabdian_learn_session_staff_write on public.pengabdian_learn_session;
    drop policy if exists pol_pengabdian_learn_attendance_staff on public.pengabdian_learn_attendance;
    drop policy if exists pol_pengabdian_calendar_event_staff_read on public.pengabdian_calendar_event;
    drop policy if exists pol_pengabdian_calendar_event_staff_write on public.pengabdian_calendar_event;

    create policy pol_pengabdian_learn_session_staff_read on public.pengabdian_learn_session
      for select using (public.pengabdian_is_staff());
    create policy pol_pengabdian_learn_session_staff_write on public.pengabdian_learn_session
      for all using (public.pengabdian_is_staff()) with check (public.pengabdian_is_staff());
    create policy pol_pengabdian_learn_attendance_staff on public.pengabdian_learn_attendance
      for all using (public.pengabdian_is_staff()) with check (public.pengabdian_is_staff());
    create policy pol_pengabdian_calendar_event_staff_read on public.pengabdian_calendar_event
      for select using (public.pengabdian_is_staff());
    create policy pol_pengabdian_calendar_event_staff_write on public.pengabdian_calendar_event
      for all using (public.pengabdian_is_staff()) with check (public.pengabdian_is_staff());
  end if;
end $$;
