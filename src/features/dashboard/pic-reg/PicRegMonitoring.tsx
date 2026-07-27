import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { useToast } from "../../../components/ui/ToastProvider";
import { useAuth } from "../../../lib/auth";
import type { ReportStatus } from "../../../lib/supabase/types";
import { usePicRegDashboard, usePicRegMapping, type PicRegMukafaahItem, type PicRegWarningItem } from "../../../models/pic-reg";
import { setReportManagementStatus, useReportManagement, type ReportQueueItem } from "../../../models/report";

type MonitoringTab = "monthly" | "weekly" | "risk";

const tabs: { id: MonitoringTab; label: string; icon: string }[] = [
  { id: "monthly", label: "Monthly Evaluation", icon: "solar:calendar-minimalistic-bold-duotone" },
  { id: "weekly", label: "Weekly Review", icon: "solar:file-text-bold-duotone" },
  { id: "risk", label: "Risk & Warning", icon: "solar:shield-warning-bold-duotone" },
];

export function PicRegMonitoring() {
  const { profile } = useAuth();
  const toast = useToast();
  const dashboard = usePicRegDashboard(profile?.regionId);
  const mapping = usePicRegMapping(profile?.regionId);
  const reports = useReportManagement();
  const [activeTab, setActiveTab] = useState<MonitoringTab>("monthly");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  if (!profile?.regionId) return <StatePanel icon="solar:map-point-wave-linear" title="Regional belum terhubung" description="Akun ini belum memiliki region pada pengabdian_staff.region_id." />;
  if (dashboard.isLoading || mapping.isLoading || reports.isLoading) return <MonitoringLoading />;
  const loadError = dashboard.error ?? mapping.error ?? reports.error;
  if (loadError || !dashboard.data || !mapping.data) return <StatePanel icon="solar:danger-triangle-bold-duotone" title="Monitoring regional belum dapat dimuat" description={loadError ?? "Data regional tidak tersedia."} tone="error" />;

  const studentIds = new Set(mapping.data.students.map((student) => student.pengabdianId).filter((id): id is string => Boolean(id)));
  const weeklyQueue = reports.data.queue.filter((report) => report.scope === "Weekly" && report.status === "Terkirim" && studentIds.has(report.pengabdianId));
  const query = search.trim().toLowerCase();
  const monthly = dashboard.data.mukafaah.filter((item) => !query || `${item.studentName} ${item.studentCode} ${item.location}`.toLowerCase().includes(query));
  const weekly = weeklyQueue.filter((item) => !query || `${item.studentName} ${item.studentCode} ${item.summary}`.toLowerCase().includes(query));
  const warnings = dashboard.data.warnings.filter((item) => !query || `${item.studentName} ${item.location} ${item.title}`.toLowerCase().includes(query));
  const gyr = {
    total: dashboard.data.mukafaah.length,
    green: dashboard.data.mukafaah.filter((item) => item.gyr === "Green").length,
    yellow: dashboard.data.mukafaah.filter((item) => item.gyr === "Yellow").length,
    red: dashboard.data.mukafaah.filter((item) => item.gyr === "Red").length,
  };

  async function updateStatus(reportId: string, status: ReportStatus, label: string) {
    setBusyId(reportId);
    try {
      await setReportManagementStatus(reportId, status);
      await Promise.all([dashboard.refresh(), reports.refresh()]);
      toast.success(status === "Disetujui" ? "Evaluasi difinalisasi" : status === "Divalidasi" ? "Weekly divalidasi" : "Revisi diminta", label);
    } catch (err) {
      toast.error("Status gagal diperbarui", err instanceof Error ? err.message : "Coba kembali beberapa saat lagi.");
    } finally {
      setBusyId(null);
    }
  }

  const counts: Record<MonitoringTab, number> = {
    monthly: dashboard.data.mukafaah.filter((item) => item.reportStatus === "Divalidasi").length,
    weekly: weeklyQueue.length,
    risk: dashboard.data.warnings.length,
  };

  return (
    <motion.div className="grid gap-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative"><div className="flex items-center gap-3"><p className="text-xs font-black uppercase tracking-widest text-primary">PIC Regional</p><span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-black text-primary">{dashboard.data.region.name}</span></div><h1 className="mt-2 font-(--font-family-head) text-3xl font-extrabold tracking-tight text-primary-dark md:text-4xl">Monitoring Regional</h1><p className="mt-1 max-w-2xl text-sm text-muted">Final review evaluasi bulanan, weekly report, dan risiko aktif santri regional.</p></div>
      </section>

      <section className="grid grid-cols-4 gap-3 max-md:grid-cols-2">
        <Metric label="Total Evaluasi" value={gyr.total} color="bg-primary/10 text-primary" />
        <Metric label="Green" value={gyr.green} color="bg-emerald-500/10 text-emerald-500" />
        <Metric label="Yellow" value={gyr.yellow} color="bg-amber-500/10 text-amber-500" />
        <Metric label="Red" value={gyr.red} color="bg-rose-500/10 text-rose-500" />
      </section>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav className="scrollbar-hidden flex gap-2 overflow-x-auto pb-1" aria-label="Monitoring regional">{tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-[0.82rem] font-bold transition-all ${activeTab === tab.id ? "bg-primary text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)]" : "border border-border/50 bg-surface text-text hover:bg-primary-soft"}`}><Iconify icon={tab.icon} width={17} />{tab.label}<span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.6rem] font-black ${activeTab === tab.id ? "bg-white/20" : counts[tab.id] ? "bg-orange/10 text-orange" : "bg-surface-strong text-muted"}`}>{counts[tab.id]}</span></button>)}</nav>
        <div className="flex min-w-64 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-muted focus-within:border-primary/40"><Iconify icon="solar:magnifer-bold-duotone" width={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari santri atau laporan..." className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-xs font-semibold text-text outline-none" />{search && <button type="button" onClick={() => setSearch("")} aria-label="Hapus pencarian"><Iconify icon="mingcute:close-line" width={15} /></button>}</div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          {activeTab === "monthly" && (monthly.length ? <div className="grid gap-3">{monthly.map((item, index) => <MonthlyCard key={item.evaluationId} item={item} index={index} busy={busyId === item.reportId} onFinalize={() => void updateStatus(item.reportId, "Disetujui", `${item.studentName} · ${item.period}`)} onRevision={() => void updateStatus(item.reportId, "Perlu_Revisi", `${item.studentName} · ${item.period}`)} />)}</div> : <Empty text="Belum ada evaluasi bulanan yang sesuai." />)}
          {activeTab === "weekly" && <WeeklyList items={weekly} busyId={busyId} onValidate={(item) => void updateStatus(item.id, "Divalidasi", `${item.studentName} · ${item.summary}`)} onRevision={(item) => void updateStatus(item.id, "Perlu_Revisi", `${item.studentName} · ${item.summary}`)} />}
          {activeTab === "risk" && (warnings.length ? <div className="grid gap-3 sm:grid-cols-2">{warnings.map((warning, index) => <RiskCard key={warning.id} warning={warning} index={index} />)}</div> : <Empty text="Tidak ada risk report atau evaluasi berisiko aktif." success />)}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function MonthlyCard({ item, index, busy, onFinalize, onRevision }: { item: PicRegMukafaahItem; index: number; busy: boolean; onFinalize: () => void; onRevision: () => void }) {
  const gyrStyle = item.gyr === "Red" ? "bg-rose-500/10 text-rose-500" : item.gyr === "Yellow" ? "bg-amber-500/10 text-amber-500" : item.gyr === "Green" ? "bg-emerald-500/10 text-emerald-500" : "bg-surface-strong text-muted";
  return <motion.article className="rounded-2xl border border-border/60 bg-surface p-5 shadow-sm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-base font-extrabold text-primary-dark">{item.studentName}</h2><span className="font-mono text-[0.62rem] font-bold text-primary">{item.studentCode}</span><span className={`rounded-full px-2.5 py-1 text-[0.62rem] font-black ${gyrStyle}`}>{item.gyr ?? "Belum dinilai"}</span><StatusBadge status={item.reportStatus} /></div><p className="mt-1 text-xs font-semibold text-muted">{item.location} · {item.period}</p></div>{item.reportStatus === "Divalidasi" && <div className="flex shrink-0 gap-2"><button type="button" disabled={busy} onClick={onRevision} className="rounded-lg border border-orange/20 px-3 py-2 text-[0.68rem] font-black text-orange disabled:opacity-50">Revisi</button><button type="button" disabled={busy} onClick={onFinalize} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[0.68rem] font-black text-white disabled:cursor-wait disabled:opacity-60">{busy && <Iconify icon="solar:refresh-linear" width={12} className="animate-spin" />}Finalize</button></div>}</div><div className="mt-4 grid grid-cols-4 gap-2"><MetricBox label="SoW" value={`${item.sowProgress}%`} warning={item.sowProgress < 60} /><MetricBox label="Adab" value={`${item.adabScore}/5`} warning={item.adabScore < 3} /><MetricBox label="Learn" value={item.learnCount} warning={item.learnCount === 0} /><MetricBox label="Project" value={item.projectCount} warning={item.projectCount === 0} /></div></motion.article>;
}

function WeeklyList({ items, busyId, onValidate, onRevision }: { items: ReportQueueItem[]; busyId: string | null; onValidate: (item: ReportQueueItem) => void; onRevision: (item: ReportQueueItem) => void }) {
  if (!items.length) return <Empty text="Tidak ada weekly report yang menunggu validasi." success />;
  return <div className="grid gap-3">{items.map((item, index) => <motion.article key={item.id} className="rounded-2xl border border-border/60 bg-surface p-4 shadow-sm" initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-primary-dark">{item.studentName}</strong><span className="font-mono text-[0.62rem] font-bold text-primary">{item.studentCode}</span>{item.hasBlocker && <span className="rounded-full bg-orange/10 px-2 py-0.5 text-[0.6rem] font-black text-orange">Ada blocker</span>}</div><p className="mt-1 text-xs font-semibold text-muted">{item.summary}</p>{item.details.length > 0 && <p className="mt-2 line-clamp-2 text-xs text-text">{item.details.map((detail) => `${detail.label}: ${detail.value}`).join(" · ")}</p>}</div><div className="flex shrink-0 gap-2"><button type="button" disabled={busyId === item.id} onClick={() => onRevision(item)} className="rounded-lg border border-border px-3 py-2 text-[0.68rem] font-bold text-muted hover:text-orange disabled:opacity-50">Revisi</button><button type="button" disabled={busyId === item.id} onClick={() => onValidate(item)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[0.68rem] font-black text-white disabled:cursor-wait disabled:opacity-60">{busyId === item.id && <Iconify icon="solar:refresh-linear" width={12} className="animate-spin" />}Validasi</button></div></div></motion.article>)}</div>;
}

function RiskCard({ warning, index }: { warning: PicRegWarningItem; index: number }) {
  const critical = warning.severity === "Critical" || warning.severity === "High";
  return <motion.article className="rounded-2xl border border-border/60 bg-surface p-4 shadow-sm" initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}><div className="flex items-start gap-3"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${critical ? "bg-rose-500" : warning.severity === "Medium" ? "bg-amber-500" : "bg-border"}`} /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-primary-dark">{warning.studentName}</strong><span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-black ${critical ? "bg-rose-500/10 text-rose-500" : warning.severity === "Medium" ? "bg-amber-500/10 text-amber-500" : "bg-surface-strong text-muted"}`}>{warning.severity}</span></div><p className="mt-0.5 text-[0.64rem] font-semibold text-muted">{warning.location}</p><h3 className="mt-2 text-xs font-extrabold text-text">{warning.title}</h3><p className="mt-1 text-[0.72rem] leading-relaxed text-muted">{warning.description}</p></div></div></motion.article>;
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) { return <article className="rounded-2xl border border-border bg-surface p-4 shadow-sm"><span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${color}`}><Iconify icon="solar:chart-square-bold-duotone" width={16} /></span><p className="mt-3 text-2xl font-extrabold text-primary-dark">{value}</p><p className="text-xs font-bold text-muted">{label}</p></article>; }
function MetricBox({ label, value, warning }: { label: string; value: string | number; warning: boolean }) { return <div className="rounded-xl bg-surface-strong/60 p-2.5 text-center"><p className="text-[0.55rem] font-bold uppercase text-muted">{label}</p><p className={`mt-0.5 text-sm font-black ${warning ? "text-orange" : "text-primary-dark"}`}>{value}</p></div>; }
function StatusBadge({ status }: { status: ReportStatus }) { const style: Record<ReportStatus, string> = { Draft: "bg-surface-strong text-muted", Terkirim: "bg-blue/10 text-blue", Divalidasi: "bg-purple/10 text-purple", Perlu_Revisi: "bg-orange/10 text-orange", Disetujui: "bg-emerald-500/10 text-emerald-500", Ditolak: "bg-rose-500/10 text-rose-500" }; return <span className={`rounded-full px-2.5 py-1 text-[0.6rem] font-black ${style[status]}`}>{status.replace("_", " ")}</span>; }
function Empty({ text, success = false }: { text: string; success?: boolean }) { return <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/45 px-6 text-center"><Iconify icon={success ? "solar:check-circle-bold-duotone" : "solar:inbox-line-bold-duotone"} width={32} className={success ? "text-emerald-500/45" : "text-muted/35"} /><p className="mt-3 text-sm font-bold text-muted">{text}</p></div>; }
function StatePanel({ icon, title, description, tone = "neutral", action }: { icon: string; title: string; description: string; tone?: "neutral" | "error"; action?: ReactNode }) { return <div className="flex min-h-[50vh] items-center justify-center"><div className="max-w-md rounded-3xl border border-border bg-surface p-8 text-center"><span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${tone === "error" ? "bg-orange/10 text-orange" : "bg-background text-muted"}`}><Iconify icon={icon} width={28} /></span><h1 className="mt-4 text-lg font-black text-text">{title}</h1><p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>{action}</div></div>; }
function MonitoringLoading() { return <div className="grid gap-5 animate-pulse"><div className="h-44 rounded-3xl bg-surface" /><div className="grid grid-cols-4 gap-3 max-md:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-24 rounded-2xl bg-surface" />)}</div><div className="h-80 rounded-2xl bg-surface" /></div>; }
