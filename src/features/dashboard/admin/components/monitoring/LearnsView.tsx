import { useState, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../../../components/iconify/iconify";
import { learnSessions, getPhaseName } from "../../../../../data/monitoring/learnData";
import type { LearnSession } from "../../../../../data/monitoring/learnData";
import { santriList } from "../../../../../data/santriData";
import {
  LearnSessionDetailDrawer,
  type AttendStatus,
} from "./LearnSessionDetailDrawer";

const phaseColors: Record<string, string> = {
  1: "border-l-[#f472b6]",
  2: "border-l-[#60a5fa]",
  3: "border-l-[#fbbf24]",
  4: "border-l-[#4ade80]",
  5: "border-l-[#c084fc]",
  rs: "border-l-[#94a3b8]",
};

const typeThemeCls: Record<string, string> = {
  "c-deen": "bg-green/10 text-green",
  "c-it": "bg-amber/10 text-amber-dark",
  "c-ops": "bg-pink/10 text-pink-dark",
  "c-dkv": "bg-purple/10 text-purple",
  "c-ac": "bg-blue/10 text-blue",
};

type TypeFilter = "all" | "mandatory" | "rolespec";
type StatusFilter = "all" | "Planned" | "Done";
type PhaseFilter = "all" | "1" | "2" | "3" | "4" | "5" | "rs";

const TYPE_OPTIONS: { value: TypeFilter; label: string; icon: string }[] = [
  { value: "all", label: "Semua", icon: "solar:layers-bold-duotone" },
  { value: "mandatory", label: "Mandatory", icon: "solar:star-bold-duotone" },
  { value: "rolespec", label: "Role-Specific", icon: "solar:tag-bold-duotone" },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua Status" },
  { value: "Planned", label: "Planned" },
  { value: "Done", label: "Done" },
];

const PHASE_OPTIONS: { value: PhaseFilter; label: string }[] = [
  { value: "all", label: "Semua Phase" },
  { value: "1", label: "1 · Niyah" },
  { value: "2", label: "2 · Fikrah" },
  { value: "3", label: "3 · Amaliyah" },
  { value: "4", label: "4 · Khidmah" },
  { value: "5", label: "5 · Jariyah" },
  { value: "rs", label: "Role-Specific" },
];

export function LearnsView() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [search, setSearch] = useState("");

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  // attendance: { [sessionId]: { [santriId]: "Izin" | "Alpha" } }
  // default Hadir = absence in map
  const [attendance, setAttendance] = useState<
    Record<string, Record<string, "Izin" | "Alpha">>
  >({});

  const filtered = useMemo(() => {
    return learnSessions.filter((s) => {
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (phaseFilter !== "all" && String(s.phase) !== phaseFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${s.id} ${s.title} ${s.subtitle} ${s.theme} ${s.speaker}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [typeFilter, statusFilter, phaseFilter, search]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const planned = filtered.filter((s) => s.status === "Planned").length;
    const done = filtered.filter((s) => s.status === "Done").length;
    return { total, planned, done };
  }, [filtered]);

  const activeSession = useMemo(
    () => (activeSessionId ? learnSessions.find((s) => s.id === activeSessionId) ?? null : null),
    [activeSessionId],
  );

  const handleOpenSession = useCallback((s: LearnSession) => {
    setActiveSessionId(s.id);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setActiveSessionId(null);
  }, []);

  const handleSetAttendance = useCallback(
    (sessionId: string, santriId: string, status: AttendStatus) => {
      setAttendance((prev) => {
        const sessionMap = { ...(prev[sessionId] ?? {}) };
        if (status === "Hadir") {
          delete sessionMap[santriId];
        } else {
          sessionMap[santriId] = status;
        }
        return { ...prev, [sessionId]: sessionMap };
      });
    },
    [],
  );

  const hasActiveFilters =
    typeFilter !== "all" || statusFilter !== "all" || phaseFilter !== "all" || search !== "";

  const resetFilters = () => {
    setTypeFilter("all");
    setStatusFilter("all");
    setPhaseFilter("all");
    setSearch("");
  };

  const activeAttendance = activeSession
    ? attendance[activeSession.id] ?? {}
    : {};

  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      {/* Filter toolbar — single row */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-surface/85 p-2 shadow-[0_4px_14px_rgba(39,49,38,0.05)]">
        <div className="group flex min-w-[180px] flex-1 items-center gap-2 rounded-lg bg-surface-strong/60 px-3 py-2 ring-1 ring-inset ring-transparent transition-all duration-150 focus-within:bg-surface focus-within:ring-primary/40">
          <Iconify
            icon="solar:magnifer-bold-duotone"
            width={14}
            className="shrink-0 text-muted/70 transition-colors group-focus-within:text-primary"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari session..."
            className="min-w-0 flex-1 border-0 bg-transparent text-[0.8rem] text-text outline-none placeholder:text-muted/50"
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

        <FilterSelect
          icon="solar:filter-bold-duotone"
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as TypeFilter)}
          options={TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
        <FilterSelect
          icon="solar:square-academic-cap-bold-duotone"
          value={phaseFilter}
          onChange={(v) => setPhaseFilter(v as PhaseFilter)}
          options={PHASE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
        <FilterSelect
          icon="solar:pulse-bold-duotone"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as StatusFilter)}
          options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-[0.7rem] font-bold text-muted transition-colors hover:bg-surface-strong hover:text-primary"
            title="Reset filter"
          >
            <Iconify icon="solar:restart-bold" width={13} />
            Reset
          </button>
        )}
      </div>

      {/* Summary strip */}
      <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
        <span className="font-bold text-text">{stats.total} sesi</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green" />
          {stats.done} Done
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber" />
          {stats.planned} Planned
        </span>
      </div>

      {/* Sessions list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/40 py-16">
          <Iconify
            icon="solar:book-bookmark-bold-duotone"
            width={40}
            className="text-muted/40"
          />
          <p className="mt-3 text-sm font-bold text-muted">Tidak ada sesi yang cocok</p>
          <p className="mt-1 text-xs text-muted/60">Coba ubah filter di atas</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((session, i) => (
            <SessionCard
              key={session.id}
              session={session}
              index={i}
              onOpen={handleOpenSession}
              attendCount={
                attendance[session.id]
                  ? Object.keys(attendance[session.id]).length
                  : 0
              }
            />
          ))}
        </div>
      )}

      <LearnSessionDetailDrawer
        session={activeSession}
        open={activeSession !== null}
        onClose={handleCloseDrawer}
        santriList={santriList}
        attendance={activeAttendance}
        onSetAttendance={(sid, status) => {
          if (activeSession) handleSetAttendance(activeSession.id, sid, status);
        }}
      />
    </motion.div>
  );
}

function FilterSelect({
  icon,
  value,
  onChange,
  options,
}: {
  icon: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const isDefault = value === "all";
  return (
    <label
      className={`relative inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[0.75rem] font-bold transition-all duration-150 cursor-pointer ${
        isDefault
          ? "bg-surface-strong/60 text-muted hover:bg-surface-strong hover:text-text"
          : "bg-primary text-white shadow-[0_2px_8px_rgba(37,99,235,0.2)]"
      }`}
    >
      <Iconify icon={icon} width={13} className="shrink-0" />
      <span className="max-w-[140px] truncate">
        {options.find((o) => o.value === value)?.label ?? options[0]?.label}
      </span>
      <Iconify
        icon="solar:alt-arrow-down-bold-duotone"
        width={11}
        className="shrink-0 opacity-70"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Filter"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SessionCard({
  session,
  index,
  onOpen,
  attendCount,
}: {
  session: LearnSession;
  index: number;
  onOpen: (s: LearnSession) => void;
  attendCount: number;
}) {
  const phaseCls = phaseColors[String(session.phase)] || "border-l-[#94a3b8]";
  const themeCls = typeThemeCls[session.themeCls] || "bg-surface-strong text-muted";
  const pct = session.totalSantri > 0 ? Math.round((session.attendance / session.totalSantri) * 100) : 0;

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(session)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(session);
        }
      }}
      aria-label={`Buka detail ${session.title}`}
      className={`group cursor-pointer rounded-xl border border-white/80 bg-surface/85 p-[18px] shadow-[0_8px_30px_rgba(39,49,38,0.06)] border-l-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(39,49,38,0.13)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${phaseCls}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.18 }}
    >
      <div className="flex items-start justify-between gap-4 max-sm:flex-col">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[0.7rem] font-bold text-primary">
              {session.id}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold ${themeCls}`}>
              {session.theme}
            </span>
            <span className="rounded-full bg-surface-strong px-2.5 py-0.5 text-[0.6rem] font-bold text-muted">
              {getPhaseName(session.phase)}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold ${
                session.status === "Done"
                  ? "bg-green/10 text-green"
                  : "bg-amber/10 text-amber-dark"
              }`}
            >
              {session.status}
            </span>
            {attendCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.6rem] font-bold text-primary">
                {attendCount} izin/alpha
              </span>
            )}
          </div>
          <h3 className="mt-2 font-(--font-family-head) text-base font-extrabold text-primary-dark group-hover:text-primary transition-colors">
            {session.title}
          </h3>
          <p className="text-sm text-muted">{session.subtitle}</p>

          <p className="mt-2 text-xs leading-relaxed text-text/80">{session.what}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.7rem] text-muted">
            <span className="flex items-center gap-1">
              <Iconify icon="solar:calendar-bold-duotone" width={12} />
              {session.when}
            </span>
            <span className="flex items-center gap-1">
              <Iconify icon="solar:map-point-bold-duotone" width={12} />
              {session.where}
            </span>
            <span className="flex items-center gap-1">
              <Iconify icon="solar:users-group-rounded-bold-duotone" width={12} />
              {session.who}
            </span>
            <span className="flex items-center gap-1">
              <Iconify icon="solar:microphone-3-bold-duotone" width={12} />
              {session.speaker}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1 max-sm:flex-row max-sm:gap-2">
          <div className="relative h-12 w-12">
            <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="15" fill="none"
                stroke="currentColor"
                className={session.status === "Done" ? "text-green" : "text-amber"}
                strokeWidth="2.5"
                strokeDasharray={2 * Math.PI * 15}
                strokeDashoffset={2 * Math.PI * 15 * (1 - pct / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[0.55rem] font-black text-primary-dark">
              {pct}%
            </span>
          </div>
          <span className="text-[0.55rem] font-bold text-muted">
            {session.attendance}/{session.totalSantri}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
