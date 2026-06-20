import { useState } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../../../components/iconify/iconify";
import { learnSessions, getPhaseName } from "../../../../../data/monitoring/learnData";
import type { LearnSession } from "../../../../../data/monitoring/learnData";

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

export function LearnsView() {
  const [filter, setFilter] = useState<"all" | "mandatory" | "rolespec">("all");

  const filtered = filter === "all" ? learnSessions : learnSessions.filter((s) => s.type === filter);

  const total = filtered.length;
  const planned = filtered.filter((s) => s.status === "Planned").length;
  const done = filtered.filter((s) => s.status === "Done").length;

  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="flex items-center gap-4 max-sm:flex-col max-sm:items-start">
        <div className="flex items-center gap-2">
          {(["all", "mandatory", "rolespec"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-[0.75rem] font-bold transition-all ${
                filter === f
                  ? "bg-primary text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]"
                  : "bg-surface text-text hover:bg-primary-soft hover:text-primary-dark border border-border/50"
              }`}
            >
              {f === "all" ? "All" : f === "mandatory" ? "Mandatory" : "Role-Specific"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted ml-auto">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green" />
            {done} Done
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber" />
            {planned} Planned
          </span>
          <span className="font-bold text-text">{total} Total</span>
        </div>
      </div>

      <div className="grid gap-3">
        {filtered.map((session, i) => (
          <SessionCard key={session.id} session={session} index={i} />
        ))}
      </div>
    </motion.div>
  );
}

function SessionCard({ session, index }: { session: LearnSession; index: number }) {
  const phaseCls = phaseColors[String(session.phase)] || "border-l-[#94a3b8]";
  const themeCls = typeThemeCls[session.themeCls] || "bg-surface-strong text-muted";
  const pct = session.totalSantri > 0 ? Math.round((session.attendance / session.totalSantri) * 100) : 0;

  return (
    <motion.div
      className={`rounded-xl border border-white/80 bg-surface/85 p-[18px] shadow-[0_8px_30px_rgba(39,49,38,0.06)] border-l-4 ${phaseCls}`}
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
          </div>
          <h3 className="mt-2 font-(--font-family-head) text-base font-extrabold text-primary-dark">
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

        <div className="flex shrink-0 flex-col items-center gap-1">
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
