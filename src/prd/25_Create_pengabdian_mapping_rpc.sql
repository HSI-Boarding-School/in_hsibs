-- Mutasi Kanban mapping untuk Admin dan PIC Regional.

create or replace function public.pengabdian_mapping_create_master(
  p_kind text,
  p_name text,
  p_region_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.pengabdian_staff;
  result_id uuid;
  result_code text;
  clean_name text := nullif(trim(p_name), '');
begin
  select * into actor from public.pengabdian_staff where id = auth.uid() and coalesce(aktif, true);
  if actor.id is null then raise exception 'Akun staff tidak aktif'; end if;
  if clean_name is null then raise exception 'Nama wajib diisi'; end if;

  if p_kind = 'unit' then
    if actor.role_staff <> 'Admin' then raise exception 'Hanya Admin yang dapat membuat unit'; end if;
    result_code := upper(regexp_replace(clean_name, '[^a-zA-Z0-9]+', '_', 'g'));
    insert into public.pengabdian_unit (kode_unit, nama_unit)
    values (result_code, clean_name)
    returning id into result_id;
  elsif p_kind = 'division' then
    if actor.role_staff <> 'Admin' then raise exception 'Hanya Admin yang dapat membuat divisi'; end if;
    result_code := upper(regexp_replace(clean_name, '[^a-zA-Z0-9]+', '_', 'g'));
    insert into public.pengabdian_divisi (kode_divisi, nama_divisi, aktif)
    values (result_code, clean_name, true)
    returning id into result_id;
  elsif p_kind = 'location' then
    if actor.role_staff = 'PIC_Reg' and (p_region_id is null or p_region_id <> actor.region_id) then
      raise exception 'PIC Regional hanya dapat membuat lokasi di region sendiri';
    end if;
    if actor.role_staff not in ('Admin', 'PIC_Reg') then raise exception 'Tidak memiliki akses membuat lokasi'; end if;
    insert into public.pengabdian_lokasi (nama_lokasi, region_id)
    values (clean_name, case when actor.role_staff = 'PIC_Reg' then actor.region_id else p_region_id end)
    returning id into result_id;
  else
    raise exception 'Jenis master tidak dikenal';
  end if;

  return jsonb_build_object('id', result_id, 'code', result_code, 'name', clean_name);
exception when unique_violation then
  raise exception 'Data dengan nama atau kode tersebut sudah tersedia';
end;
$$;

create or replace function public.pengabdian_mapping_move_student(
  p_placement_id uuid,
  p_field text,
  p_target_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.pengabdian_staff;
  placement public.pengabdian_penempatan_santri;
  primary_assignment public.pengabdian_penugasan_divisi;
  target_assignment public.pengabdian_penugasan_divisi;
begin
  select * into actor from public.pengabdian_staff where id = auth.uid() and coalesce(aktif, true);
  if actor.id is null or actor.role_staff not in ('Admin', 'PIC_Reg') then raise exception 'Tidak memiliki akses mapping'; end if;
  select * into placement from public.pengabdian_penempatan_santri where id = p_placement_id;
  if placement.id is null then raise exception 'Placement Santri tidak ditemukan'; end if;

  if actor.role_staff = 'PIC_Reg' then
    if p_field <> 'location' then raise exception 'PIC Regional hanya dapat mengubah lokasi'; end if;
    if not exists (select 1 from public.pengabdian_lokasi where id = placement.lokasi_id and region_id = actor.region_id)
      or not exists (select 1 from public.pengabdian_lokasi where id = p_target_id and region_id = actor.region_id)
    then raise exception 'Lokasi berada di luar scope regional'; end if;
  end if;

  if p_field = 'unit' then
    if actor.role_staff <> 'Admin' or not exists (select 1 from public.pengabdian_unit where id = p_target_id) then raise exception 'Unit tujuan tidak valid'; end if;
    update public.pengabdian_penempatan_santri set unit_id = p_target_id, diperbarui_pada = now() where id = placement.id;
  elsif p_field = 'location' then
    if not exists (select 1 from public.pengabdian_lokasi where id = p_target_id) then raise exception 'Lokasi tujuan tidak valid'; end if;
    update public.pengabdian_penempatan_santri set lokasi_id = p_target_id, diperbarui_pada = now() where id = placement.id;
  elsif p_field = 'division' then
    if actor.role_staff <> 'Admin' or not exists (select 1 from public.pengabdian_divisi where id = p_target_id) then raise exception 'Divisi tujuan tidak valid'; end if;
    select * into primary_assignment from public.pengabdian_penugasan_divisi
      where penempatan_id = placement.id and level = 'Primary' order by dibuat_pada limit 1;
    select * into target_assignment from public.pengabdian_penugasan_divisi
      where penempatan_id = placement.id and divisi_id = p_target_id order by dibuat_pada limit 1;
    if target_assignment.id is not null then
      if primary_assignment.id is not null and primary_assignment.id <> target_assignment.id then delete from public.pengabdian_penugasan_divisi where id = primary_assignment.id; end if;
      update public.pengabdian_penugasan_divisi set level = 'Primary', status = 'Aktif', diperbarui_pada = now() where id = target_assignment.id;
    elsif primary_assignment.id is not null then
      update public.pengabdian_penugasan_divisi set divisi_id = p_target_id, diperbarui_pada = now() where id = primary_assignment.id;
    else
      insert into public.pengabdian_penugasan_divisi (penempatan_id, divisi_id, level, status, ditugaskan_oleh)
      values (placement.id, p_target_id, 'Primary', 'Aktif', auth.uid());
    end if;
  elsif p_field = 'pic_division' then
    if actor.role_staff <> 'Admin' or not exists (select 1 from public.pengabdian_staff where id = p_target_id and role_staff = 'PIC_Div' and coalesce(aktif, true)) then raise exception 'PIC tujuan tidak valid'; end if;
    select * into primary_assignment from public.pengabdian_penugasan_divisi
      where penempatan_id = placement.id and level = 'Primary' order by dibuat_pada limit 1;
    if primary_assignment.id is null then raise exception 'Assignment utama belum tersedia'; end if;
    update public.pengabdian_penugasan_divisi set pic_div_id = p_target_id, diperbarui_pada = now() where id = primary_assignment.id;
  else
    raise exception 'Field mapping tidak dikenal';
  end if;
end;
$$;

grant execute on function public.pengabdian_mapping_create_master(text, text, uuid) to authenticated;
grant execute on function public.pengabdian_mapping_move_student(uuid, text, uuid) to authenticated;
notify pgrst, 'reload schema';
