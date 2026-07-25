import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { KanbanBoard, type KanbanColumnDef } from "../../../components/ui/KanbanBoard";
import { useLocalStorageState } from "../../../lib/useLocalStorageState";
import {
  locations,
  santriList as initialSantriList,
  type Santri,
} from "../../../data/santriData";
import { SantriCard } from "../admin/components/SantriCard";
import { SantriDetailDrawer } from "../admin/components/SantriDetailDrawer";

const CURRENT_REGION = "Regional Barat";

type StatusFilter = "all" | "Active" | "On Hold" | "Inactive" | "Alumni";

type PendingMove = {
  activeId: string;
  activeCol: string;
  overCol: string;
  newIndex: number;
  fieldLabel: string;
  apply: () => void;
};

const statusOptions: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "Active", label: "Active" },
  { id: "On Hold", label: "On Hold" },
  { id: "Inactive", label: "Inactive" },
  { id: "Alumni", label: "Alumni" },
];

export function PicRegSantri() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [santriList, setSantriList] = useLocalStorageState<Santri[]>(
    "in_hsibs.mapping.santri",
    initialSantriList,
  );
  const [extraLocs, setExtraLocs] = useLocalStorageState<string[]>(
    "in_hsibs.mapping.extraLocs",
    [],
  );

  const filtered = useMemo(() => {
    return santriList.filter((santri) => {
      if (statusFilter !== "all" && santri.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !santri.name.toLowerCase().includes(q) &&
          !santri.id.toLowerCase().includes(q) &&
          !santri.loc.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [santriList, search, statusFilter]);

  const selected = useMemo(
    () => (selectedId ? santriList.find((s) => s.id === selectedId) ?? null : null),
    [santriList, selectedId],
  );

  const locColumns: KanbanColumnDef[] = useMemo(
    () => [
      ...locations.map((loc) => ({ id: loc, label: loc })),
      ...extraLocs.map((loc) => ({ id: loc, label: loc })),
    ],
    [extraLocs],
  );

  const locColumnItems = useMemo(() => {
    const map: Record<string, string[]> = {};
    filtered.forEach((santri) => {
      if (!map[santri.loc]) map[santri.loc] = [];
      map[santri.loc].push(santri.id);
    });
    locColumns.forEach((column) => {
      if (!map[column.id]) map[column.id] = [];
    });
    return map;
  }, [filtered, locColumns]);

  const getLocColumn = useCallback(
    (itemId: string) => santriList.find((santri) => santri.id === itemId)?.loc ?? "",
    [santriList],
  );

  const commitLocationMove = useCallback(
    (activeId: string, targetLoc: string, newIndex: number) => {
      setSantriList((prev) => {
        const active = prev.find((santri) => santri.id === activeId);
        if (!active) return prev;

        const updatedActive = { ...active, loc: targetLoc };
        const withoutActive = prev.filter((santri) => santri.id !== activeId);
        const targetIds = withoutActive
          .filter((santri) => santri.loc === targetLoc)
          .map((santri) => santri.id);
        const insertIndex = Math.max(0, Math.min(newIndex, targetIds.length));
        const beforeId = targetIds[insertIndex];
        const next: Santri[] = [];
        let inserted = false;

        withoutActive.forEach((santri) => {
          if (!inserted && beforeId && santri.id === beforeId) {
            next.push(updatedActive);
            inserted = true;
          }
          next.push(santri);
        });

        if (!inserted) next.push(updatedActive);
        return next;
      });
    },
    [setSantriList],
  );

  const handleDragEnd = useCallback(
    (activeId: string, _overId: string | null, activeCol: string, overCol: string, newIndex: number) => {
      if (!overCol) return;
      setPendingMove({
        activeId,
        activeCol,
        overCol,
        newIndex,
        fieldLabel: "Lokasi regional",
        apply: () => commitLocationMove(activeId, overCol, newIndex),
      });
    },
    [commitLocationMove],
  );

  const handleAddLocation = useCallback(
    (_id: string, label: string) => {
      setExtraLocs((prev) => (prev.includes(label) ? prev : [...prev, label]));
    },
    [setExtraLocs],
  );

  const renderCard = useCallback(
    (itemId: string) => {
      const santri = santriList.find((item) => item.id === itemId);
      return santri ? <SantriCard santri={santri} onOpen={() => setSelectedId(santri.id)} /> : null;
    },
    [santriList],
  );

  const confirmPendingMove = useCallback(() => {
    pendingMove?.apply();
    setPendingMove(null);
  }, [pendingMove]);

  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <section className="relative overflow-hidden rounded-[28px] border border-border/70 bg-surface/82 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/14 blur-3xl" />
        <div className="relative flex items-end justify-between gap-5 max-lg:flex-col max-lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-black uppercase tracking-widest text-primary">
                PIC Regional
              </p>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-black text-primary">
                {CURRENT_REGION}
              </span>
            </div>
            <h1 className="mt-2 font-(--font-family-head) text-4xl font-extrabold tracking-tight text-primary-dark max-sm:text-3xl">
              Kanban Santri Regional
            </h1>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-muted">
              Kelola penempatan santri per lokasi. Drag card ke lokasi lain, lalu konfirmasi agar perubahan tersimpan.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 max-sm:w-full max-sm:grid-cols-1">
            <MiniStat label="Santri" value={filtered.length} />
            <MiniStat label="Lokasi" value={locColumns.length} />
            <MiniStat label="Active" value={filtered.filter((item) => item.status === "Active").length} />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3 max-lg:flex-col max-lg:items-stretch">
        <div className="flex flex-1 items-center gap-2.5 rounded-[14px] border-[1.5px] border-border bg-surface px-3.5 text-muted focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]">
          <Iconify icon="solar:magnifer-bold-duotone" width={18} />
          <input
            className="flex-1 border-0 bg-transparent py-3 text-sm text-text outline-none placeholder:text-muted/55"
            placeholder="Cari nama, ID, atau lokasi santri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statusOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStatusFilter(opt.id)}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-[0.78rem] font-bold transition-all ${
                statusFilter === opt.id
                  ? "bg-primary text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)]"
                  : "border border-border/50 bg-surface text-text hover:bg-primary-soft"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <KanbanBoard
        columns={locColumns}
        columnItems={locColumnItems}
        renderCard={renderCard}
        onDragEnd={handleDragEnd}
        getColumnId={getLocColumn}
        onAddColumn={handleAddLocation}
      />

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface-strong/50 p-16">
          <Iconify icon="solar:users-group-rounded-bold-duotone" width={48} className="text-muted/30" />
          <p className="font-bold text-muted">Tidak ada santri ditemukan</p>
        </div>
      )}

      <SantriDetailDrawer
        santri={selected}
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
      />

      <KanbanMoveConfirmDialog
        move={pendingMove}
        santriName={
          pendingMove
            ? santriList.find((santri) => santri.id === pendingMove.activeId)?.name ?? pendingMove.activeId
            : ""
        }
        onCancel={() => setPendingMove(null)}
        onConfirm={confirmPendingMove}
      />
    </motion.div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-surface/80 px-4 py-3 ring-1 ring-inset ring-border/60">
      <p className="text-[0.65rem] font-black uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-(--font-family-head) text-xl font-extrabold text-primary-dark">{value}</p>
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
            aria-labelledby="pic-reg-move-title"
            className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-border/70 bg-surface shadow-[0_28px_90px_rgba(0,0,0,0.34)]"
            initial={{ opacity: 0, y: 18, scale: 0.96, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 10, scale: 0.96, x: "-50%" }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative overflow-hidden border-b border-border/60 bg-primary-soft/35 px-5 py-5">
              <div className="relative flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)]">
                  <Iconify icon="solar:map-arrow-right-bold-duotone" width={22} />
                </span>
                <div className="min-w-0">
                  <h2 id="pic-reg-move-title" className="font-(--font-family-head) text-lg font-extrabold leading-tight text-primary-dark">
                    Konfirmasi Pindah Lokasi
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    Perubahan lokasi regional akan disimpan setelah dikonfirmasi.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 px-5 py-5">
              <div className="rounded-2xl border border-border/60 bg-surface-strong/35 p-4">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-muted">Santri</p>
                <p className="mt-1 font-(--font-family-head) text-base font-extrabold text-text">{santriName}</p>
                <div className="mt-3 grid gap-2 text-[0.78rem] font-bold">
                  <InfoRow label="Field" value={move.fieldLabel} />
                  <InfoRow label="Dari" value={move.activeCol || "Belum ada"} />
                  <InfoRow label="Ke" value={move.overCol} strong />
                  <InfoRow label="Posisi" value={`#${move.newIndex + 1}`} strong />
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

function InfoRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2">
      <span className="text-muted">{label}</span>
      <span className={strong ? "text-primary-dark" : "text-text"}>{value}</span>
    </div>
  );
}
