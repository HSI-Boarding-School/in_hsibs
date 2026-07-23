import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { santriList } from "../../../data/santriData";
import {
  weeklyEntries,
  monthlyEntries,
  dailyEntries,
} from "../../../data/monitoring/reportData";
import { projects } from "../../../data/monitoring/projectData";

// Demo: the PIC Div's division. In production this comes from session/profile.
const CURRENT_DIVISION = "IT";
const CURRENT_DIVISION_LABEL = "IT";
const PIC_NAME = "Kak Andy";

// ─── Helpers ────────────────────────────────────────────────────────────────

const shortId = (fullId: string) => fullId.replace("IN_HSIBS_", "");

function severityFromStatus(
  status: string,
): "high" | "medium" | "low" {
  if (status === "Red") return "high";
  if (status === "Yellow") return "medium";
  return "low";
}

// ─── Component ──────────────────────────────────────────────────────────────

export function PicDivHome() {
  const [validatedIds, setValidatedIds] = useState<Set<string>>(new Set());

  // Santri in this division
  const divisionSantri = useMemo(
    () => santriList.filter((s) => s.divs.includes(CURRENT_DIVISION)),
    [],
  );
  const santriShortIds = useMemo(
    () => divisionSantri.map((s) => shortId(s.id)),
    [divisionSantri],
  );

  // Pending weekly validation
  const pendingWeekly = useMemo(
    () =>
      weeklyEntries.filter(
        (w) => santriShortIds.includes(w.sid) && !w.validated && !validatedIds.has(w.sid),
      ),
    [santriShortIds, validatedIds],
  );

  // At-risk santri (Yellow/Red from monthly evaluations)
  const atRiskSantri = useMemo(
    () =>
      monthlyEntries.filter(
        (m) => santriShortIds.includes(m.sid) && (m.status === "Yellow" || m.status === "Red"),
      ),
    [santriShortIds],
  );

  // Division projects
  const divisionProjects = useMemo(
    () => projects.filter((p) => p.div === CURRENT_DIVISION || p.div === "All"),
    [],
  );

  // SoW pending (monthly entries with low progress)
  const lowProgressSantri = useMemo(
    () =>
      monthlyEntries.filter(
        (m) => santriShortIds.includes(m.sid) && m.sowPct < 60,
      ),
    [santriShortIds],
  );

  // Average SoW progress
  const avgProgress = useMemo(() => {
    const entries = monthlyEntries.filter((m) => santriShortIds.includes(m.sid));
    if (!entries.length) return 0;
    return Math.round(entries.reduce((sum, m) => sum + m.sowPct, 0) / entries.length);
  }, [santriShortIds]);

  // Mood distribution from daily entries
  const moodStats = useMemo(() => {
    const entries = dailyEntries.filter((d) => santriShortIds.includes(d.sid));
    const good = entries.filter((d) => d.mood === "Good").length;
    const okay = entries.filter((d) => d.mood === "Okay").length;
    const tough = entries.filter((d) => d.mood === "Tough").length;
    return { good, okay, tough, total: entries.length || 1 };
  }, [santriShortIds]);

  const stats = [
    {
      id: "santri",
      label: "Santri Binaan",
      value: divisionSantri.length,
      sub: `Dalam divisi ${CURRENT_DIVISION_LABEL}`,
      icon: "solar:users-group-rounded-bold-duotone",
      tone: "blue" as const,
      bg: "bg-blue/10",
      iconColor: "text-blue",
    },
    {
      id: "pending",
      label: "Pending Weekly Validation",
      value: pendingWeekly.length,
      sub: "Butuh validasi segera",
      icon: "solar:clipboard-list-bold-duotone",
      tone: "orange" as const,
      bg: "bg-orange/10",
      iconColor: "text-orange",
    },
    {
      id: "atRisk",
      label: "At-Risk Santri",
      value: atRiskSantri.length,
      sub: "Perlu follow up",
      icon: "solar:shield-warning-bold-duotone",
      tone: "orange" as const,
      bg: "bg-orange/10",
      iconColor: "text-orange",
    },
    {
      id: "sow",
      label: "SoW Progress",
      value: `${avgProgress}%`,
      sub: `Rata-rata divisi ${CURRENT_DIVISION_LABEL}`,
      icon: "solar:chart-square-bold-duotone",
      tone: "green" as const,
      bg: "bg-[#16a34a]/10",
      iconColor: "text-[#16a34a]",
    },
  ];

  function handleValidate(sid: string) {
    setValidatedIds((prev) => new Set([...prev, sid]));
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
          <p className="text-xs font-black uppercase tracking-widest text-primary">
            PIC Divisi
          </p>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-black text-primary">
            {CURRENT_DIVISION_LABEL}
          </span>
        </div>
        <h1 className="mt-1 font-(--font-family-head) text-4xl font-extrabold tracking-tight text-primary-dark">
          Division Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted">
          Assalamualaikum, {PIC_NAME}. Monitor santri binaan, validasi laporan, dan kelola SoW divisi.
        </p>
      </div>

      {/* Stat cards */}
      <section className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {stats.map((stat, i) => (
          <motion.article
            key={stat.id}
            className="relative overflow-hidden rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.25 }}
          >
            <span className={`absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
              <Iconify icon={stat.icon} width={22} className={stat.iconColor} />
            </span>
            <p className="text-xs font-bold text-muted">{stat.label}</p>
            <p
              className={`mt-2 font-(--font-family-head) text-4xl font-extrabold tracking-tight ${
                stat.tone === "blue"
                  ? "text-blue"
                  : stat.tone === "orange"
                    ? "text-orange"
                    : stat.tone === "green"
                      ? "text-[#16a34a]"
                      : "text-primary-dark"
              }`}
            >
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted">{stat.sub}</p>
          </motion.article>
        ))}
      </section>

      {/* Main content: left 2/3 + right 1/3 */}
      <section className="grid grid-cols-[1fr_320px] gap-4 max-lg:grid-cols-1">
        {/* Left column */}
        <div className="grid gap-4">
          {/* Quick Validate Queue */}
          <article className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-primary">
                  Quick Validate
                </p>
                <h3 className="mt-0.5 font-(--font-family-head) text-xl font-extrabold text-primary-dark">
                  Pending Weekly Validation
                </h3>
                <p className="text-sm text-muted">
                  {pendingWeekly.length} laporan menunggu validasi kamu
                </p>
              </div>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange/10">
                <Iconify icon="solar:clipboard-check-bold-duotone" width={22} className="text-orange" />
              </span>
            </div>

            {pendingWeekly.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Iconify icon="solar:checkmark-circle-bold-duotone" width={40} className="text-[#16a34a]/40" />
                <p className="text-sm font-bold text-muted">Semua weekly review sudah divalidasi</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {pendingWeekly.map((entry, i) => {
                  const santri = divisionSantri.find(
                    (s) => shortId(s.id) === entry.sid,
                  );
                  return (
                    <motion.div
                      key={entry.sid}
                      className="flex items-start gap-3 rounded-lg border border-border/60 bg-surface p-3.5 transition-colors hover:border-orange/30 hover:bg-orange/5"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.25 }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-sm text-primary-dark">
                            {santri?.name ?? entry.sid}
                          </strong>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[0.65rem] font-black ${
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
                        <p className="mt-0.5 text-xs text-muted">
                          {entry.week} · {santri?.loc ?? "-"}
                        </p>
                        {entry.highlight && (
                          <p className="mt-1 text-xs font-semibold text-text">
                            Highlight: {entry.highlight}
                          </p>
                        )}
                        {entry.lowlight && entry.lowlight !== "-" && (
                          <p className="mt-0.5 text-xs text-orange">
                            Lowlight: {entry.lowlight}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleValidate(entry.sid)}
                        className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-[0.68rem] font-black text-white transition-all hover:bg-primary-dark active:scale-95"
                      >
                        Validate
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </article>

          {/* At-Risk Santri */}
          <article className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-orange">
                  At-Risk
                </p>
                <h3 className="mt-0.5 font-(--font-family-head) text-xl font-extrabold text-primary-dark">
                  Santri Perlu Perhatian
                </h3>
                <p className="text-sm text-muted">
                  {atRiskSantri.length} santri dengan status Yellow/Red
                </p>
              </div>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange/10">
                <Iconify icon="solar:shield-warning-bold-duotone" width={22} className="text-orange" />
              </span>
            </div>

            {atRiskSantri.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Iconify icon="solar:shield-check-bold-duotone" width={40} className="text-[#16a34a]/40" />
                <p className="text-sm font-bold text-muted">Semua santri dalam kondisi baik</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {atRiskSantri.map((entry, i) => {
                  const santri = divisionSantri.find(
                    (s) => shortId(s.id) === entry.sid,
                  );
                  const severity = severityFromStatus(entry.status);
                  const sevCfg = {
                    high: { label: "Kritis", dot: "bg-orange", badge: "bg-orange/10 text-orange" },
                    medium: { label: "Sedang", dot: "bg-blue", badge: "bg-blue/10 text-blue" },
                    low: { label: "Rendah", dot: "bg-border", badge: "bg-surface-strong text-muted" },
                  }[severity];

                  return (
                    <motion.div
                      key={entry.sid}
                      className="flex items-start gap-3 rounded-lg border border-border/60 bg-surface p-3.5 transition-colors hover:border-orange/30 hover:bg-orange/5"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.25 }}
                    >
                      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${sevCfg.dot}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-sm text-primary-dark">
                            {santri?.name ?? entry.sid}
                          </strong>
                          <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-black ${sevCfg.badge}`}>
                            {sevCfg.label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted">
                          {santri?.unit} · {santri?.loc}
                        </p>
                        {entry.issues && (
                          <p className="mt-1 text-xs font-semibold text-text">{entry.issues}</p>
                        )}
                        {entry.followUp && (
                          <p className="mt-0.5 text-xs text-orange">Follow up: {entry.followUp}</p>
                        )}
                        <div className="mt-2 flex items-center gap-3 text-[0.65rem] text-muted">
                          <span>SoW: {entry.sowPct}%</span>
                          <span>Adab: {entry.adab}/5</span>
                          <span>Learn: {entry.learnAtt}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded-md bg-primary-dark px-2.5 py-1 text-[0.65rem] font-black text-white transition-opacity hover:opacity-80"
                      >
                        Follow Up
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </article>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Division Workload */}
          <article className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-primary">
                  Division Workload
                </p>
                <h3 className="mt-0.5 font-(--font-family-head) text-xl font-extrabold text-primary-dark">
                  Project Status
                </h3>
                <p className="text-sm text-muted">
                  {divisionProjects.length} project dalam divisi
                </p>
              </div>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue/10">
                <Iconify icon="solar:folder-with-files-bold-duotone" width={22} className="text-blue" />
              </span>
            </div>

            <div className="grid gap-2">
              {(["Idea", "In Progress", "Submitted", "Approved"] as const).map(
                (status) => {
                  const count = divisionProjects.filter(
                    (p) => p.status === status,
                  ).length;
                  const total = divisionProjects.length || 1;
                  const pct = Math.round((count / total) * 100);
                  const colorMap: Record<string, string> = {
                    Idea: "bg-muted/40",
                    "In Progress": "bg-amber",
                    Submitted: "bg-blue",
                    Approved: "bg-green",
                  };
                  return (
                    <div key={status} className="grid gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-text">{status}</span>
                        <span className="font-black text-primary-dark">
                          {count}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-strong">
                        <motion.div
                          className={`h-full rounded-full ${colorMap[status]}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            {/* Wajib count */}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted">Project wajib</span>
              <strong className="text-lg text-primary-dark">
                {divisionProjects.filter((p) => p.wajib).length}
              </strong>
            </div>
          </article>

          {/* Pending SoW Evidence */}
          <article className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-orange">
                  SoW Pending
                </p>
                <h3 className="mt-0.5 font-(--font-family-head) text-xl font-extrabold text-primary-dark">
                  Evidence Belum Lengkap
                </h3>
                <p className="text-sm text-muted">
                  {lowProgressSantri.length} santri di bawah 60%
                </p>
              </div>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange/10">
                <Iconify icon="solar:document-bold-duotone" width={22} className="text-orange" />
              </span>
            </div>

            {lowProgressSantri.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Iconify icon="solar:checkmark-circle-bold-duotone" width={32} className="text-[#16a34a]/40" />
                <p className="text-xs font-bold text-muted">Semua SoW progress baik</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {lowProgressSantri.map((entry, i) => {
                  const santri = divisionSantri.find(
                    (s) => shortId(s.id) === entry.sid,
                  );
                  return (
                    <motion.div
                      key={entry.sid}
                      className="rounded-lg bg-surface-strong/60 p-3"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.25 }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-xs text-primary-dark">
                          {santri?.name ?? entry.sid}
                        </strong>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[0.6rem] font-black ${
                            entry.sowPct < 40
                              ? "bg-orange/10 text-orange"
                              : "bg-amber/10 text-amber-dark"
                          }`}
                        >
                          {entry.sowPct}%
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/50">
                        <motion.div
                          className={`h-full rounded-full ${
                            entry.sowPct < 40 ? "bg-orange" : "bg-amber"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${entry.sowPct}%` }}
                          transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
                        />
                      </div>
                      {entry.picDivNote && (
                        <p className="mt-1.5 text-[0.65rem] text-muted">
                          Note: {entry.picDivNote}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </article>

          {/* Mood Overview */}
          <article className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-purple">
                  Mood Overview
                </p>
                <h3 className="mt-0.5 font-(--font-family-head) text-xl font-extrabold text-primary-dark">
                  Daily Mood Divisi
                </h3>
              </div>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple/10">
                <Iconify icon="solar:emoji-funny-circle-bold-duotone" width={22} className="text-purple" />
              </span>
            </div>

            <div className="flex h-3 overflow-hidden rounded-full bg-border/50">
              <span className="bg-green" style={{ width: `${(moodStats.good / moodStats.total) * 100}%` }} />
              <span className="bg-amber" style={{ width: `${(moodStats.okay / moodStats.total) * 100}%` }} />
              <span className="bg-pink" style={{ width: `${(moodStats.tough / moodStats.total) * 100}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-[0.68rem] font-bold text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-green" />
                Good {moodStats.good}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber" />
                Okay {moodStats.okay}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-pink" />
                Tough {moodStats.tough}
              </span>
            </div>
          </article>
        </div>
      </section>
    </motion.div>
  );
}
