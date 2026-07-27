import { supabase } from "../../lib/supabase/client";
import type {
  KesiswaanRow,
  PengabdianLokasiRow,
  PengabdianRegionRow,
  PengabdianReportMonthlyEvaluationRow,
  PengabdianReportRow,
  PengabdianSantri,
  PenempatanSantriRow,
} from "../../lib/supabase/types";
import type { PengabdianRiskReportViewRow } from "../monitoring";
import { getAdminMappingData } from "../admin/admin.repository";
import type { PicRegDashboardData, PicRegMappingData, PicRegWarningItem } from "./picReg.model";

export async function getPicRegMappingData(regionId: string): Promise<PicRegMappingData> {
  const [regionResult, locationsResult, mapping] = await Promise.all([
    supabase.from("pengabdian_region").select("id,nama_region").eq("id", regionId).single(),
    supabase.from("pengabdian_lokasi").select("id,nama_lokasi,region_id").eq("region_id", regionId).order("nama_lokasi"),
    getAdminMappingData(),
  ]);
  const error = regionResult.error ?? locationsResult.error;
  if (error) throw new Error(`Gagal memuat mapping regional: ${error.message}`);

  const region = regionResult.data as unknown as Pick<PengabdianRegionRow, "id" | "nama_region">;
  const locations = (locationsResult.data ?? []) as unknown as Pick<PengabdianLokasiRow, "id" | "nama_lokasi" | "region_id">[];
  const locationIds = new Set(locations.map((location) => location.id));
  return {
    region: { id: region.id, name: region.nama_region },
    locations: locations.map((location) => ({ id: location.id, name: location.nama_lokasi })),
    students: mapping.santri.filter((student) => Boolean(student.locationId && locationIds.has(student.locationId))),
  };
}

export async function getPicRegDashboard(regionId: string): Promise<PicRegDashboardData> {
  const [regionResult, locationsResult] = await Promise.all([
    supabase.from("pengabdian_region").select("id,nama_region,pic_reg_id,dibuat_pada").eq("id", regionId).single(),
    supabase.from("pengabdian_lokasi").select("id,nama_lokasi,region_id").eq("region_id", regionId).order("nama_lokasi"),
  ]);
  const scopeError = regionResult.error ?? locationsResult.error;
  if (scopeError) throw new Error(`Gagal memuat scope regional: ${scopeError.message}`);

  const region = regionResult.data as unknown as PengabdianRegionRow;
  const locationRows = (locationsResult.data ?? []) as unknown as Pick<PengabdianLokasiRow, "id" | "nama_lokasi" | "region_id">[];
  const locationIds = locationRows.map((row) => row.id);
  const placementsResult = locationIds.length
    ? await supabase.from("pengabdian_penempatan_santri").select("id,pengabdian_id,lokasi_id,status").in("lokasi_id", locationIds)
    : { data: [], error: null };
  if (placementsResult.error) throw new Error(`Gagal memuat placement regional: ${placementsResult.error.message}`);

  const placements = ((placementsResult.data ?? []) as unknown as Pick<PenempatanSantriRow, "id" | "pengabdian_id" | "lokasi_id" | "status">[])
    .filter((row) => !row.status || row.status === "Aktif");
  const scopedPengabdianIds = [...new Set(placements.map((row) => row.pengabdian_id))];
  const [studentsResult, reportsResult, risksResult] = scopedPengabdianIds.length
    ? await Promise.all([
        supabase.from("pengabdian_santri").select("id,siswa_id,kode_santri,status").in("id", scopedPengabdianIds),
        supabase.from("pengabdian_report").select("id,pengabdian_id,tipe,periode_mulai,periode_selesai,status,versi,dikirim_pada,dibuat_pada,diperbarui_pada").in("pengabdian_id", scopedPengabdianIds).eq("tipe", "Monthly"),
        supabase.from("v_pengabdian_risk_report").select("*").in("pengabdian_id", scopedPengabdianIds).order("dibuat_pada", { ascending: false }),
      ])
    : [{ data: [], error: null }, { data: [], error: null }, { data: [], error: null }];
  const regionalError = studentsResult.error ?? reportsResult.error ?? risksResult.error;
  if (regionalError) throw new Error(`Gagal memuat data regional: ${regionalError.message}`);

  const students = ((studentsResult.data ?? []) as unknown as Pick<PengabdianSantri, "id" | "siswa_id" | "kode_santri" | "status">[])
    .filter((row) => row.status === "Aktif");
  const activeIds = new Set(students.map((row) => row.id));
  const reports = ((reportsResult.data ?? []) as unknown as PengabdianReportRow[]).filter((row) => activeIds.has(row.pengabdian_id));
  const siswaIds = students.map((row) => row.siswa_id);
  const [identitiesResult, evaluationsResult] = await Promise.all([
    siswaIds.length ? supabase.from("kesiswaan").select("id,nis,nama_lengkap").in("id", siswaIds) : Promise.resolve({ data: [], error: null }),
    reports.length ? supabase.from("pengabdian_report_monthly_evaluation").select("id,report_id,pct_sow,skor_adab,jumlah_learn,jumlah_project_acc,status_gyr,eligible_mukafaah,dibuat_pada,diperbarui_pada").in("report_id", reports.map((row) => row.id)) : Promise.resolve({ data: [], error: null }),
  ]);
  const detailError = identitiesResult.error ?? evaluationsResult.error;
  if (detailError) throw new Error(`Gagal memuat evaluasi regional: ${detailError.message}`);

  const identities = (identitiesResult.data ?? []) as unknown as Pick<KesiswaanRow, "id" | "nis" | "nama_lengkap">[];
  const evaluations = (evaluationsResult.data ?? []) as unknown as Pick<PengabdianReportMonthlyEvaluationRow, "id" | "report_id" | "pct_sow" | "skor_adab" | "jumlah_learn" | "jumlah_project_acc" | "status_gyr" | "eligible_mukafaah" | "dibuat_pada" | "diperbarui_pada">[];
  const identityById = new Map(identities.map((row) => [row.id, row]));
  const studentById = new Map(students.map((row) => [row.id, row]));
  const reportById = new Map(reports.map((row) => [row.id, row]));
  const placementByStudentId = new Map(placements.map((row) => [row.pengabdian_id, row]));
  const locationById = new Map(locationRows.map((row) => [row.id, row]));
  const studentLabel = (pengabdianId: string) => {
    const student = studentById.get(pengabdianId);
    const identity = student ? identityById.get(student.siswa_id) : undefined;
    return { name: identity?.nama_lengkap ?? "Santri tanpa nama", code: student?.kode_santri ?? identity?.nis ?? pengabdianId.slice(0, 8) };
  };
  const studentLocation = (pengabdianId: string) => {
    const locationId = placementByStudentId.get(pengabdianId)?.lokasi_id;
    return locationId ? locationById.get(locationId)?.nama_lokasi ?? "Lokasi tidak terbaca" : "Belum ditempatkan";
  };

  const latestEvaluationByStudent = new Map<string, { evaluation: typeof evaluations[number]; report: PengabdianReportRow }>();
  evaluations.forEach((evaluation) => {
    const report = reportById.get(evaluation.report_id);
    if (!report) return;
    const current = latestEvaluationByStudent.get(report.pengabdian_id);
    if (!current || report.periode_mulai > current.report.periode_mulai) latestEvaluationByStudent.set(report.pengabdian_id, { evaluation, report });
  });

  const locations = locationRows.map((location) => {
    const studentIds = placements.filter((row) => row.lokasi_id === location.id && activeIds.has(row.pengabdian_id)).map((row) => row.pengabdian_id);
    const statuses = studentIds.map((id) => latestEvaluationByStudent.get(id)?.evaluation.status_gyr);
    return {
      id: location.id,
      name: location.nama_lokasi,
      totalStudents: studentIds.length,
      green: statuses.filter((value) => value === "Green").length,
      yellow: statuses.filter((value) => value === "Yellow").length,
      red: statuses.filter((value) => value === "Red").length,
    };
  });

  const pendingApprovals = reports
    .filter((report) => report.status === "Divalidasi")
    .map((report) => ({ reportId: report.id, studentName: studentLabel(report.pengabdian_id).name, studentCode: studentLabel(report.pengabdian_id).code, location: studentLocation(report.pengabdian_id), period: formatPeriod(report.periode_mulai) }));

  const risks = ((risksResult.data ?? []) as unknown as PengabdianRiskReportViewRow[])
    .filter((row) => activeIds.has(row.pengabdian_id) && row.status !== "Resolved" && row.status !== "Closed");
  const warnings: PicRegWarningItem[] = risks.map((risk) => ({ id: risk.id, studentName: risk.nama_santri, location: studentLocation(risk.pengabdian_id), title: risk.judul, description: risk.deskripsi, severity: risk.severity }));
  const riskStudentIds = new Set(risks.map((risk) => risk.pengabdian_id));
  latestEvaluationByStudent.forEach(({ evaluation }, pengabdianId) => {
    if ((evaluation.status_gyr !== "Yellow" && evaluation.status_gyr !== "Red") || riskStudentIds.has(pengabdianId)) return;
    warnings.push({
      id: `evaluation-${evaluation.id}`,
      studentName: studentLabel(pengabdianId).name,
      location: studentLocation(pengabdianId),
      title: `Evaluasi bulanan ${evaluation.status_gyr}`,
      description: `SoW ${evaluation.pct_sow ?? 0}% · Adab ${evaluation.skor_adab ?? 0}/5`,
      severity: evaluation.status_gyr === "Red" ? "High" : "Medium",
    });
  });

  const mukafaah = [...latestEvaluationByStudent.entries()].map(([pengabdianId, { evaluation, report }]) => ({
    evaluationId: evaluation.id,
    reportId: report.id,
    studentName: studentLabel(pengabdianId).name,
    studentCode: studentLabel(pengabdianId).code,
    location: studentLocation(pengabdianId),
    period: formatPeriod(report.periode_mulai),
    reportStatus: report.status,
    sowProgress: evaluation.pct_sow ?? 0,
    adabScore: evaluation.skor_adab ?? 0,
    learnCount: evaluation.jumlah_learn ?? 0,
    projectCount: evaluation.jumlah_project_acc ?? 0,
    ready: Boolean(evaluation.eligible_mukafaah),
    gyr: evaluation.status_gyr,
  })).sort((a, b) => Number(b.ready) - Number(a.ready) || b.sowProgress - a.sowProgress);

  return {
    region: { id: region.id, name: region.nama_region },
    totalStudents: students.length,
    atRiskCount: [...latestEvaluationByStudent.values()].filter(({ evaluation }) => evaluation.status_gyr === "Yellow" || evaluation.status_gyr === "Red").length,
    mukafaahReadyCount: mukafaah.filter((item) => item.ready).length,
    locations,
    pendingApprovals,
    warnings,
    mukafaah,
  };
}

function formatPeriod(value: string) {
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}
