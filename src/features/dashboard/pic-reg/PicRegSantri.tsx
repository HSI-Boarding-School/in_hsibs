import { useState } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import type { Santri } from "../../../data/santriData";
import { useAuth } from "../../../lib/auth";
import { usePicRegMapping } from "../../../models/pic-reg";
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

      {data.locations.length ? (
        <div className="scrollbar-hidden overflow-x-auto pb-3">
          <div className="grid min-w-max grid-flow-col auto-cols-[320px] gap-4">
            {data.locations.map((location, index) => {
              const students = filtered.filter((student) => student.locationId === location.id);
              const totalAtLocation = data.students.filter((student) => student.locationId === location.id).length;
              return <motion.section key={location.id} className="flex max-h-[70vh] min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface/60 p-4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}><header className="mb-3 flex items-center justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-sm font-extrabold text-primary-dark">{location.name}</h2><p className="text-[0.65rem] font-semibold text-muted">{students.length === totalAtLocation ? `${totalAtLocation} santri` : `${students.length} dari ${totalAtLocation} santri`}</p></div><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Iconify icon="solar:map-point-bold-duotone" width={17} /></span></header><div className="scrollbar-v-hover grid min-w-0 gap-3 overflow-x-hidden overflow-y-auto pr-1">{students.length ? students.map((student) => <SantriCard key={student.pengabdianId ?? student.id} santri={student} onOpen={() => setSelectedId(student.id)} />) : <LocationEmpty filtered={Boolean(query || statusFilter !== "all")} />}</div></motion.section>;
            })}
          </div>
        </div>
      ) : <MappingState icon="solar:map-point-linear" title="Belum ada lokasi" description={`Belum ada lokasi yang terhubung ke ${data.region.name}.`} />}

      {filtered.length === 0 && data.students.length > 0 && <div className="rounded-2xl border border-dashed border-border bg-surface/45 px-6 py-8 text-center"><Iconify icon="solar:magnifer-bold-duotone" width={28} className="mx-auto text-muted/35" /><p className="mt-2 text-sm font-bold text-muted">Tidak ada santri yang sesuai filter.</p></div>}

      <SantriDetailDrawer santri={selected} open={Boolean(selected)} onClose={() => setSelectedId(null)} readOnly />
    </motion.div>
  );
}

function Summary({ label, value }: { label: string; value: number }) { return <div className="min-w-20 rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-center"><p className="text-lg font-black text-text">{value}</p><p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p></div>; }
function LocationEmpty({ filtered }: { filtered: boolean }) { return <div className="rounded-xl border border-dashed border-border bg-background/35 px-3 py-8 text-center"><Iconify icon="solar:users-group-rounded-bold-duotone" width={24} className="mx-auto text-muted/35" /><p className="mt-2 text-xs font-bold text-muted">{filtered ? "Tidak cocok dengan filter" : "Belum ada santri"}</p></div>; }
function MappingState({ icon, title, description, tone = "neutral", action }: { icon: string; title: string; description: string; tone?: "neutral" | "error"; action?: React.ReactNode }) { return <div className="flex min-h-[45vh] items-center justify-center"><div className="max-w-md rounded-3xl border border-dashed border-border bg-surface p-8 text-center"><span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${tone === "error" ? "bg-orange/10 text-orange" : "bg-surface-strong text-muted"}`}><Iconify icon={icon} width={28} /></span><h2 className="mt-4 text-base font-black text-text">{title}</h2><p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>{action}</div></div>; }
function MappingLoading() { return <div className="grid gap-5 animate-pulse"><div className="h-44 rounded-3xl bg-surface" /><div className="h-12 rounded-2xl bg-surface" /><div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-96 rounded-2xl bg-surface" />)}</div></div>; }
