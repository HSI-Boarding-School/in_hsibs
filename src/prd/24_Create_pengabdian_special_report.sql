-- Special report Santri dan pembatasan status report yang boleh ditulis pemilik.

create table if not exists public.pengabdian_special_report (
  id uuid primary key default gen_random_uuid(),
  pengabdian_id uuid not null references public.pengabdian_santri(id) on delete cascade,
  kategori text not null,
  judul text not null,
  deskripsi text not null,
  status text not null default 'Terkirim',
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now(),
  constraint pengabdian_special_report_status_check
    check (status in ('Draft', 'Terkirim', 'In_Review', 'Resolved', 'Closed'))
);

create index if not exists idx_pengabdian_special_report_santri
  on public.pengabdian_special_report (pengabdian_id, dibuat_pada desc);

create or replace function public.pengabdian_project_is_student_owner(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pengabdian_project_owner owner_row
    join public.pengabdian_santri student
      on student.id = owner_row.pengabdian_id
    where owner_row.project_id = target_project_id
      and student.auth_user_id = auth.uid()
  );
$$;

grant execute on function public.pengabdian_project_is_student_owner(uuid) to authenticated;

drop policy if exists pol_staff_santri_pic_read on public.pengabdian_staff;
create policy pol_staff_santri_pic_read
  on public.pengabdian_staff
  for select to authenticated
  using (
    exists (
      select 1
      from public.pengabdian_santri student
      left join public.pengabdian_penempatan_santri placement
        on placement.pengabdian_id = student.id
      left join public.pengabdian_penugasan_divisi assignment
        on assignment.penempatan_id = placement.id
      where student.auth_user_id = auth.uid()
        and (placement.pic_reg_id = pengabdian_staff.id or assignment.pic_div_id = pengabdian_staff.id)
    )
  );

drop policy if exists pol_pengabdian_projects_read on public.pengabdian_projects;
create policy pol_pengabdian_projects_read
  on public.pengabdian_projects
  for select to authenticated
  using (
    public.pengabdian_project_can_read()
    or public.pengabdian_project_is_student_owner(id)
  );

drop policy if exists pol_pengabdian_project_owner_read on public.pengabdian_project_owner;
create policy pol_pengabdian_project_owner_read
  on public.pengabdian_project_owner
  for select to authenticated
  using (
    public.pengabdian_project_can_read()
    or public.pengabdian_project_is_student_owner(project_id)
  );

alter table public.pengabdian_special_report enable row level security;

grant select, insert, update
  on table public.pengabdian_special_report
  to authenticated;

drop policy if exists pol_pengabdian_special_report_read on public.pengabdian_special_report;
create policy pol_pengabdian_special_report_read
  on public.pengabdian_special_report
  for select to authenticated
  using (
    public.pengabdian_report_is_staff()
    or public.pengabdian_report_is_owner(pengabdian_id)
  );

drop policy if exists pol_pengabdian_special_report_insert on public.pengabdian_special_report;
create policy pol_pengabdian_special_report_insert
  on public.pengabdian_special_report
  for insert to authenticated
  with check (public.pengabdian_report_is_owner(pengabdian_id));

drop policy if exists pol_pengabdian_special_report_staff_update on public.pengabdian_special_report;
create policy pol_pengabdian_special_report_staff_update
  on public.pengabdian_special_report
  for update to authenticated
  using (public.pengabdian_report_is_staff())
  with check (public.pengabdian_report_is_staff());

-- Santri hanya boleh mempertahankan report pada status yang menjadi bagian workflow submit/revisi.
drop policy if exists pol_pengabdian_report_update on public.pengabdian_report;
create policy pol_pengabdian_report_update on public.pengabdian_report
  for update to authenticated
  using (
    public.pengabdian_report_is_staff()
    or public.pengabdian_report_is_owner(pengabdian_id)
  )
  with check (
    public.pengabdian_report_is_staff()
    or (
      public.pengabdian_report_is_owner(pengabdian_id)
      and status in ('Draft', 'Terkirim', 'Perlu_Revisi')
    )
  );

notify pgrst, 'reload schema';
