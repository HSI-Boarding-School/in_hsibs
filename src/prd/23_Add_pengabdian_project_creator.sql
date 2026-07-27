-- Menyimpan pembuat project untuk membedakan scope Admin dan PIC.

alter table public.pengabdian_projects
  add column if not exists dibuat_oleh uuid
    references public.pengabdian_staff(id) on delete set null
    default auth.uid();

create index if not exists idx_pengabdian_projects_dibuat_oleh
  on public.pengabdian_projects using btree (dibuat_oleh);

create or replace function public.pengabdian_project_is_admin()
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
      and role_staff = 'Admin'
  );
$$;

grant execute on function public.pengabdian_project_is_admin() to authenticated;

drop policy if exists pol_pengabdian_projects_insert
  on public.pengabdian_projects;
create policy pol_pengabdian_projects_insert
  on public.pengabdian_projects
  for insert
  to authenticated
  with check (
    public.pengabdian_project_can_manage()
    and dibuat_oleh = auth.uid()
  );

drop policy if exists pol_pengabdian_projects_update
  on public.pengabdian_projects;
create policy pol_pengabdian_projects_update
  on public.pengabdian_projects
  for update
  to authenticated
  using (
    public.pengabdian_project_is_admin()
    or (public.pengabdian_project_can_manage() and dibuat_oleh = auth.uid())
  )
  with check (
    public.pengabdian_project_is_admin()
    or (public.pengabdian_project_can_manage() and dibuat_oleh = auth.uid())
  );

drop policy if exists pol_pengabdian_projects_delete
  on public.pengabdian_projects;
create policy pol_pengabdian_projects_delete
  on public.pengabdian_projects
  for delete
  to authenticated
  using (
    public.pengabdian_project_is_admin()
    or (public.pengabdian_project_can_manage() and dibuat_oleh = auth.uid())
  );

drop policy if exists pol_pengabdian_project_owner_insert
  on public.pengabdian_project_owner;
create policy pol_pengabdian_project_owner_insert
  on public.pengabdian_project_owner
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.pengabdian_projects project
      where project.id = pengabdian_project_owner.project_id
        and (public.pengabdian_project_is_admin() or project.dibuat_oleh = auth.uid())
    )
  );

drop policy if exists pol_pengabdian_project_owner_update
  on public.pengabdian_project_owner;
create policy pol_pengabdian_project_owner_update
  on public.pengabdian_project_owner
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.pengabdian_projects project
      where project.id = pengabdian_project_owner.project_id
        and (public.pengabdian_project_is_admin() or project.dibuat_oleh = auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.pengabdian_projects project
      where project.id = pengabdian_project_owner.project_id
        and (public.pengabdian_project_is_admin() or project.dibuat_oleh = auth.uid())
    )
  );

drop policy if exists pol_pengabdian_project_owner_delete
  on public.pengabdian_project_owner;
create policy pol_pengabdian_project_owner_delete
  on public.pengabdian_project_owner
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.pengabdian_projects project
      where project.id = pengabdian_project_owner.project_id
        and (public.pengabdian_project_is_admin() or project.dibuat_oleh = auth.uid())
    )
  );

notify pgrst, 'reload schema';
