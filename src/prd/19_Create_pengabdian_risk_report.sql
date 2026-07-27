-- ============================================================
-- IN_HSIBS - At Risk Report
-- Laporan internal PIC Div / PIC Reg terhadap santri tertentu.
-- Data ini tidak otomatis terlihat oleh santri.
--
-- Prasyarat:
--   public.pengabdian_santri
--   public.pengabdian_staff (role_staff)
--   public.pengabdian_report
--   public.pengabdian_projects
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.pengabdian_risk_report (
  id uuid primary key default gen_random_uuid(),
  pengabdian_id uuid not null
    references public.pengabdian_santri(id) on delete cascade,
  dilaporkan_oleh uuid not null default auth.uid()
    references public.pengabdian_staff(id) on delete restrict,
  peran_pelapor text not null,
  kategori text not null,
  severity text not null default 'Medium',
  judul text not null,
  deskripsi text not null,
  indikator jsonb not null default '[]'::jsonb,
  rekomendasi_tindakan text,
  tindak_lanjut text,
  status text not null default 'Open',
  ditugaskan_kepada uuid
    references public.pengabdian_staff(id) on delete set null,
  report_id uuid
    references public.pengabdian_report(id) on delete set null,
  project_id uuid
    references public.pengabdian_projects(id) on delete set null,
  target_selesai date,
  diselesaikan_oleh uuid
    references public.pengabdian_staff(id) on delete set null,
  diselesaikan_pada timestamptz,
  catatan_penyelesaian text,
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now(),
  constraint pengabdian_risk_report_role_check
    check (peran_pelapor in ('Admin', 'PIC_Div', 'PIC_Reg')),
  constraint pengabdian_risk_report_category_check
    check (kategori in (
      'Performance',
      'Discipline',
      'Attendance',
      'Wellbeing',
      'Assignment',
      'Report',
      'Other'
    )),
  constraint pengabdian_risk_report_severity_check
    check (severity in ('Low', 'Medium', 'High', 'Critical')),
  constraint pengabdian_risk_report_status_check
    check (status in ('Open', 'In_Review', 'Monitoring', 'Resolved', 'Closed')),
  constraint pengabdian_risk_report_resolution_check
    check (
      status not in ('Resolved', 'Closed')
      or diselesaikan_pada is not null
    )
);

create index if not exists idx_pengabdian_risk_report_queue
  on public.pengabdian_risk_report
  using btree (status, severity, dibuat_pada desc);

create index if not exists idx_pengabdian_risk_report_santri
  on public.pengabdian_risk_report
  using btree (pengabdian_id, dibuat_pada desc);

create index if not exists idx_pengabdian_risk_report_reporter
  on public.pengabdian_risk_report
  using btree (dilaporkan_oleh, dibuat_pada desc);

create index if not exists idx_pengabdian_risk_report_assignee
  on public.pengabdian_risk_report
  using btree (ditugaskan_kepada, status, target_selesai);

create table if not exists public.pengabdian_risk_report_activity (
  id uuid primary key default gen_random_uuid(),
  risk_report_id uuid not null
    references public.pengabdian_risk_report(id) on delete cascade,
  aktor_id uuid references public.pengabdian_staff(id) on delete set null,
  aksi text not null,
  status_sebelum text,
  status_sesudah text,
  catatan text,
  dibuat_pada timestamptz not null default now(),
  constraint pengabdian_risk_activity_status_before_check
    check (
      status_sebelum is null
      or status_sebelum in ('Open', 'In_Review', 'Monitoring', 'Resolved', 'Closed')
    ),
  constraint pengabdian_risk_activity_status_after_check
    check (
      status_sesudah is null
      or status_sesudah in ('Open', 'In_Review', 'Monitoring', 'Resolved', 'Closed')
    )
);

create index if not exists idx_pengabdian_risk_activity_report
  on public.pengabdian_risk_report_activity
  using btree (risk_report_id, dibuat_pada desc);

create or replace function public.fn_pengabdian_risk_update_ts()
returns trigger
language plpgsql
as $$
begin
  new.diperbarui_pada = now();
  return new;
end;
$$;

drop trigger if exists trg_pengabdian_risk_report_ts on public.pengabdian_risk_report;
create trigger trg_pengabdian_risk_report_ts
  before update on public.pengabdian_risk_report
  for each row execute function public.fn_pengabdian_risk_update_ts();

-- Pelapor dan snapshot role harus sesuai profile staff yang sedang login.
create or replace function public.fn_pengabdian_risk_validate_reporter()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  reporter_role text;
begin
  select role_staff::text
  into reporter_role
  from public.pengabdian_staff
  where id = new.dilaporkan_oleh
    and coalesce(aktif, true) = true;

  if reporter_role is null then
    raise exception 'Profile staff pelapor tidak ditemukan atau tidak aktif';
  end if;

  if reporter_role not in ('Admin', 'PIC_Div', 'PIC_Reg') then
    raise exception 'Role % tidak boleh membuat laporan At Risk', reporter_role;
  end if;

  new.peran_pelapor := reporter_role;
  return new;
end;
$$;

drop trigger if exists trg_pengabdian_risk_validate_reporter on public.pengabdian_risk_report;
create trigger trg_pengabdian_risk_validate_reporter
  before insert or update of dilaporkan_oleh
  on public.pengabdian_risk_report
  for each row execute function public.fn_pengabdian_risk_validate_reporter();

-- Simpan history setiap perubahan status.
create or replace function public.fn_pengabdian_risk_status_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.pengabdian_risk_report_activity (
      risk_report_id,
      aktor_id,
      aksi,
      status_sebelum,
      status_sesudah
    ) values (
      new.id,
      case
        when exists (select 1 from public.pengabdian_staff where id = auth.uid())
          then auth.uid()
        else null
      end,
      'Status diubah',
      old.status,
      new.status
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_pengabdian_risk_status_history on public.pengabdian_risk_report;
create trigger trg_pengabdian_risk_status_history
  after update of status on public.pengabdian_risk_report
  for each row execute function public.fn_pengabdian_risk_status_history();

-- ============================================================
-- RLS: case At Risk bersifat internal staff.
-- Viewer hanya membaca; Admin/PIC Div/PIC Reg dapat mengelola.
-- ============================================================

create or replace function public.pengabdian_risk_can_read()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pengabdian_staff
    where id = auth.uid()
      and coalesce(aktif, true) = true
      and role_staff in ('Admin', 'PIC_Div', 'PIC_Reg', 'Viewer')
  );
$$;

create or replace function public.pengabdian_risk_can_manage()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pengabdian_staff
    where id = auth.uid()
      and coalesce(aktif, true) = true
      and role_staff in ('Admin', 'PIC_Div', 'PIC_Reg')
  );
$$;

grant execute on function public.pengabdian_risk_can_read() to authenticated;
grant execute on function public.pengabdian_risk_can_manage() to authenticated;

alter table public.pengabdian_risk_report enable row level security;
alter table public.pengabdian_risk_report_activity enable row level security;

drop policy if exists pol_pengabdian_risk_report_read on public.pengabdian_risk_report;
create policy pol_pengabdian_risk_report_read on public.pengabdian_risk_report
  for select using (public.pengabdian_risk_can_read());

drop policy if exists pol_pengabdian_risk_report_write on public.pengabdian_risk_report;
create policy pol_pengabdian_risk_report_write on public.pengabdian_risk_report
  for all using (public.pengabdian_risk_can_manage())
  with check (public.pengabdian_risk_can_manage());

drop policy if exists pol_pengabdian_risk_activity_read on public.pengabdian_risk_report_activity;
create policy pol_pengabdian_risk_activity_read on public.pengabdian_risk_report_activity
  for select using (public.pengabdian_risk_can_read());

drop policy if exists pol_pengabdian_risk_activity_write on public.pengabdian_risk_report_activity;
create policy pol_pengabdian_risk_activity_write on public.pengabdian_risk_report_activity
  for insert with check (public.pengabdian_risk_can_manage());

-- ============================================================
-- View untuk tab Monitoring > At Risk.
-- ============================================================

create or replace view public.v_pengabdian_risk_report
with (security_invoker = true)
as
select
  rr.id,
  rr.pengabdian_id,
  ps.siswa_id,
  ps.kode_santri,
  k.nama_lengkap as nama_santri,
  rr.dilaporkan_oleh,
  reporter.nama_lengkap as nama_pelapor,
  rr.peran_pelapor,
  rr.kategori,
  rr.severity,
  rr.judul,
  rr.deskripsi,
  rr.indikator,
  rr.rekomendasi_tindakan,
  rr.tindak_lanjut,
  rr.status,
  rr.ditugaskan_kepada,
  assignee.nama_lengkap as nama_assignee,
  rr.report_id,
  rr.project_id,
  rr.target_selesai,
  rr.diselesaikan_pada,
  rr.catatan_penyelesaian,
  rr.dibuat_pada,
  rr.diperbarui_pada
from public.pengabdian_risk_report rr
join public.pengabdian_santri ps
  on ps.id = rr.pengabdian_id
join public.kesiswaan k
  on k.id = ps.siswa_id
join public.pengabdian_staff reporter
  on reporter.id = rr.dilaporkan_oleh
left join public.pengabdian_staff assignee
  on assignee.id = rr.ditugaskan_kepada;

grant select on public.v_pengabdian_risk_report to authenticated;

-- Contoh insert dari PIC yang sedang login:
-- insert into public.pengabdian_risk_report (
--   pengabdian_id, peran_pelapor, kategori, severity, judul, deskripsi
-- ) values (
--   '<pengabdian_santri.id>', 'PIC_Div', 'Performance', 'High',
--   'Progress SoW tertinggal', 'Progress tertinggal selama dua pekan.'
-- );
-- Trigger akan menimpa peran_pelapor sesuai role_staff pelapor.
