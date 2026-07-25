import { motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { useLocalStorageState } from "../../../lib/useLocalStorageState";
import {
  divisions,
  locations,
  santriList,
  type Santri,
} from "../../../data/santriData";
import { projects } from "../../../data/monitoring/projectData";
import { dailyEntries, weeklyEntries } from "../../../data/monitoring/reportData";

const cardClass =
  "rounded-[26px] border border-border/70 bg-surface/82 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:shadow-[0_18px_70px_rgba(0,0,0,0.28)]";

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
  meta,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: string;
  tone: "blue" | "green" | "orange" | "purple";
  meta: string;
}) {
  const styles: Record<
    "blue" | "green" | "orange" | "purple",
    { icon: string; badge: string }
  > = {
    blue: {
      icon: "bg-blue/10 text-blue",
      badge: "bg-blue/10 text-blue",
    },
    green: {
      icon: "bg-green/10 text-green",
      badge: "bg-green/10 text-green",
    },
    orange: {
      icon: "bg-orange/10 text-orange",
      badge: "bg-orange/10 text-orange",
    },
    purple: {
      icon: "bg-purple/10 text-purple",
      badge: "bg-purple/10 text-purple",
    },
  };
  const style = styles[tone];

  return (
    <article className={`${cardClass} group relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30`}>
      <span className={`absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${style.icon}`}>
        <Iconify icon={icon} width={24} />
      </span>
      <p className="pr-12 text-xs font-black uppercase tracking-widest text-muted">{label}</p>
      <div className="mt-5 flex items-end justify-between gap-3">
        <p className="font-(--font-family-head) text-4xl font-extrabold tracking-tight text-primary-dark">
          {value}
        </p>
        <span className={`mb-1 rounded-full px-2.5 py-1 text-[0.65rem] font-black ${style.badge}`}>
          {meta}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-muted">{sub}</p>
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
  const topItem = items.reduce((top, item) => (item.value > top.value ? item : top), items[0]);

  return (
    <article className={`${cardClass} p-5`}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary">Operational Load</p>
          <h2 className="font-(--font-family-head) text-2xl font-extrabold tracking-tight text-primary-dark">{title}</h2>
          <p className="mt-1 text-sm font-semibold text-muted">Terpadat: {topItem.label}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Iconify icon={icon} width={22} />
        </span>
      </div>

      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-surface-strong/42 p-3 ring-1 ring-inset ring-border/45">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-bold text-text">{item.label}</span>
              <span className="shrink-0 rounded-full bg-surface px-2.5 py-0.5 text-xs font-black text-primary-dark">
                {item.value}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border/50">
              <motion.span
                className="block h-full rounded-full bg-gradient-to-r from-primary to-blue"
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / max) * 100}%` }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
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
    <article className={`${cardClass} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary">Data Quality</p>
          <h2 className="mt-1 font-(--font-family-head) text-2xl font-extrabold tracking-tight text-primary-dark">
            Data Completeness Score
          </h2>
        </div>
        <span className="rounded-full bg-green/10 px-3 py-1 text-xs font-black text-green">Healthy</span>
      </div>
      <div className="mt-6 grid grid-cols-[132px_1fr] items-center gap-6 max-sm:grid-cols-1">
        <div className="relative h-[132px] w-[132px]">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-border/45" strokeWidth="10" />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              className="text-primary"
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
        <div className="grid gap-4 text-sm">
          <p className="font-semibold leading-relaxed text-muted">
            Skor dihitung dari kelengkapan unit, lokasi, divisi, role, PIC divisi, dan PIC regional.
          </p>
          <div className="grid gap-2">
            {[
              ["Identity", "Unit, lokasi, status"],
              ["Assignment", "Divisi dan role kerja"],
              ["PIC", "PIC divisi dan regional"],
            ].map(([label, detail]) => (
              <div key={label} className="flex items-center justify-between gap-3 rounded-2xl bg-surface-strong/46 px-3 py-2">
                <span className="font-black text-text">{label}</span>
                <span className="text-xs font-semibold text-muted">{detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function AlertsCard() {
  const levelStyles: Record<string, string> = {
    High: "bg-orange/10 text-orange ring-orange/20",
    Medium: "bg-blue/10 text-blue ring-blue/20",
    Info: "bg-green/10 text-green ring-green/20",
  };

  return (
    <article className={`${cardClass} p-5`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-orange">System Alerts</p>
          <h2 className="font-(--font-family-head) text-2xl font-extrabold tracking-tight text-primary-dark">Alert Aktif</h2>
        </div>
        <span className="rounded-full bg-orange/10 px-3 py-1 text-xs font-black text-orange">{systemAlerts.length} alert</span>
      </div>
      <div className="grid gap-3">
        {systemAlerts.map((alert) => (
          <div key={alert.id} className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl bg-surface-strong/42 p-3.5 ring-1 ring-inset ring-border/45">
            <span className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl ring-1 ${levelStyles[alert.level]}`}>
              <Iconify icon="solar:bell-bing-bold-duotone" width={17} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-sm text-primary-dark">{alert.title}</strong>
                <span className={`rounded-full px-2 py-0.5 text-[0.62rem] font-black ring-1 ${levelStyles[alert.level]}`}>
                  {alert.level}
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-muted">{alert.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function AuditLogCard() {
  return (
    <article className={`${cardClass} p-5`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary">Recent Audit Logs</p>
          <h2 className="font-(--font-family-head) text-2xl font-extrabold tracking-tight text-primary-dark">Aktivitas Terakhir</h2>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Iconify icon="solar:history-bold-duotone" width={22} />
        </span>
      </div>
      <div className="grid gap-3">
        {auditLogs.map((log) => (
          <div key={log.id} className="grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-2xl bg-surface-strong/38 p-3.5 max-sm:grid-cols-[auto_1fr]">
            <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Iconify icon="solar:check-circle-bold-duotone" width={17} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <strong className="text-primary-dark">{log.actor}</strong>
                <span className="text-muted">{log.action}</span>
              </div>
              <p className="mt-1 truncate text-xs font-semibold text-muted">Target: {log.target}</p>
            </div>
            <span className="rounded-full bg-surface px-2.5 py-1 text-[0.65rem] font-black text-muted max-sm:col-start-2 max-sm:w-fit">
              {log.time}
            </span>
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
  const totalAssignments =
    mappedSantri.reduce(
      (sum, item) => sum + item.divs.length + item.roles.length,
      0,
    ) + projects.length;
  const pendingApprovals =
    weeklyEntries.filter((entry) => !entry.validated).length +
    projects.filter((project) => project.status === "Submitted").length;
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
  const hasCriticalAlert = systemAlerts.some((alert) => alert.level === "High");
  const hasAttentionAlert = systemAlerts.some((alert) => alert.level === "Medium");
  const systemStatus = hasCriticalAlert
    ? {
        label: "Action",
        tone: "orange" as const,
        icon: "solar:danger-triangle-bold-duotone",
        sub: "Ada alert prioritas tinggi",
      }
    : hasAttentionAlert
      ? {
          label: "Monitor",
          tone: "purple" as const,
          icon: "solar:bell-bing-bold-duotone",
          sub: "Ada alert yang perlu dipantau",
        }
      : {
          label: "Stable",
          tone: "green" as const,
          icon: "solar:shield-check-bold-duotone",
          sub: "Tidak ada alert kritis",
        };

  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <section className="relative overflow-hidden rounded-[32px] border border-border/70 bg-gradient-to-br from-surface via-surface/92 to-primary/8 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] max-sm:p-5">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/16 blur-3xl" />
        <div className="relative flex items-end justify-between gap-5 max-lg:flex-col max-lg:items-start">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-primary">
              Admin Home
            </span>
            <h1 className="mt-4 font-(--font-family-head) text-4xl font-extrabold tracking-tight text-primary-dark max-sm:text-3xl">
              Control Center
            </h1>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-muted">
              Ringkasan cepat untuk memantau santri, beban assignment, approval, alert sistem, dan audit aktivitas terbaru.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 max-sm:w-full max-sm:grid-cols-1">
            <div className="rounded-2xl bg-surface/80 px-4 py-3 ring-1 ring-inset ring-border/60">
              <p className="text-[0.65rem] font-black uppercase tracking-wider text-muted">Active</p>
              <p className="mt-1 font-(--font-family-head) text-xl font-extrabold text-primary-dark">{activeSantri.length}</p>
            </div>
            <div className="rounded-2xl bg-surface/80 px-4 py-3 ring-1 ring-inset ring-border/60">
              <p className="text-[0.65rem] font-black uppercase tracking-wider text-muted">Reports</p>
              <p className="mt-1 font-(--font-family-head) text-xl font-extrabold text-primary-dark">{dailyEntries.length}</p>
            </div>
            <div className="rounded-2xl bg-surface/80 px-4 py-3 ring-1 ring-inset ring-border/60">
              <p className="text-[0.65rem] font-black uppercase tracking-wider text-muted">Quality</p>
              <p className="mt-1 font-(--font-family-head) text-xl font-extrabold text-green">{completenessScore}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1" aria-label="Admin summary metrics">
        <MetricCard label="Total Santri" value={mappedSantri.length} sub={`${activeSantri.length} siswa aktif pengabdian`} icon="solar:square-academic-cap-bold-duotone" tone="blue" meta="Live" />
        <MetricCard label="Total Assignments" value={totalAssignments} sub="Akumulasi divisi, role, dan project" icon="solar:clipboard-list-bold-duotone" tone="purple" meta="Mapped" />
        <MetricCard label="Pending Approvals" value={pendingApprovals} sub="Weekly review dan project submit" icon="solar:checklist-minimalistic-bold-duotone" tone="orange" meta="Action" />
        <MetricCard label="System Alerts" value={systemAlerts.length} sub={systemStatus.sub} icon={systemStatus.icon} tone={systemStatus.tone} meta={systemStatus.label} />
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
