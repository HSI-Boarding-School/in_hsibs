import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { SantriCard } from "./components/SantriCard";
import { SantriDetailDrawer } from "./components/SantriDetailDrawer";
import { MappingToolbar, type FilterState } from "./components/MappingToolbar";
import type { Santri } from "../../../data/santriData";
import { KanbanBoard } from "../../../components/ui/KanbanBoard";
import type { KanbanColumnDef } from "../../../components/ui/KanbanBoard";
import { createMappingMaster, moveStudentMapping, useAdminMappingData } from "../../../models/admin";
import { useToast } from "../../../components/ui/ToastProvider";
import { getErrorMessage } from "../../../lib/errors";

type ViewTab = "santri" | "unit" | "divisi" | "lokasi" | "pic" | "projek";

type PendingMove = {
  activeId: string;
  activeCol: string;
  overCol: string;
  fieldLabel: string;
  fromLabel: string;
  toLabel: string;
  apply: () => Promise<void>;
};

const viewTabs: { id: ViewTab; label: string; icon: string }[] = [
  { id: "santri", label: "Santri View", icon: "solar:users-group-rounded-bold-duotone" },
  { id: "unit", label: "Unit View", icon: "solar:shop-2-bold-duotone" },
  { id: "divisi", label: "Divisi", icon: "solar:widget-4-bold-duotone" },
  { id: "lokasi", label: "Lokasi", icon: "solar:map-point-wave-bold-duotone" },
  { id: "pic", label: "PIC", icon: "solar:shield-user-bold-duotone" },
  { id: "projek", label: "Projek", icon: "solar:folder-with-files-bold-duotone" },
];

const defaultFilters: FilterState = {
  search: "",
  unit: [],
  div: [],
  loc: [],
  status: [],
};

export function AdminDashboardMapping() {
  const [viewTab, setViewTab] = useState<ViewTab>("santri");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const { data: mappingData, isLoading: mappingLoading, error: mappingError, refresh } = useAdminMappingData();
  const toast = useToast();
  const [activeSantriId, setActiveSantriId] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [moveSaving, setMoveSaving] = useState(false);
  const santriList = mappingData?.santri ?? [];
  const baseUnits = mappingData?.units ?? [];
  const baseDivisions = mappingData?.divisions ?? [];
  const baseLocations = mappingData?.locations ?? [];

  const activeSantri = useMemo(
    () => (activeSantriId ? santriList.find((s) => s.id === activeSantriId) ?? null : null),
    [activeSantriId, santriList],
  );

  const handleOpenSantri = useCallback((s: Santri) => {
    setActiveSantriId(s.id);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setActiveSantriId(null);
  }, []);

  const filtered = useMemo(() => {
    return santriList.filter((s) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q)) return false;
      }
      if (filters.unit.length && !filters.unit.includes(s.unit)) return false;
      if (filters.div.length && !s.divs.some((d) => filters.div.includes(d))) return false;
      if (filters.loc.length && !filters.loc.includes(s.loc)) return false;
      if (filters.status.length && !filters.status.includes(s.status)) return false;
      return true;
    });
  }, [santriList, filters]);

  const requestKanbanMove = useCallback(
    (move: PendingMove) => {
      const { overCol } = move;
      if (!overCol) return false;
      setPendingMove(move);
      return true;
    },
    [],
  );

  const confirmPendingMove = useCallback(async () => {
    if (!pendingMove || moveSaving) return;
    setMoveSaving(true);
    try {
      await pendingMove.apply();
      setPendingMove(null);
      toast.success("Mapping diperbarui", "Perubahan Santri sudah disimpan ke database.");
    } catch (error) {
      toast.error("Mapping gagal diperbarui", getErrorMessage(error, "Silakan coba lagi."));
      setMoveSaving(false);
      return;
    }
    try {
      await refresh();
    } catch (error) {
      toast.error("Data gagal dimuat ulang", getErrorMessage(error, "Mapping sudah tersimpan, tetapi data terbaru belum dapat dimuat."));
    } finally {
      setMoveSaving(false);
    }
  }, [moveSaving, pendingMove, refresh, toast]);

  // ── Unit View ──────────────────────────────────────────────
  const unitColumns: KanbanColumnDef[] = useMemo(
    () => (mappingData?.unitRecords ?? []).map((unit) => ({ id: unit.id, label: unit.label })),
    [mappingData?.unitRecords]
  );

  const unitColumnItems = useMemo(() => {
    const map: Record<string, string[]> = {};
    filtered.forEach((s) => {
      if (!s.unitId) return;
      if (!map[s.unitId]) map[s.unitId] = [];
      map[s.unitId].push(s.id);
    });
    unitColumns.forEach((c) => { if (!map[c.id]) map[c.id] = []; });
    return map;
  }, [filtered, unitColumns]);

  const getUnitColumn = useCallback((itemId: string) => {
    return santriList.find((s) => s.id === itemId)?.unitId ?? "";
  }, [santriList]);

  const handleUnitDragEnd = useCallback(
    (activeId: string, _overId: string | null, activeCol: string, overCol: string) => {
      if (activeCol === overCol) return;
      const student = santriList.find((item) => item.id === activeId);
      const target = mappingData?.unitRecords.find((item) => item.id === overCol);
      if (!student?.placementId || !target) return;
      requestKanbanMove({
        activeId,
        activeCol,
        overCol,
        fieldLabel: "Unit",
        fromLabel: mappingData?.unitRecords.find((item) => item.id === activeCol)?.label ?? "Belum ada",
        toLabel: target.label,
        apply: () => moveStudentMapping(student.placementId!, "unit", target.id),
      });
    },
    [mappingData?.unitRecords, requestKanbanMove, santriList]
  );

  const handleAddUnit = useCallback(async (_id: string, label: string) => {
    try { await createMappingMaster("unit", label); }
    catch (error) { toast.error("Unit gagal ditambahkan", getErrorMessage(error, "Silakan coba lagi.")); throw error; }
    toast.success("Unit ditambahkan", label);
    try { await refresh(); }
    catch (error) { toast.error("Data gagal dimuat ulang", getErrorMessage(error, "Unit sudah dibuat, tetapi data terbaru belum dapat dimuat.")); }
  }, [refresh, toast]);

  // ── Divisi View ────────────────────────────────────────────
  const divColumns: KanbanColumnDef[] = useMemo(
    () => baseDivisions.map((d) => ({ id: d.id, label: `${d.label} (${d.code})` })),
    [baseDivisions]
  );

  const divColumnItems = useMemo(() => {
    const map: Record<string, string[]> = {};
    filtered.forEach((s) => {
      const key = s.primaryDivisionId;
      if (key) {
        if (!map[key]) map[key] = [];
        if (!map[key].includes(s.id)) map[key].push(s.id);
      }
    });
    divColumns.forEach((c) => { if (!map[c.id]) map[c.id] = []; });
    return map;
  }, [filtered, divColumns]);

  const getDivColumn = useCallback(
    (itemId: string) => santriList.find((s) => s.id === itemId)?.primaryDivisionId ?? "",
    [santriList]
  );

  const handleDivDragEnd = useCallback(
    (activeId: string, _overId: string | null, activeCol: string, overCol: string) => {
      if (activeCol === overCol) return;
      const student = santriList.find((item) => item.id === activeId);
      const target = mappingData?.divisions.find((item) => item.id === overCol);
      if (!student?.placementId || !target) return;
      requestKanbanMove({
        activeId,
        activeCol,
        overCol,
        fieldLabel: "Divisi utama",
        fromLabel: mappingData?.divisions.find((item) => item.id === activeCol)?.label ?? "Belum ada",
        toLabel: target.label,
        apply: () => moveStudentMapping(student.placementId!, "division", target.id),
      });
    },
    [mappingData?.divisions, requestKanbanMove, santriList]
  );

  const handleAddDiv = useCallback(async (_id: string, label: string) => {
    try { await createMappingMaster("division", label); }
    catch (error) { toast.error("Divisi gagal ditambahkan", getErrorMessage(error, "Silakan coba lagi.")); throw error; }
    toast.success("Divisi ditambahkan", label);
    try { await refresh(); }
    catch (error) { toast.error("Data gagal dimuat ulang", getErrorMessage(error, "Divisi sudah dibuat, tetapi data terbaru belum dapat dimuat.")); }
  }, [refresh, toast]);

  // ── Lokasi View ────────────────────────────────────────────
  const locColumns: KanbanColumnDef[] = useMemo(
    () => (mappingData?.locationRecords ?? []).map((location) => ({ id: location.id, label: location.label })),
    [mappingData?.locationRecords]
  );

  const locColumnItems = useMemo(() => {
    const map: Record<string, string[]> = {};
    filtered.forEach((s) => {
      if (!s.locationId) return;
      if (!map[s.locationId]) map[s.locationId] = [];
      map[s.locationId].push(s.id);
    });
    locColumns.forEach((c) => { if (!map[c.id]) map[c.id] = []; });
    return map;
  }, [filtered, locColumns]);

  const getLocColumn = useCallback((itemId: string) => {
    return santriList.find((s) => s.id === itemId)?.locationId ?? "";
  }, [santriList]);

  const handleLocDragEnd = useCallback(
    (activeId: string, _overId: string | null, activeCol: string, overCol: string) => {
      if (activeCol === overCol) return;
      const student = santriList.find((item) => item.id === activeId);
      const target = mappingData?.locationRecords.find((item) => item.id === overCol);
      if (!student?.placementId || !target) return;
      requestKanbanMove({
        activeId,
        activeCol,
        overCol,
        fieldLabel: "Lokasi",
        fromLabel: mappingData?.locationRecords.find((item) => item.id === activeCol)?.label ?? "Belum ada",
        toLabel: target.label,
        apply: () => moveStudentMapping(student.placementId!, "location", target.id),
      });
    },
    [mappingData?.locationRecords, requestKanbanMove, santriList]
  );

  const handleAddLoc = useCallback(async (_id: string, label: string) => {
    try { await createMappingMaster("location", label); }
    catch (error) { toast.error("Lokasi gagal ditambahkan", getErrorMessage(error, "Silakan coba lagi.")); throw error; }
    toast.success("Lokasi ditambahkan", label);
    try { await refresh(); }
    catch (error) { toast.error("Data gagal dimuat ulang", getErrorMessage(error, "Lokasi sudah dibuat, tetapi data terbaru belum dapat dimuat.")); }
  }, [refresh, toast]);

  // ── PIC View ───────────────────────────────────────────────
  const picColumns: KanbanColumnDef[] = useMemo(
    () => (mappingData?.staffRecords ?? []).map((staff) => ({ id: staff.id, label: staff.label })),
    [mappingData?.staffRecords]
  );

  const picColumnItems = useMemo(() => {
    const map: Record<string, string[]> = {};
    filtered.forEach((s) => {
      const key = s.primaryPicDivId;
      if (key) {
        if (!map[key]) map[key] = [];
        if (!map[key].includes(s.id)) map[key].push(s.id);
      }
    });
    picColumns.forEach((c) => { if (!map[c.id]) map[c.id] = []; });
    return map;
  }, [filtered, picColumns]);

  const getPicColumn = useCallback(
    (itemId: string) => santriList.find((s) => s.id === itemId)?.primaryPicDivId ?? "",
    [santriList]
  );

  const handlePicDragEnd = useCallback(
    (activeId: string, _overId: string | null, activeCol: string, overCol: string) => {
      if (activeCol === overCol) return;
      const student = santriList.find((item) => item.id === activeId);
      const target = mappingData?.staffRecords.find((item) => item.id === overCol);
      if (!student?.placementId || !target) return;
      requestKanbanMove({
        activeId,
        activeCol,
        overCol,
        fieldLabel: "PIC Divisi utama",
        fromLabel: mappingData?.staffRecords.find((item) => item.id === activeCol)?.label ?? "Belum ada",
        toLabel: target.label,
        apply: () => moveStudentMapping(student.placementId!, "pic_division", target.id),
      });
    },
    [mappingData?.staffRecords, requestKanbanMove, santriList]
  );

  const renderCard = useCallback(
    (itemId: string) => {
      const santri = santriList.find((s) => s.id === itemId);
      return santri ? <SantriCard santri={santri} onOpen={handleOpenSantri} /> : null;
    },
    [santriList, handleOpenSantri]
  );

  return (
    <div className="flex gap-5 max-lg:flex-col">
      <div className="flex-1 min-w-0">
        <div
          className="sticky z-10 pt-4 pb-5 mb-6 border-b border-border/40 bg-bg/90 backdrop-blur-[12px] rounded-t-xl"
          style={{ top: "calc(1.5rem + 64px + 1rem)" }}
        >
          <div className="flex items-center gap-2 scrollbar-x pb-1">
            {viewTabs.map((tab) => {
              const isActive = viewTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setViewTab(tab.id)}
                  className={`relative flex items-center gap-2.5 rounded-xl px-5 py-3 text-[0.82rem] font-bold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)]"
                      : "bg-surface text-text hover:bg-primary-soft hover:text-primary-dark border border-border/50"
                  }`}
                >
                  <Iconify icon={tab.icon} width={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4">
          {mappingLoading && <MappingState icon="svg-spinners:ring-resize" title="Memuat data mapping dari Supabase..." />}
          {mappingError && <MappingState icon="solar:danger-triangle-bold-duotone" title="Data Supabase belum dapat dimuat" description={mappingError} tone="error" />}
          <AnimatePresence mode="wait">
            <motion.div
              key={viewTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {viewTab === "santri" && (
                filtered.length ? (
                  <div className="grid grid-cols-3 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1">
                    {filtered.map((s) => (
                      <SantriCard key={s.id} santri={s} onOpen={handleOpenSantri} />
                    ))}
                  </div>
                ) : (
                  <MappingState icon="solar:users-group-rounded-bold-duotone" title="Belum ada santri" description="Data akan muncul setelah pengabdian_santri, placement, dan assignment tersedia." />
                )
              )}
              {viewTab === "unit" && (
                <KanbanBoard
                  columns={unitColumns}
                  columnItems={unitColumnItems}
                  renderCard={renderCard}
                  onDragEnd={handleUnitDragEnd}
                  getColumnId={getUnitColumn}
                  onAddColumn={handleAddUnit}
                />
              )}
              {viewTab === "divisi" && (
                <KanbanBoard
                  columns={divColumns}
                  columnItems={divColumnItems}
                  renderCard={renderCard}
                  onDragEnd={handleDivDragEnd}
                  getColumnId={getDivColumn}
                  onAddColumn={handleAddDiv}
                />
              )}
              {viewTab === "lokasi" && (
                <KanbanBoard
                  columns={locColumns}
                  columnItems={locColumnItems}
                  renderCard={renderCard}
                  onDragEnd={handleLocDragEnd}
                  getColumnId={getLocColumn}
                  onAddColumn={handleAddLoc}
                />
              )}
              {viewTab === "pic" && (
                <KanbanBoard
                  columns={picColumns}
                  columnItems={picColumnItems}
                  renderCard={renderCard}
                  onDragEnd={handlePicDragEnd}
                  getColumnId={getPicColumn}
                />
              )}
              {viewTab === "projek" && (
                <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-surface-strong/50 p-16">
                  <div className="text-center">
                    <Iconify icon="solar:folder-with-files-bold-duotone" width={48} className="mx-auto text-muted/40 mb-4" />
                    <p className="font-bold text-muted">Belum ada data project</p>
                    <p className="text-sm text-muted/60 mt-1">Data project akan ditambahkan menyusul</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <MappingToolbar
        filters={filters}
        onFilterChange={setFilters}
        resultCount={filtered.length}
        unitOptions={baseUnits}
        divisionOptions={baseDivisions}
        locationOptions={baseLocations}
      />

      <SantriDetailDrawer
        santri={activeSantri}
        open={activeSantri !== null}
        onClose={handleCloseDrawer}
      />

      <KanbanMoveConfirmDialog
        move={pendingMove}
        santriName={
          pendingMove
            ? santriList.find((s) => s.id === pendingMove.activeId)?.name ?? pendingMove.activeId
            : ""
        }
        onCancel={() => setPendingMove(null)}
        onConfirm={() => void confirmPendingMove()}
        busy={moveSaving}
      />
    </div>
  );
}

function MappingState({
  icon,
  title,
  description,
  tone = "neutral",
}: {
  icon: string;
  title: string;
  description?: string;
  tone?: "neutral" | "error";
}) {
  const toneClass = tone === "error" ? "bg-orange/10 text-orange" : "bg-primary/8 text-primary";

  return (
    <div className="mb-4 flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-surface/78 px-5 py-8 text-center shadow-[0_12px_34px_rgba(0,0,0,0.06)]">
      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}>
        <Iconify icon={icon} width={23} />
      </span>
      <p className="mt-3 text-sm font-extrabold text-primary-dark">{title}</p>
      {description && <p className="mt-1 max-w-lg text-xs font-semibold leading-relaxed text-muted">{description}</p>}
    </div>
  );
}

function KanbanMoveConfirmDialog({
  move,
  santriName,
  onCancel,
  onConfirm,
  busy,
}: {
  move: PendingMove | null;
  santriName: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  return (
    <AnimatePresence>
      {move && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="kanban-move-title"
            aria-describedby="kanban-move-desc"
            className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-border/70 bg-surface shadow-[0_28px_90px_rgba(0,0,0,0.34)]"
            initial={{ opacity: 0, y: 18, scale: 0.96, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 10, scale: 0.96, x: "-50%" }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative overflow-hidden border-b border-border/60 bg-primary-soft/35 px-5 py-5">
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/14 blur-3xl" />
              <div className="relative flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)]">
                  <Iconify icon="solar:multiple-forward-left-bold-duotone" width={22} />
                </span>
                <div className="min-w-0">
                  <h2 id="kanban-move-title" className="font-(--font-family-head) text-lg font-extrabold leading-tight text-primary-dark">
                    Konfirmasi Pindah Card
                  </h2>
                  <p id="kanban-move-desc" className="mt-1 text-sm leading-relaxed text-muted">
                    Perubahan akan disimpan setelah kamu konfirmasi.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 px-5 py-5">
              <div className="rounded-2xl border border-border/60 bg-surface-strong/35 p-4">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-muted">
                  Santri
                </p>
                <p className="mt-1 font-(--font-family-head) text-base font-extrabold text-text">
                  {santriName}
                </p>
                <div className="mt-3 grid gap-2 text-[0.78rem] font-bold">
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2">
                    <span className="text-muted">Field</span>
                    <span className="text-text">{move.fieldLabel}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2">
                    <span className="text-muted">Dari</span>
                    <span className="text-text">{move.fromLabel}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2">
                    <span className="text-muted">Ke</span>
                    <span className="text-primary-dark">{move.toLabel}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={busy}
                  className="rounded-xl border border-border bg-surface px-4 py-2 text-[0.78rem] font-extrabold text-muted transition-colors hover:bg-surface-strong hover:text-text"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-[0.78rem] font-extrabold text-white shadow-[0_10px_22px_rgba(37,99,235,0.24)] transition-all hover:bg-primary-dark active:scale-95 disabled:cursor-wait disabled:opacity-60"
                >
                  {busy && <Iconify icon="svg-spinners:ring-resize" width={14} />}
                  {busy ? "Menyimpan..." : "Ya, Pindahkan"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
