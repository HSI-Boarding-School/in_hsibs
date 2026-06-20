import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import {
  dailyEntries,
  weeklyEntries,
  monthlyEntries,
  type WeeklyEntry,
} from "../../../data/monitoring/reportData";
import { santriList } from "../../../data/santriData";

type ViewTab = "daily" | "weekly" | "monthly";

const viewTabs: { id: ViewTab; label: string; icon: string }[] = [
  { id: "daily", label: "Daily Log", icon: "solar:document-text-bold-duotone" },
  { id: "weekly", label: "Weekly Review", icon: "solar:clipboard-list-bold-duotone" },
  { id: "monthly", label: "Monthly Evaluation", icon: "solar:chart-square-bold-duotone" },
];

export function AdminDashboardReport() {
  const [tab, setTab] = useState<ViewTab>("weekly");

  return (
    <motion.div
      className="grid gap-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-primary">
          Report Management
        </p>
        <h1 className="font-(--font-family-head) text-4xl font-extrabold tracking-tight text-primary-dark">
          Report
        </h1>
        <p className="mt-1 text-sm text-muted">
          Review dan verifikasi laporan pengabdian santri.
        </p>
      </div>

      <div className="flex items-center gap-2 scrollbar-x pb-1">
        {viewTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-[0.82rem] font-bold whitespace-nowrap transition-all duration-200 ${
              tab === t.id
                ? "bg-primary text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)]"
                : "bg-surface text-text hover:bg-primary-soft hover:text-primary-dark border border-border/50"
            }`}
          >
            <Iconify icon={t.icon} width={18} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "daily" && <DailyReportList />}
      {tab === "weekly" && <WeeklyReportList />}
      {tab === "monthly" && <MonthlyReportList />}
    </motion.div>
  );
}

// ─── Daily Report ────────────────────────────────────────────
const moodCls: Record<string, string> = {
  Good: "bg-green/10 text-green",
  Okay: "bg-amber/10 text-amber-dark",
  Tough: "bg-pink/10 text-pink-dark",
};

function DailyReportList() {
  const [revisionId, setRevisionId] = useState<string | null>(null);
  const [revisionNote, setRevisionNote] = useState("");

  const entries = dailyEntries;

  function handleRevisi(id: string) {
    if (revisionId === id) {
      setRevisionId(null);
      setRevisionNote("");
    } else {
      setRevisionId(id);
      setRevisionNote("");
    }
  }

  function handleVerify() {
    setRevisionId(null);
    setRevisionNote("");
  }

  const stats = {
    total: entries.length,
    good: entries.filter((d) => d.mood === "Good").length,
    okay: entries.filter((d) => d.mood === "Okay").length,
    tough: entries.filter((d) => d.mood === "Tough").length,
    blockers: entries.filter((d) => d.blocker !== "Clear" && d.blocker).length,
  };

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-4 text-xs text-muted">
        <span className="font-bold text-text">{stats.total} entries</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green" />
          Good {stats.good}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber" />
          Okay {stats.okay}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-pink" />
          Tough {stats.tough}
        </span>
        <span className="flex items-center gap-1">
          <Iconify icon="solar:alert-triangle-bold-duotone" width={12} className="text-orange" />
          {stats.blockers} blockers
        </span>
      </div>

      <div className="grid gap-2">
        {entries.map((entry, i) => {
          const id = `daily-${entry.sid}-${entry.date}`;
          const santri = santriList.find((s) => s.id === entry.sid);
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.15 }}
              className="rounded-xl border border-border/60 bg-surface/85 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[0.7rem] font-bold text-primary">{entry.sid}</span>
                    <span className="text-sm font-bold text-text">
                      {santri?.name || entry.sid}
                    </span>
                    <span className="text-xs text-muted">{entry.loc}</span>
                    <span className="text-xs text-muted">· {entry.date}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-[0.75rem] text-muted">
                    <span><span className="font-bold text-text">Plan:</span> {entry.plan || "—"}</span>
                    <span><span className="font-bold text-text">Done:</span> {entry.done || "—"}</span>
                    <span>
                      <span className="font-bold text-text">Blocker:</span>{" "}
                      {entry.blocker !== "Clear" ? (
                        <span className="text-orange">{entry.blocker}</span>
                      ) : "Clear"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[0.65rem] font-bold ${moodCls[entry.mood] || "bg-surface-strong text-muted"}`}>
                    {entry.mood}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRevisi(id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-amber/10 hover:text-amber-dark"
                    title="Minta revisi"
                  >
                    <Iconify icon="mingcute:edit-line" width={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleVerify}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-green/10 hover:text-green"
                    title="Verify"
                  >
                    <Iconify icon="mingcute:check-line" width={16} />
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {revisionId === id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 flex items-center gap-2 border-t border-border/40 pt-3">
                      <input
                        type="text"
                        value={revisionNote}
                        onChange={(e) => setRevisionNote(e.target.value)}
                        placeholder="Catatan revisi..."
                        className="flex-1 rounded-lg border border-border/60 bg-surface px-3 py-2 text-xs text-text outline-none placeholder:text-muted focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                      />
                      <button
                        type="button"
                        onClick={() => { setRevisionId(null); setRevisionNote(""); }}
                        className="rounded-lg bg-amber px-3 py-2 text-[0.65rem] font-bold text-white transition-all hover:bg-amber-dark active:scale-95"
                      >
                        Kirim Revisi
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Weekly Report ───────────────────────────────────────────
type WeeklyStatus = "verified" | "revision" | "pending";

function WeeklyReportList() {
  const [statusMap, setStatusMap] = useState<Record<string, WeeklyStatus>>({});
  const [revisionId, setRevisionId] = useState<string | null>(null);
  const [revisionNote, setRevisionNote] = useState("");

  function getStatus(entry: WeeklyEntry): WeeklyStatus {
    const key = `${entry.sid}-${entry.week}`;
    return statusMap[key] || (entry.validated ? "verified" : "pending");
  }

  function handleVerify(entry: WeeklyEntry) {
    const key = `${entry.sid}-${entry.week}`;
    setStatusMap((prev) => ({ ...prev, [key]: "verified" }));
    setRevisionId(null);
    setRevisionNote("");
  }

  function handleRevisi(entry: WeeklyEntry) {
    const key = `${entry.sid}-${entry.week}`;
    if (revisionId === key) {
      setRevisionId(null);
      setRevisionNote("");
      return;
    }
    setRevisionId(key);
    setRevisionNote("");
  }

  function submitRevisi(entry: WeeklyEntry) {
    const key = `${entry.sid}-${entry.week}`;
    setStatusMap((prev) => ({ ...prev, [key]: "revision" }));
    setRevisionId(null);
    setRevisionNote("");
  }

  const entries = weeklyEntries;

  const stats = {
    total: entries.length,
    verified: entries.filter((e) => getStatus(e) === "verified").length,
    pending: entries.filter((e) => getStatus(e) === "pending").length,
    revision: entries.filter((e) => getStatus(e) === "revision").length,
    onTrack: entries.filter((e) => e.sowProgress === "On Track").length,
    behind: entries.filter((e) => e.sowProgress === "Behind").length,
  };

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-4 text-xs text-muted">
        <span className="font-bold text-text">{stats.total} entries</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green" />
          Verified {stats.verified}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber" />
          Pending {stats.pending}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-pink" />
          Revisi {stats.revision}
        </span>
        <span className="flex items-center gap-1">
          <Iconify icon="solar:turntable-music-note-bold-duotone" width={12} className="text-green" />
          On Track {stats.onTrack}
        </span>
        <span className="flex items-center gap-1">
          <Iconify icon="solar:alert-triangle-bold-duotone" width={12} className="text-orange" />
          Behind {stats.behind}
        </span>
      </div>

      <div className="grid gap-2">
        {entries.map((entry, i) => {
          const id = `weekly-${entry.sid}-${entry.week}`;
          const status = getStatus(entry);
          const santri = santriList.find((s) => s.id === entry.sid);
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.15 }}
              className={`rounded-xl border p-4 ${
                status === "verified"
                  ? "border-green/20 bg-green/[0.02]"
                  : status === "revision"
                    ? "border-pink/20 bg-pink/[0.02]"
                    : "border-border/60 bg-surface/85"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[0.7rem] font-bold text-primary">{entry.sid}</span>
                    <span className="text-sm font-bold text-text">
                      {santri?.name || entry.sid}
                    </span>
                    {santri?.loc && <span className="text-xs text-muted">{santri.loc}</span>}
                    <span className="text-xs text-muted">· {entry.week}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.55rem] font-bold ${
                        entry.sowProgress === "On Track"
                          ? "bg-green/10 text-green"
                          : entry.sowProgress === "Ahead"
                            ? "bg-blue/10 text-blue"
                            : "bg-amber/10 text-amber-dark"
                      }`}
                    >
                      {entry.sowProgress}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-[0.75rem] text-muted">
                    <span><span className="font-bold text-text">Highlight:</span> {entry.highlight || "—"}</span>
                    <span><span className="font-bold text-text">Lowlight:</span> {entry.lowlight || "—"}</span>
                    {entry.picNote && <span><span className="font-bold text-text">Note:</span> {entry.picNote}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[0.6rem] font-bold ${
                      status === "verified"
                        ? "bg-green/10 text-green"
                        : status === "revision"
                          ? "bg-pink/10 text-pink"
                          : "bg-amber/10 text-amber-dark"
                    }`}
                  >
                    {status === "verified" ? "Verified" : status === "revision" ? "Revisi" : "Pending"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRevisi(entry)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-amber/10 hover:text-amber-dark"
                    title="Minta revisi"
                  >
                    <Iconify icon="mingcute:edit-line" width={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerify(entry)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-green/10 hover:text-green"
                    title="Verify"
                  >
                    <Iconify icon="mingcute:check-line" width={16} />
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {revisionId === id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 flex items-center gap-2 border-t border-border/40 pt-3">
                      <input
                        type="text"
                        value={revisionNote}
                        onChange={(e) => setRevisionNote(e.target.value)}
                        placeholder="Catatan revisi..."
                        className="flex-1 rounded-lg border border-border/60 bg-surface px-3 py-2 text-xs text-text outline-none placeholder:text-muted focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                      />
                      <button
                        type="button"
                        onClick={() => submitRevisi(entry)}
                        className="rounded-lg bg-amber px-3 py-2 text-[0.65rem] font-bold text-white transition-all hover:bg-amber-dark active:scale-95"
                      >
                        Kirim Revisi
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Monthly Report ──────────────────────────────────────────
const statusCls: Record<string, string> = {
  Green: "bg-green/10 text-green",
  Yellow: "bg-amber/10 text-amber-dark",
  Red: "bg-pink/10 text-pink-dark",
  TBD: "bg-surface-strong text-muted",
};

function MonthlyReportList() {
  const [revisionId, setRevisionId] = useState<string | null>(null);
  const [revisionNote, setRevisionNote] = useState("");

  const entries = monthlyEntries;

  function handleRevisi(id: string) {
    if (revisionId === id) {
      setRevisionId(null);
      setRevisionNote("");
    } else {
      setRevisionId(id);
      setRevisionNote("");
    }
  }

  function handleVerify() {
    setRevisionId(null);
    setRevisionNote("");
  }

  const stats = {
    total: entries.length,
    green: entries.filter((m) => m.status === "Green").length,
    yellow: entries.filter((m) => m.status === "Yellow").length,
    red: entries.filter((m) => m.status === "Red").length,
    tbd: entries.filter((m) => m.status === "TBD").length,
  };

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-4 text-xs text-muted">
        <span className="font-bold text-text">{stats.total} entries</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green" />
          Green {stats.green}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber" />
          Yellow {stats.yellow}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-pink" />
          Red {stats.red}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          TBD {stats.tbd}
        </span>
      </div>

      <div className="grid gap-2">
        {entries.map((entry, i) => {
          const id = `monthly-${entry.sid}-${entry.month}`;
          const santri = santriList.find((s) => s.id === entry.sid);
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.15 }}
              className="rounded-xl border border-border/60 bg-surface/85 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[0.7rem] font-bold text-primary">{entry.sid}</span>
                    <span className="text-sm font-bold text-text">
                      {santri?.name || entry.sid}
                    </span>
                    {santri?.loc && <span className="text-xs text-muted">{santri.loc}</span>}
                    <span className="text-xs text-muted">· {entry.month}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-[0.75rem] text-muted">
                    <span><span className="font-bold text-text">Learn:</span> {entry.learnAtt}/1</span>
                    <span><span className="font-bold text-text">Projects:</span> {entry.projApproved}/6</span>
                    <span><span className="font-bold text-text">SoW:</span> {entry.sowPct}%</span>
                    <span><span className="font-bold text-text">Adab:</span> {entry.adab}/5</span>
                  </div>
                  {entry.issues && (
                    <p className="mt-1 text-[0.7rem] text-orange">
                      <span className="font-bold">Issues:</span> {entry.issues}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[0.6rem] font-bold ${statusCls[entry.status] || "bg-surface-strong text-muted"}`}>
                    {entry.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRevisi(id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-amber/10 hover:text-amber-dark"
                    title="Minta revisi"
                  >
                    <Iconify icon="mingcute:edit-line" width={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleVerify}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-green/10 hover:text-green"
                    title="Verify"
                  >
                    <Iconify icon="mingcute:check-line" width={16} />
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {revisionId === id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 flex items-center gap-2 border-t border-border/40 pt-3">
                      <input
                        type="text"
                        value={revisionNote}
                        onChange={(e) => setRevisionNote(e.target.value)}
                        placeholder="Catatan revisi..."
                        className="flex-1 rounded-lg border border-border/60 bg-surface px-3 py-2 text-xs text-text outline-none placeholder:text-muted focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                      />
                      <button
                        type="button"
                        onClick={() => { setRevisionId(null); setRevisionNote(""); }}
                        className="rounded-lg bg-amber px-3 py-2 text-[0.65rem] font-bold text-white transition-all hover:bg-amber-dark active:scale-95"
                      >
                        Kirim Revisi
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
