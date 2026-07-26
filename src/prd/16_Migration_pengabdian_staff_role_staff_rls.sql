-- Perbaiki helper/view/policy lama yang masih mengacu ke pengabdian_staff.role_pengabdian.
-- Jalankan setelah kolom role_staff tersedia di public.pengabdian_staff.

create or replace function public.pengabdian_get_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role_staff::text
  from public.pengabdian_staff
  where id = auth.uid();
$$;

drop policy if exists pol_staff_self_read on public.pengabdian_staff;
drop policy if exists pol_staff_self_update on public.pengabdian_staff;
drop policy if exists pol_staff_admin_all on public.pengabdian_staff;

create policy pol_staff_self_read on public.pengabdian_staff
  for select using (id = auth.uid() or public.pengabdian_get_role() = 'Admin');

create policy pol_staff_self_update on public.pengabdian_staff
  for update using (id = auth.uid());

create policy pol_staff_admin_all on public.pengabdian_staff
  for all using (public.pengabdian_get_role() = 'Admin');

create or replace view public.v_current_user as
select
  au.id as auth_id,
  au.email,
  au.raw_user_meta_data->>'full_name' as nama,
  ps.role_staff,
  ps.nama_lengkap,
  ps.aktif as staff_aktif,
  peng.id as pengabdian_id,
  peng.kode_santri,
  peng.status as status_pengabdian,
  case
    when ps.id is not null then 'staff'
    when peng.auth_user_id is not null then 'santri'
    else 'tamu'
  end as tipe_di_pengabdian
from auth.users au
left join public.pengabdian_staff ps
  on ps.id = au.id
left join public.pengabdian_santri peng
  on peng.auth_user_id = au.id
where au.id = auth.uid();
