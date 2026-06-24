import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { SantriCard } from "./components/SantriCard";
import { SantriDetailDrawer } from "./components/SantriDetailDrawer";
import { MappingToolbar, type FilterState } from "./components/MappingToolbar";
import { santriList as initialSantriList, units, divisions, locations } from "../../../data/santriData";
import type { Santri } from "../../../data/santriData";
import { KanbanBoard } from "../../../components/ui/KanbanBoard";
import type { KanbanColumnDef } from "../../../components/ui/KanbanBoard";
import { useLocalStorageState } from "../../../lib/useLocalStorageState";

type ViewTab = "santri" | "unit" | "divisi" | "lokasi" | "pic" | "projek";

type PendingMove = {
  activeId: string;
  activeCol: string;
  overCol: string;
  newIndex: number;
  fieldLabel: string;
  apply: () => void;
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
  const [santriList, setSantriList] = useLocalStorageState<Santri[]>(
    "in_hsibs.mapping.santri",
    initialSantriList,
  );
  const [activeSantriId, setActiveSantriId] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);

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

  const commitKanbanMove = useCallback(
    (
      activeId: string,
      newIndex: number,
      updater: (s: Santri) => Santri,
      getColumnFromSantri: (s: Santri) => string,
    ) => {
      setSantriList((prev) => {
        const active = prev.find((s) => s.id === activeId);
        if (!active) return prev;

        const updatedActive = updater(active);
        const withoutActive = prev.filter((s) => s.id !== activeId);
        const targetColumn = getColumnFromSantri(updatedActive);
        const targetIds = withoutActive
          .filter((s) => getColumnFromSantri(s) === targetColumn)
          .map((s) => s.id);
        const insertIndex = Math.max(0, Math.min(newIndex, targetIds.length));
        const beforeId = targetIds[insertIndex];
        const next: Santri[] = [];
        let inserted = false;

        withoutActive.forEach((s) => {
          if (!inserted && beforeId && s.id === beforeId) {
            next.push(updatedActive);
            inserted = true;
          }
          next.push(s);
        });

        if (!inserted) next.push(updatedActive);
        return next;
      });
    },
    [setSantriList],
  );

  const requestKanbanMove = useCallback(
    (move: PendingMove) => {
      const { overCol } = move;
      if (!overCol) return false;
      setPendingMove(move);
      return true;
    },
    [],
  );

  const confirmPendingMove = useCallback(() => {
    pendingMove?.apply();
    setPendingMove(null);
  }, [pendingMove]);

  // ── Mutable column lists ────────────────────────────────────
  const [extraUnits, setExtraUnits] = useLocalStorageState<string[]>("in_hsibs.mapping.extraUnits", []);
  const [extraDivs, setExtraDivs] = useLocalStorageState<{ code: string; label: string }[]>("in_hsibs.mapping.extraDivs", []);
  const [extraLocs, setExtraLocs] = useLocalStorageState<string[]>("in_hsibs.mapping.extraLocs", []);
  const [extraPics, setExtraPics] = useLocalStorageState<string[]>("in_hsibs.mapping.extraPics", []);

  // ── Unit View ──────────────────────────────────────────────
  const unitColumns: KanbanColumnDef[] = useMemo(
    () => [...units.map((u) => ({ id: u, label: u })), ...extraUnits.map((u) => ({ id: u, label: u }))],
    [extraUnits]
  );

  const unitColumnItems = useMemo(() => {
    const map: Record<string, string[]> = {};
    filtered.forEach((s) => {
      if (!map[s.unit]) map[s.unit] = [];
      map[s.unit].push(s.id);
    });
    unitColumns.forEach((c) => { if (!map[c.id]) map[c.id] = []; });
    return map;
  }, [filtered, unitColumns]);

  const getUnitColumn = useCallback((itemId: string) => {
    return santriList.find((s) => s.id === itemId)?.unit ?? "";
  }, [santriList]);

  const handleUnitDragEnd = useCallback(
    (activeId: string, _overId: string | null, activeCol: string, overCol: string, newIndex: number) => {
      requestKanbanMove({
        activeId,
        activeCol,
        overCol,
        newIndex,
        fieldLabel: "Unit",
        apply: () => commitKanbanMove(
          activeId,
          newIndex,
          (s) => ({ ...s, unit: overCol as Santri["unit"] }),
          (s) => s.unit,
        ),
      });
    },
    [commitKanbanMove, requestKanbanMove]
  );

  const handleAddUnit = useCallback((_id: string, label: string) => {
    setExtraUnits((prev) => (prev.includes(label) ? prev : [...prev, label]));
  }, []);

  // ── Divisi View ────────────────────────────────────────────
  const divColumns: KanbanColumnDef[] = useMemo(
    () => [
      ...divisions.map((d) => ({ id: d.code, label: `${d.label} (${d.code})` })),
      ...extraDivs.map((d) => ({ id: d.code, label: d.label })),
    ],
    [extraDivs]
  );

  const getPrimaryDiv = useCallback((s: Santri) => s.divs[0] || "", []);

  const divColumnItems = useMemo(() => {
    const map: Record<string, string[]> = {};
    filtered.forEach((s) => {
      const key = getPrimaryDiv(s);
      if (key) {
        if (!map[key]) map[key] = [];
        if (!map[key].includes(s.id)) map[key].push(s.id);
      }
    });
    divColumns.forEach((c) => { if (!map[c.id]) map[c.id] = []; });
    return map;
  }, [filtered, divColumns, getPrimaryDiv]);

  const getDivColumn = useCallback(
    (itemId: string) => getPrimaryDiv(santriList.find((s) => s.id === itemId)!) || "",
    [santriList, getPrimaryDiv]
  );

  const handleDivDragEnd = useCallback(
    (activeId: string, _overId: string | null, activeCol: string, overCol: string, newIndex: number) => {
      requestKanbanMove({
        activeId,
        activeCol,
        overCol,
        newIndex,
        fieldLabel: "Divisi utama",
        apply: () => commitKanbanMove(
          activeId,
          newIndex,
          (s) => {
            const newDivs = [overCol, ...s.divs.filter((d) => d !== overCol && d !== activeCol)];
            return { ...s, divs: newDivs };
          },
          (s) => getPrimaryDiv(s),
        ),
      });
    },
    [commitKanbanMove, getPrimaryDiv, requestKanbanMove]
  );

  const handleAddDiv = useCallback((id: string, label: string) => {
    setExtraDivs((prev) => (prev.some((d) => d.code === id) ? prev : [...prev, { code: id, label }]));
  }, []);

  // ── Lokasi View ────────────────────────────────────────────
  const locColumns: KanbanColumnDef[] = useMemo(
    () => [...locations.map((l) => ({ id: l, label: l })), ...extraLocs.map((l) => ({ id: l, label: l }))],
    [extraLocs]
  );

  const locColumnItems = useMemo(() => {
    const map: Record<string, string[]> = {};
    filtered.forEach((s) => {
      if (!map[s.loc]) map[s.loc] = [];
      map[s.loc].push(s.id);
    });
    locColumns.forEach((c) => { if (!map[c.id]) map[c.id] = []; });
    return map;
  }, [filtered, locColumns]);

  const getLocColumn = useCallback((itemId: string) => {
    return santriList.find((s) => s.id === itemId)?.loc ?? "";
  }, [santriList]);

  const handleLocDragEnd = useCallback(
    (activeId: string, _overId: string | null, activeCol: string, overCol: string, newIndex: number) => {
      requestKanbanMove({
        activeId,
        activeCol,
        overCol,
        newIndex,
        fieldLabel: "Lokasi",
        apply: () => commitKanbanMove(
          activeId,
          newIndex,
          (s) => ({ ...s, loc: overCol }),
          (s) => s.loc,
        ),
      });
    },
    [commitKanbanMove, requestKanbanMove]
  );

  const handleAddLoc = useCallback((_id: string, label: string) => {
    setExtraLocs((prev) => (prev.includes(label) ? prev : [...prev, label]));
  }, []);

  // ── PIC View ───────────────────────────────────────────────
  const picColumns: KanbanColumnDef[] = useMemo(
    () => [
      ...[...new Set(santriList.flatMap((s) => s.picDivs))].map((p) => ({ id: p, label: p })),
      ...extraPics.map((p) => ({ id: p, label: p })),
    ],
    [santriList, extraPics]
  );

  const getPrimaryPic = useCallback((s: Santri) => s.picDivs[0] || "", []);

  const picColumnItems = useMemo(() => {
    const map: Record<string, string[]> = {};
    filtered.forEach((s) => {
      const key = getPrimaryPic(s);
      if (key) {
        if (!map[key]) map[key] = [];
        if (!map[key].includes(s.id)) map[key].push(s.id);
      }
    });
    picColumns.forEach((c) => { if (!map[c.id]) map[c.id] = []; });
    return map;
  }, [filtered, picColumns, getPrimaryPic]);

  const getPicColumn = useCallback(
    (itemId: string) => getPrimaryPic(santriList.find((s) => s.id === itemId)!) || "",
    [santriList, getPrimaryPic]
  );

  const handlePicDragEnd = useCallback(
    (activeId: string, _overId: string | null, activeCol: string, overCol: string, newIndex: number) => {
      requestKanbanMove({
        activeId,
        activeCol,
        overCol,
        newIndex,
        fieldLabel: "PIC Divisi utama",
        apply: () => commitKanbanMove(
          activeId,
          newIndex,
          (s) => {
            const newPics = [overCol, ...s.picDivs.filter((p) => p !== overCol && p !== activeCol)];
            return { ...s, picDivs: newPics };
          },
          (s) => getPrimaryPic(s),
        ),
      });
    },
    [commitKanbanMove, getPrimaryPic, requestKanbanMove]
  );

  const handleAddPic = useCallback((_id: string, label: string) => {
    setExtraPics((prev) => (prev.includes(label) ? prev : [...prev, label]));
  }, []);

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
          <AnimatePresence mode="wait">
            <motion.div
              key={viewTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {viewTab === "santri" && (
                <div className="grid grid-cols-3 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1">
                  {filtered.map((s) => (
                    <SantriCard key={s.id} santri={s} onOpen={handleOpenSantri} />
                  ))}
                </div>
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
                  onAddColumn={handleAddPic}
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

      <MappingToolbar filters={filters} onFilterChange={setFilters} resultCount={filtered.length} />

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
        onConfirm={confirmPendingMove}
      />
    </div>
  );
}

function KanbanMoveConfirmDialog({
  move,
  santriName,
  onCancel,
  onConfirm,
}: {
  move: PendingMove | null;
  santriName: string;
  onCancel: () => void;
  onConfirm: () => void;
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
                    <span className="text-text">{move.activeCol || "Belum ada"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2">
                    <span className="text-muted">Ke</span>
                    <span className="text-primary-dark">{move.overCol}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2">
                    <span className="text-muted">Posisi</span>
                    <span className="text-primary-dark">#{move.newIndex + 1}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-xl border border-border bg-surface px-4 py-2 text-[0.78rem] font-extrabold text-muted transition-colors hover:bg-surface-strong hover:text-text"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="rounded-xl bg-primary px-4 py-2 text-[0.78rem] font-extrabold text-white shadow-[0_10px_22px_rgba(37,99,235,0.24)] transition-all hover:bg-primary-dark active:scale-95"
                >
                  Ya, Pindahkan
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
