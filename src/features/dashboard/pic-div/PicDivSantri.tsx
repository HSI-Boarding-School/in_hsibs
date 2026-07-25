import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { santriList } from "../../../data/santriData";
import { SantriCard } from "../admin/components/SantriCard";
import { SantriDetailDrawer } from "../admin/components/SantriDetailDrawer";

const CURRENT_DIVISION = "IT";
const CURRENT_DIVISION_LABEL = "IT";

type StatusFilter = "all" | "Active" | "On Hold" | "Inactive" | "Alumni";

const statusOptions: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "Active", label: "Active" },
  { id: "On Hold", label: "On Hold" },
  { id: "Inactive", label: "Inactive" },
  { id: "Alumni", label: "Alumni" },
];

export function PicDivSantri() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedSantriId, setSelectedSantriId] = useState<string | null>(null);

  const divisionSantri = useMemo(
    () => santriList.filter((s) => s.divs.includes(CURRENT_DIVISION)),
    [],
  );

  const filtered = useMemo(() => {
    return divisionSantri.filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !s.name.toLowerCase().includes(q) &&
          !s.id.toLowerCase().includes(q)
        )
          return false;
      }
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      return true;
    });
  }, [divisionSantri, search, statusFilter]);

  const selectedSantri = useMemo(
    () =>
      selectedSantriId
        ? (divisionSantri.find((s) => s.id === selectedSantriId) ?? null)
        : null,
    [selectedSantriId, divisionSantri],
  );

  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <p className="text-xs font-black uppercase tracking-widest text-primary">
            PIC Divisi
          </p>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-black text-primary">
            {CURRENT_DIVISION_LABEL}
          </span>
        </div>
        <h1 className="mt-1 font-(--font-family-head) text-4xl font-extrabold tracking-tight text-primary-dark">
          Santri Binaan
        </h1>
        <p className="mt-1 text-sm text-muted">
          {divisionSantri.length} santri dalam scope divisi{" "}
          {CURRENT_DIVISION_LABEL}. Kelola, assign SoW, dan monitor progress.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 max-lg:flex-col max-lg:items-stretch">
        {/* Search */}
        <div className="flex flex-1 items-center gap-2.5 rounded-[14px] border-[1.5px] border-border bg-surface px-3.5 text-muted transition-[border-color,box-shadow] duration-[180ms] focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]">
          <Iconify icon="solar:magnifer-bold-duotone" width={18} />
          <input
            className="flex-1 border-0 bg-transparent py-3 text-sm text-text outline-none placeholder:text-muted/55"
            placeholder="Cari nama atau ID santri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Status filter */}
        <div className="flex items-center gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStatusFilter(opt.id)}
              className={`rounded-xl px-3.5 py-2 text-[0.78rem] font-bold whitespace-nowrap transition-all ${
                statusFilter === opt.id
                  ? "bg-primary text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)]"
                  : "bg-surface text-text hover:bg-primary-soft border border-border/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Santri cards */}
      <div className="grid grid-cols-3 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1">
        {filtered.map((santri) => (
          <SantriCard
            key={santri.id}
            santri={santri}
            onOpen={() => setSelectedSantriId(santri.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface-strong/50 p-16">
          <Iconify
            icon="solar:users-group-rounded-bold-duotone"
            width={48}
            className="text-muted/30"
          />
          <p className="font-bold text-muted">Tidak ada santri ditemukan</p>
          <p className="text-sm text-muted/60">
            Coba ubah filter atau kata kunci pencarian
          </p>
        </div>
      )}

      <SantriDetailDrawer
        santri={selectedSantri}
        open={Boolean(selectedSantri)}
        onClose={() => setSelectedSantriId(null)}
      />
    </motion.div>
  );
}
