import { supabase } from "../../lib/supabase/client";
import type {
  KesiswaanRow,
  PengabdianDivisiRow,
  PengabdianProjectRow,
  PengabdianReportDailyRow,
  PengabdianReportMonthlyEvaluationRow,
  PengabdianReportRow,
  PengabdianReportWeeklyRow,
  PengabdianSantri,
  PenempatanSantriRow,
  PenugasanDivisiRow,
} from "../../lib/supabase/types";
import type { PicDivDashboardData, PicDivRiskItem } from "./picDiv.model";

export async function getPicDivDashboard(divisionId: string): Promise<PicDivDashboardData> {
  const [divisionResult, assignmentsResult, projectsResult] = await Promise.all([
    supabase.from("pengabdian_divisi").select("id,kode_divisi,nama_divisi").eq("id", divisionId).single(),
    supabase.from("pengabdian_penugasan_divisi").select("id,penempatan_id,divisi_id,status,level,pic_div_id,disetujui_oleh").eq("divisi_id", divisionId),
    supabase.from("pengabdian_projects").select("id,status,is_wajib,divisi_id").eq("divisi_id", divisionId),
  ]);
  const firstError = divisionResult.error ?? assignmentsResult.error ?? projectsResult.error;
  if (firstError) throw new Error(`Gagal memuat dashboard divisi: ${firstError.message}`);

  const division = divisionResult.data as unknown as Pick<PengabdianDivisiRow, "id" | "kode_divisi" | "nama_divisi">;
  const assignments = ((assignmentsResult.data ?? []) as unknown as Pick<PenugasanDivisiRow, "id" | "penempatan_id" | "divisi_id" | "status" | "level" | "pic_div_id" | "disetujui_oleh">[])
    .filter((row) => !row.status || row.status === "Aktif");
  const placementIds = [...new Set(assignments.map((row) => row.penempatan_id))];
  const placementsResult = placementIds.length
    ? await supabase.from("pengabdian_penempatan_santri").select("id,pengabdian_id").in("id", placementIds)
    : { data: [], error: null };
  if (placementsResult.error) throw new Error(`Gagal memuat penempatan divisi: ${placementsResult.error.message}`);

  const placements = (placementsResult.data ?? []) as unknown as Pick<PenempatanSantriRow, "id" | "pengabdian_id">[];
  const pengabdianIds = [...new Set(placements.map((row) => row.pengabdian_id))];
  const [santriResult, reportsResult] = pengabdianIds.length
    ? await Promise.all([
        supabase.from("pengabdian_santri").select("id,siswa_id,kode_santri,status").in("id", pengabdianIds),
        supabase.from("pengabdian_report").select("id,pengabdian_id,tipe,periode_mulai,periode_selesai,status,versi,dikirim_pada,dibuat_pada,diperbarui_pada").in("pengabdian_id", pengabdianIds),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];
  const secondError = santriResult.error ?? reportsResult.error;
  if (secondError) throw new Error(`Gagal memuat data santri divisi: ${secondError.message}`);

  const santriRows = ((santriResult.data ?? []) as unknown as Pick<PengabdianSantri, "id" | "siswa_id" | "kode_santri" | "status">[])
    .filter((row) => row.status === "Aktif");
  const siswaIds = [...new Set(santriRows.map((row) => row.siswa_id))];
  const identitiesResult = siswaIds.length
    ? await supabase.from("kesiswaan").select("id,nis,nama_lengkap").in("id", siswaIds)
    : { data: [], error: null };
  if (identitiesResult.error) throw new Error(`Gagal memuat identitas santri: ${identitiesResult.error.message}`);

  const identities = (identitiesResult.data ?? []) as unknown as Pick<KesiswaanRow, "id" | "nis" | "nama_lengkap">[];
  const identityById = new Map(identities.map((row) => [row.id, row]));
  const students = santriRows.map((row) => {
    const identity = identityById.get(row.siswa_id);
    return { pengabdianId: row.id, code: row.kode_santri ?? identity?.nis ?? row.id.slice(0, 8), name: identity?.nama_lengkap ?? "Santri tanpa nama" };
  });
  const studentById = new Map(students.map((row) => [row.pengabdianId, row]));
  const reportRows = ((reportsResult.data ?? []) as unknown as PengabdianReportRow[])
    .filter((row) => studentById.has(row.pengabdian_id));
  const weeklyReports = reportRows.filter((row) => row.tipe === "Weekly");
  const dailyReports = reportRows.filter((row) => row.tipe === "Daily");
  const monthlyReports = reportRows.filter((row) => row.tipe === "Monthly");
  const [weeklyDetailsResult, dailyDetailsResult, evaluationsResult] = await Promise.all([
    weeklyReports.length
      ? supabase.from("pengabdian_report_weekly").select("report_id,minggu_label,progres_sow_status,progres_sow_pct,highlight,lowlight,refleksi").in("report_id", weeklyReports.map((row) => row.id))
      : Promise.resolve({ data: [], error: null }),
    dailyReports.length
      ? supabase.from("pengabdian_report_daily").select("report_id,tanggal,rencana,pagi_dikirim_pada,recap,kendala,mood,sore_dikirim_pada").in("report_id", dailyReports.map((row) => row.id))
      : Promise.resolve({ data: [], error: null }),
    monthlyReports.length
      ? supabase.from("pengabdian_report_monthly_evaluation").select("id,report_id,pct_sow,skor_adab,jumlah_learn,status_gyr,eligible_mukafaah,catatan_pic_div,dibuat_pada,diperbarui_pada").in("report_id", monthlyReports.map((row) => row.id))
      : Promise.resolve({ data: [], error: null }),
  ]);
  const detailError = weeklyDetailsResult.error ?? dailyDetailsResult.error ?? evaluationsResult.error;
  if (detailError) throw new Error(`Gagal memuat progres divisi: ${detailError.message}`);

  const weeklyDetails = (weeklyDetailsResult.data ?? []) as unknown as PengabdianReportWeeklyRow[];
  const dailyDetails = (dailyDetailsResult.data ?? []) as unknown as PengabdianReportDailyRow[];
  const evaluations = (evaluationsResult.data ?? []) as unknown as Pick<PengabdianReportMonthlyEvaluationRow, "id" | "report_id" | "pct_sow" | "skor_adab" | "jumlah_learn" | "status_gyr" | "eligible_mukafaah" | "catatan_pic_div" | "dibuat_pada" | "diperbarui_pada">[];
  const reportById = new Map(reportRows.map((row) => [row.id, row]));

  const pendingWeekly = weeklyDetails
    .map((detail) => ({ detail, report: reportById.get(detail.report_id) }))
    .filter((entry) => entry.report?.status === "Terkirim")
    .map(({ detail, report }) => {
      const student = studentById.get(report!.pengabdian_id)!;
      return { reportId: report!.id, studentName: student.name, studentCode: student.code, week: detail.minggu_label, sowStatus: detail.progres_sow_status ?? "Belum dinilai", highlight: detail.highlight, lowlight: detail.lowlight };
    });

  const latestEvaluationByStudent = new Map<string, { evaluation: typeof evaluations[number]; report: PengabdianReportRow }>();
  evaluations.forEach((evaluation) => {
    const report = reportById.get(evaluation.report_id);
    if (!report) return;
    const current = latestEvaluationByStudent.get(report.pengabdian_id);
    if (!current || report.periode_mulai > current.report.periode_mulai) latestEvaluationByStudent.set(report.pengabdian_id, { evaluation, report });
  });
  const latestEvaluations = [...latestEvaluationByStudent.entries()];
  const atRisk: PicDivRiskItem[] = latestEvaluations
    .filter(([, value]) => value.evaluation.status_gyr === "Yellow" || value.evaluation.status_gyr === "Red")
    .map(([id, value]) => ({ pengabdianId: id, studentName: studentById.get(id)?.name ?? id.slice(0, 8), studentCode: studentById.get(id)?.code ?? id.slice(0, 8), gyr: value.evaluation.status_gyr as "Yellow" | "Red", sowProgress: value.evaluation.pct_sow ?? 0, adabScore: value.evaluation.skor_adab ?? 0, learnCount: value.evaluation.jumlah_learn ?? 0, note: value.evaluation.catatan_pic_div }));
  const lowProgress = latestEvaluations
    .filter(([, value]) => (value.evaluation.pct_sow ?? 0) < 60)
    .map(([id, value]) => ({ pengabdianId: id, studentName: studentById.get(id)?.name ?? id.slice(0, 8), studentCode: studentById.get(id)?.code ?? id.slice(0, 8), sowProgress: value.evaluation.pct_sow ?? 0, note: value.evaluation.catatan_pic_div }));
  const averageSowProgress = latestEvaluations.length
    ? Math.round(latestEvaluations.reduce((sum, [, value]) => sum + (value.evaluation.pct_sow ?? 0), 0) / latestEvaluations.length)
    : 0;
  const mood = dailyDetails.reduce((result, row) => {
    if (row.mood === "Good") result.good++;
    if (row.mood === "Okay") result.okay++;
    if (row.mood === "Tough") result.tough++;
    result.total++;
    return result;
  }, { good: 0, okay: 0, tough: 0, total: 0 });
  const projectRows = (projectsResult.data ?? []) as unknown as Pick<PengabdianProjectRow, "id" | "status" | "is_wajib" | "divisi_id">[];
  const projectStats = projectRows.reduce<Record<string, number>>((result, row) => {
    const key = row.status ?? "Unknown";
    result[key] = (result[key] ?? 0) + 1;
    return result;
  }, {});

  return {
    division: { id: division.id, code: division.kode_divisi, name: division.nama_divisi },
    students,
    pendingWeekly,
    atRisk,
    lowProgress,
    averageSowProgress,
    projectStats,
    totalProjects: projectRows.length,
    mandatoryProjects: projectRows.filter((row) => row.is_wajib).length,
    mood: { ...mood, total: mood.total || 1 },
  };
}
