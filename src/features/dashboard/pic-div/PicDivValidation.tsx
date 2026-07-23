import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { santriList } from "../../../data/santriData";
import {
  weeklyEntries,
  monthlyEntries,
} from "../../../data/monitoring/reportData";

const CURRENT_DIVISION = "IT";
const CURRENT_DIVISION_LABEL = "IT";
const PIC_NAME = "Kak Andy";

const shortId = (fullId: string) => fullId.replace("IN_HSIBS_", "");

type ValidationTab = "weekly" | "monthly" | "special";

const validationTabs: { id: ValidationTab; label: string; icon: string; description: string }[] = [
  { id: "weekly", label: "Weekly Review", icon: "solar:clipboard-list-bold-duotone", description: "Validasi laporan mingguan santri" },
  { id: "monthly", label: "Monthly Evaluation", icon: "solar:calendar-minimalistic-bold-duotone", description: "Review draft evaluasi bulanan" },
  { id: "special", label: "Special Report", icon: "solar:file-text-bold-duotone", description: "Review laporan khusus tahap pertama" },
];

interface ValidationNote {
  targetId: string;
  type: "weekly" | "monthly" | "special";
  note: string;
}

export function PicDivValidation() {
  const [activeTab, setActiveTab] = useState<ValidationTab>("weekly");
  const [validatedIds, setValidatedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<ValidationNote[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const divisionSantri = useMemo(
    () => santriList.filter((s) => s.divs.includes(CURRENT_DIVISION)),
    [],
  );
  const santriShortIds = useMemo(
    () => divisionSantri.map((s) => shortId(s.id)),
    [divisionSantri],
  );

  // Weekly validation queue
  const weeklyQueue = useMemo(
    () =>
      weeklyEntries.filter(
        (w) => santriShortIds.includes(w.sid) && !w.validated && !validatedIds.has(`w-${w.sid}`),
      ),
    [santriShortIds, validatedIds],
  );

  // Monthly evaluation queue (pending review, not yet finalized)
  const monthlyQueue = useMemo(
    () =>
      monthlyEntries.filter(
        (m) => santriShortIds.includes(m.sid) && !validatedIds.has(`m-${m.sid}`),
      ),
    [santriShortIds, validatedIds],
  );

  // Special reports (mock data for demo)
  const specialReports = useMemo(
    () => [
      {
        id: "SR001",
        santriId: "S03",
        type: "Izin Tidak Hadir Learn",
        date: "2025-06-18",
        reason: "Kegiatan keluarga mendesak",
        status: "pending" as const,
      },
      {
        id: "SR002",
        santriId: "S15",
        type: "Request Perpanjangan Deadline Project",
        date: "2025-06-20",
        reason: "Butuh waktu tambahan untuk quality assurance",
        status: "pending" as const,
      },
      {
        id: "SR003",
        santriId: "S08",
        type: "Permohonan Ganti Role",
        date: "2025-06-21",
        reason: "Ingin fokus ke Developer role",
        status: "pending" as const,
      },
    ].filter((r) => santriShortIds.includes(r.santriId)),
    [santriShortIds],
  );

  function getSantriName(sid: string): string {
    return divisionSantri.find((s) => shortId(s.id) === sid)?.name ?? sid;
  }

  function getSantriLoc(sid: string): string {
    return divisionSantri.find((s) => shortId(s.id) === sid)?.loc ?? "-";
  }

  function handleValidate(id: string) {
    setValidatedIds((prev) => new Set([...prev, id]));
  }

  function handleReject(id: string) {
    setRejectedIds((prev) => new Set([...prev, id]));
    setValidatedIds((prev) => new Set([...prev, id]));
  }

  function handleSaveNote() {
    if (!activeNoteId || !noteText.trim()) return;
    setNotes((prev) => [
      ...prev.filter((n) => n.targetId !== activeNoteId),
      {
        targetId: activeNoteId,
        type: activeTab,
        note: noteText.trim(),
      },
    ]);
    setActiveNoteId(null);
    setNoteText("");
  }

  function getNote(targetId: string): string {
    return notes.find((n) => n.targetId === targetId)?.note ?? "";
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
          Validation & Monitoring
        </h1>
        <p className="mt-1 text-sm text-muted">
          Validasi laporan, review evaluasi, dan kelola special report santri divisi {CURRENT_DIVISION_LABEL}.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 scrollbar-x pb-1">
        {validationTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count =
            tab.id === "weekly"
              ? weeklyQueue.length
              : tab.id === "monthly"
                ? monthlyQueue.length
                : specialReports.length;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2.5 rounded-xl px-5 py-3 text-[0.82rem] font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)]"
                  : "bg-surface text-text hover:bg-primary-soft hover:text-primary-dark border border-border/50"
              }`}
            >
              <Iconify icon={tab.icon} width={18} />
              {tab.label}
              {count > 0 && (
                <span
                  className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.6rem] font-black ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-orange/10 text-orange"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {/* ── Weekly Review Tab ──────────────────────────── */}
          {activeTab === "weekly" && (
            <div className="grid gap-4">
              <div className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
                <div className="mb-4">
                  <h3 className="font-(--font-family-head) text-lg font-extrabold text-primary-dark">
                    Pending Weekly Validation
                  </h3>
                  <p className="text-sm text-muted">
                    {weeklyQueue.length} laporan mingguan menunggu validasi dari {PIC_NAME}
                  </p>
                </div>

                {weeklyQueue.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <Iconify icon="solar:checkmark-circle-bold-duotone" width={40} className="text-[#16a34a]/40" />
                    <p className="text-sm font-bold text-muted">Semua weekly review sudah divalidasi</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {weeklyQueue.map((entry, i) => (
                      <motion.div
                        key={entry.sid}
                        className="rounded-xl border border-border/60 bg-surface p-4"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.25 }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <strong className="text-sm text-primary-dark">
                                {getSantriName(entry.sid)}
                              </strong>
                              <span className="rounded-full bg-surface-strong px-2 py-0.5 text-[0.62rem] font-bold text-muted">
                                {entry.week}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[0.62rem] font-black ${
                                  entry.sowProgress === "Behind"
                                    ? "bg-orange/10 text-orange"
                                    : entry.sowProgress === "Ahead"
                                      ? "bg-[#16a34a]/10 text-[#16a34a]"
                                      : "bg-blue/10 text-blue"
                                }`}
                              >
                                {entry.sowProgress}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-muted">{getSantriLoc(entry.sid)}</p>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() => handleValidate(`w-${entry.sid}`)}
                              className="rounded-lg bg-primary px-3.5 py-2 text-[0.72rem] font-black text-white transition-all hover:bg-primary-dark active:scale-95"
                            >
                              Validate
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(`w-${entry.sid}`)}
                              className="rounded-lg border border-border bg-surface px-3.5 py-2 text-[0.72rem] font-bold text-muted transition-colors hover:bg-surface-strong"
                            >
                              Reject
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2">
                          {entry.highlight && (
                            <div className="rounded-lg bg-[#16a34a]/5 border border-[#16a34a]/20 p-2.5">
                              <p className="text-[0.6rem] font-black uppercase text-[#16a34a]">Highlight</p>
                              <p className="mt-0.5 text-xs font-semibold text-text">{entry.highlight}</p>
                            </div>
                          )}
                          {entry.lowlight && entry.lowlight !== "-" && (
                            <div className="rounded-lg bg-orange/5 border border-orange/20 p-2.5">
                              <p className="text-[0.6rem] font-black uppercase text-orange">Lowlight</p>
                              <p className="mt-0.5 text-xs font-semibold text-text">{entry.lowlight}</p>
                            </div>
                          )}
                          {entry.picNote && (
                            <div className="rounded-lg bg-blue/5 border border-blue/20 p-2.5">
                              <p className="text-[0.6rem] font-black uppercase text-blue">PIC Note</p>
                              <p className="mt-0.5 text-xs font-semibold text-text">{entry.picNote}</p>
                            </div>
                          )}
                        </div>

                        {/* Add note */}
                        <div className="mt-3 border-t border-border/40 pt-3">
                          {activeNoteId === entry.sid ? (
                            <div className="flex items-center gap-2">
                              <input
                                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text outline-none focus:border-primary/40 placeholder:text-muted/50"
                                placeholder="Tulis catatan untuk santri..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSaveNote()}
                              />
                              <button
                                type="button"
                                onClick={handleSaveNote}
                                className="rounded-lg bg-primary px-3 py-2 text-[0.68rem] font-black text-white"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => { setActiveNoteId(null); setNoteText(""); }}
                                className="rounded-lg border border-border bg-surface px-3 py-2 text-[0.68rem] font-bold text-muted"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => { setActiveNoteId(entry.sid); setNoteText(getNote(entry.sid)); }}
                              className="flex items-center gap-1.5 text-[0.72rem] font-bold text-primary transition-colors hover:text-primary-dark"
                            >
                              <Iconify icon="solar:pen-bold-duotone" width={14} />
                              {getNote(entry.sid) ? "Edit Note" : "Add PIC Note"}
                            </button>
                          )}
                          {getNote(entry.sid) && !activeNoteId && (
                            <p className="mt-1.5 rounded-lg bg-primary/5 border border-primary/20 p-2 text-xs text-primary-dark">
                              {getNote(entry.sid)}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Monthly Evaluation Tab ─────────────────────── */}
          {activeTab === "monthly" && (
            <div className="grid gap-4">
              <div className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
                <div className="mb-4">
                  <h3 className="font-(--font-family-head) text-lg font-extrabold text-primary-dark">
                    Monthly Evaluation Draft
                  </h3>
                  <p className="text-sm text-muted">
                    {monthlyQueue.length} evaluasi bulanan menunggu review dari {PIC_NAME}
                  </p>
                </div>

                {monthlyQueue.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <Iconify icon="solar:checkmark-circle-bold-duotone" width={40} className="text-[#16a34a]/40" />
                    <p className="text-sm font-bold text-muted">Semua evaluasi sudah direview</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {monthlyQueue.map((entry, i) => (
                      <motion.div
                        key={entry.sid}
                        className="rounded-xl border border-border/60 bg-surface p-4"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.25 }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <strong className="text-sm text-primary-dark">
                                {getSantriName(entry.sid)}
                              </strong>
                              <span className="rounded-full bg-surface-strong px-2 py-0.5 text-[0.62rem] font-bold text-muted">
                                {entry.month}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[0.62rem] font-black ${
                                  entry.status === "Red"
                                    ? "bg-red-50 text-red-700"
                                    : entry.status === "Yellow"
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-green-50 text-green-700"
                                }`}
                              >
                                {entry.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() => handleValidate(`m-${entry.sid}`)}
                              className="rounded-lg bg-primary px-3.5 py-2 text-[0.72rem] font-black text-white transition-all hover:bg-primary-dark active:scale-95"
                            >
                              Review Done
                            </button>
                          </div>
                        </div>

                        {/* Metrics grid */}
                        <div className="mt-3 grid grid-cols-5 gap-2">
                          {[
                            { label: "SoW %", value: `${entry.sowPct}%`, warn: entry.sowPct < 50 },
                            { label: "Adab", value: `${entry.adab}/5`, warn: entry.adab < 3 },
                            { label: "Learn", value: String(entry.learnAtt), warn: entry.learnAtt === 0 },
                            { label: "Projects", value: String(entry.projApproved), warn: entry.projApproved === 0 },
                            { label: "Status", value: entry.status, warn: entry.status !== "Green" },
                          ].map((metric) => (
                            <div key={metric.label} className="rounded-lg bg-surface-strong/60 p-2.5 text-center">
                              <p className="text-[0.58rem] font-bold uppercase text-muted">{metric.label}</p>
                              <p className={`mt-0.5 text-sm font-black ${metric.warn ? "text-orange" : "text-primary-dark"}`}>
                                {metric.value}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Issues & Notes */}
                        <div className="mt-3 grid gap-2">
                          {entry.issues && (
                            <div className="rounded-lg bg-orange/5 border border-orange/20 p-2.5">
                              <p className="text-[0.6rem] font-black uppercase text-orange">Issues</p>
                              <p className="mt-0.5 text-xs font-semibold text-text">{entry.issues}</p>
                            </div>
                          )}
                          {entry.followUp && (
                            <div className="rounded-lg bg-blue/5 border border-blue/20 p-2.5">
                              <p className="text-[0.6rem] font-black uppercase text-blue">Follow Up</p>
                              <p className="mt-0.5 text-xs font-semibold text-text">{entry.followUp}</p>
                            </div>
                          )}
                          {entry.picDivNote && (
                            <div className="rounded-lg bg-purple/5 border border-purple/20 p-2.5">
                              <p className="text-[0.6rem] font-black uppercase text-purple">PIC Div Note</p>
                              <p className="mt-0.5 text-xs font-semibold text-text">{entry.picDivNote}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Special Report Tab ─────────────────────────── */}
          {activeTab === "special" && (
            <div className="grid gap-4">
              <div className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
                <div className="mb-4">
                  <h3 className="font-(--font-family-head) text-lg font-extrabold text-primary-dark">
                    Special Report Review
                  </h3>
                  <p className="text-sm text-muted">
                    {specialReports.length} special report menunggu review tahap pertama dari {PIC_NAME}
                  </p>
                </div>

                {specialReports.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <Iconify icon="solar:checkmark-circle-bold-duotone" width={40} className="text-[#16a34a]/40" />
                    <p className="text-sm font-bold text-muted">Tidak ada special report pending</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {specialReports.map((report, i) => (
                      <motion.div
                        key={report.id}
                        className="rounded-xl border border-border/60 bg-surface p-4"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.25 }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="rounded-full bg-purple/10 px-2.5 py-1 text-[0.65rem] font-black text-purple">
                                {report.type}
                              </span>
                              <span className="text-[0.65rem] text-muted">{report.date}</span>
                            </div>
                            <h4 className="mt-2 text-sm font-extrabold text-primary-dark">
                              {getSantriName(report.santriId)}
                            </h4>
                            <p className="mt-1 text-xs text-muted">{report.reason}</p>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              className="rounded-lg bg-primary px-3.5 py-2 text-[0.72rem] font-black text-white transition-all hover:bg-primary-dark active:scale-95"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="rounded-lg border border-border bg-surface px-3.5 py-2 text-[0.72rem] font-bold text-muted transition-colors hover:bg-surface-strong"
                            >
                              Reject
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 rounded-lg bg-surface-strong/40 p-3">
                          <p className="text-[0.6rem] font-black uppercase text-muted">Review Notes</p>
                          <p className="mt-1 text-xs text-muted italic">
                            Review tahap pertama oleh PIC Divisi. Final approval memerlukan Admin.
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
