-- ============================================================
-- IN_HSIBS - Sistem Reporting Pengabdian
-- Daily, Weekly, Monthly, review PIC, attachment, clarification,
-- reminder, RLS, dan read model untuk halaman Monitoring.
--
-- Prasyarat:
--   public.pengabdian_santri
--   public.pengabdian_staff
--   public.pengabdian_penugasan_divisi
--   auth.users
-- ============================================================

create extension if not exists pgcrypto;

-- Enum dibuat aman untuk database baru maupun schema existing.
do $$ begin
  create type public.pengabdian_report_status_enum as enum (
    'Draft',
    'Terkirim',
    'Divalidasi',
    'Perlu_Revisi',
    'Disetujui',
    'Ditolak'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pengabdian_mood_enum as enum ('Good', 'Okay', 'Tough');
exception when duplicate_object then null;
end $$;

-- ============================================================
-- 1. REPORT INDUK
-- ============================================================

create table if not exists public.pengabdian_report (
  id uuid primary key default gen_random_uuid(),
  pengabdian_id uuid not null
    references public.pengabdian_santri(id) on delete cascade,
  tipe text not null,
  periode_mulai date not null,
  periode_selesai date not null,
  status public.pengabdian_report_status_enum not null default 'Draft',
  versi int not null default 1,
  dikirim_pada timestamptz,
  divalidasi_oleh uuid references public.pengabdian_staff(id) on delete set null,
  divalidasi_pada timestamptz,
  disetujui_oleh uuid references public.pengabdian_staff(id) on delete set null,
  disetujui_pada timestamptz,
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now(),
  constraint pengabdian_report_tipe_check
    check (tipe in ('Daily', 'Weekly', 'Monthly')),
  constraint pengabdian_report_periode_check
    check (periode_selesai >= periode_mulai),
  constraint pengabdian_report_versi_check
    check (versi >= 1),
  constraint pengabdian_report_periode_unique
    unique (pengabdian_id, tipe, periode_mulai)
);

create index if not exists idx_pengabdian_report_santri
  on public.pengabdian_report using btree (pengabdian_id);

create index if not exists idx_pengabdian_report_queue
  on public.pengabdian_report using btree (tipe, status, periode_mulai desc);

create index if not exists idx_pengabdian_report_periode
  on public.pengabdian_report using btree (periode_mulai desc, periode_selesai desc);

-- ============================================================
-- 2. DAILY REPORT
-- Satu report per santri per hari. Pagi dan sore berada dalam
-- row yang sama agar progres harian mudah dilacak.
-- ============================================================

create table if not exists public.pengabdian_report_daily (
  report_id uuid primary key
    references public.pengabdian_report(id) on delete cascade,
  tanggal date not null,

  rencana text,
  foto_pagi_path text,
  gps_pagi_lat numeric(10,7),
  gps_pagi_lng numeric(10,7),
  gps_pagi_akurasi_m numeric(8,2),
  gps_pagi_valid boolean,
  pagi_dikirim_pada timestamptz,

  recap text,
  kendala text,
  mood public.pengabdian_mood_enum,
  foto_sore_path text,
  sore_dikirim_pada timestamptz,

  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now(),
  constraint pengabdian_report_daily_lat_check
    check (gps_pagi_lat is null or gps_pagi_lat between -90 and 90),
  constraint pengabdian_report_daily_lng_check
    check (gps_pagi_lng is null or gps_pagi_lng between -180 and 180)
);

create index if not exists idx_pengabdian_report_daily_tanggal
  on public.pengabdian_report_daily using btree (tanggal desc);

-- ============================================================
-- 3. WEEKLY REPORT
-- sow_snapshot menyimpan kondisi SoW saat laporan dikirim supaya
-- histori tidak berubah ketika assignment/SoW diedit kemudian.
-- ============================================================

create table if not exists public.pengabdian_report_weekly (
  report_id uuid primary key
    references public.pengabdian_report(id) on delete cascade,
  minggu_label text not null,
  progres_sow_status text,
  progres_sow_pct int,
  sow_snapshot jsonb not null default '[]'::jsonb,
  highlight text,
  lowlight text,
  refleksi text,
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now(),
  constraint pengabdian_report_weekly_progress_status_check
    check (
      progres_sow_status is null
      or progres_sow_status in ('On Track', 'Behind', 'Ahead')
    ),
  constraint pengabdian_report_weekly_progress_pct_check
    check (progres_sow_pct is null or progres_sow_pct between 0 and 100)
);

create index if not exists idx_pengabdian_report_weekly_label
  on public.pengabdian_report_weekly using btree (minggu_label);

-- ============================================================
-- 4. MONTHLY REPORT SANTRI
-- Semua auto-summary disimpan sebagai snapshot JSONB.
-- ============================================================

create table if not exists public.pengabdian_report_monthly (
  report_id uuid primary key
    references public.pengabdian_report(id) on delete cascade,
  bulan int not null,
  tahun int not null,
  summary_learn jsonb not null default '{}'::jsonb,
  summary_project jsonb not null default '{}'::jsonb,
  summary_checkin jsonb not null default '{}'::jsonb,
  summary_sow jsonb not null default '{}'::jsonb,
  refleksi text,
  pencapaian text,
  tantangan text,
  rencana_bulan_depan text,
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now(),
  constraint pengabdian_report_monthly_bulan_check
    check (bulan between 1 and 12),
  constraint pengabdian_report_monthly_tahun_check
    check (tahun between 2000 and 2200)
);

create index if not exists idx_pengabdian_report_monthly_periode
  on public.pengabdian_report_monthly using btree (tahun desc, bulan desc);

-- ============================================================
-- 5. EVALUASI BULANAN PIC
-- PIC Div membuat draft, PIC Reg melakukan finalisasi.
-- Parent pengabdian_report tetap menjadi sumber status workflow.
-- ============================================================

create table if not exists public.pengabdian_report_monthly_evaluation (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique
    references public.pengabdian_report(id) on delete cascade,
  pct_sow int,
  skor_adab int,
  skor_kedisiplinan int,
  jumlah_learn int not null default 0,
  jumlah_project_acc int not null default 0,
  jumlah_checkin int not null default 0,
  status_gyr text,
  eligible_mukafaah boolean not null default false,
  catatan_pic_div text,
  pic_div_id uuid references public.pengabdian_staff(id) on delete set null,
  draft_pic_div_pada timestamptz,
  catatan_pic_reg text,
  pic_reg_id uuid references public.pengabdian_staff(id) on delete set null,
  difinalisasi_pada timestamptz,
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now(),
  constraint pengabdian_monthly_eval_pct_sow_check
    check (pct_sow is null or pct_sow between 0 and 100),
  constraint pengabdian_monthly_eval_adab_check
    check (skor_adab is null or skor_adab between 1 and 5),
  constraint pengabdian_monthly_eval_disiplin_check
    check (skor_kedisiplinan is null or skor_kedisiplinan between 1 and 5),
  constraint pengabdian_monthly_eval_count_check
    check (jumlah_learn >= 0 and jumlah_project_acc >= 0 and jumlah_checkin >= 0),
  constraint pengabdian_monthly_eval_gyr_check
    check (status_gyr is null or status_gyr in ('Green', 'Yellow', 'Red'))
);

-- ============================================================
-- 6. ATTACHMENT
-- File disimpan di Supabase Storage. Tabel hanya menyimpan path
-- dan metadata file.
-- ============================================================

create table if not exists public.pengabdian_report_attachment (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null
    references public.pengabdian_report(id) on delete cascade,
  storage_bucket text not null default 'pengabdian-report-attachments',
  storage_path text not null,
  nama_file text not null,
  mime_type text,
  ukuran_byte bigint,
  diunggah_oleh uuid references auth.users(id) on delete set null,
  dibuat_pada timestamptz not null default now(),
  constraint pengabdian_report_attachment_size_check
    check (ukuran_byte is null or ukuran_byte >= 0),
  constraint pengabdian_report_attachment_path_unique
    unique (storage_bucket, storage_path)
);

create index if not exists idx_pengabdian_report_attachment_report
  on public.pengabdian_report_attachment using btree (report_id);

-- Daftarkan private bucket jika Supabase Storage tersedia.
insert into storage.buckets (id, name, public, file_size_limit)
values ('pengabdian-report-attachments', 'pengabdian-report-attachments', false, 10485760)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

-- ============================================================
-- 7. REVIEW / STATUS HISTORY
-- ============================================================

create table if not exists public.pengabdian_report_review (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null
    references public.pengabdian_report(id) on delete cascade,
  aktor_user_id uuid references auth.users(id) on delete set null,
  aktor_staff_id uuid references public.pengabdian_staff(id) on delete set null,
  status_sebelum public.pengabdian_report_status_enum,
  status_sesudah public.pengabdian_report_status_enum not null,
  aksi text,
  catatan text,
  dibuat_pada timestamptz not null default now()
);

create index if not exists idx_pengabdian_report_review_report
  on public.pengabdian_report_review using btree (report_id, dibuat_pada desc);

-- ============================================================
-- 8. ASK PIC / CLARIFICATION
-- ============================================================

create table if not exists public.pengabdian_clarification (
  id uuid primary key default gen_random_uuid(),
  pengabdian_id uuid not null
    references public.pengabdian_santri(id) on delete cascade,
  report_id uuid
    references public.pengabdian_report(id) on delete set null,
  penugasan_divisi_id uuid
    references public.pengabdian_penugasan_divisi(id) on delete set null,
  tipe text not null,
  pertanyaan text not null,
  pic_div_id uuid references public.pengabdian_staff(id) on delete set null,
  jawaban text,
  status text not null default 'Open',
  adjustment_note text,
  dijawab_pada timestamptz,
  ditutup_pada timestamptz,
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now(),
  constraint pengabdian_clarification_tipe_check
    check (tipe in ('SoW', 'Assignment', 'Report', 'Other')),
  constraint pengabdian_clarification_status_check
    check (status in ('Open', 'Answered', 'Adjustment_Requested', 'Closed'))
);

create index if not exists idx_pengabdian_clarification_pic_queue
  on public.pengabdian_clarification using btree (pic_div_id, status, dibuat_pada desc);

create index if not exists idx_pengabdian_clarification_santri
  on public.pengabdian_clarification using btree (pengabdian_id, dibuat_pada desc);

-- ============================================================
-- 9. REMINDER
-- Missing dan Reminded bukan status report. Keduanya dihitung atau
-- dicatat terpisah agar workflow status tetap bersih.
-- ============================================================

create table if not exists public.pengabdian_report_reminder (
  id uuid primary key default gen_random_uuid(),
  pengabdian_id uuid not null
    references public.pengabdian_santri(id) on delete cascade,
  report_id uuid
    references public.pengabdian_report(id) on delete set null,
  tipe_report text not null,
  periode_mulai date not null,
  channel text not null default 'In_App',
  pesan text,
  dikirim_oleh uuid references public.pengabdian_staff(id) on delete set null,
  dikirim_pada timestamptz not null default now(),
  constraint pengabdian_report_reminder_tipe_check
    check (tipe_report in ('Daily', 'Weekly', 'Monthly')),
  constraint pengabdian_report_reminder_channel_check
    check (channel in ('In_App', 'Email', 'WhatsApp', 'Telegram'))
);

create index if not exists idx_pengabdian_report_reminder_lookup
  on public.pengabdian_report_reminder
  using btree (pengabdian_id, tipe_report, periode_mulai, dikirim_pada desc);

-- ============================================================
-- 10. TIMESTAMP DAN VALIDASI TIPE DETAIL
-- ============================================================

create or replace function public.fn_pengabdian_report_update_ts()
returns trigger
language plpgsql
as $$
begin
  new.diperbarui_pada = now();
  return new;
end;
$$;

drop trigger if exists trg_pengabdian_report_ts on public.pengabdian_report;
create trigger trg_pengabdian_report_ts
  before update on public.pengabdian_report
  for each row execute function public.fn_pengabdian_report_update_ts();

drop trigger if exists trg_pengabdian_report_daily_ts on public.pengabdian_report_daily;
create trigger trg_pengabdian_report_daily_ts
  before update on public.pengabdian_report_daily
  for each row execute function public.fn_pengabdian_report_update_ts();

drop trigger if exists trg_pengabdian_report_weekly_ts on public.pengabdian_report_weekly;
create trigger trg_pengabdian_report_weekly_ts
  before update on public.pengabdian_report_weekly
  for each row execute function public.fn_pengabdian_report_update_ts();

drop trigger if exists trg_pengabdian_report_monthly_ts on public.pengabdian_report_monthly;
create trigger trg_pengabdian_report_monthly_ts
  before update on public.pengabdian_report_monthly
  for each row execute function public.fn_pengabdian_report_update_ts();

drop trigger if exists trg_pengabdian_report_monthly_eval_ts on public.pengabdian_report_monthly_evaluation;
create trigger trg_pengabdian_report_monthly_eval_ts
  before update on public.pengabdian_report_monthly_evaluation
  for each row execute function public.fn_pengabdian_report_update_ts();

drop trigger if exists trg_pengabdian_clarification_ts on public.pengabdian_clarification;
create trigger trg_pengabdian_clarification_ts
  before update on public.pengabdian_clarification
  for each row execute function public.fn_pengabdian_report_update_ts();

create or replace function public.fn_pengabdian_validate_report_detail()
returns trigger
language plpgsql
as $$
declare
  expected_type text;
  actual_type text;
  detail_date date;
begin
  expected_type := case tg_table_name
    when 'pengabdian_report_daily' then 'Daily'
    when 'pengabdian_report_weekly' then 'Weekly'
    when 'pengabdian_report_monthly' then 'Monthly'
    else null
  end;

  select tipe into actual_type
  from public.pengabdian_report
  where id = new.report_id;

  if actual_type is distinct from expected_type then
    raise exception 'Report % harus bertipe %, bukan %', new.report_id, expected_type, actual_type;
  end if;

  if tg_table_name = 'pengabdian_report_daily' then
    detail_date := new.tanggal;
    if not exists (
      select 1 from public.pengabdian_report r
      where r.id = new.report_id
        and r.periode_mulai = detail_date
        and r.periode_selesai = detail_date
    ) then
      raise exception 'Tanggal daily harus sama dengan periode report induk';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_pengabdian_report_daily on public.pengabdian_report_daily;
create trigger trg_validate_pengabdian_report_daily
  before insert or update on public.pengabdian_report_daily
  for each row execute function public.fn_pengabdian_validate_report_detail();

drop trigger if exists trg_validate_pengabdian_report_weekly on public.pengabdian_report_weekly;
create trigger trg_validate_pengabdian_report_weekly
  before insert or update on public.pengabdian_report_weekly
  for each row execute function public.fn_pengabdian_validate_report_detail();

drop trigger if exists trg_validate_pengabdian_report_monthly on public.pengabdian_report_monthly;
create trigger trg_validate_pengabdian_report_monthly
  before insert or update on public.pengabdian_report_monthly
  for each row execute function public.fn_pengabdian_validate_report_detail();

-- Setelah pagi dan sore dikirim, Daily otomatis masuk queue sebagai Terkirim.
create or replace function public.fn_pengabdian_daily_auto_submit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.pagi_dikirim_pada is not null and new.sore_dikirim_pada is not null then
    update public.pengabdian_report
    set status = 'Terkirim',
        dikirim_pada = coalesce(dikirim_pada, greatest(new.pagi_dikirim_pada, new.sore_dikirim_pada)),
        diperbarui_pada = now()
    where id = new.report_id
      and status in ('Draft', 'Perlu_Revisi');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_pengabdian_daily_auto_submit on public.pengabdian_report_daily;
create trigger trg_pengabdian_daily_auto_submit
  after insert or update of pagi_dikirim_pada, sore_dikirim_pada
  on public.pengabdian_report_daily
  for each row execute function public.fn_pengabdian_daily_auto_submit();

-- Catat setiap perubahan status, termasuk perubahan langsung dari aplikasi.
create or replace function public.fn_pengabdian_report_status_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.pengabdian_report_review (
      report_id,
      aktor_user_id,
      aktor_staff_id,
      status_sebelum,
      status_sesudah,
      aksi
    ) values (
      new.id,
      auth.uid(),
      case
        when exists (select 1 from public.pengabdian_staff s where s.id = auth.uid())
          then auth.uid()
        else null
      end,
      old.status,
      new.status,
      'Status diubah'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_pengabdian_report_status_history on public.pengabdian_report;
create trigger trg_pengabdian_report_status_history
  after update of status on public.pengabdian_report
  for each row execute function public.fn_pengabdian_report_status_history();

-- ============================================================
-- 11. RLS HELPERS
-- ============================================================

create or replace function public.pengabdian_report_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pengabdian_staff s
    where s.id = auth.uid()
      and coalesce(s.aktif, true) = true
      and s.role_staff in ('Admin', 'PIC_Div', 'PIC_Reg', 'Viewer')
  );
$$;

create or replace function public.pengabdian_report_is_owner(target_pengabdian_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pengabdian_santri s
    where s.id = target_pengabdian_id
      and s.auth_user_id = auth.uid()
  );
$$;

grant execute on function public.pengabdian_report_is_staff() to authenticated;
grant execute on function public.pengabdian_report_is_owner(uuid) to authenticated;

create or replace function public.pengabdian_report_can_access_storage(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  target_pengabdian_id uuid;
begin
  target_pengabdian_id := split_part(object_name, '/', 1)::uuid;
  return public.pengabdian_report_is_staff()
    or public.pengabdian_report_is_owner(target_pengabdian_id);
exception when invalid_text_representation then
  return false;
end;
$$;

grant execute on function public.pengabdian_report_can_access_storage(text) to authenticated;

alter table public.pengabdian_report enable row level security;
alter table public.pengabdian_report_daily enable row level security;
alter table public.pengabdian_report_weekly enable row level security;
alter table public.pengabdian_report_monthly enable row level security;
alter table public.pengabdian_report_monthly_evaluation enable row level security;
alter table public.pengabdian_report_attachment enable row level security;
alter table public.pengabdian_report_review enable row level security;
alter table public.pengabdian_clarification enable row level security;
alter table public.pengabdian_report_reminder enable row level security;

drop policy if exists pol_pengabdian_report_read on public.pengabdian_report;
create policy pol_pengabdian_report_read on public.pengabdian_report
  for select using (
    public.pengabdian_report_is_staff()
    or public.pengabdian_report_is_owner(pengabdian_id)
  );

drop policy if exists pol_pengabdian_report_insert on public.pengabdian_report;
create policy pol_pengabdian_report_insert on public.pengabdian_report
  for insert with check (
    public.pengabdian_report_is_staff()
    or (
      public.pengabdian_report_is_owner(pengabdian_id)
      and status = 'Draft'
    )
  );

drop policy if exists pol_pengabdian_report_update on public.pengabdian_report;
create policy pol_pengabdian_report_update on public.pengabdian_report
  for update using (
    public.pengabdian_report_is_staff()
    or public.pengabdian_report_is_owner(pengabdian_id)
  ) with check (
    public.pengabdian_report_is_staff()
    or public.pengabdian_report_is_owner(pengabdian_id)
  );

-- Child report dapat dibaca/ditulis jika user punya akses ke parent.
drop policy if exists pol_pengabdian_report_daily_access on public.pengabdian_report_daily;
create policy pol_pengabdian_report_daily_access on public.pengabdian_report_daily
  for all using (
    exists (
      select 1 from public.pengabdian_report r
      where r.id = report_id
        and (
          public.pengabdian_report_is_staff()
          or public.pengabdian_report_is_owner(r.pengabdian_id)
        )
    )
  ) with check (
    exists (
      select 1 from public.pengabdian_report r
      where r.id = report_id
        and (
          public.pengabdian_report_is_staff()
          or public.pengabdian_report_is_owner(r.pengabdian_id)
        )
    )
  );

drop policy if exists pol_pengabdian_report_weekly_access on public.pengabdian_report_weekly;
create policy pol_pengabdian_report_weekly_access on public.pengabdian_report_weekly
  for all using (
    exists (
      select 1 from public.pengabdian_report r
      where r.id = report_id
        and (
          public.pengabdian_report_is_staff()
          or public.pengabdian_report_is_owner(r.pengabdian_id)
        )
    )
  ) with check (
    exists (
      select 1 from public.pengabdian_report r
      where r.id = report_id
        and (
          public.pengabdian_report_is_staff()
          or public.pengabdian_report_is_owner(r.pengabdian_id)
        )
    )
  );

drop policy if exists pol_pengabdian_report_monthly_access on public.pengabdian_report_monthly;
create policy pol_pengabdian_report_monthly_access on public.pengabdian_report_monthly
  for all using (
    exists (
      select 1 from public.pengabdian_report r
      where r.id = report_id
        and (
          public.pengabdian_report_is_staff()
          or public.pengabdian_report_is_owner(r.pengabdian_id)
        )
    )
  ) with check (
    exists (
      select 1 from public.pengabdian_report r
      where r.id = report_id
        and (
          public.pengabdian_report_is_staff()
          or public.pengabdian_report_is_owner(r.pengabdian_id)
        )
    )
  );

-- Santri boleh membaca evaluasi miliknya, tetapi hanya staff yang menulis.
drop policy if exists pol_pengabdian_monthly_eval_read on public.pengabdian_report_monthly_evaluation;
create policy pol_pengabdian_monthly_eval_read on public.pengabdian_report_monthly_evaluation
  for select using (
    exists (
      select 1 from public.pengabdian_report r
      where r.id = report_id
        and (
          public.pengabdian_report_is_staff()
          or public.pengabdian_report_is_owner(r.pengabdian_id)
        )
    )
  );

drop policy if exists pol_pengabdian_monthly_eval_write on public.pengabdian_report_monthly_evaluation;
create policy pol_pengabdian_monthly_eval_write on public.pengabdian_report_monthly_evaluation
  for all using (public.pengabdian_report_is_staff())
  with check (public.pengabdian_report_is_staff());

drop policy if exists pol_pengabdian_report_attachment_access on public.pengabdian_report_attachment;
create policy pol_pengabdian_report_attachment_access on public.pengabdian_report_attachment
  for all using (
    exists (
      select 1 from public.pengabdian_report r
      where r.id = report_id
        and (
          public.pengabdian_report_is_staff()
          or public.pengabdian_report_is_owner(r.pengabdian_id)
        )
    )
  ) with check (
    exists (
      select 1 from public.pengabdian_report r
      where r.id = report_id
        and (
          public.pengabdian_report_is_staff()
          or public.pengabdian_report_is_owner(r.pengabdian_id)
        )
    )
  );

drop policy if exists pol_pengabdian_report_review_read on public.pengabdian_report_review;
create policy pol_pengabdian_report_review_read on public.pengabdian_report_review
  for select using (
    exists (
      select 1 from public.pengabdian_report r
      where r.id = report_id
        and (
          public.pengabdian_report_is_staff()
          or public.pengabdian_report_is_owner(r.pengabdian_id)
        )
    )
  );

drop policy if exists pol_pengabdian_report_review_write on public.pengabdian_report_review;
create policy pol_pengabdian_report_review_write on public.pengabdian_report_review
  for insert with check (public.pengabdian_report_is_staff());

drop policy if exists pol_pengabdian_clarification_access on public.pengabdian_clarification;
create policy pol_pengabdian_clarification_access on public.pengabdian_clarification
  for all using (
    public.pengabdian_report_is_staff()
    or public.pengabdian_report_is_owner(pengabdian_id)
  ) with check (
    public.pengabdian_report_is_staff()
    or public.pengabdian_report_is_owner(pengabdian_id)
  );

drop policy if exists pol_pengabdian_report_reminder_read on public.pengabdian_report_reminder;
create policy pol_pengabdian_report_reminder_read on public.pengabdian_report_reminder
  for select using (
    public.pengabdian_report_is_staff()
    or public.pengabdian_report_is_owner(pengabdian_id)
  );

drop policy if exists pol_pengabdian_report_reminder_write on public.pengabdian_report_reminder;
create policy pol_pengabdian_report_reminder_write on public.pengabdian_report_reminder
  for insert with check (public.pengabdian_report_is_staff());

-- Storage policy menggunakan folder pertama sebagai pengabdian_id:
-- pengabdian-report-attachments/{pengabdian_id}/{report_id}/{filename}
drop policy if exists pol_pengabdian_report_storage_read on storage.objects;
create policy pol_pengabdian_report_storage_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'pengabdian-report-attachments'
    and public.pengabdian_report_can_access_storage(name)
  );

drop policy if exists pol_pengabdian_report_storage_insert on storage.objects;
create policy pol_pengabdian_report_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'pengabdian-report-attachments'
    and public.pengabdian_report_can_access_storage(name)
  );

drop policy if exists pol_pengabdian_report_storage_delete on storage.objects;
create policy pol_pengabdian_report_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'pengabdian-report-attachments'
    and public.pengabdian_report_can_access_storage(name)
  );

-- ============================================================
-- 12. VIEW UNTUK MONITORING > REPORT
-- View ini read-only dan hanya menyajikan progres singkat.
-- Queue review tetap membaca public.pengabdian_report langsung.
-- ============================================================

create or replace view public.v_pengabdian_report_progress
with (security_invoker = true)
as
select
  ps.id as pengabdian_id,
  ps.siswa_id,
  ps.kode_santri,
  ps.status as status_pengabdian,

  daily.id as daily_report_id,
  daily.periode_mulai as daily_tanggal,
  daily.status as daily_status,
  (daily_detail.pagi_dikirim_pada is not null) as daily_pagi_selesai,
  (daily_detail.sore_dikirim_pada is not null) as daily_sore_selesai,
  daily_detail.mood as daily_mood,
  nullif(trim(coalesce(daily_detail.kendala, '')), '') as daily_kendala,

  weekly.id as weekly_report_id,
  weekly.periode_mulai as weekly_periode_mulai,
  weekly.status as weekly_status,
  weekly_detail.minggu_label,
  weekly_detail.progres_sow_status,
  weekly_detail.progres_sow_pct,

  monthly.id as monthly_report_id,
  monthly.periode_mulai as monthly_periode_mulai,
  monthly.status as monthly_status,
  monthly_detail.bulan as monthly_bulan,
  monthly_detail.tahun as monthly_tahun,
  monthly_eval.status_gyr,
  monthly_eval.eligible_mukafaah,

  case
    when daily.id is null then 0
    when daily_detail.pagi_dikirim_pada is not null
      and daily_detail.sore_dikirim_pada is not null then 100
    when daily_detail.pagi_dikirim_pada is not null
      or daily_detail.sore_dikirim_pada is not null then 50
    else 0
  end as daily_completion_pct

from public.pengabdian_santri ps

left join lateral (
  select r.*
  from public.pengabdian_report r
  where r.pengabdian_id = ps.id and r.tipe = 'Daily'
  order by r.periode_mulai desc
  limit 1
) daily on true
left join public.pengabdian_report_daily daily_detail
  on daily_detail.report_id = daily.id

left join lateral (
  select r.*
  from public.pengabdian_report r
  where r.pengabdian_id = ps.id and r.tipe = 'Weekly'
  order by r.periode_mulai desc
  limit 1
) weekly on true
left join public.pengabdian_report_weekly weekly_detail
  on weekly_detail.report_id = weekly.id

left join lateral (
  select r.*
  from public.pengabdian_report r
  where r.pengabdian_id = ps.id and r.tipe = 'Monthly'
  order by r.periode_mulai desc
  limit 1
) monthly on true
left join public.pengabdian_report_monthly monthly_detail
  on monthly_detail.report_id = monthly.id
left join public.pengabdian_report_monthly_evaluation monthly_eval
  on monthly_eval.report_id = monthly.id;

grant select on public.v_pengabdian_report_progress to authenticated;

-- ============================================================
-- STATUS MAPPING UNTUK UI
-- Draft          -> Belum dikirim
-- Terkirim       -> Pending
-- Divalidasi     -> Verified
-- Perlu_Revisi   -> Revision
-- Disetujui      -> Approved
-- Ditolak        -> Rejected
-- Missing        -> derived: report periode tidak ditemukan
-- Reminded       -> pengabdian_report_reminder
-- ============================================================
