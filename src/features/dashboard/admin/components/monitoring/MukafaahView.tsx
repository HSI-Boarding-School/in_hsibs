import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../../../components/iconify/iconify";
import { generateMukafaahData } from "../../../../../data/monitoring/mukafaahData";

export function MukafaahView() {
  const [filter, setFilter] = useState<"all" | "eligible" | "ineligible">("all");

  const records = useMemo(() => generateMukafaahData(), []);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? records
        : records.filter((r) => (filter === "eligible" ? r.eligible : !r.eligible)),
    [records, filter],
  );

  const eligibleCount = records.filter((r) => r.eligible).length;
  const total = records.length;

  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 scrollbar-x pb-1 max-md:w-full">
          {(["all", "eligible", "ineligible"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-[0.75rem] font-bold whitespace-nowrap transition-all ${
                filter === f
                  ? "bg-primary text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]"
                  : "bg-surface text-text hover:bg-primary-soft hover:text-primary-dark border border-border/50"
              }`}
            >
              {f === "all" ? "All" : f === "eligible" ? "Eligible" : "Belum Eligible"}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green" />
            Eligible {eligibleCount}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber" />
            Belum {total - eligibleCount}
          </span>
          <span className="font-bold text-text">{total} Total</span>
        </div>
      </div>

      <div className="grid gap-3">
        {filtered.map((record, i) => (
          <motion.div
            key={record.santriId}
            className={`rounded-xl border p-[18px] shadow-[0_8px_30px_rgba(39,49,38,0.06)] ${
              record.eligible
                ? "border-green/30 bg-green/5"
                : "border-border/60 bg-surface/85"
            }`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.15 }}
          >
            <div className="flex items-start justify-between gap-4 max-sm:flex-col">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[0.7rem] font-bold text-primary">
                    {record.santriId}
                  </span>
                  <span className="text-sm font-bold text-text">{record.name}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold ${
                      record.eligible
                        ? "bg-green/10 text-green"
                        : "bg-amber/10 text-amber-dark"
                    }`}
                  >
                    {record.eligible ? "Eligible" : "Belum Eligible"}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-4">
                  <MiniStat
                    label="Learn"
                    value={`${record.learnCompleted}/${record.targetLearn}`}
                    ok={record.learnCompleted >= record.targetLearn}
                  />
                  <MiniStat
                    label="Projek"
                    value={`${record.projectsApproved}/${record.targetProjects}`}
                    ok={record.projectsApproved >= record.targetProjects}
                  />
                  <MiniStat
                    label="Report"
                    value={`${record.reportsOnTime}/${record.targetReports}`}
                    ok={record.reportsOnTime >= record.targetReports}
                  />
                  <MiniStat
                    label="Adab"
                    value={`${record.adabScore}/5`}
                    ok={record.adabScore >= 3}
                  />
                </div>

                {record.notes && (
                  <p className="mt-3 text-[0.7rem] text-muted">
                    <Iconify
                      icon="solar:info-circle-bold-duotone"
                      width={12}
                      className="inline-block mr-1 -mt-0.5 text-orange"
                    />
                    {record.notes}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-center gap-1">
                <div className="relative h-14 w-14">
                  <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="currentColor"
                      className={record.eligible ? "text-green" : "text-amber"}
                      strokeWidth="2.5"
                      strokeDasharray={2 * Math.PI * 15}
                      strokeDashoffset={2 * Math.PI * 15 * 0.25}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Iconify
                      icon={
                        record.eligible
                          ? "solar:check-circle-bold-duotone"
                          : "solar:clock-circle-bold-duotone"
                      }
                      width={22}
                      className={record.eligible ? "text-green" : "text-amber"}
                    />
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function MiniStat({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Iconify
        icon={ok ? "solar:check-circle-bold-duotone" : "solar:close-circle-bold-duotone"}
        width={14}
        className={ok ? "text-green" : "text-muted/40"}
      />
      <span className="text-[0.65rem] text-muted">
        {label}: <strong className={ok ? "text-green" : "text-text"}>{value}</strong>
      </span>
    </div>
  );
}
