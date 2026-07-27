import type { CalendarEvent } from "../../components/calendar/types";
import type { LearnSession } from "../../data/monitoring/learnData";
import type { Project } from "../../data/monitoring/projectData";
import type { Santri } from "../../data/santriData";
import { supabase } from "../../lib/supabase/client";
import type {
  KesiswaanRow,
  PengabdianCalendarEventRow,
  PengabdianDivisiRow,
  PengabdianLearnSessionRow,
  PengabdianProjectOwnerRow,
  PengabdianProjectRow,
  PengabdianReportMonthlyEvaluationRow,
  PengabdianReportRow,
  PengabdianSantri,
  PengabdianTrackRow,
} from "../../lib/supabase/types";
import type {
  MonitoringReportProgress,
  MonitoringRiskReport,
  MonitoringProjectInput,
  MonitoringProjectOptions,
  MonitoringMukafaahRecord,
  PengabdianReportProgressViewRow,
  PengabdianRiskReportViewRow,
} from "./monitoring.model";

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

  return mapCalendarRows((data ?? []) as unknown as Pick<
    PengabdianCalendarEventRow,
    "id" | "tanggal_event" | "judul" | "subjudul" | "tipe" | "status" | "warna" | "sepanjang_hari" | "mulai_pada" | "selesai_pada" | "deskripsi"
  >[]);
}

function mapCalendarRows(rows: Pick<
  PengabdianCalendarEventRow,
  "id" | "tanggal_event" | "judul" | "subjudul" | "tipe" | "status" | "warna" | "sepanjang_hari" | "mulai_pada" | "selesai_pada" | "deskripsi"
>[]): CalendarEvent[] {
  return rows.map((row) => ({
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

function calendarPayload(event: Omit<CalendarEvent, "id">) {
  const timestamp = (time?: string) => {
    if (!time) return null;
    if (time.includes("T")) return time;
    return new Date(`${event.date}T${time}:00`).toISOString();
  };
  return {
    tanggal_event: event.date,
    judul: event.title,
    subjudul: event.subtitle ?? null,
    tipe: event.type,
    status: event.status,
    warna: event.color ?? null,
    sepanjang_hari: event.allDay ?? true,
    mulai_pada: event.allDay ? null : timestamp(event.start),
    selesai_pada: event.allDay ? null : timestamp(event.end),
    deskripsi: event.description ?? null,
  };
}

export async function createMonitoringCalendarEvent(event: Omit<CalendarEvent, "id">) {
  const { data, error } = await supabase
    .from("pengabdian_calendar_event")
    .insert(calendarPayload(event) as never)
    .select("id,tanggal_event,judul,subjudul,tipe,status,warna,sepanjang_hari,mulai_pada,selesai_pada,deskripsi")
    .single();
  if (error) throw new Error(`Gagal menambahkan event: ${error.message}`);
  return mapCalendarRows([data as unknown as PengabdianCalendarEventRow])[0];
}

export async function updateMonitoringCalendarEvent(id: string, event: Omit<CalendarEvent, "id">) {
  const { data, error } = await supabase
    .from("pengabdian_calendar_event")
    .update(calendarPayload(event) as never)
    .eq("id", id)
    .select("id,tanggal_event,judul,subjudul,tipe,status,warna,sepanjang_hari,mulai_pada,selesai_pada,deskripsi")
    .single();
  if (error) throw new Error(`Gagal memperbarui event: ${error.message}`);
  return mapCalendarRows([data as unknown as PengabdianCalendarEventRow])[0];
}

export async function deleteMonitoringCalendarEvent(id: string) {
  const { error } = await supabase.from("pengabdian_calendar_event").delete().eq("id", id);
  if (error) throw new Error(`Gagal menghapus event: ${error.message}`);
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
    databaseId: row.id,
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

function learnSessionPayload(session: Omit<LearnSession, "id" | "databaseId">) {
  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(session.when) ? session.when : null;
  return {
    tipe: session.type,
    phase: String(session.phase),
    bulan_ke: session.month,
    quarter: session.quarter,
    schedule_label: session.when,
    tanggal_sesi: dateValue,
    tema: session.theme,
    theme_cls: session.themeCls,
    judul: session.title,
    subjudul: session.subtitle || null,
    deskripsi_what: session.what || null,
    peserta_who: session.who || null,
    tujuan_why: session.why || null,
    lokasi_where: session.where || null,
    metode_how: session.how || null,
    pemateri: session.speaker || null,
    status: session.status,
    target_peserta: session.totalSantri,
  };
}

export async function createMonitoringLearnSession(code: string, session: Omit<LearnSession, "id" | "databaseId">) {
  const { error } = await supabase.from("pengabdian_learn_session").insert({
    kode_sesi: code,
    ...learnSessionPayload(session),
  } as never);
  if (error) throw new Error(`Gagal menambahkan learn session: ${error.message}`);
}

export async function updateMonitoringLearnSession(sessionId: string, session: Omit<LearnSession, "id" | "databaseId">) {
  const { error } = await supabase
    .from("pengabdian_learn_session")
    .update(learnSessionPayload(session) as never)
    .eq("id", sessionId);
  if (error) throw new Error(`Gagal memperbarui learn session: ${error.message}`);
}

export async function updateMonitoringLearnStatus(sessionId: string, status: LearnSession["status"]) {
  const { error } = await supabase.from("pengabdian_learn_session").update({ status } as never).eq("id", sessionId);
  if (error) throw new Error(`Gagal memperbarui status sesi: ${error.message}`);
}

export async function deleteMonitoringLearnSession(sessionId: string) {
  const { error } = await supabase.from("pengabdian_learn_session").delete().eq("id", sessionId);
  if (error) throw new Error(`Gagal menghapus learn session: ${error.message}`);
}

export async function getMonitoringLearnParticipants(): Promise<Santri[]> {
  const [santri, identities] = await Promise.all([
    supabase.from("pengabdian_santri").select("id,siswa_id,kode_santri,status"),
    supabase.from("kesiswaan").select("id,nis,nama_lengkap"),
  ]);
  const error = santri.error ?? identities.error;
  if (error) throw new Error(`Gagal memuat peserta learn: ${error.message}`);

  const santriRows = (santri.data ?? []) as unknown as Pick<PengabdianSantri, "id" | "siswa_id" | "kode_santri" | "status">[];
  const identityRows = (identities.data ?? []) as unknown as Pick<KesiswaanRow, "id" | "nis" | "nama_lengkap">[];
  const identityById = new Map(identityRows.map((row) => [row.id, row]));
  return santriRows
    .filter((row) => row.status === "Aktif")
    .map((row) => {
      const identity = identityById.get(row.siswa_id);
      return {
        id: row.kode_santri ?? identity?.nis ?? row.id.slice(0, 8),
        pengabdianId: row.id,
        name: identity?.nama_lengkap ?? "Santri tanpa nama",
        unit: "",
        loc: "",
        divs: [],
        roles: [],
        picDivs: [],
        picReg: "",
        status: "Active" as const,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getMonitoringLearnAttendance(sessionId: string) {
  const { data, error } = await supabase
    .from("pengabdian_learn_attendance")
    .select("pengabdian_id,status")
    .eq("learn_session_id", sessionId);
  if (error) throw new Error(`Gagal memuat absensi: ${error.message}`);
  return (data ?? []) as unknown as { pengabdian_id: string; status: "Hadir" | "Izin" | "Alpha" }[];
}

export async function setMonitoringLearnAttendance(
  sessionId: string,
  pengabdianId: string,
  status: "Hadir" | "Izin" | "Alpha",
) {
  if (status === "Hadir") {
    const { error } = await supabase
      .from("pengabdian_learn_attendance")
      .delete()
      .eq("learn_session_id", sessionId)
      .eq("pengabdian_id", pengabdianId);
    if (error) throw new Error(`Gagal memperbarui absensi: ${error.message}`);
    return;
  }
  const { error } = await supabase.from("pengabdian_learn_attendance").upsert({
    learn_session_id: sessionId,
    pengabdian_id: pengabdianId,
    status,
    catatan: null,
    dicatat_oleh: null,
  } as never, { onConflict: "learn_session_id,pengabdian_id" });
  if (error) throw new Error(`Gagal memperbarui absensi: ${error.message}`);
}

function trackLabel(row: PengabdianTrackRow | undefined) {
  if (!row) return "Tanpa Track";
  return row.Track ?? row.track ?? row.nama_track ?? row.track_name ?? `Track ${row.id}`;
}

function trackIcon(label: string) {
  const value = label.toLowerCase();
  if (value.includes("design")) return "solar:palette-bold-duotone";
  if (value.includes("technical") || value.includes("builder")) return "solar:code-bold-duotone";
  if (value.includes("teaching") || value.includes("knowledge")) return "solar:square-academic-cap-bold-duotone";
  if (value.includes("operational")) return "solar:settings-minimalistic-bold-duotone";
  if (value.includes("dakwah") || value.includes("speaking")) return "solar:microphone-3-bold-duotone";
  if (value.includes("pkbm")) return "solar:notebook-bold-duotone";
  return "solar:route-bold-duotone";
}

function mapProjectStatus(status: string | null): Project["status"] {
  if (status === "In Progress" || status === "Submitted" || status === "Approved" || status === "Archived") return status;
  return "Idea";
}

export async function getMonitoringProjects(): Promise<Project[]> {
  const [projects, owners, santri, identities, divisions, tracks] = await Promise.all([
    supabase.from("pengabdian_projects").select("id,track_id,project_name,divisi_id,status,platform,reviewer,link,is_wajib,created_at").order("created_at", { ascending: false }),
    supabase.from("pengabdian_project_owner").select("id,project_id,pengabdian_id,role_owner,ditambahkan_pada"),
    supabase.from("pengabdian_santri").select("id,siswa_id,kode_santri"),
    supabase.from("kesiswaan").select("id,nis,nama_lengkap"),
    supabase.from("pengabdian_divisi").select("id,kode_divisi,nama_divisi"),
    supabase.from("pengabdian_track").select("*"),
  ]);

  const error = projects.error ?? owners.error ?? santri.error ?? identities.error ?? divisions.error ?? tracks.error;
  if (error) throw new Error(`Gagal memuat data project: ${error.message}`);

  const projectRows = (projects.data ?? []) as unknown as PengabdianProjectRow[];
  const ownerRows = (owners.data ?? []) as unknown as Pick<PengabdianProjectOwnerRow, "project_id" | "pengabdian_id">[];
  const santriRows = (santri.data ?? []) as unknown as Pick<PengabdianSantri, "id" | "siswa_id" | "kode_santri">[];
  const identityRows = (identities.data ?? []) as unknown as Pick<KesiswaanRow, "id" | "nis" | "nama_lengkap">[];
  const divisionRows = (divisions.data ?? []) as unknown as Pick<PengabdianDivisiRow, "id" | "kode_divisi" | "nama_divisi">[];
  const trackRows = (tracks.data ?? []) as unknown as PengabdianTrackRow[];

  const identityById = new Map(identityRows.map((row) => [row.id, row]));
  const santriLabelByPengabdianId = new Map(
    santriRows.map((row) => {
      const identity = identityById.get(row.siswa_id);
      return [row.id, identity?.nama_lengkap ?? row.kode_santri ?? row.id.slice(0, 8)];
    }),
  );
  const ownersByProjectId = new Map<string, string[]>();
  ownerRows.forEach((row) => {
    const current = ownersByProjectId.get(row.project_id) ?? [];
    current.push(santriLabelByPengabdianId.get(row.pengabdian_id) ?? row.pengabdian_id.slice(0, 8));
    ownersByProjectId.set(row.project_id, current);
  });
  const divisionById = new Map(divisionRows.map((row) => [row.id, row]));
  const trackById = new Map(trackRows.map((row) => [row.id, row]));

  return projectRows.map((project, index) => {
    const division = project.divisi_id ? divisionById.get(project.divisi_id) : null;
    return {
      id: `P${String(projectRows.length - index).padStart(3, "0")}`,
      databaseId: project.id,
      name: project.project_name ?? "Project tanpa nama",
      track: trackLabel(project.track_id ? trackById.get(project.track_id) : undefined),
      trackId: project.track_id,
      div: division?.kode_divisi ?? division?.nama_divisi ?? "All",
      divisionId: project.divisi_id,
      owners: ownersByProjectId.get(project.id) ?? [],
      ownerIds: ownerRows.filter((owner) => owner.project_id === project.id).map((owner) => owner.pengabdian_id),
      platform: project.platform ?? "",
      link: project.link ?? "",
      reviewer: project.reviewer ? "Reviewer assigned" : "",
      reviewerId: project.reviewer,
      status: mapProjectStatus(project.status),
      wajib: project.is_wajib ?? false,
    };
  });
}

export async function getMonitoringProjectOptions(): Promise<MonitoringProjectOptions> {
  const [tracks, divisions, santri, identities, staff] = await Promise.all([
    supabase.from("pengabdian_track").select("*"),
    supabase.from("pengabdian_divisi").select("id,kode_divisi,nama_divisi").order("nama_divisi"),
    supabase.from("pengabdian_santri").select("id,siswa_id,kode_santri,status"),
    supabase.from("kesiswaan").select("id,nis,nama_lengkap"),
    supabase.from("pengabdian_staff").select("id,nama_lengkap,role_staff").eq("aktif", true).order("nama_lengkap"),
  ]);

  const error = tracks.error ?? divisions.error ?? santri.error ?? identities.error;
  if (error) throw new Error(`Gagal memuat opsi project: ${error.message}`);

  const trackRows = (tracks.data ?? []) as unknown as PengabdianTrackRow[];
  const divisionRows = (divisions.data ?? []) as unknown as Pick<PengabdianDivisiRow, "id" | "kode_divisi" | "nama_divisi">[];
  const santriRows = (santri.data ?? []) as unknown as Pick<PengabdianSantri, "id" | "siswa_id" | "kode_santri" | "status">[];
  const identityRows = (identities.data ?? []) as unknown as Pick<KesiswaanRow, "id" | "nis" | "nama_lengkap">[];
  const staffRows = staff.error ? [] : (staff.data ?? []) as unknown as { id: string; nama_lengkap: string; role_staff: string }[];
  const identityById = new Map(identityRows.map((row) => [row.id, row]));

  return {
    tracks: trackRows.map((row) => {
      const label = trackLabel(row);
      return { value: row.id, label, description: row.description ?? undefined, icon: trackIcon(label) };
    }),
    divisions: divisionRows.map((row) => ({ value: row.id, label: `${row.kode_divisi} · ${row.nama_divisi}`, icon: "solar:widget-4-bold-duotone" })),
    owners: santriRows
      .filter((row) => row.status === "Aktif")
      .map((row) => {
        const identity = identityById.get(row.siswa_id);
        return {
          value: row.id,
          label: identity?.nama_lengkap ?? row.kode_santri ?? row.id.slice(0, 8),
          description: row.kode_santri ?? identity?.nis ?? undefined,
          icon: "solar:user-rounded-bold-duotone",
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label)),
    reviewers: staffRows.map((row) => ({
      value: row.id,
      label: row.nama_lengkap,
      description: row.role_staff,
      icon: "solar:shield-user-bold-duotone",
    })),
  };
}

async function replaceProjectOwners(projectId: string, ownerIds: string[]) {
  const { error: deleteError } = await supabase
    .from("pengabdian_project_owner")
    .delete()
    .eq("project_id", projectId);
  if (deleteError) throw new Error(`Gagal memperbarui owner project: ${deleteError.message}`);

  if (!ownerIds.length) return;
  const { error: insertError } = await supabase
    .from("pengabdian_project_owner")
    .insert(ownerIds.map((pengabdianId) => ({ project_id: projectId, pengabdian_id: pengabdianId, role_owner: "Owner" })) as never);
  if (insertError) throw new Error(`Gagal menyimpan owner project: ${insertError.message}`);
}

export async function createMonitoringProject(input: MonitoringProjectInput) {
  const { data, error } = await supabase
    .from("pengabdian_projects")
    .insert({
      project_name: input.name,
      track_id: input.trackId,
      divisi_id: input.divisionId,
      status: input.status,
      platform: input.platform || null,
      reviewer: input.reviewerId,
      link: input.link || null,
      is_wajib: input.wajib,
    } as never)
    .select("id")
    .single();
  if (error) throw new Error(`Gagal membuat project: ${error.message}`);
  await replaceProjectOwners((data as { id: string }).id, input.ownerIds);
}

export async function updateMonitoringProject(projectId: string, input: MonitoringProjectInput) {
  const { error } = await supabase
    .from("pengabdian_projects")
    .update({
      project_name: input.name,
      track_id: input.trackId,
      divisi_id: input.divisionId,
      status: input.status,
      platform: input.platform || null,
      reviewer: input.reviewerId,
      link: input.link || null,
      is_wajib: input.wajib,
    } as never)
    .eq("id", projectId);
  if (error) throw new Error(`Gagal memperbarui project: ${error.message}`);
  await replaceProjectOwners(projectId, input.ownerIds);
}

export async function deleteMonitoringProject(projectId: string) {
  const { error } = await supabase.from("pengabdian_projects").delete().eq("id", projectId);
  if (error) throw new Error(`Gagal menghapus project: ${error.message}`);
}

function isSubmitted(status: PengabdianReportProgressViewRow["weekly_status"]) {
  return status !== null && status !== "Draft";
}

export async function getMonitoringReportProgress(): Promise<MonitoringReportProgress[]> {
  const [progress, identities] = await Promise.all([
    supabase.from("v_pengabdian_report_progress").select("*"),
    supabase.from("kesiswaan").select("id,nis,nama_lengkap"),
  ]);

  const error = progress.error ?? identities.error;
  if (error) throw new Error(`Gagal memuat progres laporan: ${error.message}`);

  const progressRows = (progress.data ?? []) as unknown as PengabdianReportProgressViewRow[];
  const identityRows = (identities.data ?? []) as unknown as Pick<KesiswaanRow, "id" | "nis" | "nama_lengkap">[];
  const identityById = new Map(identityRows.map((row) => [row.id, row]));

  return progressRows.map((row) => {
    const identity = identityById.get(row.siswa_id);
    const dailyComplete = Boolean(row.daily_pagi_selesai && row.daily_sore_selesai);
    const weeklyComplete = isSubmitted(row.weekly_status);
    const monthlyComplete = isSubmitted(row.monthly_status);
    const completed = [dailyComplete, weeklyComplete, monthlyComplete].filter(Boolean).length;
    const statuses = [row.daily_status, row.weekly_status, row.monthly_status];

    return {
      pengabdianId: row.pengabdian_id,
      siswaId: row.siswa_id,
      code: row.kode_santri ?? identity?.nis ?? row.pengabdian_id.slice(0, 8),
      name: identity?.nama_lengkap ?? "Santri tanpa nama",
      daily: {
        id: row.daily_report_id,
        date: row.daily_tanggal,
        status: row.daily_status,
        morningDone: Boolean(row.daily_pagi_selesai),
        eveningDone: Boolean(row.daily_sore_selesai),
        mood: row.daily_mood,
        blocker: row.daily_kendala,
        completion: row.daily_completion_pct ?? 0,
      },
      weekly: {
        id: row.weekly_report_id,
        periodStart: row.weekly_periode_mulai,
        status: row.weekly_status,
        label: row.minggu_label,
        sowStatus: row.progres_sow_status,
        sowProgress: row.progres_sow_pct,
      },
      monthly: {
        id: row.monthly_report_id,
        periodStart: row.monthly_periode_mulai,
        status: row.monthly_status,
        month: row.monthly_bulan,
        year: row.monthly_tahun,
        gyr: row.status_gyr,
        mukafaahEligible: Boolean(row.eligible_mukafaah),
      },
      compliance: Math.round((completed / 3) * 100),
      needsAttention:
        row.daily_mood === "Tough"
        || Boolean(row.daily_kendala)
        || statuses.includes("Perlu_Revisi"),
    };
  });
}

function indicatorList(value: PengabdianRiskReportViewRow["indikator"]) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

export async function getMonitoringRiskReports(): Promise<MonitoringRiskReport[]> {
  const { data, error } = await supabase
    .from("v_pengabdian_risk_report")
    .select("*")
    .order("dibuat_pada", { ascending: false });

  if (error) throw new Error(`Gagal memuat laporan At Risk: ${error.message}`);

  return ((data ?? []) as unknown as PengabdianRiskReportViewRow[]).map((row) => ({
    id: row.id,
    pengabdianId: row.pengabdian_id,
    studentCode: row.kode_santri ?? row.pengabdian_id.slice(0, 8),
    studentName: row.nama_santri,
    reporterName: row.nama_pelapor,
    reporterRole: row.peran_pelapor,
    category: row.kategori,
    severity: row.severity,
    title: row.judul,
    description: row.deskripsi,
    indicators: indicatorList(row.indikator),
    recommendation: row.rekomendasi_tindakan,
    followUp: row.tindak_lanjut,
    status: row.status,
    assigneeName: row.nama_assignee,
    targetDate: row.target_selesai,
    resolvedAt: row.diselesaikan_pada,
    resolutionNote: row.catatan_penyelesaian,
    createdAt: row.dibuat_pada,
    updatedAt: row.diperbarui_pada,
  }));
}

export async function getMonitoringMukafaahRecords(): Promise<MonitoringMukafaahRecord[]> {
  const [evaluations, reports, santri, identities] = await Promise.all([
    supabase.from("pengabdian_report_monthly_evaluation").select("id,report_id,skor_adab,jumlah_learn,jumlah_project_acc,jumlah_checkin,status_gyr,eligible_mukafaah,dibuat_pada,diperbarui_pada"),
    supabase.from("pengabdian_report").select("id,pengabdian_id,tipe,periode_mulai,periode_selesai,status,dikirim_pada,dibuat_pada,diperbarui_pada"),
    supabase.from("pengabdian_santri").select("id,siswa_id,kode_santri"),
    supabase.from("kesiswaan").select("id,nis,nama_lengkap"),
  ]);

  const error = evaluations.error ?? reports.error ?? santri.error ?? identities.error;
  if (error) throw new Error(`Gagal memuat kesiapan Mukafaah: ${error.message}`);

  const evaluationRows = (evaluations.data ?? []) as unknown as Pick<
    PengabdianReportMonthlyEvaluationRow,
    "id" | "report_id" | "skor_adab" | "jumlah_learn" | "jumlah_project_acc" | "jumlah_checkin" | "status_gyr" | "eligible_mukafaah" | "dibuat_pada" | "diperbarui_pada"
  >[];
  const reportRows = (reports.data ?? []) as unknown as Pick<
    PengabdianReportRow,
    "id" | "pengabdian_id" | "tipe" | "periode_mulai" | "periode_selesai" | "status" | "dikirim_pada" | "dibuat_pada" | "diperbarui_pada"
  >[];
  const santriRows = (santri.data ?? []) as unknown as Pick<PengabdianSantri, "id" | "siswa_id" | "kode_santri">[];
  const identityRows = (identities.data ?? []) as unknown as Pick<KesiswaanRow, "id" | "nis" | "nama_lengkap">[];
  const reportById = new Map(reportRows.map((row) => [row.id, row]));
  const santriById = new Map(santriRows.map((row) => [row.id, row]));
  const identityById = new Map(identityRows.map((row) => [row.id, row]));
  const latestBySantri = new Map<string, { evaluation: typeof evaluationRows[number]; report: typeof reportRows[number] }>();

  evaluationRows.forEach((evaluation) => {
    const report = reportById.get(evaluation.report_id);
    if (!report || report.tipe !== "Monthly") return;
    const current = latestBySantri.get(report.pengabdian_id);
    if (!current || report.periode_mulai > current.report.periode_mulai) {
      latestBySantri.set(report.pengabdian_id, { evaluation, report });
    }
  });

  return [...latestBySantri.entries()].map(([pengabdianId, value]) => {
    const { evaluation, report } = value;
    const student = santriById.get(pengabdianId);
    const identity = student ? identityById.get(student.siswa_id) : null;
    const reportsSubmitted = reportRows.filter((item) =>
      item.pengabdian_id === pengabdianId
      && item.periode_mulai >= report.periode_mulai
      && item.periode_mulai <= report.periode_selesai
      && item.status !== "Draft"
      && item.status !== "Ditolak"
    ).length;

    return {
      evaluationId: evaluation.id,
      pengabdianId,
      studentCode: student?.kode_santri ?? identity?.nis ?? pengabdianId.slice(0, 8),
      studentName: identity?.nama_lengkap ?? "Santri tanpa nama",
      period: new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(`${report.periode_mulai}T00:00:00`)),
      learnCompleted: evaluation.jumlah_learn ?? 0,
      targetLearn: 3,
      projectsApproved: evaluation.jumlah_project_acc ?? 0,
      targetProjects: 1,
      reportsSubmitted,
      targetReports: 3,
      adabScore: evaluation.skor_adab ?? 0,
      targetAdab: 3,
      ready: Boolean(evaluation.eligible_mukafaah),
      gyr: evaluation.status_gyr,
    };
  }).sort((a, b) => a.studentName.localeCompare(b.studentName));
}
