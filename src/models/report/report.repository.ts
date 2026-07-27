import { supabase } from "../../lib/supabase/client";
import type {
  KesiswaanRow,
  PengabdianReportDailyRow,
  PengabdianReportMonthlyRow,
  PengabdianReportReminderRow,
  PengabdianReportReviewRow,
  PengabdianReportRow,
  PengabdianReportWeeklyRow,
  PengabdianSantri,
  PengabdianStaff,
  ReportStatus,
} from "../../lib/supabase/types";
import type {
  MissingReportItem,
  ReportDetailItem,
  ReportHistoryItem,
  ReportManagementData,
  ReportQueueItem,
  ReportScope,
} from "./report.model";

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function currentPeriods() {
  const today = new Date();
  const weekStart = new Date(today);
  const day = (today.getDay() + 6) % 7;
  weekStart.setDate(today.getDate() - day);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    Daily: localDateKey(today),
    Weekly: localDateKey(weekStart),
    Monthly: localDateKey(monthStart),
  } satisfies Record<ReportScope, string>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" })
    .format(new Date(`${value}T00:00:00`));
}

function detailsForReport(
  report: Pick<PengabdianReportRow, "id" | "tipe">,
  daily: Map<string, PengabdianReportDailyRow>,
  weekly: Map<string, PengabdianReportWeeklyRow>,
  monthly: Map<string, PengabdianReportMonthlyRow>,
): { summary: string; details: ReportDetailItem[]; mood?: PengabdianReportDailyRow["mood"]; hasBlocker: boolean } {
  if (report.tipe === "Daily") {
    const row = daily.get(report.id);
    const details = [
      row?.rencana && { label: "Rencana", value: row.rencana },
      row?.recap && { label: "Recap", value: row.recap },
      row?.kendala && { label: "Kendala", value: row.kendala },
      row?.mood && { label: "Mood", value: row.mood },
    ].filter((item): item is ReportDetailItem => Boolean(item));
    const morning = Boolean(row?.pagi_dikirim_pada);
    const evening = Boolean(row?.sore_dikirim_pada);
    return {
      summary: morning && evening ? "Laporan pagi dan sore lengkap" : morning ? "Laporan pagi sudah masuk" : evening ? "Laporan sore sudah masuk" : "Daily masih draft",
      details,
      mood: row?.mood,
      hasBlocker: Boolean(row?.kendala?.trim()),
    };
  }
  if (report.tipe === "Weekly") {
    const row = weekly.get(report.id);
    const details = [
      row?.progres_sow_status && { label: "Status SoW", value: row.progres_sow_status },
      row?.progres_sow_pct !== null && row?.progres_sow_pct !== undefined && { label: "Progress", value: `${row.progres_sow_pct}%` },
      row?.highlight && { label: "Highlight", value: row.highlight },
      row?.lowlight && { label: "Lowlight", value: row.lowlight },
      row?.refleksi && { label: "Refleksi", value: row.refleksi },
    ].filter((item): item is ReportDetailItem => Boolean(item));
    return { summary: row?.minggu_label ? `${row.minggu_label} · ${row.progres_sow_status ?? "Progress belum diisi"}` : "Weekly report", details, hasBlocker: row?.progres_sow_status === "Behind" };
  }
  const row = monthly.get(report.id);
  const details = [
    row?.refleksi && { label: "Refleksi", value: row.refleksi },
    row?.pencapaian && { label: "Pencapaian", value: row.pencapaian },
    row?.tantangan && { label: "Tantangan", value: row.tantangan },
    row?.rencana_bulan_depan && { label: "Rencana berikutnya", value: row.rencana_bulan_depan },
  ].filter((item): item is ReportDetailItem => Boolean(item));
  return { summary: row ? `${String(row.bulan).padStart(2, "0")}/${row.tahun} · Evaluasi bulanan` : "Monthly report", details, hasBlocker: Boolean(row?.tantangan?.trim()) };
}

export async function getReportManagementData(): Promise<ReportManagementData> {
  const [reportsResult, santriResult, identitiesResult, reviewsResult, remindersResult, staffResult] = await Promise.all([
    supabase.from("pengabdian_report").select("id,pengabdian_id,tipe,periode_mulai,periode_selesai,status,versi,dikirim_pada,dibuat_pada,diperbarui_pada").order("periode_mulai", { ascending: false }).limit(500),
    supabase.from("pengabdian_santri").select("id,siswa_id,kode_santri,status"),
    supabase.from("kesiswaan").select("id,nis,nama_lengkap"),
    supabase.from("pengabdian_report_review").select("id,report_id,aktor_user_id,aktor_staff_id,status_sebelum,status_sesudah,aksi,catatan,dibuat_pada").order("dibuat_pada", { ascending: false }).limit(500),
    supabase.from("pengabdian_report_reminder").select("id,pengabdian_id,report_id,tipe_report,periode_mulai,channel,pesan,dikirim_oleh,dikirim_pada").order("dikirim_pada", { ascending: false }).limit(500),
    supabase.from("pengabdian_staff").select("id,nama_lengkap"),
  ]);

  const baseError = reportsResult.error ?? santriResult.error ?? identitiesResult.error ?? reviewsResult.error ?? remindersResult.error;
  if (baseError) throw new Error(`Gagal memuat Report Management: ${baseError.message}`);

  const reportRows = (reportsResult.data ?? []) as unknown as PengabdianReportRow[];
  const reportIds = reportRows.map((row) => row.id);
  const [dailyResult, weeklyResult, monthlyResult] = reportIds.length
    ? await Promise.all([
        supabase.from("pengabdian_report_daily").select("report_id,tanggal,rencana,pagi_dikirim_pada,recap,kendala,mood,sore_dikirim_pada").in("report_id", reportIds),
        supabase.from("pengabdian_report_weekly").select("report_id,minggu_label,progres_sow_status,progres_sow_pct,highlight,lowlight,refleksi").in("report_id", reportIds),
        supabase.from("pengabdian_report_monthly").select("report_id,bulan,tahun,refleksi,pencapaian,tantangan,rencana_bulan_depan").in("report_id", reportIds),
      ])
    : [{ data: [], error: null }, { data: [], error: null }, { data: [], error: null }];

  const detailError = dailyResult.error ?? weeklyResult.error ?? monthlyResult.error;
  if (detailError) throw new Error(`Gagal memuat detail laporan: ${detailError.message}`);

  const santriRows = (santriResult.data ?? []) as unknown as Pick<PengabdianSantri, "id" | "siswa_id" | "kode_santri" | "status">[];
  const identityRows = (identitiesResult.data ?? []) as unknown as Pick<KesiswaanRow, "id" | "nis" | "nama_lengkap">[];
  const reviewRows = (reviewsResult.data ?? []) as unknown as PengabdianReportReviewRow[];
  const reminderRows = (remindersResult.data ?? []) as unknown as PengabdianReportReminderRow[];
  const staffRows = staffResult.error ? [] : (staffResult.data ?? []) as unknown as Pick<PengabdianStaff, "id" | "nama_lengkap">[];
  const dailyById = new Map(((dailyResult.data ?? []) as unknown as PengabdianReportDailyRow[]).map((row) => [row.report_id, row]));
  const weeklyById = new Map(((weeklyResult.data ?? []) as unknown as PengabdianReportWeeklyRow[]).map((row) => [row.report_id, row]));
  const monthlyById = new Map(((monthlyResult.data ?? []) as unknown as PengabdianReportMonthlyRow[]).map((row) => [row.report_id, row]));
  const identityById = new Map(identityRows.map((row) => [row.id, row]));
  const santriById = new Map(santriRows.map((row) => [row.id, row]));
  const reportById = new Map(reportRows.map((row) => [row.id, row]));
  const staffById = new Map(staffRows.map((row) => [row.id, row.nama_lengkap]));
  const latestReviewByReport = new Map<string, PengabdianReportReviewRow>();
  reviewRows.forEach((row) => { if (!latestReviewByReport.has(row.report_id)) latestReviewByReport.set(row.report_id, row); });

  const studentLabel = (pengabdianId: string) => {
    const student = santriById.get(pengabdianId);
    const identity = student ? identityById.get(student.siswa_id) : null;
    return {
      code: student?.kode_santri ?? identity?.nis ?? pengabdianId.slice(0, 8),
      name: identity?.nama_lengkap ?? "Santri tanpa nama",
    };
  };

  const queue: ReportQueueItem[] = reportRows.map((report) => {
    const label = studentLabel(report.pengabdian_id);
    const detail = detailsForReport(report, dailyById, weeklyById, monthlyById);
    return {
      id: report.id,
      pengabdianId: report.pengabdian_id,
      studentCode: label.code,
      studentName: label.name,
      scope: report.tipe,
      periodStart: report.periode_mulai,
      periodEnd: report.periode_selesai,
      status: report.status,
      version: report.versi,
      submittedAt: report.dikirim_pada,
      updatedAt: report.diperbarui_pada,
      summary: detail.summary,
      details: detail.details,
      mood: detail.mood,
      hasBlocker: detail.hasBlocker,
      latestNote: latestReviewByReport.get(report.id)?.catatan ?? null,
    };
  });

  const periods = currentPeriods();
  const reportKeys = new Set(reportRows.map((row) => `${row.pengabdian_id}|${row.tipe}|${row.periode_mulai}`));
  const reminderByKey = new Map<string, string>();
  reminderRows.forEach((row) => {
    const key = `${row.pengabdian_id}|${row.tipe_report}|${row.periode_mulai}`;
    if (!reminderByKey.has(key)) reminderByKey.set(key, row.dikirim_pada);
  });
  const missing: MissingReportItem[] = [];
  santriRows.filter((row) => row.status === "Aktif").forEach((student) => {
    const label = studentLabel(student.id);
    (Object.keys(periods) as ReportScope[]).forEach((scope) => {
      const periodStart = periods[scope];
      const key = `${student.id}|${scope}|${periodStart}`;
      if (!reportKeys.has(key)) {
        missing.push({ id: key, pengabdianId: student.id, studentCode: label.code, studentName: label.name, scope, periodStart, periodLabel: formatDate(periodStart), remindedAt: reminderByKey.get(key) ?? null });
      }
    });
  });

  const history: ReportHistoryItem[] = reviewRows.map((review) => {
    const report = reportById.get(review.report_id);
    const label = report ? studentLabel(report.pengabdian_id) : { code: "-", name: "Laporan dihapus" };
    return {
      id: review.id,
      reportId: review.report_id,
      studentName: label.name,
      studentCode: label.code,
      scope: report?.tipe ?? "Daily",
      action: review.aksi ?? "Status diubah",
      statusBefore: review.status_sebelum,
      statusAfter: review.status_sesudah,
      note: review.catatan,
      actor: review.aktor_staff_id ? staffById.get(review.aktor_staff_id) ?? review.aktor_staff_id.slice(0, 8) : "System",
      createdAt: review.dibuat_pada,
    };
  });

  return { queue, missing, history };
}

export async function setReportManagementStatus(reportId: string, status: ReportStatus, note?: string) {
  const action = status === "Divalidasi" ? "Laporan diverifikasi" : status === "Perlu_Revisi" ? "Revisi diminta" : status === "Disetujui" ? "Laporan disetujui" : "Status diubah";
  const callStatusRpc = supabase.rpc as unknown as (
    functionName: "pengabdian_set_report_status",
    args: { p_report_id: string; p_status: ReportStatus; p_catatan: string | null; p_aksi: string },
  ) => Promise<{ error: { message: string } | null }>;
  const { error } = await callStatusRpc("pengabdian_set_report_status", {
    p_report_id: reportId,
    p_status: status,
    p_catatan: note?.trim() || null,
    p_aksi: action,
  });
  if (error) throw new Error(`Gagal memperbarui laporan: ${error.message}`);
}

export async function sendReportReminder(item: MissingReportItem) {
  const { error } = await supabase.from("pengabdian_report_reminder").insert({
    pengabdian_id: item.pengabdianId,
    report_id: null,
    tipe_report: item.scope,
    periode_mulai: item.periodStart,
    channel: "In_App",
    pesan: `Reminder ${item.scope} untuk periode ${item.periodLabel}`,
    dikirim_oleh: null,
  } as never);
  if (error) throw new Error(`Gagal mengirim reminder: ${error.message}`);
}
