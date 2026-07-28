import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import type { Santri } from "../../../data/santriData";
import { useAuth } from "../../../lib/auth";
import { usePicRegMapping } from "../../../models/pic-reg";
import { createMappingMaster, moveStudentMapping } from "../../../models/admin";
import { KanbanBoard, type KanbanColumnDef } from "../../../components/ui/KanbanBoard";
import { useToast } from "../../../components/ui/ToastProvider";
import { SantriCard } from "../admin/components/SantriCard";
import { SantriDetailDrawer } from "../admin/components/SantriDetailDrawer";

type StatusFilter = "all" | Santri["status"];

const statusOptions: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "Active", label: "Active" },
  { id: "On Hold", label: "On Hold" },
  { id: "Inactive", label: "Inactive" },
  { id: "Alumni", label: "Alumni" },
];

export function PicRegSantri() {
  const { profile } = useAuth();
  const { data, isLoading, error, refresh } = usePicRegMapping(profile?.regionId);
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<{ student: Santri; from: string; to: string; targetLocationId: string } | null>(null);
  const [moveSaving, setMoveSaving] = useState(false);

  if (!profile?.regionId) return <MappingState icon="solar:map-point-wave-linear" title="Regional belum terhubung" description="Akun ini belum memiliki region pada pengabdian_staff.region_id." />;
  if (isLoading) return <MappingLoading />;
  if (error || !data) return <MappingState icon="solar:danger-triangle-bold-duotone" title="Mapping regional belum dapat dimuat" description={error ?? "Data regional tidak tersedia."} tone="error" action={<button type="button" onClick={() => void refresh().catch(() => undefined)} className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-white">Coba lagi</button>} />;

  const query = search.trim().toLowerCase();
  const filtered = data.students.filter((student) => {
    if (statusFilter !== "all" && student.status !== statusFilter) return false;
    return !query || `${student.name} ${student.id} ${student.loc} ${student.unit}`.toLowerCase().includes(query);
  });
  const selected = selectedId ? data.students.find((student) => student.id === selectedId) ?? null : null;
  const activeCount = data.students.filter((student) => student.status === "Active").length;
  const regionId = data.region.id;
  const columns: KanbanColumnDef[] = data.locations.map((location) => ({ id: location.id, label: location.name }));
  const columnItems = columns.reduce<Record<string, string[]>>((result, column) => {
    result[column.id] = filtered.filter((student) => student.locationId === column.id).map((student) => student.id);
    return result;
  }, {});

  async function addLocation(_id: string, label: string) {
    await createMappingMaster("location", label, regionId);
    await refresh();
    toast.success("Lokasi ditambahkan", label);
  }

  async function confirmMove() {
    if (!pendingMove?.student.placementId || moveSaving) return;
    setMoveSaving(true);
    try {
      await moveStudentMapping(pendingMove.student.placementId, "location", pendingMove.targetLocationId);
      await refresh();
      toast.success("Lokasi Santri diperbarui", `${pendingMove.student.name} dipindahkan ke ${pendingMove.to}.`);
      setPendingMove(null);
    } catch (error) {
      toast.error("Perpindahan gagal", error instanceof Error ? error.message : "Silakan coba lagi.");
    } finally { setMoveSaving(false); }
  }

  return (
    <motion.div className="grid gap-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3"><p className="text-xs font-black uppercase tracking-widest text-primary">PIC Regional</p><span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-black text-primary">{data.region.name}</span></div>
            <h1 className="mt-2 font-(--font-family-head) text-3xl font-extrabold tracking-tight text-primary-dark md:text-4xl">Mapping Santri Regional</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted">Placement santri per lokasi dari Supabase. Detail role, divisi, SoW, dan PIC ditampilkan secara read-only.</p>
          </div>
          <div className="grid grid-cols-3 gap-2"><Summary label="Santri" value={data.students.length} /><Summary label="Lokasi" value={data.locations.length} /><Summary label="Aktif" value={activeCount} /></div>
        </div>
      </section>

      <div className="flex items-center gap-3 max-lg:flex-col max-lg:items-stretch">
        <div className="flex flex-1 items-center gap-2.5 rounded-[14px] border-[1.5px] border-border bg-surface px-3.5 text-muted focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"><Iconify icon="solar:magnifer-bold-duotone" width={18} /><input className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-text outline-none placeholder:text-muted/55" placeholder="Cari nama, ID, lokasi, atau unit..." value={search} onChange={(event) => setSearch(event.target.value)} />{search && <button type="button" onClick={() => setSearch("")} aria-label="Hapus pencarian" className="rounded-lg p-1 text-muted hover:text-text"><Iconify icon="mingcute:close-line" width={16} /></button>}</div>
        <div className="flex gap-2 overflow-x-auto pb-1">{statusOptions.map((option) => { const count = option.id === "all" ? data.students.length : data.students.filter((student) => student.status === option.id).length; return <button key={option.id} type="button" onClick={() => setStatusFilter(option.id)} className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-[0.78rem] font-bold transition-all ${statusFilter === option.id ? "bg-primary text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)]" : "border border-border/50 bg-surface text-text hover:bg-primary-soft"}`}>{option.label} <span className="ml-1 opacity-70">{count}</span></button>; })}</div>
      </div>

      <KanbanBoard
        columns={columns}
        columnItems={columnItems}
        getColumnId={(itemId) => data.students.find((student) => student.id === itemId)?.locationId ?? ""}
        renderCard={(itemId) => { const student = data.students.find((item) => item.id === itemId); return student ? <SantriCard santri={student} onOpen={() => setSelectedId(student.id)} /> : null; }}
        onDragEnd={(activeId, _overId, activeCol, overCol) => {
          if (!overCol || activeCol === overCol) return;
          const student = data.students.find((item) => item.id === activeId);
          const from = data.locations.find((location) => location.id === activeCol);
          const to = data.locations.find((location) => location.id === overCol);
          if (student?.placementId && to) setPendingMove({ student, from: from?.name ?? "Belum ada", to: to.name, targetLocationId: to.id });
        }}
        onAddColumn={addLocation}
        hideHorizontalScrollbar
      />

      {filtered.length === 0 && data.students.length > 0 && <div className="rounded-2xl border border-dashed border-border bg-surface/45 px-6 py-8 text-center"><Iconify icon="solar:magnifer-bold-duotone" width={28} className="mx-auto text-muted/35" /><p className="mt-2 text-sm font-bold text-muted">Tidak ada santri yang sesuai filter.</p></div>}

      <SantriDetailDrawer santri={selected} open={Boolean(selected)} onClose={() => setSelectedId(null)} readOnly />
      <RegionalMoveDialog move={pendingMove} busy={moveSaving} onCancel={() => setPendingMove(null)} onConfirm={() => void confirmMove()} />
    </motion.div>
  );
}

function Summary({ label, value }: { label: string; value: number }) { return <div className="min-w-20 rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-center"><p className="text-lg font-black text-text">{value}</p><p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p></div>; }
function MappingState({ icon, title, description, tone = "neutral", action }: { icon: string; title: string; description: string; tone?: "neutral" | "error"; action?: React.ReactNode }) { return <div className="flex min-h-[45vh] items-center justify-center"><div className="max-w-md rounded-3xl border border-dashed border-border bg-surface p-8 text-center"><span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${tone === "error" ? "bg-orange/10 text-orange" : "bg-surface-strong text-muted"}`}><Iconify icon={icon} width={28} /></span><h2 className="mt-4 text-base font-black text-text">{title}</h2><p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>{action}</div></div>; }
function MappingLoading() { return <div className="grid gap-5 animate-pulse"><div className="h-44 rounded-3xl bg-surface" /><div className="h-12 rounded-2xl bg-surface" /><div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-96 rounded-2xl bg-surface" />)}</div></div>; }

function RegionalMoveDialog({ move, busy, onCancel, onConfirm }: { move: { student: Santri; from: string; to: string } | null; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <AnimatePresence>{move && <><motion.div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={busy ? undefined : onCancel} /><motion.div role="alertdialog" aria-modal="true" className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-surface p-5 shadow-[0_28px_90px_rgba(0,0,0,0.34)]" initial={{ opacity: 0, y: 16, scale: 0.97, x: "-50%" }} animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }} exit={{ opacity: 0, y: 10, scale: 0.97, x: "-50%" }}><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white"><Iconify icon="solar:map-arrow-right-bold-duotone" width={22} /></span><h2 className="mt-4 text-lg font-extrabold text-primary-dark">Konfirmasi pindah lokasi</h2><p className="mt-1 text-sm font-semibold text-muted">Perubahan akan langsung disimpan ke placement Santri.</p><div className="mt-4 rounded-2xl bg-surface-strong/45 p-4"><p className="text-sm font-extrabold text-text">{move.student.name}</p><div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center"><span className="rounded-xl bg-surface px-3 py-2 text-xs font-bold text-muted">{move.from}</span><Iconify icon="solar:arrow-right-linear" width={17} className="text-primary" /><span className="rounded-xl bg-primary/9 px-3 py-2 text-xs font-extrabold text-primary">{move.to}</span></div></div><div className="mt-5 flex justify-end gap-2"><button type="button" disabled={busy} onClick={onCancel} className="rounded-xl px-4 py-2.5 text-xs font-extrabold text-muted hover:bg-surface-strong disabled:opacity-50">Batal</button><button type="button" disabled={busy} onClick={onConfirm} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-white disabled:cursor-wait disabled:opacity-60">{busy && <Iconify icon="svg-spinners:ring-resize" width={14} />}{busy ? "Menyimpan..." : "Ya, Pindahkan"}</button></div></motion.div></>}</AnimatePresence>;
}
