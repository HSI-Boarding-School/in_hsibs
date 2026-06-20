import { useMemo } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../../../components/iconify/iconify";
import {
  dailyEntries,
  weeklyEntries,
  monthlyEntries,
} from "../../../../../data/monitoring/reportData";
import { santriList } from "../../../../../data/santriData";

export function ReportView() {
  const santriCompliance = useMemo(() => {
    const dailySet = new Set(dailyEntries.map((d) => d.sid));
    const weeklySet = new Set(weeklyEntries.map((w) => w.sid));
    const monthlySet = new Set(monthlyEntries.map((m) => m.sid));

    const dailyValidatedSet = new Set(
      weeklyEntries.filter((w) => w.validated).map((w) => w.sid),
    );

    return santriList.map((s) => {
      const hasDaily = dailySet.has(s.id);
      const hasWeekly = weeklySet.has(s.id);
      const hasMonthly = monthlySet.has(s.id);

      const dailyMoods = dailyEntries
        .filter((d) => d.sid === s.id)
        .map((d) => d.mood);

      const weeklyValidated = dailyValidatedSet.has(s.id);

      const monthlyStatuses = monthlyEntries
        .filter((m) => m.sid === s.id)
        .map((m) => m.status);

      const submitted = [hasDaily, hasWeekly, hasMonthly].filter(Boolean).length;
      const totalTypes = 3;
      const pct = Math.round((submitted / totalTypes) * 100);

      return {
        santri: s,
        hasDaily,
        hasWeekly,
        hasMonthly,
        weeklyValidated,
        dailyMoods,
        monthlyStatuses,
        compliancePct: pct,
      };
    });
  }, []);

  const stats = useMemo(() => {
    const total = santriList.length;
    const full = santriCompliance.filter((s) => s.compliancePct === 100).length;
    const partial = santriCompliance.filter(
      (s) => s.compliancePct > 0 && s.compliancePct < 100,
    ).length;
    const none = santriCompliance.filter((s) => s.compliancePct === 0).length;
    return { total, full, partial, none };
  }, []);

  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
        <span className="font-bold text-text">{stats.total} santri</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green" />
          Full Compliance {stats.full}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber" />
          Partial {stats.partial}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-pink" />
          None {stats.none}
        </span>
      </div>

      <div className="grid gap-2">
        {santriCompliance.map((item, i) => {
          const s = item.santri;
          const moods = [...new Set(item.dailyMoods)];

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025, duration: 0.15 }}
              className="flex items-center gap-4 rounded-xl border border-border/60 bg-surface/85 p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-black text-primary">
                {s.name.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-text">{s.name}</span>
                  <span className="text-xs text-muted">{s.loc}</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[0.65rem] text-muted">
                  <span className="font-mono text-primary">{s.id}</span>
                  <span>·</span>
                  <span>{s.unit}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ComplianceBadge label="Daily" ok={item.hasDaily} />
                <ComplianceBadge
                  label="Weekly"
                  ok={item.hasWeekly}
                  extra={item.weeklyValidated ? "✓" : undefined}
                />
                <ComplianceBadge label="Monthly" ok={item.hasMonthly} />
              </div>

              <div className="hidden sm:flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-strong">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.compliancePct >= 80
                          ? "bg-green"
                          : item.compliancePct >= 40
                            ? "bg-amber"
                            : "bg-pink"
                      }`}
                      style={{ width: `${item.compliancePct}%` }}
                    />
                  </div>
                  <span className="text-[0.6rem] font-bold text-muted">{item.compliancePct}%</span>
                </div>
                {moods.length > 0 && (
                  <div className="flex items-center gap-1">
                    {moods.map((m) => (
                      <span
                        key={m}
                        className={`h-1.5 w-1.5 rounded-full ${
                          m === "Good" ? "bg-green" : m === "Okay" ? "bg-amber" : "bg-pink"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function ComplianceBadge({
  label,
  ok,
  extra,
}: {
  label: string;
  ok: boolean;
  extra?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
          ok ? "bg-green/10 text-green" : "bg-pink/10 text-pink"
        }`}
      >
        <Iconify
          icon={ok ? "mingcute:check-line" : "mingcute:close-line"}
          width={14}
        />
      </span>
      <span className="text-[0.5rem] font-bold uppercase tracking-wider text-muted">
        {label}
        {extra && <span className="ml-0.5 text-green">{extra}</span>}
      </span>
    </div>
  );
}
