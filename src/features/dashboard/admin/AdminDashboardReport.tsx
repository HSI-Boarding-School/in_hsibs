import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import {
  dailyEntries,
  weeklyEntries,
  monthlyEntries,
  type DailyEntry,
  type WeeklyEntry,
  type MonthlyEntry,
} from "../../../data/monitoring/reportData";
import { santriList } from "../../../data/santriData";

type ViewTab = "queue" | "history";

const viewTabs: { id: ViewTab; label: string; icon: string }[] = [
  { id: "queue", label: "Report Queue", icon: "solar:inbox-archive-bold-duotone" },
  { id: "history", label: "History", icon: "solar:history-bold-duotone" },
];

// ─── History event types ─────────────────────────────────────
type ReportScope = "daily" | "weekly" | "monthly";
type ReportAction = "verify" | "revisi" | "remind" | "sudah";

interface ReportEvent {
  id: string;
  timestamp: number;
  scope: ReportScope;
  action: ReportAction;
  santriId: string;
  santriName: string;
  period: string;
  note?: string;
}

type RecordEventFn = (event: Omit<ReportEvent, "id" | "timestamp">) => void;

const scopeMeta: Record<ReportScope, { label: string; icon: string; tone: string }> = {
  daily: { label: "Daily", icon: "solar:document-text-bold-duotone", tone: "bg-blue-50 text-blue-700 ring-blue-200" },
  weekly: { label: "Weekly", icon: "solar:clipboard-list-bold-duotone", tone: "bg-purple-50 text-purple-700 ring-purple-200" },
  monthly: { label: "Monthly", icon: "solar:chart-square-bold-duotone", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
};

const actionMeta: Record<ReportAction, { label: string; icon: string; tone: string; dot: string }> = {
  verify: { label: "Verified", icon: "solar:verified-check-bold-duotone", tone: "bg-green-50 text-green-700 ring-green-200", dot: "bg-green-500" },
  revisi: { label: "Minta Revisi", icon: "solar:refresh-circle-bold-duotone", tone: "bg-blue-50 text-blue-700 ring-blue-200", dot: "bg-blue-500" },
  remind: { label: "Diingatkan", icon: "solar:bell-bing-bold-duotone", tone: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  sudah: { label: "Tandai Sudah", icon: "solar:check-circle-bold-duotone", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
};

export function AdminDashboardReport() {
  const [tab, setTab] = useState<ViewTab>("queue");
  const [events, setEvents] = useState<ReportEvent[]>([]);

  const recordEvent = useCallback<RecordEventFn>((event) => {
    setEvents((prev) => [
      {
        ...event,
        id: `${event.scope}-${event.action}-${event.santriId}-${event.period}-${Date.now()}`,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  }, []);

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
            {t.id === "history" && events.length > 0 && (
              <span className={`ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[0.55rem] font-black ${
                tab === t.id ? "bg-white/20 text-white" : "bg-primary text-white"
              }`}>
                {events.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "queue" && <ReportQueue onEvent={recordEvent} />}
      {tab === "history" && <HistoryView events={events} onClear={() => setEvents([])} />}
    </motion.div>
  );
}

// ─── Shared helpers & config ─────────────────────────────────
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
type ReportStatusFilter = "all" | DailyStatus | "missing" | "reminded" | "done";

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

// ─── Report Queue ────────────────────────────────────────────
type QueueScope = "daily" | "weekly" | "monthly";

interface QueueEntry {
  id: string;
  scope: QueueScope;
  santriId: string; // short sid
  period: string; // date / week / month
  sortKey: number;
  raw: DailyEntry | WeeklyEntry | MonthlyEntry;
}

const scopeChip: Record<QueueScope, { label: string; icon: string; tone: string }> = {
  daily: {
    label: "Daily",
    icon: "solar:document-text-bold-duotone",
    tone: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  weekly: {
    label: "Weekly",
    icon: "solar:clipboard-list-bold-duotone",
    tone: "bg-purple-50 text-purple-700 ring-purple-200",
  },
  monthly: {
    label: "Monthly",
    icon: "solar:chart-square-bold-duotone",
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
};

const MONTH_INDEX: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

function parseDailySort(date: string): number {
  // "DD/MM" — assume year 2026
  const [d, m] = date.split("/").map(Number);
  if (!d || !m) return 0;
  return new Date(2026, m - 1, d).getTime();
}

function parseWeeklySort(week: string): number {
  // "W24" — approximate using ISO week of 2026
  const n = Number(week.replace(/^W/i, "")) || 0;
  return new Date(2026, 0, n * 7).getTime();
}

function parseMonthlySort(month: string): number {
  // "Jun 2025"
  const [m, y] = month.split(" ");
  const idx = MONTH_INDEX[m] ?? 1;
  return new Date(Number(y) || 2025, idx - 1, 1).getTime();
}

function ReportQueue({ onEvent }: { onEvent: RecordEventFn }) {
  // Build unified entries
  const allEntries = useMemo<QueueEntry[]>(() => {
    const daily: QueueEntry[] = dailyEntries.map((d) => ({
      id: `daily-${d.sid}-${d.date}`,
      scope: "daily",
      santriId: d.sid,
      period: d.date,
      sortKey: parseDailySort(d.date),
      raw: d,
    }));
    const weekly: QueueEntry[] = weeklyEntries.map((w) => ({
      id: `weekly-${w.sid}-${w.week}`,
      scope: "weekly",
      santriId: w.sid,
      period: w.week,
      sortKey: parseWeeklySort(w.week),
      raw: w,
    }));
    const monthly: QueueEntry[] = monthlyEntries.map((m) => ({
      id: `monthly-${m.sid}-${m.month}`,
      scope: "monthly",
      santriId: m.sid,
      period: m.month,
      sortKey: parseMonthlySort(m.month),
      raw: m,
    }));
    return [...daily, ...weekly, ...monthly].sort((a, b) => b.sortKey - a.sortKey);
  }, []);

  // Filters
  const [scopeFilter, setScopeFilter] = useState<"all" | QueueScope>("all");
  const [statusFilter, setStatusFilter] = useState<ReportStatusFilter>("all");
  const [search, setSearch] = useState("");

  // Decision per-entry: pending / verified / revision
  const [statusMap, setStatusMap] = useState<Record<string, DailyStatus>>({});
  // Today's daily-missing reminder state, keyed by santri short id
  const [missingMap, setMissingMap] = useState<Record<string, MissingStatus>>({});
  const [revisionId, setRevisionId] = useState<string | null>(null);
  const [revisionNote, setRevisionNote] = useState("");

  function getStatus(entry: QueueEntry): DailyStatus {
    if (statusMap[entry.id]) return statusMap[entry.id];
    if (entry.scope === "weekly" && (entry.raw as WeeklyEntry).validated) return "verified";
    return "pending";
  }

  function setStatus(entry: QueueEntry, status: DailyStatus) {
    setStatusMap((prev) => ({ ...prev, [entry.id]: status }));
  }

  // Today's daily-missing list (use most recent daily date)
  const latestDailyDate = useMemo(() => {
    const dates = [...new Set(dailyEntries.map((d) => d.date))].sort(
      (a, b) => parseDailySort(b) - parseDailySort(a),
    );
    return dates[0] ?? "";
  }, []);

  const todayDaily = useMemo(
    () => dailyEntries.filter((e) => e.date === latestDailyDate),
    [latestDailyDate],
  );

  const todayDailySidSet = useMemo(
    () => new Set(todayDaily.map((e) => e.sid)),
    [todayDaily],
  );

  const missingSantri = useMemo(
    () => santriList.filter((s) => !todayDailySidSet.has(toShortSid(s.id))),
    [todayDailySidSet],
  );

  function getMissingId(santriId: string) {
    return `missing-${toShortSid(santriId)}-${latestDailyDate}`;
  }

  function getMissingStatus(santriId: string): MissingStatus {
    return missingMap[getMissingId(santriId)] ?? "none";
  }

  function matchesSearch(text: string) {
    if (!search.trim()) return true;
    return text.toLowerCase().includes(search.trim().toLowerCase());
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

  function handleVerify(entry: QueueEntry) {
    setStatus(entry, "verified");
    setRevisionId(null);
    setRevisionNote("");
    const santri = santriList.find((s) => toShortSid(s.id) === entry.santriId);
    onEvent({
      scope: entry.scope,
      action: "verify",
      santriId: entry.santriId,
      santriName: santri?.name ?? entry.santriId,
      period: entry.period,
    });
  }

  function submitRevisi(entry: QueueEntry) {
    setStatus(entry, "revision");
    const santri = santriList.find((s) => toShortSid(s.id) === entry.santriId);
    onEvent({
      scope: entry.scope,
      action: "revisi",
      santriId: entry.santriId,
      santriName: santri?.name ?? entry.santriId,
      period: entry.period,
      note: revisionNote.trim() || undefined,
    });
    setRevisionId(null);
    setRevisionNote("");
  }

  function handleRemind(santriId: string) {
    setMissingMap((prev) => ({ ...prev, [getMissingId(santriId)]: "reminded" }));
    const santri = santriList.find((s) => s.id === santriId);
    onEvent({
      scope: "daily",
      action: "remind",
      santriId: toShortSid(santriId),
      santriName: santri?.name ?? santriId,
      period: latestDailyDate,
    });
  }

  function handleMarkDone(santriId: string) {
    setMissingMap((prev) => ({ ...prev, [getMissingId(santriId)]: "done" }));
    const santri = santriList.find((s) => s.id === santriId);
    onEvent({
      scope: "daily",
      action: "sudah",
      santriId: toShortSid(santriId),
      santriName: santri?.name ?? santriId,
      period: latestDailyDate,
    });
  }

  // Apply filters
  const filtered = useMemo(() => {
    return allEntries.filter((entry) => {
      if (scopeFilter !== "all" && entry.scope !== scopeFilter) return false;
      if (
        statusFilter !== "all" &&
        statusFilter !== "pending" &&
        statusFilter !== "verified" &&
        statusFilter !== "revision"
      ) return false;
      if (statusFilter !== "all" && getStatus(entry) !== statusFilter) return false;
      const santri = santriList.find((s) => toShortSid(s.id) === entry.santriId);
      const hay = `${entry.santriId} ${santri?.name ?? ""} ${santri?.unit ?? ""} ${santri?.loc ?? ""} ${entry.period}`;
      if (!matchesSearch(hay)) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allEntries, scopeFilter, statusFilter, search, statusMap]);

  const filteredMissingSantri = useMemo(() => {
    return missingSantri.filter((santri) => {
      if (scopeFilter !== "all" && scopeFilter !== "daily") return false;
      const missingStatus = getMissingStatus(santri.id);
      if (statusFilter === "pending" || statusFilter === "verified" || statusFilter === "revision") return false;
      if (statusFilter === "missing" && missingStatus !== "none") return false;
      if (statusFilter === "reminded" && missingStatus !== "reminded") return false;
      if (statusFilter === "done" && missingStatus !== "done") return false;
      const hay = `${toShortSid(santri.id)} ${santri.name} ${santri.loc} ${santri.unit} ${latestDailyDate}`;
      if (!matchesSearch(hay)) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingSantri, scopeFilter, statusFilter, search, missingMap, latestDailyDate]);

  const stats = {
    total: allEntries.length,
    pending: allEntries.filter((e) => getStatus(e) === "pending").length,
    verified: allEntries.filter((e) => getStatus(e) === "verified").length,
    revision: allEntries.filter((e) => getStatus(e) === "revision").length,
    missing: missingSantri.filter((s) => getMissingStatus(s.id) !== "done").length,
  };

  const hasActiveFilters =
    scopeFilter !== "all" || statusFilter !== "all" || search !== "";

  return (
    <div className="grid gap-5">
      {/* Header card */}
      <div className="rounded-2xl border border-border/60 bg-surface/85 p-4 shadow-[0_4px_14px_rgba(39,49,38,0.05)] max-sm:p-3">
        <div className="flex items-start justify-between gap-3 max-md:flex-col max-md:items-stretch">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Iconify icon="solar:inbox-archive-bold-duotone" width={18} />
            </span>
            <div className="min-w-0">
              <h2 className="font-(--font-family-head) text-base font-extrabold leading-none text-primary-dark">
                Report Queue
              </h2>
              <p className="mt-1 text-[0.7rem] text-muted">
                {stats.total} laporan masuk · {stats.pending} menunggu review
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 max-md:w-full">
            <div className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-surface-strong/60 px-3 py-2 ring-1 ring-inset ring-transparent transition-all duration-150 focus-within:bg-surface focus-within:ring-primary/40 max-md:basis-full md:min-w-[180px]">
              <Iconify
                icon="solar:magnifer-bold-duotone"
                width={14}
                className="shrink-0 text-muted/70 transition-colors group-focus-within:text-primary"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari santri / periode..."
                className="min-w-0 flex-1 border-0 bg-transparent text-[0.78rem] text-text outline-none placeholder:text-muted/50"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-muted/70 transition-colors hover:text-text"
                  aria-label="Clear"
                >
                  <Iconify icon="solar:close-circle-bold-duotone" width={13} />
                </button>
              )}
            </div>
            <div className="flex-1 max-sm:basis-[calc(50%-0.25rem)] md:flex-none md:min-w-[150px]">
              <CustomSelect
                value={scopeFilter}
                onChange={(v) => setScopeFilter(v as typeof scopeFilter)}
                options={[
                  { value: "all", label: "Semua Scope", icon: "solar:layers-bold-duotone" },
                  { value: "daily", label: "Daily", icon: "solar:document-text-bold-duotone" },
                  { value: "weekly", label: "Weekly", icon: "solar:clipboard-list-bold-duotone" },
                  { value: "monthly", label: "Monthly", icon: "solar:chart-square-bold-duotone" },
                ]}
                icon="solar:filter-bold-duotone"
              />
            </div>
            <div className="flex-1 max-sm:basis-[calc(50%-0.25rem)] md:flex-none md:min-w-[160px]">
              <CustomSelect
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as typeof statusFilter)}
                options={[
                  { value: "all", label: "Semua Status", icon: "solar:layers-bold-duotone" },
                  { value: "pending", label: "Pending", icon: "solar:clock-circle-bold-duotone" },
                  { value: "verified", label: "Verified", icon: "solar:verified-check-bold-duotone" },
                  { value: "revision", label: "Revisi", icon: "solar:refresh-circle-bold-duotone" },
                  { value: "missing", label: "Belum Kirim", icon: "solar:close-circle-bold-duotone" },
                  { value: "reminded", label: "Sudah Diingatkan", icon: "solar:bell-bing-bold-duotone" },
                  { value: "done", label: "Sudah Masuk", icon: "solar:check-circle-bold-duotone" },
                ]}
                icon="solar:pulse-bold-duotone"
              />
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setScopeFilter("all");
                  setStatusFilter("all");
                  setSearch("");
                }}
                className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-[0.7rem] font-bold text-muted transition-colors hover:bg-surface-strong hover:text-primary max-md:basis-full max-md:justify-center"
                title="Reset filter"
              >
                <Iconify icon="solar:restart-bold" width={13} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          <StatCard icon="solar:clock-circle-bold-duotone" label="Pending" value={stats.pending} tone="amber" />
          <StatCard icon="solar:close-circle-bold-duotone" label="Belum kirim daily" value={stats.missing} tone="pink" />
          <StatCard icon="solar:verified-check-bold-duotone" label="Verified" value={stats.verified} tone="green" />
          <StatCard icon="solar:refresh-circle-bold-duotone" label="Revisi" value={stats.revision} tone="blue" />
        </div>
      </div>

      {/* Belum kirim daily (untuk tanggal terbaru) */}
      {filteredMissingSantri.length > 0 && (
        <section className="grid gap-3">
          <SectionHeader
            icon="solar:user-cross-bold-duotone"
            tone="pink"
            title={`Belum Kirim Daily · ${latestDailyDate}`}
            count={filteredMissingSantri.length}
          />

          <div className="grid gap-2">
            {filteredMissingSantri.map((santri, i) => {
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
                  className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 transition-colors ${cfg.ring} ${cfg.bg}`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br font-(--font-family-head) text-[0.75rem] font-extrabold tracking-wide text-white shadow-[0_4px_10px_rgba(39,49,38,0.12)] ${grad}`} aria-hidden>
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
                  <StatusChip icon={cfg.icon} label={cfg.label} chipCls={cfg.chip} />
                  <div className="flex items-center gap-1.5 max-md:w-full">
                    <button
                      type="button"
                      onClick={() => handleRemind(santri.id)}
                      disabled={isDone}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[0.7rem] font-bold text-amber-700 transition-all hover:bg-amber-100 hover:shadow-[0_4px_10px_rgba(245,158,11,0.18)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-amber-50 disabled:hover:shadow-none max-md:flex-1"
                    >
                      <Iconify icon="solar:bell-bing-bold-duotone" width={13} />
                      Remind
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkDone(santri.id)}
                      disabled={isDone}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-[0.7rem] font-bold text-white shadow-[0_4px_10px_rgba(34,197,94,0.25)] transition-all hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-green-600 max-md:flex-1"
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

      {/* Queue list */}
      <section className="grid gap-3">
        <SectionHeader
          icon="solar:inbox-archive-bold-duotone"
          tone="primary"
          title="Antrian Review"
          count={filtered.length}
        />

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/40 py-14">
            <Iconify icon="solar:inbox-bold-duotone" width={36} className="text-muted/40" />
            <p className="mt-2 text-sm font-bold text-muted">
              {allEntries.length === 0 ? "Belum ada laporan" : "Tidak ada laporan yang cocok"}
            </p>
            {allEntries.length !== 0 && (
              <p className="mt-1 text-xs text-muted/60">Coba ubah filter di atas</p>
            )}
          </div>
        ) : (
          <div className="grid gap-2">
            {filtered.map((entry, i) => (
              <QueueRow
                key={entry.id}
                entry={entry}
                index={i}
                status={getStatus(entry)}
                isRevising={revisionId === entry.id}
                revisionNote={revisionNote}
                onRevisionNoteChange={setRevisionNote}
                onToggleRevisi={() => handleRevisi(entry.id)}
                onSubmitRevisi={() => submitRevisi(entry)}
                onVerify={() => handleVerify(entry)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function QueueRow({
  entry,
  index,
  status,
  isRevising,
  revisionNote,
  onRevisionNoteChange,
  onToggleRevisi,
  onSubmitRevisi,
  onVerify,
}: {
  entry: QueueEntry;
  index: number;
  status: DailyStatus;
  isRevising: boolean;
  revisionNote: string;
  onRevisionNoteChange: (v: string) => void;
  onToggleRevisi: () => void;
  onSubmitRevisi: () => void;
  onVerify: () => void;
}) {
  const santri = santriList.find((s) => toShortSid(s.id) === entry.santriId);
  const cfg = dailyStatusCfg[status];
  const sCfg = scopeChip[entry.scope];
  const initials = santri ? getInitials(santri.name) : entry.santriId.slice(0, 2);
  const grad = santri ? unitGradient[santri.unit] ?? "from-primary to-primary-dark" : "from-primary to-primary-dark";
  const isResolved = status !== "pending";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.15 }}
      className={`rounded-2xl border p-4 transition-colors ${cfg.ring} ${cfg.bg}`}
    >
      <div className="flex items-start gap-3 max-md:flex-col">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br font-(--font-family-head) text-sm font-extrabold tracking-wide text-white shadow-[0_4px_10px_rgba(39,49,38,0.12)] ${grad}`}
          aria-hidden
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2 flex-wrap">
            <span className="min-w-0 break-words text-sm font-bold text-text">
              {santri?.name ?? entry.santriId}
            </span>
            <span className="font-mono text-[0.65rem] font-bold text-primary">{entry.santriId}</span>
            <span className="break-words text-[0.65rem] text-muted">• {entry.period}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusChip icon={sCfg.icon} label={sCfg.label} chipCls={sCfg.tone} />
            <StatusChip icon={cfg.icon} label={cfg.label} chipCls={cfg.chip} />
            {entry.scope === "daily" && (entry.raw as DailyEntry).blocker !== "Clear" && (entry.raw as DailyEntry).blocker && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[0.6rem] font-bold text-orange ring-1 ring-inset ring-orange-200">
                <Iconify icon="solar:danger-triangle-bold-duotone" width={11} />
                Blocker
              </span>
            )}
            {entry.scope === "weekly" && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-bold ring-1 ring-inset ${
                (entry.raw as WeeklyEntry).sowProgress === "On Track"
                  ? "bg-green-50 text-green-700 ring-green-200"
                  : (entry.raw as WeeklyEntry).sowProgress === "Ahead"
                    ? "bg-blue-50 text-blue-700 ring-blue-200"
                    : "bg-orange-50 text-orange ring-orange-200"
              }`}>
                <Iconify icon="solar:target-bold-duotone" width={11} />
                {(entry.raw as WeeklyEntry).sowProgress}
              </span>
            )}
            {entry.scope === "monthly" && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-bold ring-1 ring-inset ${
                (entry.raw as MonthlyEntry).status === "Green"
                  ? "bg-green-50 text-green-700 ring-green-200"
                  : (entry.raw as MonthlyEntry).status === "Yellow"
                    ? "bg-amber-50 text-amber-700 ring-amber-200"
                    : (entry.raw as MonthlyEntry).status === "Red"
                      ? "bg-pink-50 text-pink-700 ring-pink-200"
                      : "bg-surface-strong text-muted ring-border"
              }`}>
                <Iconify icon="solar:flag-bold-duotone" width={11} />
                Status {(entry.raw as MonthlyEntry).status}
              </span>
            )}
          </div>

          {entry.scope === "daily" && (
            <div className="mt-2.5 grid gap-1 rounded-lg bg-surface-strong/50 p-2.5 text-[0.72rem]">
              <ReportLine icon="solar:target-bold-duotone" label="Plan" value={(entry.raw as DailyEntry).plan} />
              <ReportLine icon="solar:check-square-bold-duotone" label="Done" value={(entry.raw as DailyEntry).done} />
              {(entry.raw as DailyEntry).blocker !== "Clear" && (entry.raw as DailyEntry).blocker && (
                <ReportLine
                  icon="solar:danger-triangle-bold-duotone"
                  label="Blocker"
                  value={(entry.raw as DailyEntry).blocker}
                  valueCls="text-orange font-bold"
                />
              )}
              <ReportLine
                icon="solar:emoji-funny-circle-bold-duotone"
                label="Mood"
                value={(entry.raw as DailyEntry).mood}
              />
            </div>
          )}

          {entry.scope === "weekly" && (
            <div className="mt-2.5 grid gap-1 rounded-lg bg-surface-strong/50 p-2.5 text-[0.72rem]">
              <ReportLine icon="solar:star-bold-duotone" label="Highlight" value={(entry.raw as WeeklyEntry).highlight} />
              <ReportLine
                icon="solar:danger-triangle-bold-duotone"
                label="Lowlight"
                value={(entry.raw as WeeklyEntry).lowlight}
                valueCls={
                  (entry.raw as WeeklyEntry).lowlight && (entry.raw as WeeklyEntry).lowlight !== "-"
                    ? "text-orange font-bold"
                    : "text-text"
                }
              />
              {(entry.raw as WeeklyEntry).picNote && (
                <ReportLine icon="solar:notebook-bold-duotone" label="Catatan PIC" value={(entry.raw as WeeklyEntry).picNote} />
              )}
            </div>
          )}

          {entry.scope === "monthly" && (
            <div className="mt-2.5 grid gap-2 rounded-lg bg-surface-strong/50 p-2.5 text-[0.72rem]">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <MetricBox
                  label="Learn Att."
                  value={`${(entry.raw as MonthlyEntry).learnAtt}/1`}
                  tone={(entry.raw as MonthlyEntry).learnAtt >= 1 ? "green" : "amber"}
                />
                <MetricBox
                  label="Project"
                  value={`${(entry.raw as MonthlyEntry).projApproved}/6`}
                  tone={
                    (entry.raw as MonthlyEntry).projApproved >= 4
                      ? "green"
                      : (entry.raw as MonthlyEntry).projApproved >= 2
                        ? "amber"
                        : "pink"
                  }
                />
                <MetricBox
                  label="SoW"
                  value={`${(entry.raw as MonthlyEntry).sowPct}%`}
                  tone={
                    (entry.raw as MonthlyEntry).sowPct >= 75
                      ? "green"
                      : (entry.raw as MonthlyEntry).sowPct >= 50
                        ? "amber"
                        : "pink"
                  }
                />
                <MetricBox
                  label="Adab"
                  value={`${(entry.raw as MonthlyEntry).adab}/5`}
                  tone={
                    (entry.raw as MonthlyEntry).adab >= 4
                      ? "green"
                      : (entry.raw as MonthlyEntry).adab >= 3
                        ? "amber"
                        : "pink"
                  }
                />
              </div>
              {(entry.raw as MonthlyEntry).issues && (
                <ReportLine
                  icon="solar:danger-triangle-bold-duotone"
                  label="Issues"
                  value={(entry.raw as MonthlyEntry).issues}
                  valueCls="text-orange font-bold"
                />
              )}
              {(entry.raw as MonthlyEntry).followUp && (
                <ReportLine icon="solar:checklist-bold-duotone" label="Follow Up" value={(entry.raw as MonthlyEntry).followUp} />
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 max-md:w-full">
          <button
            type="button"
            onClick={onToggleRevisi}
            disabled={isResolved}
            className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[0.7rem] font-bold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 max-md:flex-1 ${
              isRevising
                ? "border-blue-400 bg-blue-100 text-blue-700"
                : "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-[0_4px_10px_rgba(59,130,246,0.18)]"
            }`}
          >
            <Iconify icon="solar:refresh-circle-bold-duotone" width={13} />
            Revisi
          </button>
          <button
            type="button"
            onClick={onVerify}
            disabled={isResolved}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-[0.7rem] font-bold text-white shadow-[0_4px_10px_rgba(34,197,94,0.25)] transition-all hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-green-600 max-md:flex-1"
          >
            <Iconify icon="solar:verified-check-bold-duotone" width={13} />
            Verify
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isRevising && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
              <div className="flex flex-1 items-center gap-2 max-md:basis-full">
                <Iconify icon="solar:pen-new-square-bold-duotone" width={15} className="shrink-0 text-blue-600" />
                <input
                  type="text"
                  value={revisionNote}
                  onChange={(e) => onRevisionNoteChange(e.target.value)}
                  placeholder="Tulis catatan revisi untuk santri..."
                  className="min-w-0 flex-1 rounded-lg border border-border/60 bg-surface px-3 py-2 text-xs text-text outline-none placeholder:text-muted/60 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
                />
              </div>
              <div className="flex items-center gap-2 max-md:ml-auto">
                <button
                  type="button"
                  onClick={onToggleRevisi}
                  className="rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.65rem] font-bold text-muted transition-colors hover:bg-surface-strong hover:text-text"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={onSubmitRevisi}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[0.7rem] font-bold text-white shadow-[0_4px_10px_rgba(59,130,246,0.25)] transition-all hover:bg-blue-700 active:scale-95"
                >
                  <Iconify icon="solar:paper-plane-bold-duotone" width={13} />
                  Kirim Revisi
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
    <div className={`rounded-lg px-2 py-2 text-center ring-1 ring-inset ${toneCls}`}>
      <div className="font-(--font-family-head) text-sm font-extrabold leading-none">{value}</div>
      <div className="mt-1 text-[0.55rem] font-bold uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}

// ─── History ─────────────────────────────────────────────────
function HistoryView({ events, onClear }: { events: ReportEvent[]; onClear: () => void }) {
  const [scopeFilter, setScopeFilter] = useState<"all" | ReportScope>("all");
  const [actionFilter, setActionFilter] = useState<"all" | ReportAction>("all");

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (scopeFilter !== "all" && e.scope !== scopeFilter) return false;
      if (actionFilter !== "all" && e.action !== actionFilter) return false;
      return true;
    });
  }, [events, scopeFilter, actionFilter]);

  const counts = useMemo(
    () => ({
      total: events.length,
      verify: events.filter((e) => e.action === "verify").length,
      revisi: events.filter((e) => e.action === "revisi").length,
      remind: events.filter((e) => e.action === "remind").length,
      sudah: events.filter((e) => e.action === "sudah").length,
    }),
    [events],
  );

  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border border-border/60 bg-surface/85 p-4 shadow-[0_4px_14px_rgba(39,49,38,0.05)] max-sm:p-3">
        <div className="flex items-start justify-between gap-3 max-md:flex-col max-md:items-stretch">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Iconify icon="solar:history-bold-duotone" width={18} />
            </span>
            <div className="min-w-0">
              <h2 className="font-(--font-family-head) text-base font-extrabold leading-none text-primary-dark">
                History Report
              </h2>
              <p className="mt-1 text-[0.7rem] text-muted">
                {counts.total} aktivitas tercatat
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 max-md:w-full">
            <div className="flex-1 max-sm:basis-[calc(50%-0.25rem)] md:flex-none md:min-w-[150px]">
              <CustomSelect
                value={scopeFilter}
                onChange={(v) => setScopeFilter(v as typeof scopeFilter)}
                options={[
                  { value: "all", label: "Semua Scope", icon: "solar:layers-bold-duotone" },
                  { value: "daily", label: "Daily", icon: "solar:document-text-bold-duotone" },
                  { value: "weekly", label: "Weekly", icon: "solar:clipboard-list-bold-duotone" },
                  { value: "monthly", label: "Monthly", icon: "solar:chart-square-bold-duotone" },
                ]}
                icon="solar:filter-bold-duotone"
              />
            </div>
            <div className="flex-1 max-sm:basis-[calc(50%-0.25rem)] md:flex-none md:min-w-[160px]">
              <CustomSelect
                value={actionFilter}
                onChange={(v) => setActionFilter(v as typeof actionFilter)}
                options={[
                  { value: "all", label: "Semua Aksi", icon: "solar:layers-bold-duotone" },
                  { value: "verify", label: "Verified", icon: "solar:verified-check-bold-duotone" },
                  { value: "revisi", label: "Minta Revisi", icon: "solar:refresh-circle-bold-duotone" },
                  { value: "remind", label: "Diingatkan", icon: "solar:bell-bing-bold-duotone" },
                  { value: "sudah", label: "Tandai Sudah", icon: "solar:check-circle-bold-duotone" },
                ]}
                icon="solar:pulse-bold-duotone"
              />
            </div>
            {events.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="flex items-center gap-1 rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.7rem] font-bold text-muted transition-colors hover:bg-pink-50 hover:text-pink-700 max-md:basis-full max-md:justify-center"
                title="Hapus semua history"
              >
                <Iconify icon="solar:trash-bin-2-bold-duotone" width={13} />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          <StatCard icon="solar:verified-check-bold-duotone" label="Verify" value={counts.verify} tone="green" />
          <StatCard icon="solar:refresh-circle-bold-duotone" label="Revisi" value={counts.revisi} tone="blue" />
          <StatCard icon="solar:bell-bing-bold-duotone" label="Remind" value={counts.remind} tone="amber" />
          <StatCard icon="solar:check-circle-bold-duotone" label="Sudah" value={counts.sudah} tone="green" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/40 py-16">
          <Iconify icon="solar:history-bold-duotone" width={40} className="text-muted/40" />
          <p className="mt-3 text-sm font-bold text-muted">
            {events.length === 0 ? "Belum ada aktivitas" : "Tidak ada aktivitas yang cocok"}
          </p>
          <p className="mt-1 text-xs text-muted/60">
            {events.length === 0
              ? "Aksi verify, revisi, remind, dan tandai sudah akan tercatat di sini"
              : "Coba ubah filter di atas"}
          </p>
        </div>
      ) : (
        <ol className="relative grid gap-3 pl-6">
          <span className="absolute left-[10px] top-2 bottom-2 w-[2px] rounded-full bg-border" aria-hidden />
          {filtered.map((ev, i) => {
            const sm = scopeMeta[ev.scope];
            const am = actionMeta[ev.action];
            const time = new Date(ev.timestamp);
            const timeStr = time.toLocaleString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <motion.li
                key={ev.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02, duration: 0.15 }}
                className="relative rounded-xl border border-border/60 bg-surface/85 p-3 shadow-[0_2px_8px_rgba(39,49,38,0.04)]"
              >
                <span
                  className={`absolute -left-[18px] top-3.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-bg ${am.dot}`}
                  aria-hidden
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                </span>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-bold ring-1 ring-inset ${sm.tone}`}>
                    <Iconify icon={sm.icon} width={11} />
                    {sm.label}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-bold ring-1 ring-inset ${am.tone}`}>
                    <Iconify icon={am.icon} width={11} />
                    {am.label}
                  </span>
                  <span className="break-words text-[0.65rem] font-bold text-text">{ev.santriName}</span>
                  <span className="font-mono text-[0.6rem] font-bold text-primary">{ev.santriId}</span>
                  <span className="text-[0.6rem] text-muted">• {ev.period}</span>
                  <span className="text-[0.6rem] text-muted md:ml-auto">{timeStr}</span>
                </div>
                {ev.note && (
                  <p className="mt-1.5 rounded-lg bg-surface-strong/50 px-2.5 py-1.5 text-[0.7rem] italic text-text">
                    <Iconify icon="solar:pen-new-square-bold-duotone" width={11} className="mr-1 inline text-blue-600" />
                    {ev.note}
                  </p>
                )}
              </motion.li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
