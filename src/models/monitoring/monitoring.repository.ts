import type { CalendarEvent } from "../../components/calendar/types";
import type { LearnSession } from "../../data/monitoring/learnData";
import { supabase } from "../../lib/supabase/client";
import type { PengabdianCalendarEventRow, PengabdianLearnSessionRow } from "../../lib/supabase/types";

function normalizePhase(value: string | null, type: LearnSession["type"]): LearnSession["phase"] {
  if (type === "rolespec") return "rs";
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 1;
}

export async function getMonitoringCalendarEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from("pengabdian_calendar_event")
    .select("id,tanggal_event,judul,subjudul,tipe,status,warna,sepanjang_hari,mulai_pada,selesai_pada,deskripsi")
    .order("tanggal_event", { ascending: true });

  if (error) throw new Error(`Gagal memuat calendar event: ${error.message}`);

  return ((data ?? []) as unknown as Pick<
    PengabdianCalendarEventRow,
    "id" | "tanggal_event" | "judul" | "subjudul" | "tipe" | "status" | "warna" | "sepanjang_hari" | "mulai_pada" | "selesai_pada" | "deskripsi"
  >[]).map((row) => ({
    id: row.id,
    date: row.tanggal_event,
    title: row.judul,
    subtitle: row.subjudul ?? undefined,
    type: row.tipe,
    status: row.status,
    color: row.warna ?? undefined,
    allDay: row.sepanjang_hari ?? true,
    start: row.mulai_pada ?? undefined,
    end: row.selesai_pada ?? undefined,
    description: row.deskripsi ?? undefined,
  }));
}

export async function getMonitoringLearnSessions(): Promise<LearnSession[]> {
  const { data, error } = await supabase
    .from("pengabdian_learn_session")
    .select("id,kode_sesi,tipe,phase,bulan_ke,quarter,schedule_label,tanggal_sesi,tema,theme_cls,judul,subjudul,deskripsi_what,peserta_who,tujuan_why,lokasi_where,metode_how,pemateri,status,target_peserta")
    .order("kode_sesi", { ascending: true });

  if (error) throw new Error(`Gagal memuat learn session: ${error.message}`);

  return ((data ?? []) as unknown as Pick<
    PengabdianLearnSessionRow,
    "id" | "kode_sesi" | "tipe" | "phase" | "bulan_ke" | "quarter" | "schedule_label" | "tanggal_sesi" | "tema" | "theme_cls" | "judul" | "subjudul" | "deskripsi_what" | "peserta_who" | "tujuan_why" | "lokasi_where" | "metode_how" | "pemateri" | "status" | "target_peserta"
  >[]).map((row) => ({
    id: row.kode_sesi,
    type: row.tipe,
    phase: normalizePhase(row.phase, row.tipe),
    month: row.bulan_ke,
    quarter: row.quarter,
    theme: row.tema,
    themeCls: row.theme_cls ?? "c-deen",
    title: row.judul,
    subtitle: row.subjudul ?? "",
    what: row.deskripsi_what ?? row.judul,
    who: row.peserta_who ?? "Semua santri",
    why: row.tujuan_why ?? "",
    when: row.schedule_label ?? row.tanggal_sesi ?? "TBD",
    where: row.lokasi_where ?? "Online",
    how: row.metode_how ?? "",
    speaker: row.pemateri ?? "TBD",
    status: row.status === "Done" ? "Done" : "Planned",
    attendance: 0,
    totalSantri: row.target_peserta ?? 0,
  }));
}
