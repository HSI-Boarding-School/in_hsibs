import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { useLocalStorageState } from "../../../lib/useLocalStorageState";
import { santriList, getUnitColor } from "../../../data/santriData";
import { monthlyEntries, type MonthlyEntry } from "../../../data/monitoring/reportData";

const CURRENT_DIVISION = "IT";
const CURRENT_DIVISION_LABEL = "IT";
const PIC_NAME = "Kak Andy";

const shortId = (fullId: string) => fullId.replace("IN_HSIBS_", "");

type StatusFilter = "all" | "Green" | "Yellow" | "Red" | "TBD";

const statusFilters: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "Green", label: "Green" },
  { id: "Yellow", label: "Yellow" },
  { id: "Red", label: "Red" },
  { id: "TBD", label: "TBD" },
];

const statusStyle: Record<string, { chip: string; dot: string; label: string }> = {
  Green: { chip: "bg-green-50 text-green-700 ring-green-200", dot: "bg-green-500", label: "Green" },
  Yellow: { chip: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500", label: "Yellow" },
  Red: { chip: "bg-pink-50 text-pink-700 ring-pink-200", dot: "bg-pink-500", label: "Red" },
  TBD: { chip: "bg-surface-strong text-muted ring-border", dot: "bg-border", label: "TBD" },
};

export function PicDivReport() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  // PIC Div notes (editable) + reviewed markers, persisted locally
  const [picNotes, setPicNotes] = useLocalStorageState<Record<string, string>>(
    "in_hsibs.picdiv.report.notes",
    {},
  );
  const [reviewedIds, setReviewedIds] = useLocalStorageState<string[]>(
    "in_hsibs.picdiv.report.reviewed",
    [],
  );
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const divisionSantri = useMemo(
    () => santriList.filter((s) => s.divs.includes(CURRENT_DIVISION)),
    [],
  );
  const santriShortIds = useMemo(
    () => divisionSantri.map((s) => shortId(s.id)),
    [divisionSantri],
  );

  // All monthly entries in division scope
  const divisionEntries = useMemo(
    () => monthlyEntries.filter((m) => santriShortIds.includes(m.sid)),
    [santriShortIds],
  );

  const filtered = useMemo(() => {
    return divisionEntries.filter((entry) => {
      if (statusFilter !== "all" && entry.status !== statusFilter) return false;
      if (search.trim()) {
        const santri = divisionSantri.find((s) => shortId(s.id) === entry.sid);
        const hay = `${entry.sid} ${santri?.name ?? ""} ${santri?.unit ?? ""} ${santri?.loc ?? ""}`.toLowerCase();
        if (!hay.includes(search.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [divisionEntries, statusFilter, search, divisionSantri]);

  const stats = useMemo(() => {
    const green = divisionEntries.filter((e) => e.status === "Green").length;
    const yellow = divisionEntries.filter((e) => e.status === "Yellow").length;
    const red = divisionEntries.filter((e) => e.status === "Red").length;
    const reviewed = divisionEntries.filter((e) => reviewedIds.includes(e.sid)).length;
    const avgSow = divisionEntries.length
      ? Math.round(divisionEntries.reduce((sum, e) => sum + e.sowPct, 0) / divisionEntries.length)
      : 0;
    return { total: divisionEntries.length, green, yellow, red, reviewed, avgSow };
  }, [divisionEntries, reviewedIds]);

  function getSantri(sid: string) {
    return divisionSantri.find((s) => shortId(s.id) === sid);
  }

  function getNote(entry: MonthlyEntry): string {
    return picNotes[entry.sid] ?? entry.picDivNote ?? "";
  }

  function startEditNote(entry: MonthlyEntry) {
    setEditingNoteId(entry.sid);
    setNoteDraft(getNote(entry));
  }

  function saveNote(sid: string) {
    setPicNotes((prev) => ({ ...prev, [sid]: noteDraft.trim() }));
    setEditingNoteId(null);
    setNoteDraft("");
  }

  function toggleReviewed(sid: string) {
    setReviewedIds((prev) =>
      prev.includes(sid) ? prev.filter((id) => id !== sid) : [...prev, sid],
    );
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
          Monthly Evaluation Review
        </h1>
        <p className="mt-1 text-sm text-muted">
          Review draft evaluasi bulanan santri divisi {CURRENT_DIVISION_LABEL} dan berikan PIC note.
          Final approval dilakukan oleh Admin.
        </p>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-5 gap-3 max-lg:grid-cols-3 max-sm:grid-cols-2">
        {[
          {
            label: "Total Evaluasi",
            value: stats.total,
            icon: "solar:document-text-bold-duotone",
            cls: "bg-primary/10 text-primary",
          },
          {
            label: "Green",
            value: stats.green,
            icon: "solar:check-circle-bold-duotone",
            cls: "bg-green-50 text-green-600",
          },
          {
            label: "Yellow",
            value: stats.yellow,
            icon: "solar:danger-triangle-bold-duotone",
            cls: "bg-amber-50 text-amber-600",
          },
          {
            label: "Red",
            value: stats.red,
            icon: "solar:close-circle-bold-duotone",
            cls: "bg-pink-50 text-pink-600",
          },
          {
            label: "Sudah Direview",
            value: `${stats.reviewed}/${stats.total}`,
            icon: "solar:verified-check-bold-duotone",
            cls: "bg-blue/10 text-blue",
          },
        ].map((stat, i) => (
          <motion.article
            key={stat.label}
            className="rounded-xl border border-white/80 bg-surface/85 p-4 shadow-[0_14px_40px_rgba(39,49,38,0.08)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.25 }}
          >
            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${stat.cls}`}>
              <Iconify icon={stat.icon} width={20} />
            </span>
            <p className="mt-3 font-(--font-family-head) text-2xl font-extrabold tracking-tight text-primary-dark">
              {stat.value}
            </p>
            <p className="text-xs font-bold text-muted">{stat.label}</p>
          </motion.article>
        ))}
      </section>

      {/* Filters */}
      <div className="flex items-center gap-3 max-lg:flex-col max-lg:items-stretch">
        <div className="flex flex-1 items-center gap-2.5 rounded-[14px] border-[1.5px] border-border bg-surface px-3.5 text-muted transition-[border-color,box-shadow] duration-[180ms] focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]">
          <Iconify icon="solar:magnifer-bold-duotone" width={18} />
          <input
            className="flex-1 border-0 bg-transparent py-3 text-sm text-text outline-none placeholder:text-muted/55"
            placeholder="Cari santri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 scrollbar-x">
          {statusFilters.map((opt) => (
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

      {/* Evaluation list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/40 py-14">
          <Iconify icon="solar:document-bold-duotone" width={36} className="text-muted/40" />
          <p className="mt-2 text-sm font-bold text-muted">Tidak ada evaluasi yang cocok</p>
          <p className="mt-1 text-xs text-muted/60">Coba ubah filter di atas</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((entry, i) => {
            const santri = getSantri(entry.sid);
            const st = statusStyle[entry.status] ?? statusStyle.TBD;
            const reviewed = reviewedIds.includes(entry.sid);
            const isEditing = editingNoteId === entry.sid;
            const note = getNote(entry);

            return (
              <motion.article
                key={entry.sid}
                className={`rounded-xl border p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)] transition-colors ${
                  reviewed
                    ? "border-green-300/50 bg-green-50/30"
                    : "border-white/80 bg-surface/85"
                }`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
              >
                {/* Top row: identity + status */}
                <div className="flex items-start justify-between gap-3 max-md:flex-col">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-(--font-family-head) text-base font-extrabold text-primary">
                      {santri?.name.charAt(0) ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-(--font-family-head) text-base font-extrabold text-primary-dark">
                          {santri?.name ?? entry.sid}
                        </h3>
                        <span className="font-mono text-[0.65rem] font-bold text-primary">
                          {entry.sid}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {santri && (
                          <span className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold ${getUnitColor(santri.unit)}`}>
                            {santri.unit}
                          </span>
                        )}
                        <span className="rounded-full bg-surface-strong px-2 py-0.5 text-[0.62rem] font-bold text-muted">
                          {santri?.loc ?? "-"}
                        </span>
                        <span className="rounded-full bg-surface-strong px-2 py-0.5 text-[0.62rem] font-bold text-muted">
                          {entry.month}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-black ring-1 ring-inset ${st.chip}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                    {reviewed && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-1 text-[0.65rem] font-black text-white">
                        <Iconify icon="solar:verified-check-bold-duotone" width={12} />
                        Reviewed
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-4 grid grid-cols-4 gap-2 max-sm:grid-cols-2">
                  <MetricBox
                    label="Learn Att."
                    value={`${entry.learnAtt}/1`}
                    tone={entry.learnAtt >= 1 ? "green" : "pink"}
                  />
                  <MetricBox
                    label="Project Approved"
                    value={`${entry.projApproved}`}
                    tone={entry.projApproved >= 1 ? "green" : "amber"}
                  />
                  <MetricBox
                    label="SoW Progress"
                    value={`${entry.sowPct}%`}
                    tone={entry.sowPct >= 75 ? "green" : entry.sowPct >= 50 ? "amber" : "pink"}
                  />
                  <MetricBox
                    label="Adab"
                    value={`${entry.adab}/5`}
                    tone={entry.adab >= 4 ? "green" : entry.adab >= 3 ? "amber" : "pink"}
                  />
                </div>

                {/* Issues & follow up */}
                {(entry.issues || entry.followUp) && (
                  <div className="mt-3 grid gap-2 rounded-lg bg-surface-strong/50 p-3">
                    {entry.issues && (
                      <div className="flex items-start gap-2">
                        <Iconify icon="solar:danger-triangle-bold-duotone" width={13} className="mt-0.5 shrink-0 text-orange" />
                        <div>
                          <p className="text-[0.6rem] font-bold uppercase tracking-wider text-muted">Issues</p>
                          <p className="text-[0.78rem] font-semibold text-orange">{entry.issues}</p>
                        </div>
                      </div>
                    )}
                    {entry.followUp && (
                      <div className="flex items-start gap-2">
                        <Iconify icon="solar:checklist-bold-duotone" width={13} className="mt-0.5 shrink-0 text-primary/70" />
                        <div>
                          <p className="text-[0.6rem] font-bold uppercase tracking-wider text-muted">Follow Up</p>
                          <p className="text-[0.78rem] text-text">{entry.followUp}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes: PIC Reg (read-only) + PIC Div (editable) */}
                <div className="mt-3 grid grid-cols-2 gap-2 max-md:grid-cols-1">
                  <div className="rounded-lg border border-border/60 bg-surface p-3">
                    <p className="flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-wider text-muted">
                      <Iconify icon="solar:map-point-bold-duotone" width={12} className="text-muted" />
                      PIC Region Note
                    </p>
                    <p className="mt-1 text-[0.78rem] text-text">
                      {entry.picRegNote || <span className="italic text-muted/60">Belum ada catatan</span>}
                    </p>
                  </div>

                  <div className={`rounded-lg border p-3 transition-colors ${
                    isEditing ? "border-primary/40 bg-primary-soft/30" : "border-primary/20 bg-primary-soft/15"
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-wider text-primary">
                        <Iconify icon="solar:notebook-bold-duotone" width={12} />
                        PIC Div Note (Kamu)
                      </p>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => startEditNote(entry)}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-[0.62rem] font-bold text-primary transition-colors hover:bg-primary/10"
                        >
                          <Iconify icon="solar:pen-bold-duotone" width={11} />
                          Edit
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="mt-2 grid gap-2">
                        <textarea
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          rows={2}
                          placeholder="Tulis catatan pembinaan untuk santri ini..."
                          className="w-full resize-none rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.78rem] text-text outline-none placeholder:text-muted/55 focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => { setEditingNoteId(null); setNoteDraft(""); }}
                            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[0.68rem] font-bold text-muted transition-colors hover:bg-surface-strong"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => saveNote(entry.sid)}
                            className="rounded-lg bg-primary px-3 py-1.5 text-[0.68rem] font-black text-white transition-all hover:bg-primary-dark active:scale-95"
                          >
                            Simpan Note
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-[0.78rem] text-text">
                        {note || <span className="italic text-muted/60">Belum ada catatan — klik Edit untuk menambahkan</span>}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-3 max-sm:flex-col max-sm:items-stretch">
                  <p className="text-[0.68rem] text-muted">
                    <Iconify icon="solar:info-circle-bold-duotone" width={12} className="mr-1 inline" />
                    Review kamu bersifat draft — final approval oleh Admin.
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleReviewed(entry.sid)}
                    className={`flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-[0.72rem] font-black transition-all active:scale-95 ${
                      reviewed
                        ? "border border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-green-600 text-white shadow-[0_4px_10px_rgba(34,197,94,0.25)] hover:bg-green-700"
                    }`}
                  >
                    <Iconify icon="solar:verified-check-bold-duotone" width={14} />
                    {reviewed ? "Batalkan Review" : "Tandai Sudah Direview"}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Summary footer */}
      <AnimatePresence>
        {stats.reviewed === stats.total && stats.total > 0 && (
          <motion.div
            className="flex items-center gap-3 rounded-xl border border-green-300/60 bg-green-50/60 p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white">
              <Iconify icon="solar:checkmark-circle-bold-duotone" width={22} />
            </span>
            <div>
              <p className="text-sm font-extrabold text-green-800">
                Semua evaluasi bulan ini sudah kamu review, {PIC_NAME}.
              </p>
              <p className="text-xs text-green-700/80">
                Draft akan diteruskan ke Admin untuk final approval dan perhitungan mukafaah.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MetricBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "amber" | "pink";
}) {
  const toneCls = {
    green: "bg-green-50 text-green-700 ring-green-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    pink: "bg-pink-50 text-pink-700 ring-pink-200",
  }[tone];
  return (
    <div className={`rounded-lg px-2 py-2.5 text-center ring-1 ring-inset ${toneCls}`}>
      <div className="font-(--font-family-head) text-sm font-extrabold leading-none">{value}</div>
      <div className="mt-1 text-[0.55rem] font-bold uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}
