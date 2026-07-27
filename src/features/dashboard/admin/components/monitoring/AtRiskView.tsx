import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../../../components/iconify/iconify";
import { useMonitoringRiskReports, type MonitoringRiskReport, type RiskStatus } from "../../../../../models/monitoring";
import { MonitoringLoadingState } from "./MonitoringLoadingState";

type RiskFilter = "all" | "active" | "monitoring" | "resolved";

const filterOptions: { id: RiskFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "active", label: "Perlu ditindak" },
  { id: "monitoring", label: "Monitoring" },
  { id: "resolved", label: "Selesai" },
];

const severityStyle = {
  Critical: { label: "Kritis", dot: "bg-red-500", tone: "bg-red-500/9 text-red-500 ring-red-500/15" },
  High: { label: "Tinggi", dot: "bg-orange", tone: "bg-orange/9 text-orange ring-orange/15" },
  Medium: { label: "Sedang", dot: "bg-blue", tone: "bg-blue/9 text-blue ring-blue/15" },
  Low: { label: "Rendah", dot: "bg-slate-400", tone: "bg-surface-strong text-muted ring-border/60" },
};

const statusLabel: Record<RiskStatus, string> = {
  Open: "Open",
  In_Review: "Dalam review",
  Monitoring: "Monitoring",
  Resolved: "Resolved",
  Closed: "Closed",
};

export function AtRiskView() {
  const { reports, isLoading, error } = useMonitoringRiskReports();
  const [filter, setFilter] = useState<RiskFilter>("all");

  const stats = useMemo(() => ({
    active: reports.filter((item) => item.status === "Open" || item.status === "In_Review").length,
    critical: reports.filter((item) => item.severity === "Critical" || item.severity === "High").length,
    monitoring: reports.filter((item) => item.status === "Monitoring").length,
    resolved: reports.filter((item) => item.status === "Resolved" || item.status === "Closed").length,
  }), [reports]);

  const filtered = useMemo(() => reports.filter((item) => {
    if (filter === "active") return item.status === "Open" || item.status === "In_Review";
    if (filter === "monitoring") return item.status === "Monitoring";
    if (filter === "resolved") return item.status === "Resolved" || item.status === "Closed";
    return true;
  }), [filter, reports]);

  if (isLoading) {
    return <MonitoringLoadingState variant="list" label="laporan At Risk" />;
  }

  if (error) {
    return <RiskError message={error} />;
  }

  if (reports.length === 0) {
    return <RiskEmptyState />;
  }

  return (
    <motion.div
      className="grid gap-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <section className="grid grid-cols-4 overflow-hidden rounded-2xl border border-border/65 bg-surface/78 max-md:grid-cols-2">
        <Stat label="Perlu ditindak" value={stats.active} icon="solar:inbox-line-bold-duotone" />
        <Stat label="Prioritas tinggi" value={stats.critical} icon="solar:danger-triangle-bold-duotone" tone="danger" />
        <Stat label="Monitoring" value={stats.monitoring} icon="solar:eye-bold-duotone" tone="info" />
        <Stat label="Selesai" value={stats.resolved} icon="solar:shield-check-bold-duotone" tone="success" />
      </section>

      <div className="flex items-center justify-between gap-3 max-sm:items-start max-sm:flex-col">
        <div>
          <p className="text-xs font-extrabold text-primary-dark">Laporan PIC</p>
          <p className="mt-0.5 text-[0.68rem] font-semibold text-muted">Case santri yang dikirim oleh PIC Divisi dan PIC Regional.</p>
        </div>
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-border/60 bg-surface/78 p-1">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-[0.68rem] font-extrabold transition-colors ${
                filter === option.id ? "bg-primary text-white" : "text-muted hover:bg-surface-strong hover:text-text"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border/65 bg-surface/42 px-5 text-center">
          <Iconify icon="solar:filter-bold-duotone" width={24} className="text-muted/50" />
          <p className="mt-2 text-sm font-extrabold text-muted">Tidak ada case pada filter ini</p>
          <p className="mt-1 text-xs font-semibold text-muted">Pilih filter lain untuk melihat laporan At Risk.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((report, index) => (
            <RiskCard key={report.id} report={report} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone = "primary",
}: {
  label: string;
  value: number;
  icon: string;
  tone?: "primary" | "danger" | "info" | "success";
}) {
  const toneClass = {
    primary: "bg-primary/9 text-primary",
    danger: "bg-orange/10 text-orange",
    info: "bg-blue/10 text-blue",
    success: "bg-green/10 text-green",
  }[tone];

  return (
    <div className="flex items-center gap-3 border-r border-border/55 px-4 py-4 last:border-r-0 max-md:nth-[2n]:border-r-0 max-md:nth-[n+3]:border-t">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
        <Iconify icon={icon} width={18} />
      </span>
      <div>
        <p className="text-[0.56rem] font-black uppercase tracking-[0.11em] text-muted">{label}</p>
        <p className="mt-0.5 font-(--font-family-head) text-xl font-extrabold text-primary-dark">{value}</p>
      </div>
    </div>
  );
}

function RiskCard({ report, index }: { report: MonitoringRiskReport; index: number }) {
  const severity = severityStyle[report.severity];
  const resolved = report.status === "Resolved" || report.status === "Closed";

  return (
    <motion.article
      initial={{ opacity: 0, y: 7 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.22), duration: 0.17 }}
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface/78 p-4 transition-colors hover:border-primary/20 hover:bg-surface"
    >
      <span className={`absolute inset-y-4 left-0 w-1 rounded-r-full ${severity.dot}`} />
      <div className="ml-1 grid grid-cols-[1fr_auto] gap-4 max-sm:grid-cols-1">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[0.58rem] font-black ring-1 ${severity.tone}`}>{severity.label}</span>
            <span className="rounded-full bg-surface-strong px-2.5 py-1 text-[0.58rem] font-black text-muted">{report.category}</span>
            <span className={`rounded-full px-2.5 py-1 text-[0.58rem] font-black ${resolved ? "bg-green/9 text-green" : "bg-primary/8 text-primary"}`}>
              {statusLabel[report.status]}
            </span>
          </div>

          <h3 className="mt-3 font-(--font-family-head) text-base font-extrabold text-primary-dark">{report.title}</h3>
          <p className="mt-1 max-w-3xl text-xs font-semibold leading-relaxed text-muted">{report.description}</p>

          {report.indicators.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {report.indicators.map((indicator) => (
                <span key={indicator} className="rounded-lg bg-surface-strong/70 px-2 py-1 text-[0.62rem] font-bold text-text">{indicator}</span>
              ))}
            </div>
          )}

          {(report.recommendation || report.followUp) && (
            <div className="mt-3 rounded-xl border border-border/50 bg-surface-strong/35 px-3 py-2.5">
              <p className="text-[0.56rem] font-black uppercase tracking-[0.12em] text-muted">Tindak lanjut</p>
              <p className="mt-1 text-[0.7rem] font-semibold leading-relaxed text-text">{report.followUp ?? report.recommendation}</p>
            </div>
          )}
        </div>

        <aside className="w-48 shrink-0 border-l border-border/55 pl-4 text-[0.65rem] max-sm:w-full max-sm:border-l-0 max-sm:border-t max-sm:pl-0 max-sm:pt-3">
          <p className="font-mono font-bold text-primary">{report.studentCode}</p>
          <p className="mt-1 text-sm font-extrabold text-primary-dark">{report.studentName}</p>
          <div className="mt-3 grid gap-1.5 text-muted">
            <p>
              Oleh <strong className="text-text">{report.reporterName}</strong>
              <span className="ml-1">· {roleLabel(report.reporterRole)}</span>
            </p>
            <p>{formatDate(report.createdAt)}</p>
            {report.assigneeName && <p>Assignee: <strong className="text-text">{report.assigneeName}</strong></p>}
            {report.targetDate && <p>Target: <strong className="text-text">{formatDate(report.targetDate)}</strong></p>}
          </div>
        </aside>
      </div>
    </motion.article>
  );
}

function roleLabel(role: MonitoringRiskReport["reporterRole"]) {
  if (role === "PIC_Div") return "PIC Divisi";
  if (role === "PIC_Reg") return "PIC Regional";
  return "Admin";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function RiskEmptyState() {
  return (
    <div className="relative flex min-h-72 flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-border/70 bg-surface/55 px-6 text-center">
      <span className="absolute -top-16 h-40 w-40 rounded-full bg-slate-400/8 blur-3xl" />
      <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-strong text-muted ring-1 ring-border/60">
        <Iconify icon="solar:shield-check-bold-duotone" width={29} />
      </span>
      <h3 className="relative mt-4 font-(--font-family-head) text-lg font-extrabold text-muted">Belum ada laporan At Risk</h3>
      <p className="relative mt-1 max-w-md text-xs font-semibold leading-relaxed text-muted">
        Belum ada laporan risiko yang masuk dari PIC Divisi atau PIC Regional. Case baru akan tampil di sini untuk ditinjau dan ditindaklanjuti.
      </p>
      <div className="relative mt-5 flex flex-wrap justify-center gap-2 text-[0.62rem] font-bold text-muted">
        <span className="rounded-full bg-surface-strong px-3 py-1.5">PIC Divisi</span>
        <span className="rounded-full bg-surface-strong px-3 py-1.5">PIC Regional</span>
        <span className="rounded-full bg-surface-strong px-3 py-1.5">Internal case</span>
      </div>
    </div>
  );
}

function RiskError({ message }: { message: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-orange/25 bg-orange/5 px-6 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange/10 text-orange">
        <Iconify icon="solar:danger-triangle-bold-duotone" width={22} />
      </span>
      <p className="mt-3 text-sm font-extrabold text-primary-dark">Laporan At Risk belum dapat dimuat</p>
      <p className="mt-1 max-w-lg text-xs font-semibold leading-relaxed text-muted">{message}</p>
    </div>
  );
}
