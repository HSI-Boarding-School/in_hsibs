import { useMemo } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../../../components/iconify/iconify";
import {
  monthlyEntries,
  dailyEntries,
  weeklyEntries,
} from "../../../../../data/monitoring/reportData";
import { santriList } from "../../../../../data/santriData";

const santriMap = new Map(santriList.map((s) => [s.id, s.name]));

export function AtRiskView() {
  const atRisk = useMemo(() => {
    const riskList: {
      id: string;
      name: string;
      issues: string[];
      severity: "high" | "medium" | "low";
      lastCheck: string;
    }[] = [];

    const yellowMonthly = monthlyEntries.filter(
      (m) => m.status === "Yellow" || m.status === "Red",
    );

    yellowMonthly.forEach((m) => {
      const issues: string[] = [];
      if (m.issues) issues.push(m.issues);

      const daily = dailyEntries.filter((d) => d.sid === m.sid);
      const hasBlocker = daily.some((d) => d.blocker !== "Clear" && d.blocker);
      if (hasBlocker) issues.push("Ada blocker di daily log");

      const hasTough = daily.some((d) => d.mood === "Tough");
      if (hasTough) issues.push("Mood Tough dalam 7 hari terakhir");

      const weekly = weeklyEntries.filter((w) => w.sid === m.sid);
      const behind = weekly.some((w) => w.sowProgress === "Behind");
      if (behind) issues.push("Progress behind target");

      const notValidated = weekly.some((w) => !w.validated);
      if (notValidated) issues.push("Weekly review belum divalidasi");

      if (issues.length > 0 || m.status === "Red") {
        riskList.push({
          id: m.sid,
          name: santriMap.get(m.sid) || m.sid,
          issues: issues.length > 0 ? issues : ["Monthly status: " + m.status],
          severity: m.status === "Red" ? "high" : "medium",
          lastCheck: m.month,
        });
      }
    });

    const checkedIds = new Set(riskList.map((r) => r.id));
    const toughDaily = dailyEntries.filter(
      (d) => d.mood === "Tough" && !checkedIds.has(d.sid),
    );
    toughDaily.forEach((d) => {
      riskList.push({
        id: d.sid,
        name: santriMap.get(d.sid) || d.sid,
        issues: ["Mood Tough — perlu perhatian"],
        severity: "medium",
        lastCheck: d.date,
      });
      checkedIds.add(d.sid);
    });

    return riskList;
  }, []);

  const severityCfg = {
    high: { label: "Kritis", dot: "bg-orange", badge: "bg-orange/10 text-orange" },
    medium: { label: "Sedang", dot: "bg-blue", badge: "bg-blue/10 text-blue" },
    low: { label: "Rendah", dot: "bg-border", badge: "bg-surface-strong text-muted" },
  };

  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="flex items-center gap-4 text-xs text-muted">
        <span className="font-bold text-text">{atRisk.length} santri at-risk</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-orange" />
          {atRisk.filter((r) => r.severity === "high").length} Kritis
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue" />
          {atRisk.filter((r) => r.severity === "medium").length} Sedang
        </span>
      </div>

      {atRisk.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-16">
          <Iconify
            icon="solar:shield-check-bold-duotone"
            width={48}
            className="text-green/40"
          />
          <p className="mt-4 text-sm font-bold text-green/60">
            Semua santri dalam keadaan baik
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {atRisk.map((santri, i) => {
            const cfg = severityCfg[santri.severity];
            return (
              <motion.div
                key={santri.id}
                className="flex items-start gap-4 rounded-xl border border-border/60 bg-surface/85 p-[18px] shadow-[0_8px_30px_rgba(39,49,38,0.06)]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.18 }}
              >
                <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${cfg.dot}`} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[0.7rem] font-bold text-primary">
                      {santri.id}
                    </span>
                    <strong className="text-sm text-primary-dark">
                      {santri.name}
                    </strong>
                    <span className={`rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>

                  <ul className="mt-2 space-y-0.5">
                    {santri.issues.map((issue, j) => (
                      <li key={j} className="flex items-center gap-2 text-[0.75rem] text-muted">
                        <span className="h-1 w-1 rounded-full bg-muted/40" />
                        {issue}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-2 text-[0.65rem] text-muted">
                    Terakhir diperiksa: {santri.lastCheck}
                  </p>
                </div>

                <button
                  type="button"
                  className="shrink-0 rounded-lg bg-primary-dark px-3 py-2 text-[0.65rem] font-bold text-white transition-opacity hover:opacity-80"
                >
                  Tindak Lanjut
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
