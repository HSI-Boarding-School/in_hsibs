import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import {
  dailyEntries,
  weeklyEntries,
  monthlyEntries,
  type DailyEntry,
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
  Good: "bg-green/10 text-green ring-green/20",
  Okay: "bg-amber/10 text-amber-dark ring-amber/30",
  Tough: "bg-pink/10 text-pink-dark ring-pink/30",
};

const unitGradient: Record<string, string> = {
  "HSI BS": "from-blue-400 to-blue-600",
  "HSI BO": "from-purple-400 to-purple-600",
  "STIT Riyadh": "from-emerald-400 to-emerald-600",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function toShortSid(id: string) {
  return id.replace("IN_HSIBS_", "");
}

type DailyStatus = "pending" | "verified" | "revision";
type MissingStatus = "none" | "reminded" | "done";

const dailyStatusCfg: Record<DailyStatus, { label: string; icon: string; chip: string; ring: string; bg: string }> = {
  pending: {
    label: "Menunggu Review",
    icon: "solar:clock-circle-bold-duotone",
    chip: "bg-amber-50 text-amber-700 ring-amber-200",
    ring: "border-border/60",
    bg: "bg-surface/85",
  },
  verified: {
    label: "Verified",
    icon: "solar:verified-check-bold-duotone",
    chip: "bg-green-50 text-green-700 ring-green-200",
    ring: "border-green-300/50",
    bg: "bg-green-50/40",
  },
  revision: {
    label: "Perlu Revisi",
    icon: "solar:refresh-circle-bold-duotone",
    chip: "bg-blue-50 text-blue-700 ring-blue-200",
    ring: "border-blue-300/50",
    bg: "bg-blue-50/40",
  },
};

const missingStatusCfg: Record<MissingStatus, { label: string; icon: string; chip: string; ring: string; bg: string }> = {
  none: {
    label: "Belum kirim",
    icon: "solar:close-circle-bold-duotone",
    chip: "bg-pink-50 text-pink-700 ring-pink-200",
    ring: "border-border/60",
    bg: "bg-surface/85",
  },
  reminded: {
    label: "Sudah diingatkan",
    icon: "solar:bell-bing-bold-duotone",
    chip: "bg-amber-50 text-amber-700 ring-amber-200",
    ring: "border-amber-300/50",
    bg: "bg-amber-50/40",
  },
  done: {
    label: "Sudah masuk",
    icon: "solar:check-circle-bold-duotone",
    chip: "bg-green-50 text-green-700 ring-green-200",
    ring: "border-green-300/50",
    bg: "bg-green-50/40",
  },
};

function DailyReportList() {
  const dateOptions = useMemo(
    () => [...new Set(dailyEntries.map((e) => e.date))],
    [],
  );
  const [selectedDate, setSelectedDate] = useState(dateOptions[0] ?? "");
  const [statusMap, setStatusMap] = useState<Record<string, DailyStatus>>({});
  const [missingMap, setMissingMap] = useState<Record<string, MissingStatus>>({});
  const [revisionId, setRevisionId] = useState<string | null>(null);
  const [revisionNote, setRevisionNote] = useState("");

  const entries = useMemo(
    () => dailyEntries.filter((entry) => entry.date === selectedDate),
    [selectedDate],
  );

  const submittedSidSet = useMemo(
    () => new Set(entries.map((entry) => entry.sid)),
    [entries],
  );

  const missingSantri = useMemo(
    () => santriList.filter((s) => !submittedSidSet.has(toShortSid(s.id))),
    [submittedSidSet],
  );

  function getDailyId(entry: DailyEntry) {
    return `daily-${entry.sid}-${entry.date}`;
  }

  function getDailyStatus(entry: DailyEntry): DailyStatus {
    return statusMap[getDailyId(entry)] ?? "pending";
  }

  function getMissingId(santriId: string) {
    return `missing-${toShortSid(santriId)}-${selectedDate}`;
  }

  function getMissingStatus(santriId: string): MissingStatus {
    return missingMap[getMissingId(santriId)] ?? "none";
  }

  function handleRevisi(id: string) {
    if (revisionId === id) {
      setRevisionId(null);
      setRevisionNote("");
    } else {
      setRevisionId(id);
      setRevisionNote("");
    }
  }

  function handleVerify(entry: DailyEntry) {
    setStatusMap((prev) => ({ ...prev, [getDailyId(entry)]: "verified" }));
    setRevisionId(null);
    setRevisionNote("");
  }

  function submitRevisi(entry: DailyEntry) {
    setStatusMap((prev) => ({ ...prev, [getDailyId(entry)]: "revision" }));
    setRevisionId(null);
    setRevisionNote("");
  }

  function handleRemind(santriId: string) {
    setMissingMap((prev) => ({ ...prev, [getMissingId(santriId)]: "reminded" }));
  }

  function handleMarkDone(santriId: string) {
    setMissingMap((prev) => ({ ...prev, [getMissingId(santriId)]: "done" }));
  }

  const stats = {
    total: entries.length,
    pending: entries.filter((d) => getDailyStatus(d) === "pending").length,
    verified: entries.filter((d) => getDailyStatus(d) === "verified").length,
    revision: entries.filter((d) => getDailyStatus(d) === "revision").length,
    missing: missingSantri.filter((s) => getMissingStatus(s.id) !== "done").length,
    blockers: entries.filter((d) => d.blocker !== "Clear" && d.blocker).length,
  };

  return (
    <div className="grid gap-5">
      {/* Header card */}
      <div className="rounded-2xl border border-border/60 bg-surface/85 p-4 shadow-[0_4px_14px_rgba(39,49,38,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Iconify icon="solar:document-text-bold-duotone" width={18} />
            </span>
            <div>
              <h2 className="font-(--font-family-head) text-base font-extrabold leading-none text-primary-dark">
                Daily Log
              </h2>
              <p className="mt-1 text-[0.7rem] text-muted">
                {stats.total} laporan masuk · {stats.blockers} blocker
              </p>
            </div>
          </div>

          <div className="min-w-[200px]">
            <CustomSelect
              value={selectedDate}
              onChange={setSelectedDate}
              options={dateOptions.map((date) => ({ value: date, label: date }))}
              icon="solar:calendar-bold-duotone"
              align="right"
              placeholder="Pilih tanggal"
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          <StatCard
            icon="solar:clock-circle-bold-duotone"
            label="Pending"
            value={stats.pending}
            tone="amber"
          />
          <StatCard
            icon="solar:close-circle-bold-duotone"
            label="Belum kirim"
            value={stats.missing}
            tone="pink"
          />
          <StatCard
            icon="solar:verified-check-bold-duotone"
            label="Verified"
            value={stats.verified}
            tone="green"
          />
          <StatCard
            icon="solar:refresh-circle-bold-duotone"
            label="Revisi"
            value={stats.revision}
            tone="blue"
          />
        </div>
      </div>

      {/* Belum kirim */}
      {missingSantri.length > 0 && (
        <section className="grid gap-3">
          <SectionHeader
            icon="solar:user-cross-bold-duotone"
            tone="pink"
            title="Belum Kirim Laporan"
            count={missingSantri.length}
          />

          <div className="grid gap-2">
            {missingSantri.map((santri, i) => {
              const status = getMissingStatus(santri.id);
              const cfg = missingStatusCfg[status];
              const initials = getInitials(santri.name);
              const grad = unitGradient[santri.unit] ?? "from-primary to-primary-dark";
              const isDone = status === "done";

              return (
                <motion.div
                  key={santri.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.015, duration: 0.15 }}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${cfg.ring} ${cfg.bg}`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br font-(--font-family-head) text-[0.75rem] font-extrabold tracking-wide text-white shadow-[0_4px_10px_rgba(39,49,38,0.12)] ${grad}`}
                    aria-hidden
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-text">{santri.name}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-[0.65rem] text-muted">
                      <span className="font-mono font-bold text-primary">{toShortSid(santri.id)}</span>
                      <span className="text-border">•</span>
                      <span className="truncate">{santri.loc}</span>
                      <span className="text-border">•</span>
                      <span>{santri.unit}</span>
                    </p>
                  </div>

                  <StatusChip
                    icon={cfg.icon}
                    label={cfg.label}
                    chipCls={cfg.chip}
                  />

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleRemind(santri.id)}
                      disabled={isDone}
                      className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[0.7rem] font-bold text-amber-700 transition-all hover:bg-amber-100 hover:shadow-[0_4px_10px_rgba(245,158,11,0.18)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-amber-50 disabled:hover:shadow-none"
                    >
                      <Iconify icon="solar:bell-bing-bold-duotone" width={13} />
                      Remind
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkDone(santri.id)}
                      disabled={isDone}
                      className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-[0.7rem] font-bold text-white shadow-[0_4px_10px_rgba(34,197,94,0.25)] transition-all hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-green-600"
                    >
                      <Iconify icon="solar:check-circle-bold-duotone" width={13} />
                      {isDone ? "Sudah" : "Tandai Sudah"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Laporan masuk */}
      <section className="grid gap-3">
        <SectionHeader
          icon="solar:document-text-bold-duotone"
          tone="primary"
          title="Laporan Masuk"
          count={entries.length}
        />

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/40 py-14">
            <Iconify
              icon="solar:inbox-bold-duotone"
              width={36}
              className="text-muted/40"
            />
            <p className="mt-2 text-sm font-bold text-muted">Belum ada laporan masuk</p>
            <p className="mt-1 text-xs text-muted/60">untuk tanggal {selectedDate}</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {entries.map((entry, i) => {
              const id = getDailyId(entry);
              const santri = santriList.find((s) => toShortSid(s.id) === entry.sid);
              const status = getDailyStatus(entry);
              const cfg = dailyStatusCfg[status];
              const initials = santri ? getInitials(santri.name) : entry.sid.slice(0, 2);
              const grad = santri ? unitGradient[santri.unit] ?? "from-primary to-primary-dark" : "from-primary to-primary-dark";
              const isResolved = status !== "pending";

              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.15 }}
                  className={`rounded-2xl border p-4 transition-colors ${cfg.ring} ${cfg.bg}`}
                >
                  <div className="flex items-start gap-3 max-md:flex-col">
                    {/* Avatar + identity */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br font-(--font-family-head) text-sm font-extrabold tracking-wide text-white shadow-[0_4px_10px_rgba(39,49,38,0.12)] ${grad}`}
                      aria-hidden
                    >
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-text">
                          {santri?.name || entry.sid}
                        </span>
                        <span className="font-mono text-[0.65rem] font-bold text-primary">
                          {entry.sid}
                        </span>
                        <span className="text-[0.65rem] text-muted">
                          • {entry.loc} • {entry.date}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-bold ring-1 ring-inset ${moodCls[entry.mood] ?? "bg-surface-strong text-muted ring-border"}`}>
                          <Iconify icon="solar:emoji-funny-circle-bold-duotone" width={11} />
                          {entry.mood}
                        </span>
                        {entry.blocker !== "Clear" && entry.blocker && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[0.6rem] font-bold text-orange ring-1 ring-inset ring-orange-200">
                            <Iconify icon="solar:danger-triangle-bold-duotone" width={11} />
                            Blocker
                          </span>
                        )}
                        <StatusChip
                          icon={cfg.icon}
                          label={cfg.label}
                          chipCls={cfg.chip}
                        />
                      </div>

                      <div className="mt-2.5 grid gap-1 rounded-lg bg-surface-strong/50 p-2.5 text-[0.72rem]">
                        <ReportLine icon="solar:target-bold-duotone" label="Plan" value={entry.plan} />
                        <ReportLine icon="solar:check-square-bold-duotone" label="Done" value={entry.done} />
                        {entry.blocker !== "Clear" && entry.blocker && (
                          <ReportLine
                            icon="solar:danger-triangle-bold-duotone"
                            label="Blocker"
                            value={entry.blocker}
                            valueCls="text-orange font-bold"
                          />
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex shrink-0 items-center gap-1.5 max-md:w-full max-md:justify-end">
                      <button
                        type="button"
                        onClick={() => handleRevisi(id)}
                        disabled={isResolved}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[0.7rem] font-bold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                          revisionId === id
                            ? "border-blue-400 bg-blue-100 text-blue-700"
                            : "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-[0_4px_10px_rgba(59,130,246,0.18)]"
                        }`}
                      >
                        <Iconify icon="solar:refresh-circle-bold-duotone" width={13} />
                        Revisi
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerify(entry)}
                        disabled={isResolved}
                        className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-[0.7rem] font-bold text-white shadow-[0_4px_10px_rgba(34,197,94,0.25)] transition-all hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-green-600"
                      >
                        <Iconify icon="solar:verified-check-bold-duotone" width={13} />
                        Verify
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
                          <Iconify
                            icon="solar:pen-new-square-bold-duotone"
                            width={15}
                            className="shrink-0 text-blue-600"
                          />
                          <input
                            type="text"
                            value={revisionNote}
                            onChange={(e) => setRevisionNote(e.target.value)}
                            placeholder="Tulis catatan revisi untuk santri..."
                            className="flex-1 rounded-lg border border-border/60 bg-surface px-3 py-2 text-xs text-text outline-none placeholder:text-muted/60 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRevisi(id)}
                            className="rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.65rem] font-bold text-muted transition-colors hover:bg-surface-strong hover:text-text"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => submitRevisi(entry)}
                            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[0.7rem] font-bold text-white shadow-[0_4px_10px_rgba(59,130,246,0.25)] transition-all hover:bg-blue-700 active:scale-95"
                          >
                            <Iconify icon="solar:paper-plane-bold-duotone" width={13} />
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
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: string;
  label: string;
  value: number;
  tone: "amber" | "pink" | "green" | "blue";
}) {
  const toneCls = {
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    pink: "bg-pink-50 text-pink-700 ring-pink-200",
    green: "bg-green-50 text-green-700 ring-green-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
  }[tone];

  return (
    <div className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ring-1 ring-inset ${toneCls}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/60">
        <Iconify icon={icon} width={16} />
      </span>
      <div className="min-w-0">
        <div className="font-(--font-family-head) text-lg font-extrabold leading-none">
          {value}
        </div>
        <div className="mt-1 text-[0.6rem] font-bold uppercase tracking-wider opacity-80">
          {label}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  count,
  tone,
}: {
  icon: string;
  title: string;
  count: number;
  tone: "pink" | "primary";
}) {
  const iconCls = tone === "pink" ? "bg-pink-100 text-pink-700" : "bg-primary-soft text-primary";
  return (
    <div className="flex items-center gap-2">
      <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconCls}`}>
        <Iconify icon={icon} width={14} />
      </span>
      <h3 className="font-(--font-family-head) text-sm font-extrabold text-primary-dark">
        {title}
      </h3>
      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-surface-strong px-1.5 text-[0.6rem] font-bold text-muted">
        {count}
      </span>
    </div>
  );
}

function StatusChip({
  icon,
  label,
  chipCls,
}: {
  icon: string;
  label: string;
  chipCls: string;
}) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-bold ring-1 ring-inset ${chipCls}`}>
      <Iconify icon={icon} width={12} />
      {label}
    </span>
  );
}

function ReportLine({
  icon,
  label,
  value,
  valueCls = "text-text",
}: {
  icon: string;
  label: string;
  value: string;
  valueCls?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Iconify icon={icon} width={12} className="mt-0.5 shrink-0 text-primary/60" />
      <div className="min-w-0 flex-1">
        <span className="text-[0.6rem] font-bold uppercase tracking-wider text-muted">{label}</span>
        <p className={`text-[0.75rem] leading-snug ${valueCls}`}>{value || "—"}</p>
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
