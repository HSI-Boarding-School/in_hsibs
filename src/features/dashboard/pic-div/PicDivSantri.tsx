import { useState } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { useAuth } from "../../../lib/auth";
import { useAdminMappingData } from "../../../models/admin";
import type { Santri } from "../../../data/santriData";
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

export function PicDivSantri() {
  const { profile } = useAuth();
  const { data, isLoading, error } = useAdminMappingData({ divisionId: profile?.divisionId ?? undefined });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedSantriId, setSelectedSantriId] = useState<string | null>(null);

  if (!profile?.divisionId) {
    return <MappingState icon="solar:buildings-3-linear" title="Divisi belum terhubung" description="Akun ini belum memiliki divisi pada pengabdian_staff.divisi_id." />;
  }

  if (isLoading) return <MappingLoading />;
  if (error || !data?.scopeDivision) {
    return <MappingState icon="solar:danger-triangle-bold-duotone" title="Mapping belum dapat dimuat" description={error ?? "Data divisi akun tidak ditemukan."} tone="error" />;
  }

  const query = search.trim().toLowerCase();
  const filtered = data.santri.filter((santri) => {
    if (query && !santri.name.toLowerCase().includes(query) && !santri.id.toLowerCase().includes(query)) return false;
    return statusFilter === "all" || santri.status === statusFilter;
  });
  const selectedSantri = selectedSantriId ? data.santri.find((santri) => santri.id === selectedSantriId) ?? null : null;
  const activeCount = data.santri.filter((santri) => santri.status === "Active").length;
  const locationsCount = new Set(data.santri.map((santri) => santri.loc).filter((location) => location !== "Belum ditempatkan")).size;

  return (
    <motion.div className="grid gap-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-xs font-black uppercase tracking-widest text-primary">PIC Divisi</p>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-black text-primary">{data.scopeDivision.code}</span>
            </div>
            <h1 className="mt-2 font-(--font-family-head) text-3xl font-extrabold tracking-tight text-primary-dark md:text-4xl">Santri Binaan</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted">Mapping aktif divisi {data.scopeDivision.label} dari placement dan assignment Supabase.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Summary label="Total" value={data.santri.length} />
            <Summary label="Aktif" value={activeCount} />
            <Summary label="Lokasi" value={locationsCount} />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3 max-lg:flex-col max-lg:items-stretch">
        <div className="flex flex-1 items-center gap-2.5 rounded-[14px] border-[1.5px] border-border bg-surface px-3.5 text-muted transition-[border-color,box-shadow] duration-[180ms] focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]">
          <Iconify icon="solar:magnifer-bold-duotone" width={18} />
          <input className="flex-1 border-0 bg-transparent py-3 text-sm text-text outline-none placeholder:text-muted/55" placeholder="Cari nama atau ID santri..." value={search} onChange={(event) => setSearch(event.target.value)} />
          {search && <button type="button" onClick={() => setSearch("")} className="rounded-lg p-1 text-muted hover:text-text" aria-label="Hapus pencarian"><Iconify icon="mingcute:close-line" width={16} /></button>}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          {statusOptions.map((option) => {
            const count = option.id === "all" ? data.santri.length : data.santri.filter((santri) => santri.status === option.id).length;
            return <button key={option.id} type="button" onClick={() => setStatusFilter(option.id)} className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-[0.78rem] font-bold transition-all ${statusFilter === option.id ? "bg-primary text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)]" : "border border-border/50 bg-surface text-text hover:bg-primary-soft"}`}>{option.label} <span className="ml-1 opacity-70">{count}</span></button>;
          })}
        </div>
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-3 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1">
          {filtered.map((santri) => <SantriCard key={santri.pengabdianId ?? santri.id} santri={santri} onOpen={() => setSelectedSantriId(santri.id)} />)}
        </div>
      ) : (
        <MappingState icon="solar:users-group-rounded-bold-duotone" title={data.santri.length ? "Tidak ada santri ditemukan" : "Belum ada santri binaan"} description={data.santri.length ? "Coba ubah filter atau kata kunci pencarian." : `Belum ada penugasan aktif pada divisi ${data.scopeDivision.label}.`} />
      )}

      <SantriDetailDrawer santri={selectedSantri} open={Boolean(selectedSantri)} onClose={() => setSelectedSantriId(null)} readOnly />
    </motion.div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return <div className="min-w-20 rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-center"><p className="text-lg font-black text-text">{value}</p><p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p></div>;
}

function MappingState({ icon, title, description, tone = "neutral" }: { icon: string; title: string; description: string; tone?: "neutral" | "error" }) {
  return <div className="flex min-h-[45vh] items-center justify-center"><div className="max-w-md rounded-3xl border border-dashed border-border bg-surface p-8 text-center"><span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${tone === "error" ? "bg-orange/10 text-orange" : "bg-surface-strong text-muted"}`}><Iconify icon={icon} width={28} /></span><h2 className="mt-4 text-base font-black text-text">{title}</h2><p className="mt-2 text-sm leading-relaxed text-muted">{description}</p></div></div>;
}

function MappingLoading() {
  return <div className="grid gap-5 animate-pulse"><div className="h-44 rounded-3xl bg-surface" /><div className="h-12 rounded-2xl bg-surface" /><div className="grid grid-cols-3 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-60 rounded-2xl bg-surface" />)}</div></div>;
}
