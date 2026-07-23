import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import {
  santriList,
  getUnitColor,
  getDivColor,
  getDivLabel,
} from "../../../data/santriData";
import {
  weeklyEntries,
  monthlyEntries,
} from "../../../data/monitoring/reportData";

const CURRENT_REGION = "Regional Barat";
const shortId = (id: string) => id.replace("IN_HSIBS_", "");

type StatusFilter = "all" | "Active" | "On Hold" | "Inactive" | "Alumni";
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

  const filtered = useMemo(() => {
    return santriList.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !s.name.toLowerCase().includes(q) &&
          !s.id.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [search, statusFilter]);

  const selected = useMemo(
    () =>
      selectedId ? (santriList.find((s) => s.id === selectedId) ?? null) : null,
    [selectedId],
  );

  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <div className="flex items-center gap-3">
          <p className="text-xs font-black uppercase tracking-widest text-primary">
            PIC Regional
          </p>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-black text-primary">
            {CURRENT_REGION}
          </span>
        </div>
        <h1 className="mt-1 font-(--font-family-head) text-4xl font-extrabold tracking-tight text-primary-dark">
          Santri Regional
        </h1>
        <p className="mt-1 text-sm text-muted">
          {santriList.length} santri dalam scope regional. PIC Reg dapat melihat
          dan mengelola seluruh santri.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 max-lg:flex-col max-lg:items-stretch">
        <div className="flex flex-1 items-center gap-2.5 rounded-[14px] border-[1.5px] border-border bg-surface px-3.5 text-muted focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]">
          <Iconify icon="solar:magnifer-bold-duotone" width={18} />
          <input
            className="flex-1 border-0 bg-transparent py-3 text-sm text-text outline-none placeholder:text-muted/55"
            placeholder="Cari nama atau ID santri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStatusFilter(opt.id)}
              className={`rounded-xl px-3.5 py-2 text-[0.78rem] font-bold whitespace-nowrap transition-all ${
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

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1">
        {filtered.map((santri, i) => {
          const sid = shortId(santri.id);
          const monthly = monthlyEntries.find((m) => m.sid === sid);
          const weekly = weeklyEntries.find((w) => w.sid === sid);
          return (
            <motion.article
              key={santri.id}
              className="group rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)] hover:border-primary/20 transition-all"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.22 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-(--font-family-head) text-lg font-extrabold text-primary">
                    {santri.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-(--font-family-head) text-base font-extrabold text-primary-dark">
                      {santri.name}
                    </h3>
                    <p className="text-[0.65rem] text-muted">{santri.id}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[0.62rem] font-black ${
                    santri.status === "Active"
                      ? "bg-green-50 text-green-700"
                      : santri.status === "On Hold"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {santri.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span
                  className={`rounded-full px-2.5 py-1 text-[0.62rem] font-bold ${getUnitColor(santri.unit)}`}
                >
                  {santri.unit}
                </span>
                <span className="rounded-full bg-surface-strong px-2.5 py-1 text-[0.62rem] font-bold text-muted">
                  {santri.loc}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {[
                  {
                    label: "SoW",
                    value: `${monthly?.sowPct ?? 0}%`,
                    warn: (monthly?.sowPct ?? 0) < 60,
                  },
                  {
                    label: "Adab",
                    value: `${monthly?.adab ?? "-"}/5`,
                    warn: (monthly?.adab ?? 5) < 3,
                  },
                  {
                    label: "Weekly",
                    value: weekly?.validated ? "OK" : "Pending",
                    warn: !weekly?.validated,
                  },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-lg bg-surface-strong/60 p-2 text-center"
                  >
                    <p className="text-[0.55rem] font-bold uppercase text-muted">
                      {m.label}
                    </p>
                    <p
                      className={`mt-0.5 text-xs font-black ${m.warn ? "text-orange" : "text-primary-dark"}`}
                    >
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2 border-t border-border/60 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedId(santri.id)}
                  className="flex-1 rounded-lg bg-primary px-3 py-2 text-[0.72rem] font-black text-white hover:bg-primary-dark active:scale-95"
                >
                  Detail
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-[0.72rem] font-bold text-muted hover:bg-surface-strong"
                  title="Request Placement Change"
                >
                  <Iconify
                    icon="solar:pen-new-square-bold-duotone"
                    width={15}
                  />
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface-strong/50 p-16">
          <Iconify
            icon="solar:users-group-rounded-bold-duotone"
            width={48}
            className="text-muted/30"
          />
          <p className="font-bold text-muted">Tidak ada santri ditemukan</p>
        </div>
      )}

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
            />
            <motion.div
              className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-[460px] flex-col overflow-y-auto border-l border-border/60 bg-surface shadow-[0_0_60px_rgba(0,0,0,0.2)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="sticky top-0 z-10 border-b border-border/60 bg-surface/95 px-6 py-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.65rem] font-black uppercase tracking-widest text-primary">
                      Santri Detail
                    </p>
                    <h2 className="mt-1 font-(--font-family-head) text-xl font-extrabold text-primary-dark">
                      {selected.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="rounded-lg p-2 text-muted hover:bg-surface-strong hover:text-text"
                  >
                    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                      <path
                        d="M3 3l10 10M13 3L3 13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="grid gap-5 px-6 py-5 content-start">
                {[
                  ["ID", selected.id],
                  ["Unit", selected.unit],
                  ["Lokasi", selected.loc],
                  ["Status", selected.status],
                  ["PIC Regional", selected.picReg],
                ].map(([l, v]) => (
                  <div
                    key={l}
                    className="flex items-center justify-between rounded-lg bg-surface-strong/40 px-3 py-2"
                  >
                    <span className="text-xs font-bold text-muted">{l}</span>
                    <span className="text-xs font-extrabold text-text">
                      {v}
                    </span>
                  </div>
                ))}
                <div>
                  <p className="mb-2 text-[0.65rem] font-black uppercase tracking-wider text-muted">
                    Divisi
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selected.divs.map((d) => (
                      <span
                        key={d}
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${getDivColor(d)}`}
                      >
                        {getDivLabel(d)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[0.78rem] font-black text-white hover:bg-primary-dark active:scale-95"
                  >
                    <Iconify
                      icon="solar:pen-new-square-bold-duotone"
                      width={16}
                    />
                    Request Placement
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-[0.78rem] font-extrabold text-muted hover:bg-surface-strong"
                  >
                    <Iconify icon="solar:user-plus-bold-duotone" width={16} />
                    Assign PIC Div
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
