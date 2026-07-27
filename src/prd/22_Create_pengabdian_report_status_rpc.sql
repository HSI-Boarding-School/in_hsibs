-- RPC perubahan status Report Management.
-- Menjamin status, timestamp, dan catatan history tersimpan dalam satu transaksi.

create or replace function public.pengabdian_set_report_status(
  p_report_id uuid,
  p_status public.pengabdian_report_status_enum,
  p_catatan text default null,
  p_aksi text default 'Status diubah'
)
returns public.pengabdian_report
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.pengabdian_report;
begin
  if not exists (
    select 1
    from public.pengabdian_staff
    where id = auth.uid()
      and coalesce(aktif, true) = true
      and role_staff in ('Admin', 'PIC_Div', 'PIC_Reg')
  ) then
    raise exception 'Tidak memiliki akses untuk mengubah status laporan';
  end if;

  update public.pengabdian_report
  set status = p_status,
      versi = case when p_status = 'Perlu_Revisi' then versi + 1 else versi end,
      divalidasi_oleh = case when p_status = 'Divalidasi' then auth.uid() else divalidasi_oleh end,
      divalidasi_pada = case when p_status = 'Divalidasi' then now() else divalidasi_pada end,
      disetujui_oleh = case when p_status = 'Disetujui' then auth.uid() else disetujui_oleh end,
      disetujui_pada = case when p_status = 'Disetujui' then now() else disetujui_pada end,
      diperbarui_pada = now()
  where id = p_report_id
  returning * into result;

  if result.id is null then
    raise exception 'Laporan tidak ditemukan';
  end if;

  -- Trigger status history sudah membuat row. Lengkapi row terbaru tersebut.
  update public.pengabdian_report_review
  set catatan = nullif(trim(p_catatan), ''),
      aksi = coalesce(nullif(trim(p_aksi), ''), 'Status diubah')
  where id = (
    select id
    from public.pengabdian_report_review
    where report_id = p_report_id
      and status_sesudah = p_status
    order by dibuat_pada desc
    limit 1
  );

  return result;
end;
$$;

grant execute on function public.pengabdian_set_report_status(
  uuid,
  public.pengabdian_report_status_enum,
  text,
  text
) to authenticated;

notify pgrst, 'reload schema';
