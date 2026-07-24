import { motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { useLocalStorageState } from "../../../lib/useLocalStorageState";
import { divisions, locations, santriList, type Santri } from "../../../data/santriData";
import { projects } from "../../../data/monitoring/projectData";
import { dailyEntries, weeklyEntries } from "../../../data/monitoring/reportData";

const systemAlerts = [
  {
    id: 1,
    title: "Weekly report belum lengkap",
    detail: "Beberapa siswa belum mengirim weekly review pekan ini.",
    level: "High",
  },
  {
    id: 2,
    title: "PIC regional perlu validasi lokasi",
    detail: "Data lokasi Remote dan Pandeglang perlu dicek ulang.",
    level: "Medium",
  },
  {
    id: 3,
    title: "Data assignment baru masuk",
    detail: "Mapping project dan divisi perlu direview sebelum aktif.",
    level: "Info",
  },
];

const auditLogs = [
  {
    id: 1,
    actor: "Admin",
    action: "Memindahkan siswa ke divisi IT",
    target: "IN_HSIBS_S08",
    time: "10 menit lalu",
  },
  {
    id: 2,
    actor: "PIC Divisi",
    action: "Memverifikasi weekly review",
    target: "Academic",
    time: "34 menit lalu",
  },
  {
    id: 3,
    actor: "PIC Regional",
    action: "Update status lokasi",
    target: "Sukabumi",
    time: "1 jam lalu",
  },
  {
    id: 4,
    actor: "System",
    action: "Mengirim reminder daily log",
    target: "7 siswa",
    time: "2 jam lalu",
  },
];

function pct(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function countBy(items: Santri[], getKey: (item: Santri) => string[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    getKey(item).forEach((key) => {
      acc[key] = (acc[key] ?? 0) + 1;
    });
    return acc;
  }, {});
}

function MetricCard({
  label,
  value,
  sub,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: string;
  tone: "blue" | "green" | "orange" | "purple";
}) {
  const styles = {
    blue: "bg-blue/10 text-blue",
    green: "bg-green/10 text-green",
    orange: "bg-orange/10 text-orange",
    purple: "bg-purple/10 text-purple",
  }[tone];

  return (
    <article className="relative overflow-hidden rounded-2xl border border-border/70 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
      <span className={`absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${styles}`}>
        <Iconify icon={icon} width={24} />
      </span>
      <p className="pr-12 text-xs font-black uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-3 font-(--font-family-head) text-4xl font-extrabold tracking-tight text-primary-dark">
        {value}
      </p>
      <p className="mt-1 text-sm font-semibold text-muted">{sub}</p>
    </article>
  );
}

function LoadCard({
  title,
  items,
  total,
  icon,
}: {
  title: string;
  items: { label: string; value: number }[];
  total: number;
  icon: string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <article className="rounded-2xl border border-border/70 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary">Load</p>
          <h2 className="font-(--font-family-head) text-xl font-extrabold text-primary-dark">{title}</h2>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Iconify icon={icon} width={22} />
        </span>
      </div>

      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.label} className="grid gap-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-bold text-text">{item.label}</span>
              <span className="font-black text-primary-dark">{item.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-strong">
              <span className="block h-full rounded-full bg-primary" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="font-semibold text-muted">Total coverage</span>
        <strong className="text-primary-dark">{total} siswa</strong>
      </div>
    </article>
  );
}

function DataCompletenessCard({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42;

  return (
    <article className="rounded-2xl border border-border/70 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
      <p className="text-xs font-black uppercase tracking-widest text-primary">Data Quality</p>
      <h2 className="mt-1 font-(--font-family-head) text-xl font-extrabold text-primary-dark">
        Data Completeness Score
      </h2>
      <div className="mt-5 grid grid-cols-[120px_1fr] items-center gap-5 max-sm:grid-cols-1">
        <div className="relative h-[120px] w-[120px]">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-surface-strong" strokeWidth="10" />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              className="text-green"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (score / 100) * circumference}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-(--font-family-head) text-3xl font-extrabold text-primary-dark">
            {score}%
          </span>
        </div>
        <div className="grid gap-3 text-sm">
          <p className="font-semibold leading-relaxed text-muted">
            Skor dihitung dari kelengkapan unit, lokasi, divisi, role, PIC divisi, dan PIC regional.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <span className="rounded-xl bg-green/10 px-3 py-2 font-black text-green">Siap audit</span>
            <span className="rounded-xl bg-primary/10 px-3 py-2 font-black text-primary">Perlu monitoring</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function AlertsCard() {
  return (
    <article className="rounded-2xl border border-border/70 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-orange">System Alerts</p>
          <h2 className="font-(--font-family-head) text-xl font-extrabold text-primary-dark">Alert Aktif</h2>
        </div>
        <span className="rounded-full bg-orange/10 px-3 py-1 text-xs font-black text-orange">{systemAlerts.length} alert</span>
      </div>
      <div className="grid gap-2">
        {systemAlerts.map((alert) => (
          <div key={alert.id} className="rounded-xl border border-border/70 bg-surface-strong/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm text-primary-dark">{alert.title}</strong>
              <span className="rounded-full bg-surface px-2 py-0.5 text-[0.65rem] font-black text-orange">{alert.level}</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-muted">{alert.detail}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function AuditLogCard() {
  return (
    <article className="rounded-2xl border border-border/70 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary">Recent Audit Logs</p>
          <h2 className="font-(--font-family-head) text-xl font-extrabold text-primary-dark">Aktivitas Terakhir</h2>
        </div>
        <Iconify icon="solar:history-bold-duotone" width={26} className="text-primary" />
      </div>
      <div className="grid gap-3">
        {auditLogs.map((log) => (
          <div key={log.id} className="grid grid-cols-[auto_1fr] gap-3">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
            <div className="border-b border-border pb-3 last:border-b-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <strong className="text-primary-dark">{log.actor}</strong>
                <span className="text-muted">{log.action}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
                <span>{log.target}</span>
                <span>•</span>
                <span>{log.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export function AdminDashboardHome() {
  const [mappedSantri] = useLocalStorageState<Santri[]>("in_hsibs.mapping.santri", santriList);

  const activeSantri = mappedSantri.filter((item) => item.status === "Active");
  const divisionCounts = countBy(mappedSantri, (item) => item.divs);
  const locationCounts = countBy(mappedSantri, (item) => [item.loc]);
  const divisionLoad = divisions.map((division) => ({
    label: division.label,
    value: divisionCounts[division.code] ?? 0,
  }));
  const locationLoad = locations.map((location) => ({
    label: location,
    value: locationCounts[location] ?? 0,
  }));
  const totalAssignments = mappedSantri.reduce((sum, item) => sum + item.divs.length + item.roles.length, 0) + projects.length;
  const pendingApprovals = weeklyEntries.filter((entry) => !entry.validated).length + projects.filter((project) => project.status === "Submitted").length;
  const requiredFields = mappedSantri.length * 6 || 1;
  const completedFields = mappedSantri.reduce(
    (sum, item) =>
      sum +
      Number(Boolean(item.unit)) +
      Number(Boolean(item.loc)) +
      Number(item.divs.length > 0) +
      Number(item.roles.length > 0) +
      Number(item.picDivs.length > 0) +
      Number(Boolean(item.picReg)),
    0,
  );
  const completenessScore = pct(completedFields, requiredFields);

  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-primary">Admin Home</p>
        <h1 className="font-(--font-family-head) text-4xl font-extrabold tracking-tight text-primary-dark">
          Control Center
        </h1>
        <p className="mt-1 text-sm font-semibold text-muted">
          Ringkasan data santri, assignment, approval, alert sistem, dan aktivitas audit terbaru.
        </p>
      </div>

      <section className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1" aria-label="Admin summary metrics">
        <MetricCard label="Total Santri" value={mappedSantri.length} sub={`${activeSantri.length} aktif pengabdian`} icon="solar:square-academic-cap-bold-duotone" tone="blue" />
        <MetricCard label="Total Assignments" value={totalAssignments} sub="Divisi, role, dan project" icon="solar:clipboard-list-bold-duotone" tone="purple" />
        <MetricCard label="Pending Approvals" value={pendingApprovals} sub="Weekly review dan project submit" icon="solar:checklist-minimalistic-bold-duotone" tone="orange" />
        <MetricCard label="System Alerts" value={systemAlerts.length} sub={`${dailyEntries.length} daily log termonitor`} icon="solar:danger-triangle-bold-duotone" tone="green" />
      </section>

      <section className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <LoadCard title="Division Load" items={divisionLoad} total={mappedSantri.length} icon="solar:chart-square-bold-duotone" />
        <LoadCard title="Location Load" items={locationLoad} total={mappedSantri.length} icon="solar:buildings-2-bold-duotone" />
      </section>

      <section className="grid grid-cols-[0.9fr_1.1fr] gap-4 max-xl:grid-cols-1">
        <DataCompletenessCard score={completenessScore} />
        <AlertsCard />
      </section>

      <AuditLogCard />
    </motion.div>
  );
}
