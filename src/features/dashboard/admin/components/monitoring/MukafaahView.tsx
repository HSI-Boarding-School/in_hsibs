import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../../../components/iconify/iconify";
import { useMonitoringMukafaah, type MonitoringMukafaahRecord } from "../../../../../models/monitoring";
import { MonitoringLoadingState } from "./MonitoringLoadingState";

type ReadyFilter = "all" | "ready" | "not-ready";

export function MukafaahView() {
  const { records, isLoading, error } = useMonitoringMukafaah();
  const [filter, setFilter] = useState<ReadyFilter>("all");

  const readyCount = records.filter((record) => record.ready).length;
  const filtered = useMemo(() => records.filter((record) => {
    if (filter === "ready") return record.ready;
    if (filter === "not-ready") return !record.ready;
    return true;
  }), [filter, records]);

  if (isLoading) return <MonitoringLoadingState variant="list" label="kesiapan Mukafaah" />;

  if (error) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-orange/25 bg-orange/5 px-6 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange/10 text-orange">
          <Iconify icon="solar:danger-triangle-bold-duotone" width={22} />
        </span>
        <p className="mt-3 text-sm font-extrabold text-primary-dark">Kesiapan Mukafaah belum dapat dimuat</p>
        <p className="mt-1 max-w-lg text-xs font-semibold leading-relaxed text-muted">{error}</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border/65 bg-surface/45 px-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-strong text-muted">
          <Iconify icon="solar:wallet-money-bold-duotone" width={24} />
        </span>
        <p className="mt-3 text-sm font-extrabold text-muted">Belum ada evaluasi Mukafaah</p>
        <p className="mt-1 max-w-md text-xs font-semibold leading-relaxed text-muted">Data kesiapan akan tampil setelah evaluasi bulanan santri dibuat oleh PIC.</p>
      </div>
    );
  }

  return (
    <motion.div className="grid gap-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-surface/78 p-1">
          {([
            ["all", "Semua"],
            ["ready", "Ready"],
            ["not-ready", "Belum Ready"],
          ] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setFilter(id)} className={`rounded-lg px-3 py-2 text-[0.7rem] font-extrabold transition-colors ${filter === id ? "bg-primary text-white" : "text-muted hover:bg-surface-strong hover:text-text"}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-muted">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green" />Ready {readyCount}</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange" />Belum {records.length - readyCount}</span>
          <strong className="text-text">{records.length} santri</strong>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-border/65 bg-surface/42 text-xs font-bold text-muted">Tidak ada santri pada filter ini.</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((record, index) => <MukafaahCard key={record.evaluationId} record={record} index={index} />)}
        </div>
      )}
    </motion.div>
  );
}

function MukafaahCard({ record, index }: { record: MonitoringMukafaahRecord; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 7 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.2), duration: 0.17 }}
      className={`rounded-2xl border bg-surface/78 p-4 ${record.ready ? "border-green/25" : "border-border/65"}`}
    >
      <div className="grid grid-cols-[1fr_auto] gap-5 max-sm:grid-cols-1">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.65rem] font-bold text-primary">{record.studentCode}</span>
            <h3 className="text-sm font-extrabold text-primary-dark">{record.studentName}</h3>
            <span className="rounded-full bg-surface-strong px-2 py-0.5 text-[0.58rem] font-bold text-muted">{record.period}</span>
            {record.gyr && <span className="rounded-full bg-surface-strong px-2 py-0.5 text-[0.58rem] font-bold text-muted">{record.gyr}</span>}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2 max-md:grid-cols-2">
            <Requirement label="Learn" value={`${record.learnCompleted}/${record.targetLearn}`} complete={record.learnCompleted >= record.targetLearn} />
            <Requirement label="Project" value={`${record.projectsApproved}/${record.targetProjects}`} complete={record.projectsApproved >= record.targetProjects} />
            <Requirement label="Report" value={`${record.reportsSubmitted}/${record.targetReports}`} complete={record.reportsSubmitted >= record.targetReports} />
            <Requirement label="Adab" value={`${record.adabScore}/5`} complete={record.adabScore >= record.targetAdab} />
          </div>
        </div>

        <div className={`flex min-w-28 flex-col items-center justify-center rounded-2xl px-4 py-3 ${record.ready ? "bg-green/8 text-green" : "bg-orange/8 text-orange"}`}>
          <Iconify icon={record.ready ? "solar:check-circle-bold-duotone" : "solar:clock-circle-bold-duotone"} width={30} />
          <span className="mt-1.5 text-[0.65rem] font-black uppercase tracking-[0.1em]">{record.ready ? "Ready" : "Belum Ready"}</span>
        </div>
      </div>
    </motion.article>
  );
}

function Requirement({ label, value, complete }: { label: string; value: string; complete: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${complete ? "bg-green/8" : "bg-surface-strong/60"}`}>
      <Iconify icon={complete ? "solar:check-circle-bold-duotone" : "solar:minus-circle-bold-duotone"} width={17} className={complete ? "text-green" : "text-muted/55"} />
      <div>
        <p className={`text-[0.56rem] font-black uppercase tracking-[0.1em] ${complete ? "text-green/75" : "text-muted"}`}>{label}</p>
        <p className={`mt-0.5 text-xs font-extrabold ${complete ? "text-green" : "text-muted"}`}>{value}</p>
      </div>
    </div>
  );
}
