import { supabase } from "../../lib/supabase/client";
import type {
  KesiswaanRow,
  PengabdianClarificationRow,
  PengabdianDivisiRow,
  PengabdianProjectOwnerRow,
  PengabdianProjectRow,
  PengabdianReportAttachmentRow,
  PengabdianReportMonthlyEvaluationRow,
  PengabdianReportReviewRow,
  PengabdianReportRow,
  PengabdianRoleRow,
  PengabdianSantri,
  PengabdianSpecialReportRow,
  PengabdianStaff,
  PengabdianUnitRow,
  PengabdianLokasiRow,
  PenempatanSantriRow,
  PenugasanDivisiRow,
} from "../../lib/supabase/types";
import type {
  DailyReportInput,
  EvidenceInput,
  MonthlyReportInput,
  RemindPicInput,
  SpecialReportInput,
  StudentReportItem,
  StudentWorkspaceData,
  WeeklyReportInput,
} from "./siswa.model";

const attachmentBucket = "pengabdian-report-attachments";

export async function getStudentWorkspace(authUserId: string): Promise<StudentWorkspaceData> {
  const studentResult = await supabase.from("pengabdian_santri").select("*").eq("auth_user_id", authUserId).single();
  if (studentResult.error) throw new Error(`Gagal memuat profil pengabdian: ${studentResult.error.message}`);
  const student = studentResult.data as PengabdianSantri;

  const [identityResult, placementResult, reportsResult, ownersResult, clarificationsResult, specialResult] = await Promise.all([
    supabase.from("kesiswaan").select("id,nis,nama_lengkap,foto_url").eq("id", student.siswa_id).single(),
    supabase.from("pengabdian_penempatan_santri").select("*").eq("pengabdian_id", student.id).maybeSingle(),
    supabase.from("pengabdian_report").select("*").eq("pengabdian_id", student.id).order("periode_mulai", { ascending: false }),
    supabase.from("pengabdian_project_owner").select("*").eq("pengabdian_id", student.id),
    supabase.from("pengabdian_clarification").select("*").eq("pengabdian_id", student.id).order("dibuat_pada", { ascending: false }),
    supabase.from("pengabdian_special_report").select("*").eq("pengabdian_id", student.id).order("dibuat_pada", { ascending: false }),
  ]);
  const baseError = identityResult.error ?? placementResult.error ?? reportsResult.error ?? ownersResult.error ?? clarificationsResult.error ?? specialResult.error;
  if (baseError) throw new Error(`Gagal memuat ruang kerja Santri: ${baseError.message}`);

  const identity = identityResult.data as unknown as Pick<KesiswaanRow, "id" | "nis" | "nama_lengkap" | "foto_url">;
  const placement = placementResult.data as unknown as PenempatanSantriRow | null;
  const reportRows = (reportsResult.data ?? []) as unknown as PengabdianReportRow[];
  const ownerRows = (ownersResult.data ?? []) as unknown as PengabdianProjectOwnerRow[];
  const clarificationRows = (clarificationsResult.data ?? []) as unknown as PengabdianClarificationRow[];
  const specialRows = (specialResult.data ?? []) as unknown as PengabdianSpecialReportRow[];
  const reportIds = reportRows.map((report) => report.id);

  const [assignmentsResult, unitResult, locationResult, attachmentsResult, reviewsResult, evaluationsResult, projectsResult] = await Promise.all([
    placement ? supabase.from("pengabdian_penugasan_divisi").select("*").eq("penempatan_id", placement.id) : Promise.resolve({ data: [], error: null }),
    placement?.unit_id ? supabase.from("pengabdian_unit").select("*").eq("id", placement.unit_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    placement?.lokasi_id ? supabase.from("pengabdian_lokasi").select("*").eq("id", placement.lokasi_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    reportIds.length ? supabase.from("pengabdian_report_attachment").select("*").in("report_id", reportIds) : Promise.resolve({ data: [], error: null }),
    reportIds.length ? supabase.from("pengabdian_report_review").select("*").in("report_id", reportIds).order("dibuat_pada", { ascending: false }) : Promise.resolve({ data: [], error: null }),
    reportIds.length ? supabase.from("pengabdian_report_monthly_evaluation").select("*").in("report_id", reportIds).order("dibuat_pada", { ascending: false }) : Promise.resolve({ data: [], error: null }),
    ownerRows.length ? supabase.from("pengabdian_projects").select("*").in("id", ownerRows.map((owner) => owner.project_id)).order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
  ]);
  const relationError = assignmentsResult.error ?? unitResult.error ?? locationResult.error ?? attachmentsResult.error ?? reviewsResult.error ?? evaluationsResult.error ?? projectsResult.error;
  if (relationError) throw new Error(`Gagal memuat detail ruang kerja: ${relationError.message}`);

  const assignments = ((assignmentsResult.data ?? []) as unknown as PenugasanDivisiRow[]).filter((row) => !row.status || row.status === "Aktif");
  const divisionIds = [...new Set(assignments.map((assignment) => assignment.divisi_id))];
  const staffIds = [...new Set([placement?.pic_reg_id, ...assignments.map((assignment) => assignment.pic_div_id)].filter((id): id is string => Boolean(id)))];
  const [divisionsResult, rolesResult, staffResult] = await Promise.all([
    divisionIds.length ? supabase.from("pengabdian_divisi").select("*").in("id", divisionIds) : Promise.resolve({ data: [], error: null }),
    divisionIds.length ? supabase.from("pengabdian_role").select("*").in("divisi_id", divisionIds) : Promise.resolve({ data: [], error: null }),
    staffIds.length ? supabase.from("pengabdian_staff").select("*").in("id", staffIds) : Promise.resolve({ data: [], error: null }),
  ]);
  const mappingError = divisionsResult.error ?? rolesResult.error ?? staffResult.error;
  if (mappingError) throw new Error(`Gagal memuat mapping Santri: ${mappingError.message}`);

  const divisions = (divisionsResult.data ?? []) as unknown as PengabdianDivisiRow[];
  const roles = ((rolesResult.data ?? []) as unknown as PengabdianRoleRow[]).filter((role) => role.status !== "Inactive");
  const staff = (staffResult.data ?? []) as unknown as PengabdianStaff[];
  const staffById = new Map(staff.map((row) => [row.id, row.nama_lengkap]));
  const reviews = (reviewsResult.data ?? []) as unknown as PengabdianReportReviewRow[];
  const evaluations = (evaluationsResult.data ?? []) as unknown as PengabdianReportMonthlyEvaluationRow[];
  const latestEvaluation = evaluations[0];
  const latestEvaluationReport = latestEvaluation ? reportRows.find((report) => report.id === latestEvaluation.report_id) : undefined;
  const latestReview = reviews.find((review) => Boolean(review.catatan));
  const projectRows = (projectsResult.data ?? []) as unknown as PengabdianProjectRow[];
  const unit = unitResult.data as unknown as PengabdianUnitRow | null;
  const location = locationResult.data as unknown as PengabdianLokasiRow | null;
  const sow = roles.reduce<Record<string, string[]>>((result, role) => {
    result[role.nama_role] = [role.default_sow_summary, role.self_study ? `Self study: ${role.self_study}` : null].filter((value): value is string => Boolean(value));
    return result;
  }, {});

  return {
    profile: {
      pengabdianId: student.id,
      code: student.kode_santri ?? identity.nis,
      name: identity.nama_lengkap,
      avatarUrl: identity.foto_url,
      unit: unit?.nama_unit ?? "Belum ditempatkan",
      location: location?.nama_lokasi ?? "Belum ditempatkan",
      divisions: divisions.map((division) => division.nama_divisi),
      roles: roles.map((role) => role.nama_role),
      sow,
      picDivisions: assignments.map((assignment) => assignment.pic_div_id ? staffById.get(assignment.pic_div_id) : null).filter((value): value is string => Boolean(value)),
      picRegional: placement?.pic_reg_id ? staffById.get(placement.pic_reg_id) ?? "PIC Regional belum terbaca" : "Belum ditentukan",
    },
    reports: reportRows.map(mapStudentReport),
    latestEvaluation: latestEvaluation ? {
      period: latestEvaluationReport ? new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(`${latestEvaluationReport.periode_mulai}T00:00:00`)) : "Periode terbaru",
      sowProgress: latestEvaluation.pct_sow ?? 0,
      adabScore: latestEvaluation.skor_adab ?? 0,
      disciplineScore: latestEvaluation.skor_kedisiplinan ?? 0,
      learnCount: latestEvaluation.jumlah_learn ?? 0,
      projectCount: latestEvaluation.jumlah_project_acc ?? 0,
      checkinCount: latestEvaluation.jumlah_checkin ?? 0,
      gyr: latestEvaluation.status_gyr,
      mukafaahReady: latestEvaluation.eligible_mukafaah,
    } : null,
    projects: projectRows.map((project) => ({ id: project.id, name: project.project_name ?? "Project tanpa nama", status: project.status ?? "Idea", progress: projectProgress(project.status), platform: project.platform ?? "", link: project.link ?? "" })),
    latestPicNote: latestReview?.catatan ? { note: latestReview.catatan, actor: latestReview.aktor_staff_id ? staffById.get(latestReview.aktor_staff_id) ?? "PIC" : "PIC", createdAt: latestReview.dibuat_pada } : null,
    openClarifications: clarificationRows.filter((row) => row.status === "Open" || row.status === "Adjustment_Requested").length,
    evidenceCount: ((attachmentsResult.data ?? []) as unknown as PengabdianReportAttachmentRow[]).length,
    specialReportCount: specialRows.length,
    primaryAssignmentId: assignments[0]?.id ?? null,
    primaryPicDivisionId: assignments[0]?.pic_div_id ?? null,
  };
}

export async function submitDailyReport(pengabdianId: string, input: DailyReportInput) {
  const { start, end } = dailyPeriod();
  const reportId = await ensureEditableReport(pengabdianId, "Daily", start, end);
  const now = new Date().toISOString();
  const { error } = await supabase.from("pengabdian_report_daily").upsert({ report_id: reportId, tanggal: start, rencana: input.plan || null, recap: input.recap || null, kendala: input.blocker || null, mood: input.mood, pagi_dikirim_pada: input.plan ? now : null, sore_dikirim_pada: input.recap || input.blocker ? now : null } as never, { onConflict: "report_id" });
  if (error) throw new Error(`Gagal menyimpan Daily Check-in: ${error.message}`);
  await markSubmitted(reportId);
}

export async function submitWeeklyReport(pengabdianId: string, input: WeeklyReportInput) {
  const { start, end } = weeklyPeriod();
  const reportId = await ensureEditableReport(pengabdianId, "Weekly", start, end);
  const { error } = await supabase.from("pengabdian_report_weekly").upsert({ report_id: reportId, minggu_label: `${formatShort(start)} - ${formatShort(end)}`, progres_sow_status: input.progressStatus, progres_sow_pct: input.progressPercent, highlight: input.highlight || null, lowlight: input.lowlight || null, refleksi: input.reflection || null } as never, { onConflict: "report_id" });
  if (error) throw new Error(`Gagal menyimpan Weekly Review: ${error.message}`);
  await markSubmitted(reportId);
}

export async function submitMonthlyReport(pengabdianId: string, input: MonthlyReportInput) {
  const { start, end } = monthlyPeriod();
  const reportId = await ensureEditableReport(pengabdianId, "Monthly", start, end);
  const date = new Date(`${start}T00:00:00`);
  const { error } = await supabase.from("pengabdian_report_monthly").upsert({ report_id: reportId, bulan: date.getMonth() + 1, tahun: date.getFullYear(), refleksi: input.reflection || null, pencapaian: input.achievement || null, tantangan: input.challenge || null, rencana_bulan_depan: input.nextPlan || null } as never, { onConflict: "report_id" });
  if (error) throw new Error(`Gagal menyimpan Monthly Report: ${error.message}`);
  await markSubmitted(reportId);
}

export async function submitSpecialReport(pengabdianId: string, input: SpecialReportInput) {
  const { error } = await supabase.from("pengabdian_special_report").insert({ pengabdian_id: pengabdianId, kategori: input.category, judul: input.title.trim(), deskripsi: input.description.trim(), status: "Terkirim" } as never);
  if (error) throw new Error(`Gagal mengirim Special Report: ${error.message}`);
}

export async function uploadStudentEvidence(pengabdianId: string, authUserId: string, input: EvidenceInput) {
  const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${pengabdianId}/${input.reportId}/${crypto.randomUUID()}-${safeName}`;
  const upload = await supabase.storage.from(attachmentBucket).upload(path, input.file, { upsert: false, contentType: input.file.type || undefined });
  if (upload.error) throw new Error(`Upload evidence gagal: ${upload.error.message}`);
  const { error } = await supabase.from("pengabdian_report_attachment").insert({ report_id: input.reportId, storage_bucket: attachmentBucket, storage_path: path, nama_file: input.file.name, mime_type: input.file.type || null, ukuran_byte: input.file.size, diunggah_oleh: authUserId } as never);
  if (error) {
    await supabase.storage.from(attachmentBucket).remove([path]);
    throw new Error(`Metadata evidence gagal disimpan: ${error.message}`);
  }
}

export async function remindStudentPic(pengabdianId: string, assignmentId: string | null, picDivisionId: string | null, input: RemindPicInput) {
  const { error } = await supabase.from("pengabdian_clarification").insert({ pengabdian_id: pengabdianId, report_id: input.reportId, penugasan_divisi_id: assignmentId, tipe: "Report", pertanyaan: input.message.trim(), pic_div_id: picDivisionId, status: "Open" } as never);
  if (error) throw new Error(`Gagal mengirim permintaan review: ${error.message}`);
}

async function ensureEditableReport(pengabdianId: string, type: "Daily" | "Weekly" | "Monthly", start: string, end: string) {
  const existing = await supabase.from("pengabdian_report").select("id,status").eq("pengabdian_id", pengabdianId).eq("tipe", type).eq("periode_mulai", start).maybeSingle();
  if (existing.error) throw new Error(`Gagal memeriksa report: ${existing.error.message}`);
  const current = existing.data as unknown as Pick<PengabdianReportRow, "id" | "status"> | null;
  if (current) {
    if (current.status === "Divalidasi" || current.status === "Disetujui") throw new Error("Report periode ini sudah direview dan tidak dapat diubah.");
    return current.id;
  }
  const created = await supabase.from("pengabdian_report").insert({ pengabdian_id: pengabdianId, tipe: type, periode_mulai: start, periode_selesai: end, status: "Draft" } as never).select("id").single();
  if (created.error) throw new Error(`Gagal membuat report: ${created.error.message}`);
  return (created.data as { id: string }).id;
}

async function markSubmitted(reportId: string) {
  const { error } = await supabase.from("pengabdian_report").update({ status: "Terkirim", dikirim_pada: new Date().toISOString() } as never).eq("id", reportId);
  if (error) throw new Error(`Report tersimpan tetapi gagal dikirim: ${error.message}`);
}

function mapStudentReport(report: PengabdianReportRow): StudentReportItem {
  return { id: report.id, type: report.tipe, status: report.status, periodStart: report.periode_mulai, periodEnd: report.periode_selesai, submittedAt: report.dikirim_pada, summary: `${report.tipe} · ${formatShort(report.periode_mulai)}` };
}
function projectProgress(status: string | null) { return status === "Approved" ? 100 : status === "Submitted" ? 80 : status === "In Progress" ? 50 : status === "Archived" ? 100 : 10; }
function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function dailyPeriod() { const key = dateKey(new Date()); return { start: key, end: key }; }
function weeklyPeriod() { const start = new Date(); const day = (start.getDay() + 6) % 7; start.setDate(start.getDate() - day); const end = new Date(start); end.setDate(start.getDate() + 6); return { start: dateKey(start), end: dateKey(end) }; }
function monthlyPeriod() { const now = new Date(); return { start: dateKey(new Date(now.getFullYear(), now.getMonth(), 1)), end: dateKey(new Date(now.getFullYear(), now.getMonth() + 1, 0)) }; }
function formatShort(value: string) { return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)); }
