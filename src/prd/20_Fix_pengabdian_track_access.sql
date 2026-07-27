-- Memastikan master track dapat dibaca user yang sudah login.
-- SQL Editor menggunakan service/postgres role sehingga tetap dapat melihat row
-- walaupun aplikasi mendapat array kosong akibat RLS.

grant select on table public.pengabdian_track to authenticated;

drop policy if exists pol_pengabdian_track_authenticated_read
  on public.pengabdian_track;

create policy pol_pengabdian_track_authenticated_read
  on public.pengabdian_track
  for select
  to authenticated
  using (true);

-- Jalankan hanya jika Admin/PIC memang boleh mengelola master track dari app.
-- Saat ini UI Project hanya membaca track, jadi policy write tidak dibuka.

notify pgrst, 'reload schema';
