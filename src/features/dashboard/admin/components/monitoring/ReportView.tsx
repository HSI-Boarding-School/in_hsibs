import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../../../components/iconify/iconify";
import { useMonitoringReportProgress, type MonitoringReportProgress } from "../../../../../models/monitoring";
import { MonitoringLoadingState } from "./MonitoringLoadingState";

type ProgressFilter = "all" | "complete" | "attention" | "missing";

const filters: { id: ProgressFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "complete", label: "Lengkap" },
  { id: "attention", label: "Perlu perhatian" },
  { id: "missing", label: "Belum lengkap" },
];

export function ReportView() {
  const { reports, isLoading, error } = useMonitoringReportProgress();
  const [filter, setFilter] = useState<ProgressFilter>("all");
  const [search, setSearch] = useState("");

  const stats = useMemo(() => {
    const complete = reports.filter((item) => item.compliance === 100).length;
    const attention = reports.filter((item) => item.needsAttention).length;
    const average = reports.length
      ? Math.round(reports.reduce((sum, item) => sum + item.compliance, 0) / reports.length)
      : 0;
    return { complete, attention, average };
  }, [reports]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reports.filter((item) => {
      if (query && !`${item.name} ${item.code}`.toLowerCase().includes(query)) return false;
      if (filter === "complete" && item.compliance !== 100) return false;
      if (filter === "attention" && !item.needsAttention) return false;
      if (filter === "missing" && item.compliance === 100) return false;
      return true;
    });
  }, [filter, reports, search]);

  if (isLoading) {
    return <MonitoringLoadingState variant="list" label="progres laporan" />;
  }

  if (error) {
    return <ReportError message={error} />;
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        title="Belum ada progres laporan"
        description="Data akan tampil setelah santri pengabdian tersedia dan mulai mengisi laporan Daily, Weekly, atau Monthly."
      />
    );
  }

  return (
    <motion.div
      className="grid gap-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <section className="grid grid-cols-4 overflow-hidden rounded-2xl border border-border/65 bg-surface/78 max-md:grid-cols-2">
        <SummaryItem label="Santri" value={reports.length} icon="solar:users-group-rounded-bold-duotone" />
        <SummaryItem label="Lengkap" value={stats.complete} icon="solar:verified-check-bold-duotone" tone="success" />
        <SummaryItem label="Attention" value={stats.attention} icon="solar:danger-triangle-bold-duotone" tone="warning" />
        <SummaryItem label="Compliance" value={`${stats.average}%`} icon="solar:chart-2-bold-duotone" />
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <div className="group flex min-w-52 flex-1 items-center gap-2 rounded-xl border border-border/60 bg-surface/78 px-3 py-2.5 focus-within:border-primary/35">
          <Iconify icon="solar:magnifer-bold-duotone" width={15} className="text-muted group-focus-within:text-primary" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari santri atau ID..."
            className="min-w-0 flex-1 border-0 bg-transparent text-[0.78rem] font-semibold text-text outline-none placeholder:text-muted/55"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="text-muted hover:text-text" aria-label="Hapus pencarian">
              <Iconify icon="solar:close-circle-bold-duotone" width={15} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border/60 bg-surface/78 p-1">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-[0.68rem] font-extrabold transition-colors ${
                filter === item.id ? "bg-primary text-white" : "text-muted hover:bg-surface-strong hover:text-text"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Tidak ada hasil" description="Tidak ada santri yang cocok dengan pencarian atau filter aktif." compact />
      ) : (
        <div className="grid gap-2.5">
          {filtered.map((item, index) => (
            <ProgressRow key={item.pengabdianId} item={item} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function SummaryItem({
  label,
  value,
  icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  icon: string;
  tone?: "primary" | "success" | "warning";
}) {
  const iconClass = {
    primary: "bg-primary/9 text-primary",
    success: "bg-green/10 text-green",
    warning: "bg-orange/10 text-orange",
  }[tone];

  return (
    <div className="flex items-center gap-3 border-r border-border/55 px-4 py-4 last:border-r-0 max-md:nth-[2n]:border-r-0 max-md:nth-[n+3]:border-t">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
        <Iconify icon={icon} width={18} />
      </span>
      <div>
        <p className="text-[0.58rem] font-black uppercase tracking-[0.12em] text-muted">{label}</p>
        <p className="mt-0.5 font-(--font-family-head) text-xl font-extrabold text-primary-dark">{value}</p>
      </div>
    </div>
  );
}

function ProgressRow({ item, index }: { item: MonitoringReportProgress; index: number }) {
  const initials = item.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.2), duration: 0.16 }}
      className="grid grid-cols-[minmax(190px,1fr)_minmax(300px,1.35fr)_100px] items-center gap-5 rounded-2xl border border-border/58 bg-surface/76 px-4 py-3.5 transition-colors hover:border-primary/20 hover:bg-surface max-lg:grid-cols-[1fr_auto] max-sm:grid-cols-1"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft font-(--font-family-head) text-xs font-black text-primary">
          {initials || "?"}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-extrabold text-primary-dark">{item.name}</h3>
            {item.needsAttention && <span className="h-2 w-2 shrink-0 rounded-full bg-orange" title="Perlu perhatian" />}
          </div>
          <p className="mt-0.5 truncate font-mono text-[0.63rem] font-bold text-muted">{item.code}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 max-sm:grid-cols-1">
        <ReportStage
          label="Daily"
          status={dailyLabel(item)}
          complete={item.daily.morningDone && item.daily.eveningDone}
          attention={item.daily.status === "Perlu_Revisi" || item.daily.mood === "Tough" || Boolean(item.daily.blocker)}
        />
        <ReportStage
          label="Weekly"
          status={statusLabel(item.weekly.status, item.weekly.label)}
          complete={isComplete(item.weekly.status)}
          attention={item.weekly.status === "Perlu_Revisi"}
        />
        <ReportStage
          label="Monthly"
          status={statusLabel(item.monthly.status, item.monthly.gyr)}
          complete={isComplete(item.monthly.status)}
          attention={item.monthly.status === "Perlu_Revisi" || item.monthly.gyr === "Red"}
        />
      </div>

      <div className="max-lg:col-start-2 max-lg:row-start-1 max-sm:col-auto max-sm:row-auto">
        <div className="flex items-center justify-end gap-2 max-sm:justify-start">
          <span className="text-[0.65rem] font-black text-primary-dark">{item.compliance}%</span>
          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-surface-strong">
            <div
              className={`h-full rounded-full ${item.compliance === 100 ? "bg-green" : item.compliance > 0 ? "bg-primary" : "bg-border"}`}
              style={{ width: `${item.compliance}%` }}
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ReportStage({
  label,
  status,
  complete,
  attention,
}: {
  label: string;
  status: string;
  complete: boolean;
  attention: boolean;
}) {
  const tone = attention
    ? "bg-orange/8 text-orange"
    : complete
      ? "bg-green/8 text-green"
      : "bg-surface-strong/55 text-muted";

  return (
    <div className={`min-w-0 rounded-xl px-2.5 py-2 ${tone}`}>
      <p className="text-[0.52rem] font-black uppercase tracking-[0.12em] opacity-70">{label}</p>
      <p className="mt-0.5 truncate text-[0.66rem] font-extrabold" title={status}>{status}</p>
    </div>
  );
}

function dailyLabel(item: MonitoringReportProgress) {
  if (!item.daily.id) return "Belum ada";
  if (item.daily.status === "Perlu_Revisi") return "Perlu revisi";
  if (item.daily.morningDone && item.daily.eveningDone) return "Pagi & sore selesai";
  if (item.daily.morningDone) return "Pagi selesai";
  if (item.daily.eveningDone) return "Sore selesai";
  return "Draft";
}

function statusLabel(status: MonitoringReportProgress["weekly"]["status"], detail?: string | null) {
  if (!status) return "Belum ada";
  const labels: Record<string, string> = {
    Draft: "Draft",
    Terkirim: "Menunggu review",
    Divalidasi: "Tervalidasi",
    Perlu_Revisi: "Perlu revisi",
    Disetujui: "Disetujui",
    Ditolak: "Ditolak",
  };
  return detail ? `${labels[status] ?? status} · ${detail}` : labels[status] ?? status;
}

function isComplete(status: MonitoringReportProgress["weekly"]["status"]) {
  return status === "Terkirim" || status === "Divalidasi" || status === "Disetujui";
}

function ReportError({ message }: { message: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-orange/25 bg-orange/5 px-6 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange/10 text-orange">
        <Iconify icon="solar:danger-triangle-bold-duotone" width={22} />
      </span>
      <p className="mt-3 text-sm font-extrabold text-primary-dark">Progres laporan belum dapat dimuat</p>
      <p className="mt-1 max-w-lg text-xs font-semibold leading-relaxed text-muted">{message}</p>
    </div>
  );
}

function EmptyState({ title, description, compact = false }: { title: string; description: string; compact?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/65 bg-surface/45 px-6 text-center ${compact ? "min-h-40" : "min-h-64"}`}>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-strong text-muted">
        <Iconify icon="solar:clipboard-remove-bold-duotone" width={22} />
      </span>
      <p className="mt-3 text-sm font-extrabold text-muted">{title}</p>
      <p className="mt-1 max-w-md text-xs font-semibold leading-relaxed text-muted">{description}</p>
    </div>
  );
}
