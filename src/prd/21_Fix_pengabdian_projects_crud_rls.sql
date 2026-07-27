-- ============================================================
-- RLS CRUD untuk project monitoring.
-- Membuka akses kelola untuk Admin, PIC Div, dan PIC Reg.
-- Viewer hanya dapat membaca.
-- ============================================================

create or replace function public.pengabdian_project_can_read()
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

create or replace function public.pengabdian_project_can_manage()
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

grant execute on function public.pengabdian_project_can_read() to authenticated;
grant execute on function public.pengabdian_project_can_manage() to authenticated;

grant select, insert, update, delete
  on table public.pengabdian_projects
  to authenticated;

grant select, insert, update, delete
  on table public.pengabdian_project_owner
  to authenticated;

alter table public.pengabdian_projects enable row level security;
alter table public.pengabdian_project_owner enable row level security;

drop policy if exists pol_pengabdian_projects_read
  on public.pengabdian_projects;
create policy pol_pengabdian_projects_read
  on public.pengabdian_projects
  for select
  to authenticated
  using (public.pengabdian_project_can_read());

drop policy if exists pol_pengabdian_projects_insert
  on public.pengabdian_projects;
create policy pol_pengabdian_projects_insert
  on public.pengabdian_projects
  for insert
  to authenticated
  with check (public.pengabdian_project_can_manage());

drop policy if exists pol_pengabdian_projects_update
  on public.pengabdian_projects;
create policy pol_pengabdian_projects_update
  on public.pengabdian_projects
  for update
  to authenticated
  using (public.pengabdian_project_can_manage())
  with check (public.pengabdian_project_can_manage());

drop policy if exists pol_pengabdian_projects_delete
  on public.pengabdian_projects;
create policy pol_pengabdian_projects_delete
  on public.pengabdian_projects
  for delete
  to authenticated
  using (public.pengabdian_project_can_manage());

drop policy if exists pol_pengabdian_project_owner_read
  on public.pengabdian_project_owner;
create policy pol_pengabdian_project_owner_read
  on public.pengabdian_project_owner
  for select
  to authenticated
  using (public.pengabdian_project_can_read());

drop policy if exists pol_pengabdian_project_owner_insert
  on public.pengabdian_project_owner;
create policy pol_pengabdian_project_owner_insert
  on public.pengabdian_project_owner
  for insert
  to authenticated
  with check (public.pengabdian_project_can_manage());

drop policy if exists pol_pengabdian_project_owner_update
  on public.pengabdian_project_owner;
create policy pol_pengabdian_project_owner_update
  on public.pengabdian_project_owner
  for update
  to authenticated
  using (public.pengabdian_project_can_manage())
  with check (public.pengabdian_project_can_manage());

drop policy if exists pol_pengabdian_project_owner_delete
  on public.pengabdian_project_owner;
create policy pol_pengabdian_project_owner_delete
  on public.pengabdian_project_owner
  for delete
  to authenticated
  using (public.pengabdian_project_can_manage());

notify pgrst, 'reload schema';
