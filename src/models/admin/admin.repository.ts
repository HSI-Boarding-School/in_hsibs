import { supabase } from "../../lib/supabase/client";
import type {
  AuditLogRow,
  PengabdianDivisiRow,
  PengabdianLokasiRow,
  PengabdianRoleRow,
  PengabdianSantri,
  PengabdianStaff,
  PengabdianUnitRow,
  KesiswaanRow,
  PenempatanSantriRow,
  PenugasanDivisiRow,
} from "../../lib/supabase/types";
import type { Santri } from "../../data/santriData";
import type {
  AdminAlert,
  AdminDashboardSnapshot,
  AdminDataFilter,
  AdminMappingData,
} from "./admin.model";

function relativeTime(value: string | null) {
  if (!value) return "Baru saja";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

function mapStatus(status: PengabdianSantri["status"] | null | undefined): Santri["status"] {
  if (status === "Aktif") return "Active";
  if (status === "Ditangguhkan") return "On Hold";
  if (status === "Selesai") return "Alumni";
  return "Inactive";
}

function compactUnique(values: (string | null | undefined)[]) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function buildSowItems(role: Pick<PengabdianRoleRow, "default_sow_summary" | "self_study">) {
  return compactUnique([
    role.default_sow_summary,
    role.self_study ? `Self study: ${role.self_study}` : null,
  ]);
}

export async function getAdminDashboardSnapshot(
  filter: AdminDataFilter = {},
): Promise<AdminDashboardSnapshot> {
  void filter;
  const [students, placements, assignments, divisions, locations, audits] = await Promise.all([
    supabase.from("pengabdian_santri").select("id,status"),
    supabase.from("pengabdian_penempatan_santri").select("id,unit_id,lokasi_id,pic_reg_id"),
    supabase.from("pengabdian_penugasan_divisi").select("id,divisi_id,pic_div_id,disetujui_oleh"),
    supabase.from("pengabdian_divisi").select("id,nama_divisi").order("nama_divisi"),
    supabase.from("pengabdian_lokasi").select("id,nama_lokasi").order("nama_lokasi"),
    supabase.from("audit_log").select("id,aktor_id,tipe_entitas,id_entitas,aksi,dibuat_pada").order("dibuat_pada", { ascending: false }).limit(8),
  ]);

  const error = students.error ?? placements.error ?? assignments.error ?? divisions.error ?? locations.error ?? audits.error;
  if (error) throw new Error(`Gagal memuat ringkasan admin: ${error.message}`);

  const studentRows = (students.data ?? []) as unknown as Pick<
    PengabdianSantri,
    "id" | "status"
  >[];
  const placementRows = (placements.data ?? []) as unknown as Pick<
    PenempatanSantriRow,
    "id" | "unit_id" | "lokasi_id" | "pic_reg_id"
  >[];
  const assignmentRows = (assignments.data ?? []) as unknown as Pick<
    PenugasanDivisiRow,
    "id" | "divisi_id" | "pic_div_id" | "disetujui_oleh"
  >[];
  const divisionRows = (divisions.data ?? []) as unknown as Pick<
    PengabdianDivisiRow,
    "id" | "nama_divisi"
  >[];
  const locationRows = (locations.data ?? []) as unknown as Pick<
    PengabdianLokasiRow,
    "id" | "nama_lokasi"
  >[];
  const auditRows = (audits.data ?? []) as unknown as Pick<
    AuditLogRow,
    "id" | "aktor_id" | "tipe_entitas" | "id_entitas" | "aksi" | "dibuat_pada"
  >[];
  const pendingApprovals = assignmentRows.filter((row) => !row.disetujui_oleh).length;
  const incompletePlacements = placementRows.filter(
    (row) => !row.unit_id || !row.lokasi_id || !row.pic_reg_id,
  ).length;
  const incompleteAssignments = assignmentRows.filter(
    (row) => !row.divisi_id || !row.pic_div_id,
  ).length;
  const requiredFields = placementRows.length * 3 + assignmentRows.length * 2;
  const completedFields =
    placementRows.reduce(
      (sum, row) => sum + Number(Boolean(row.unit_id)) + Number(Boolean(row.lokasi_id)) + Number(Boolean(row.pic_reg_id)),
      0,
    ) +
    assignmentRows.reduce(
      (sum, row) => sum + Number(Boolean(row.divisi_id)) + Number(Boolean(row.pic_div_id)),
      0,
    );
  const alerts: AdminAlert[] = [];

  if (pendingApprovals > 0) {
    alerts.push({
      id: "pending-approval",
      title: "Assignment menunggu persetujuan",
      detail: `${pendingApprovals} penugasan divisi belum memiliki approval.`,
      level: "High",
    });
  }
  if (incompletePlacements > 0) {
    alerts.push({
      id: "incomplete-placement",
      title: "Placement belum lengkap",
      detail: `${incompletePlacements} placement belum memiliki unit, lokasi, atau PIC regional lengkap.`,
      level: "Medium",
    });
  }
  if (incompleteAssignments > 0) {
    alerts.push({
      id: "incomplete-assignment",
      title: "PIC divisi belum ditentukan",
      detail: `${incompleteAssignments} assignment belum memiliki PIC divisi.`,
      level: "Info",
    });
  }

  const divisionCounts = new Map<string, number>();
  assignmentRows.forEach((row) => {
    divisionCounts.set(row.divisi_id, (divisionCounts.get(row.divisi_id) ?? 0) + 1);
  });
  const locationCounts = new Map<string, number>();
  placementRows.forEach((row) => {
    if (row.lokasi_id) {
      locationCounts.set(row.lokasi_id, (locationCounts.get(row.lokasi_id) ?? 0) + 1);
    }
  });

  return {
    totalStudents: studentRows.length,
    activeStudents: studentRows.filter((row) => row.status === "Aktif").length,
    totalPlacements: placementRows.length,
    totalDivisionAssignments: assignmentRows.length,
    pendingApprovals,
    completenessScore: requiredFields ? Math.round((completedFields / requiredFields) * 100) : 0,
    divisionLoad: divisionRows.map((division) => ({
      label: division.nama_divisi,
      value: divisionCounts.get(division.id) ?? 0,
    })),
    locationLoad: locationRows.map((location) => ({
      label: location.nama_lokasi,
      value: locationCounts.get(location.id) ?? 0,
    })),
    alerts,
    auditLogs: auditRows.map((audit) => ({
      id: audit.id,
      actor: audit.aktor_id ? audit.aktor_id.slice(0, 8) : "System",
      action: audit.aksi,
      target: `${audit.tipe_entitas}${audit.id_entitas ? ` • ${audit.id_entitas.slice(0, 8)}` : ""}`,
      time: relativeTime(audit.dibuat_pada),
    })),
  };
}

export async function getAdminMappingData(
  filter: AdminDataFilter = {},
): Promise<AdminMappingData> {
  const [students, identities, placements, assignments, units, divisions, locations, roles] = await Promise.all([
    supabase.from("pengabdian_santri").select("id,siswa_id,kode_santri,status"),
    supabase.from("kesiswaan").select("id,nis,nama_lengkap"),
    supabase.from("pengabdian_penempatan_santri").select("id,pengabdian_id,unit_id,lokasi_id,pic_reg_id,status"),
    supabase.from("pengabdian_penugasan_divisi").select("id,penempatan_id,divisi_id,pic_div_id,status"),
    supabase.from("pengabdian_unit").select("id,kode_unit,nama_unit").order("nama_unit"),
    supabase.from("pengabdian_divisi").select("id,kode_divisi,nama_divisi").order("nama_divisi"),
    supabase.from("pengabdian_lokasi").select("id,nama_lokasi").order("nama_lokasi"),
    supabase.from("pengabdian_role").select("id,divisi_id,nama_role,role_code,default_sow_summary,self_study,status").order("nama_role"),
  ]);

  const error = students.error ?? identities.error ?? placements.error ?? assignments.error ?? units.error ?? divisions.error ?? locations.error ?? roles.error;
  if (error) throw new Error(`Gagal memuat data mapping: ${error.message}`);

  const staff = await supabase.from("pengabdian_staff").select("id,nama_lengkap");

  const studentRows = (students.data ?? []) as unknown as Pick<PengabdianSantri, "id" | "siswa_id" | "kode_santri" | "status">[];
  const identityRows = (identities.data ?? []) as unknown as Pick<KesiswaanRow, "id" | "nis" | "nama_lengkap">[];
  const placementRows = (placements.data ?? []) as unknown as Pick<PenempatanSantriRow, "id" | "pengabdian_id" | "unit_id" | "lokasi_id" | "pic_reg_id" | "status">[];
  const assignmentRows = (assignments.data ?? []) as unknown as Pick<PenugasanDivisiRow, "id" | "penempatan_id" | "divisi_id" | "pic_div_id" | "status">[];
  const unitRows = (units.data ?? []) as unknown as Pick<PengabdianUnitRow, "id" | "kode_unit" | "nama_unit">[];
  const divisionRows = (divisions.data ?? []) as unknown as Pick<PengabdianDivisiRow, "id" | "kode_divisi" | "nama_divisi">[];
  const locationRows = (locations.data ?? []) as unknown as Pick<PengabdianLokasiRow, "id" | "nama_lokasi">[];
  const roleRows = ((roles.data ?? []) as unknown as Pick<PengabdianRoleRow, "id" | "divisi_id" | "nama_role" | "role_code" | "default_sow_summary" | "self_study" | "status">[]).filter(
    (row) => row.status !== "Inactive",
  );
  const staffRows = staff.error ? [] : (staff.data ?? []) as unknown as Pick<PengabdianStaff, "id" | "nama_lengkap">[];

  const identityById = new Map(identityRows.map((row) => [row.id, row]));
  const placementByPengabdianId = new Map(placementRows.map((row) => [row.pengabdian_id, row]));
  const assignmentsByPlacementId = new Map<string, typeof assignmentRows>();
  assignmentRows.forEach((row) => {
    const current = assignmentsByPlacementId.get(row.penempatan_id) ?? [];
    current.push(row);
    assignmentsByPlacementId.set(row.penempatan_id, current);
  });
  const unitById = new Map(unitRows.map((row) => [row.id, row]));
  const divisionById = new Map(divisionRows.map((row) => [row.id, row]));
  const locationById = new Map(locationRows.map((row) => [row.id, row]));
  const staffById = new Map(staffRows.map((row) => [row.id, row]));
  const rolesByDivisionId = new Map<string, typeof roleRows>();
  roleRows.forEach((row) => {
    if (!row.divisi_id) return;
    const current = rolesByDivisionId.get(row.divisi_id) ?? [];
    current.push(row);
    rolesByDivisionId.set(row.divisi_id, current);
  });

  const scopeDivision = filter.divisionId
    ? divisionRows.find((row) => row.id === filter.divisionId)
    : undefined;
  const mappedSantri = studentRows.map((student, index) => {
      const identity = identityById.get(student.siswa_id);
      const placement = placementByPengabdianId.get(student.id);
      const studentAssignments = (placement ? assignmentsByPlacementId.get(placement.id) ?? [] : [])
        .filter((row) => !row.status || row.status === "Aktif");
      const divs = compactUnique(studentAssignments.map((row) => divisionById.get(row.divisi_id)?.kode_divisi));
      const picDivs = compactUnique(studentAssignments.map((row) => row.pic_div_id ? staffById.get(row.pic_div_id)?.nama_lengkap ?? "PIC Divisi belum terbaca" : null));
      const roleAssignments = studentAssignments.flatMap((row) => rolesByDivisionId.get(row.divisi_id) ?? []);
      const studentRoles = compactUnique(roleAssignments.map((row) => row.nama_role));
      const sow = roleAssignments.reduce<Record<string, string[]>>((acc, role) => {
        acc[role.nama_role] = buildSowItems(role);
        return acc;
      }, {});

      return {
        id: student.kode_santri || identity?.nis || `PENGABDIAN-${index + 1}`,
        pengabdianId: student.id,
        placementId: placement?.id,
        locationId: placement?.lokasi_id ?? undefined,
        name: identity?.nama_lengkap || "Santri tanpa nama",
        unit: (placement?.unit_id ? unitById.get(placement.unit_id)?.nama_unit : "") as Santri["unit"],
        loc: placement?.lokasi_id ? locationById.get(placement.lokasi_id)?.nama_lokasi ?? "Belum ditempatkan" : "Belum ditempatkan",
        divs,
        roles: studentRoles,
        sow,
        picDivs,
        picReg: placement?.pic_reg_id ? staffById.get(placement.pic_reg_id)?.nama_lengkap ?? "PIC Regional belum terbaca" : "",
        status: mapStatus(student.status),
      };
    });

  return {
    santri: scopeDivision
      ? mappedSantri.filter((student) => student.divs.includes(scopeDivision.kode_divisi))
      : mappedSantri,
    units: compactUnique(unitRows.map((row) => row.nama_unit)),
    divisions: divisionRows.map((row) => ({ code: row.kode_divisi, label: row.nama_divisi })),
    locations: compactUnique(locationRows.map((row) => row.nama_lokasi)),
    scopeDivision: scopeDivision
      ? { code: scopeDivision.kode_divisi, label: scopeDivision.nama_divisi }
      : undefined,
  };
}
