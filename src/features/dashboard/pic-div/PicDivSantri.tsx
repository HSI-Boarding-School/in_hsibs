import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { santriList, getDivLabel, getUnitColor, getDivColor } from "../../../data/santriData";
import { weeklyEntries, monthlyEntries } from "../../../data/monitoring/reportData";

const CURRENT_DIVISION = "IT";
const CURRENT_DIVISION_LABEL = "IT";
const PIC_NAME = "Kak Andy";

const shortId = (fullId: string) => fullId.replace("IN_HSIBS_", "");

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
        if (!s.name.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q)) return false;
      }
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      return true;
    });
  }, [divisionSantri, search, statusFilter]);

  const selectedSantri = useMemo(
    () => (selectedSantriId ? divisionSantri.find((s) => s.id === selectedSantriId) ?? null : null),
    [selectedSantriId, divisionSantri],
  );

  // Get santri's latest weekly & monthly data
  function getSantriMeta(sid: string) {
    const weekly = weeklyEntries.find((w) => w.sid === sid);
    const monthly = monthlyEntries.find((m) => m.sid === sid);
    return { weekly, monthly };
  }

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
          <p className="text-xs font-black uppercase tracking-widest text-primary">PIC Divisi</p>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-black text-primary">
            {CURRENT_DIVISION_LABEL}
          </span>
        </div>
        <h1 className="mt-1 font-(--font-family-head) text-4xl font-extrabold tracking-tight text-primary-dark">
          Santri Binaan
        </h1>
        <p className="mt-1 text-sm text-muted">
          {divisionSantri.length} santri dalam scope divisi {CURRENT_DIVISION_LABEL}. Kelola, assign SoW, dan monitor progress.
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
        {filtered.map((santri, i) => {
          const sid = shortId(santri.id);
          const { weekly, monthly } = getSantriMeta(sid);
          return (
            <motion.article
              key={santri.id}
              className="group relative overflow-hidden rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)] transition-all hover:border-primary/20 hover:shadow-[0_20px_60px_rgba(39,49,38,0.12)]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
            >
              {/* Status badge */}
              <div className="absolute right-3 top-3">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-black ${
                    santri.status === "Active"
                      ? "bg-green-50 text-green-700"
                      : santri.status === "On Hold"
                        ? "bg-amber-50 text-amber-700"
                        : santri.status === "Inactive"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-blue-50 text-blue-700"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      santri.status === "Active"
                        ? "bg-green-500"
                        : santri.status === "On Hold"
                          ? "bg-amber-500"
                          : santri.status === "Inactive"
                            ? "bg-gray-400"
                            : "bg-blue-500"
                    }`}
                  />
                  {santri.status}
                </span>
              </div>

              {/* Avatar + name */}
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-(--font-family-head) text-lg font-extrabold text-primary">
                  {santri.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-(--font-family-head) text-base font-extrabold text-primary-dark">
                    {santri.name}
                  </h3>
                  <p className="text-xs text-muted">{santri.id}</p>
                </div>
              </div>

              {/* Info tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold ${getUnitColor(santri.unit)}`}>
                  {santri.unit}
                </span>
                <span className="rounded-full bg-surface-strong px-2.5 py-1 text-[0.65rem] font-bold text-muted">
                  {santri.loc}
                </span>
                {santri.divs.map((d) => (
                  <span key={d} className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold ${getDivColor(d)}`}>
                    {getDivLabel(d)}
                  </span>
                ))}
              </div>

              {/* Roles */}
              <div className="mt-3">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">Roles</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {santri.roles.map((role) => (
                    <span key={role} className="rounded-md bg-primary/8 px-2 py-0.5 text-[0.62rem] font-semibold text-primary">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress indicators */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-surface-strong/60 p-2 text-center">
                  <p className="text-[0.58rem] font-bold uppercase text-muted">SoW</p>
                  <p className={`mt-0.5 text-sm font-black ${
                    (monthly?.sowPct ?? 0) >= 60 ? "text-primary-dark" : "text-orange"
                  }`}>
                    {monthly?.sowPct ?? 0}%
                  </p>
                </div>
                <div className="rounded-lg bg-surface-strong/60 p-2 text-center">
                  <p className="text-[0.58rem] font-bold uppercase text-muted">Adab</p>
                  <p className={`mt-0.5 text-sm font-black ${
                    (monthly?.adab ?? 0) >= 3 ? "text-primary-dark" : "text-orange"
                  }`}>
                    {monthly?.adab ?? "-"}/5
                  </p>
                </div>
                <div className="rounded-lg bg-surface-strong/60 p-2 text-center">
                  <p className="text-[0.58rem] font-bold uppercase text-muted">Weekly</p>
                  <p className={`mt-0.5 text-sm font-black ${
                    weekly?.validated ? "text-[#16a34a]" : "text-orange"
                  }`}>
                    {weekly?.validated ? "OK" : "Pending"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedSantriId(santri.id)}
                  className="flex-1 rounded-lg bg-primary px-3 py-2 text-[0.72rem] font-black text-white transition-all hover:bg-primary-dark active:scale-95"
                >
                  Detail
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-[0.72rem] font-bold text-muted transition-colors hover:bg-surface-strong hover:text-text"
                  title="Assign SoW"
                >
                  <Iconify icon="solar:document-add-bold-duotone" width={16} />
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-[0.72rem] font-bold text-muted transition-colors hover:bg-surface-strong hover:text-text"
                  title="Request Adjustment"
                >
                  <Iconify icon="solar:pen-new-square-bold-duotone" width={16} />
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface-strong/50 p-16">
          <Iconify icon="solar:users-group-rounded-bold-duotone" width={48} className="text-muted/30" />
          <p className="font-bold text-muted">Tidak ada santri ditemukan</p>
          <p className="text-sm text-muted/60">Coba ubah filter atau kata kunci pencarian</p>
        </div>
      )}

      {/* Santri Detail Drawer */}
      <AnimatePresence>
        {selectedSantri && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSantriId(null)}
            />
            <motion.div
              className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-[480px] flex-col overflow-y-auto border-l border-border/60 bg-surface shadow-[0_0_60px_rgba(0,0,0,0.2)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Drawer header */}
              <div className="sticky top-0 z-10 border-b border-border/60 bg-surface/95 backdrop-blur-sm px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.65rem] font-black uppercase tracking-widest text-primary">Santri Detail</p>
                    <h2 className="mt-1 font-(--font-family-head) text-xl font-extrabold text-primary-dark">
                      {selectedSantri.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSantriId(null)}
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-strong hover:text-text"
                  >
                    <Iconify icon="mingcute:close-line" width={20} />
                  </button>
                </div>
              </div>

              {/* Drawer content */}
              <div className="flex-1 px-6 py-5 grid gap-5 content-start">
                {/* Basic info */}
                <div className="rounded-xl border border-border/60 bg-surface-strong/40 p-4">
                  <p className="text-[0.65rem] font-black uppercase tracking-wider text-muted mb-3">Informasi Dasar</p>
                  <div className="grid gap-2.5">
                    {[
                      ["ID", selectedSantri.id],
                      ["Unit", selectedSantri.unit],
                      ["Lokasi", selectedSantri.loc],
                      ["Status", selectedSantri.status],
                      ["PIC Regional", selectedSantri.picReg],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
                        <span className="text-xs font-bold text-muted">{label}</span>
                        <span className="text-xs font-extrabold text-text">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divisions */}
                <div className="rounded-xl border border-border/60 bg-surface-strong/40 p-4">
                  <p className="text-[0.65rem] font-black uppercase tracking-wider text-muted mb-3">Divisi</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSantri.divs.map((d) => (
                      <span key={d} className={`rounded-full px-3 py-1.5 text-xs font-bold ${getDivColor(d)}`}>
                        {getDivLabel(d)} ({d})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Roles */}
                <div className="rounded-xl border border-border/60 bg-surface-strong/40 p-4">
                  <p className="text-[0.65rem] font-black uppercase tracking-wider text-muted mb-3">Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSantri.roles.map((r) => (
                      <span key={r} className="rounded-lg bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* PIC Divisi */}
                <div className="rounded-xl border border-border/60 bg-surface-strong/40 p-4">
                  <p className="text-[0.65rem] font-black uppercase tracking-wider text-muted mb-3">PIC Divisi</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSantri.picDivs.map((p) => (
                      <span key={p} className="rounded-lg bg-orange/8 px-3 py-1.5 text-xs font-semibold text-orange">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Report summary */}
                {(() => {
                  const sid = shortId(selectedSantri.id);
                  const weekly = weeklyEntries.find((w) => w.sid === sid);
                  const monthly = monthlyEntries.find((m) => m.sid === sid);
                  return (
                    <div className="rounded-xl border border-border/60 bg-surface-strong/40 p-4">
                      <p className="text-[0.65rem] font-black uppercase tracking-wider text-muted mb-3">Report Summary</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-surface p-3">
                          <p className="text-[0.58rem] font-bold uppercase text-muted">SoW Progress</p>
                          <p className="mt-1 font-(--font-family-head) text-2xl font-extrabold text-primary-dark">
                            {monthly?.sowPct ?? 0}%
                          </p>
                        </div>
                        <div className="rounded-lg bg-surface p-3">
                          <p className="text-[0.58rem] font-bold uppercase text-muted">Adab Score</p>
                          <p className="mt-1 font-(--font-family-head) text-2xl font-extrabold text-primary-dark">
                            {monthly?.adab ?? "-"}/5
                          </p>
                        </div>
                        <div className="rounded-lg bg-surface p-3">
                          <p className="text-[0.58rem] font-bold uppercase text-muted">Learn Attendance</p>
                          <p className="mt-1 font-(--font-family-head) text-2xl font-extrabold text-primary-dark">
                            {monthly?.learnAtt ?? 0}
                          </p>
                        </div>
                        <div className="rounded-lg bg-surface p-3">
                          <p className="text-[0.58rem] font-bold uppercase text-muted">Weekly Validated</p>
                          <p className={`mt-1 font-(--font-family-head) text-2xl font-extrabold ${weekly?.validated ? "text-[#16a34a]" : "text-orange"}`}>
                            {weekly?.validated ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>
                      {monthly?.issues && (
                        <div className="mt-3 rounded-lg bg-orange/5 border border-orange/20 p-3">
                          <p className="text-[0.58rem] font-bold uppercase text-orange">Issues</p>
                          <p className="mt-1 text-xs font-semibold text-text">{monthly.issues}</p>
                        </div>
                      )}
                      {monthly?.followUp && (
                        <div className="mt-2 rounded-lg bg-blue/5 border border-blue/20 p-3">
                          <p className="text-[0.58rem] font-bold uppercase text-blue">Follow Up</p>
                          <p className="mt-1 text-xs font-semibold text-text">{monthly.followUp}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[0.78rem] font-black text-white shadow-[0_10px_22px_rgba(37,99,235,0.24)] transition-all hover:bg-primary-dark active:scale-95"
                  >
                    <Iconify icon="solar:document-add-bold-duotone" width={18} />
                    Assign SoW
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-[0.78rem] font-extrabold text-muted transition-colors hover:bg-surface-strong hover:text-text"
                  >
                    <Iconify icon="solar:pen-new-square-bold-duotone" width={18} />
                    Request Adjustment
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
