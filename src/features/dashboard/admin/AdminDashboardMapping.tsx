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

type ViewTab = "santri" | "unit" | "divisi" | "lokasi" | "pic" | "projek";

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
  const [santriList, setSantriList] = useState(initialSantriList);
  const [activeSantriId, setActiveSantriId] = useState<string | null>(null);

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

  const updateSantri = useCallback((id: string, updater: (s: Santri) => Santri) => {
    setSantriList((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
  }, []);

  // ── Mutable column lists ────────────────────────────────────
  const [extraUnits, setExtraUnits] = useState<string[]>([]);
  const [extraDivs, setExtraDivs] = useState<{ code: string; label: string }[]>([]);
  const [extraLocs, setExtraLocs] = useState<string[]>([]);
  const [extraPics, setExtraPics] = useState<string[]>([]);

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
    (_activeId: string, _overId: string | null, _activeCol: string, overCol: string) => {
      updateSantri(_activeId, (s) => ({ ...s, unit: overCol as Santri["unit"] }));
    },
    [updateSantri]
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
    (activeId: string, _overId: string | null, _activeCol: string, overCol: string) => {
      updateSantri(activeId, (s) => {
        const newDivs = s.divs.includes(overCol) ? s.divs : [...s.divs, overCol];
        return { ...s, divs: newDivs };
      });
    },
    [updateSantri]
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
    (_activeId: string, _overId: string | null, _activeCol: string, overCol: string) => {
      updateSantri(_activeId, (s) => ({ ...s, loc: overCol }));
    },
    [updateSantri]
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
    (activeId: string, _overId: string | null, _activeCol: string, overCol: string) => {
      updateSantri(activeId, (s) => {
        const newPics = s.picDivs.includes(overCol) ? s.picDivs : [...s.picDivs, overCol];
        return { ...s, picDivs: newPics };
      });
    },
    [updateSantri]
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
    </div>
  );
}
