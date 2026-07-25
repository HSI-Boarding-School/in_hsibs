-- Migration jika data pengabdian langsung mengikuti public.kesiswaan.
-- Tidak lagi wajib memakai public.pengabdian_batch karena kesiswaan sudah punya:
-- - angkatan_id
-- - tahun_ajaran_id
--
-- Tidak mengubah struktur public.kesiswaan.

alter table public.pengabdian_santri
  alter column batch_id drop not null;

-- Constraint unik lama (siswa_id, batch_id) tidak cocok untuk mode tanpa batch.
alter table public.pengabdian_santri
  drop constraint if exists pengabdian_santri_siswa_id_batch_id_key;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'pengabdian_santri_siswa_id_key'
      and conrelid = 'public.pengabdian_santri'::regclass
  ) then
    alter table public.pengabdian_santri
      add constraint pengabdian_santri_siswa_id_key unique (siswa_id);
  end if;
end $$;

-- Kalau santri pengabdian bukan hanya alumni, trigger validasi alumni perlu dimatikan.
drop trigger if exists trg_cek_alumni on public.pengabdian_santri;
