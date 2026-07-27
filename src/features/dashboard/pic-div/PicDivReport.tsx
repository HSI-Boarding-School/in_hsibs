import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import { useAuth } from "../../../lib/auth";
import type { ReportStatus } from "../../../lib/supabase/types";
import { useAdminMappingData } from "../../../models/admin";
import { useReportManagement, type MissingReportItem, type ReportHistoryItem, type ReportQueueItem, type ReportScope } from "../../../models/report";

type ReportTab = "reports" | "missing" | "history";

const scopeOptions = [
  { value: "all", label: "Semua jenis", icon: "solar:layers-bold-duotone" },
  { value: "Daily", label: "Daily", icon: "solar:document-text-bold-duotone" },
  { value: "Weekly", label: "Weekly", icon: "solar:clipboard-list-bold-duotone" },
  { value: "Monthly", label: "Monthly", icon: "solar:chart-square-bold-duotone" },
];

const statusOptions = [
  { value: "all", label: "Semua status" },
  { value: "Draft", label: "Draft" },
  { value: "Terkirim", label: "Pending review" },
  { value: "Divalidasi", label: "Divalidasi" },
  { value: "Perlu_Revisi", label: "Perlu revisi" },
  { value: "Disetujui", label: "Disetujui" },
  { value: "Ditolak", label: "Ditolak" },
];

export function PicDivReport() {
  const { profile } = useAuth();
  const mapping = useAdminMappingData({ divisionId: profile?.divisionId ?? undefined });
  const reports = useReportManagement();
  const [tab, setTab] = useState<ReportTab>("reports");
  const [scope, setScope] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  if (!profile?.divisionId) {
    return <ReportState icon="solar:buildings-3-linear" title="Divisi belum terhubung" description="Akun ini belum memiliki divisi pada pengabdian_staff.divisi_id." />;
  }
  if (mapping.isLoading || reports.isLoading) return <ReportLoading />;
  if (mapping.error || reports.error || !mapping.data?.scopeDivision) {
    return <ReportState icon="solar:danger-triangle-bold-duotone" title="Report belum dapat dimuat" description={mapping.error ?? reports.error ?? "Data divisi tidak ditemukan."} tone="error" action={!mapping.error && reports.error ? <button type="button" onClick={() => void reports.refresh().catch(() => undefined)} className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-white">Coba lagi</button> : undefined} />;
  }

  const studentIds = new Set(mapping.data.santri.map((student) => student.pengabdianId).filter((id): id is string => Boolean(id)));
  const divisionReports = reports.data.queue.filter((report) => studentIds.has(report.pengabdianId));
  const divisionReportIds = new Set(divisionReports.map((report) => report.id));
  const missingReports = reports.data.missing.filter((item) => studentIds.has(item.pengabdianId));
  const history = reports.data.history.filter((item) => divisionReportIds.has(item.reportId));
  const query = search.trim().toLowerCase();
  const filteredReports = divisionReports.filter((report) => {
    if (scope !== "all" && report.scope !== scope) return false;
    if (status !== "all" && report.status !== status) return false;
    if (query && !`${report.studentName} ${report.studentCode} ${report.summary}`.toLowerCase().includes(query)) return false;
    return true;
  });
  const filteredMissing = missingReports.filter((item) => !query || `${item.studentName} ${item.studentCode} ${item.scope}`.toLowerCase().includes(query));
  const stats = {
    total: divisionReports.length,
    pending: divisionReports.filter((report) => report.status === "Terkirim").length,
    revision: divisionReports.filter((report) => report.status === "Perlu_Revisi").length,
    completed: divisionReports.filter((report) => report.status === "Divalidasi" || report.status === "Disetujui").length,
    missing: missingReports.length,
  };

  return (
    <motion.div className="grid gap-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3"><p className="text-xs font-black uppercase tracking-widest text-primary">PIC Divisi</p><span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-black text-primary">{mapping.data.scopeDivision.code}</span></div>
            <h1 className="mt-2 font-(--font-family-head) text-3xl font-extrabold tracking-tight text-primary-dark md:text-4xl">Report Santri</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted">Seluruh Daily, Weekly, dan Monthly report santri divisi {mapping.data.scopeDivision.label} dari Supabase.</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/65 px-4 py-3"><p className="text-[0.6rem] font-black uppercase tracking-wider text-muted">Santri dalam scope</p><p className="mt-1 text-xl font-black text-text">{mapping.data.santri.length}</p></div>
        </div>
      </section>

      <section className="grid grid-cols-5 overflow-hidden rounded-2xl border border-border/65 bg-surface/78 max-lg:grid-cols-3 max-sm:grid-cols-2">
        <Stat label="Total Report" value={stats.total} icon="solar:documents-bold-duotone" />
        <Stat label="Pending" value={stats.pending} icon="solar:inbox-line-bold-duotone" tone="info" />
        <Stat label="Perlu Revisi" value={stats.revision} icon="solar:refresh-circle-bold-duotone" tone="warning" />
        <Stat label="Selesai Review" value={stats.completed} icon="solar:verified-check-bold-duotone" tone="success" />
        <Stat label="Belum Lapor" value={stats.missing} icon="solar:bell-bing-bold-duotone" tone="warning" />
      </section>

      <nav className="flex items-center gap-2 overflow-x-auto" aria-label="Report PIC Divisi">
        {([
          ["reports", "Semua Report", "solar:documents-bold-duotone", divisionReports.length],
          ["missing", "Belum Lapor", "solar:document-add-bold-duotone", missingReports.length],
          ["history", "Riwayat Review", "solar:history-bold-duotone", history.length],
        ] as const).map(([id, label, icon, count]) => <button key={id} type="button" onClick={() => setTab(id)} className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-extrabold transition-colors ${tab === id ? "bg-primary text-white" : "border border-border/60 bg-surface text-muted hover:text-text"}`}><Iconify icon={icon} width={16} />{label}<span className={`rounded-full px-1.5 py-0.5 text-[0.58rem] ${tab === id ? "bg-white/18" : "bg-surface-strong"}`}>{count}</span></button>)}
      </nav>

      {tab !== "history" && <div className="flex flex-wrap gap-2 rounded-xl border border-border/60 bg-surface/78 p-2">
        <div className="flex min-w-52 flex-1 items-center gap-2 rounded-lg bg-surface-strong/55 px-3 py-2"><Iconify icon="solar:magnifer-bold-duotone" width={14} className="text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, ID, atau ringkasan..." className="min-w-0 flex-1 border-0 bg-transparent text-xs font-semibold text-text outline-none placeholder:text-muted/55" />{search && <button type="button" onClick={() => setSearch("")} aria-label="Hapus pencarian" className="text-muted hover:text-text"><Iconify icon="mingcute:close-line" width={15} /></button>}</div>
        {tab === "reports" && <><CustomSelect value={scope} onChange={setScope} options={scopeOptions} className="max-sm:flex-1" /><CustomSelect value={status} onChange={setStatus} options={statusOptions} className="max-sm:flex-1" /></>}
      </div>}

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
          {tab === "reports" && (filteredReports.length ? <div className="grid gap-3">{filteredReports.map((report, index) => <StudentReportCard key={report.id} report={report} index={index} />)}</div> : <Empty icon="solar:documents-bold-duotone" title="Report tidak ditemukan" description={divisionReports.length ? "Coba ubah pencarian atau filter yang aktif." : "Belum ada report dari santri divisi ini."} />)}
          {tab === "missing" && (filteredMissing.length ? <MissingList items={filteredMissing} /> : <Empty icon="solar:shield-check-bold-duotone" title={missingReports.length ? "Data tidak ditemukan" : "Semua laporan lengkap"} description={missingReports.length ? "Coba ubah kata kunci pencarian." : "Tidak ada report yang belum masuk untuk periode berjalan."} />)}
          {tab === "history" && (history.length ? <HistoryList items={history} /> : <Empty icon="solar:history-bold-duotone" title="Belum ada riwayat" description="Aktivitas validasi dan revisi report divisi akan tampil di sini." />)}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function StudentReportCard({ report, index }: { report: ReportQueueItem; index: number }) {
  const initial = report.studentName.trim().charAt(0).toUpperCase() || "?";
  return <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.025, 0.2) }} className="rounded-2xl border border-border/60 bg-surface/82 p-4 shadow-[0_8px_28px_rgba(39,49,38,0.05)]">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-(--font-family-head) text-base font-extrabold text-primary">{initial}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h2 className="font-(--font-family-head) text-base font-extrabold text-primary-dark">{report.studentName}</h2><span className="font-mono text-[0.62rem] font-bold text-primary">{report.studentCode}</span></div>
          <div className="mt-2 flex flex-wrap items-center gap-2"><ScopePill scope={report.scope} /><StatusPill status={report.status} />{report.hasBlocker && <span className="rounded-full bg-orange/10 px-2.5 py-1 text-[0.58rem] font-black text-orange">Ada kendala</span>}<span className="text-[0.64rem] font-semibold text-muted">{formatPeriod(report.periodStart, report.periodEnd)}</span></div>
          <p className="mt-3 text-xs font-bold text-text">{report.summary}</p>
          {report.details.length > 0 && <div className="mt-3 grid gap-2 sm:grid-cols-2">{report.details.map((detail) => <div key={detail.label} className="rounded-xl bg-surface-strong/48 px-3 py-2.5"><p className="text-[0.54rem] font-black uppercase tracking-[0.1em] text-muted">{detail.label}</p><p className="mt-1 text-[0.72rem] font-semibold leading-relaxed text-text">{detail.value || "-"}</p></div>)}</div>}
          {report.latestNote && <div className="mt-3 rounded-xl border border-orange/15 bg-orange/5 px-3 py-2.5"><p className="text-[0.56rem] font-black uppercase tracking-wider text-orange">Catatan review</p><p className="mt-1 text-xs font-semibold text-text">{report.latestNote}</p></div>}
        </div>
      </div>
      <aside className="flex shrink-0 items-center justify-between gap-5 border-t border-border/50 pt-3 text-[0.62rem] font-semibold text-muted lg:min-w-36 lg:flex-col lg:items-end lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0"><div className="lg:text-right"><p>Versi {report.version}</p><p className="mt-1">Update {formatDateTime(report.updatedAt)}</p></div>{report.submittedAt && <p>Dikirim {formatDateTime(report.submittedAt)}</p>}</aside>
    </div>
  </motion.article>;
}

function MissingList({ items }: { items: MissingReportItem[] }) {
  return <div className="grid gap-2.5">{items.map((item) => <article key={item.id} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-surface/78 p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange/9 text-orange"><Iconify icon="solar:document-add-bold-duotone" width={19} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-primary-dark">{item.studentName}</strong><span className="font-mono text-[0.62rem] font-bold text-primary">{item.studentCode}</span></div><p className="mt-1 text-[0.68rem] font-semibold text-muted">{item.scope} · {item.periodLabel}</p></div>{item.remindedAt && <span className="rounded-lg bg-surface-strong px-3 py-2 text-[0.62rem] font-bold text-muted">Sudah diingatkan</span>}</article>)}</div>;
}

function HistoryList({ items }: { items: ReportHistoryItem[] }) {
  return <div className="grid gap-2.5">{items.map((item) => <article key={item.id} className="flex gap-3 rounded-2xl border border-border/55 bg-surface/72 p-3.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-strong text-primary"><Iconify icon="solar:history-bold-duotone" width={16} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-primary-dark">{item.studentName}</strong><ScopePill scope={item.scope} /><StatusPill status={item.statusAfter} /></div><p className="mt-1 text-[0.7rem] font-semibold text-text">{item.action}</p>{item.note && <p className="mt-1 text-[0.68rem] text-muted">{item.note}</p>}<p className="mt-2 text-[0.6rem] font-semibold text-muted">{item.actor} · {formatDateTime(item.createdAt)}</p></div></article>)}</div>;
}

function Stat({ label, value, icon, tone = "primary" }: { label: string; value: number; icon: string; tone?: "primary" | "info" | "success" | "warning" }) {
  const style = tone === "success" ? "bg-emerald-500/10 text-emerald-500" : tone === "warning" ? "bg-orange/10 text-orange" : tone === "info" ? "bg-blue/10 text-blue" : "bg-primary/9 text-primary";
  return <div className="flex items-center gap-3 border-r border-border/55 px-4 py-4 last:border-r-0"><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${style}`}><Iconify icon={icon} width={18} /></span><div><p className="text-[0.56rem] font-black uppercase tracking-[0.11em] text-muted">{label}</p><p className="font-(--font-family-head) text-xl font-extrabold text-primary-dark">{value}</p></div></div>;
}

function ScopePill({ scope }: { scope: ReportScope }) {
  const style = scope === "Daily" ? "bg-blue/9 text-blue" : scope === "Weekly" ? "bg-purple/9 text-purple" : "bg-green/9 text-green";
  return <span className={`rounded-full px-2.5 py-1 text-[0.58rem] font-black ${style}`}>{scope}</span>;
}

function StatusPill({ status }: { status: ReportStatus }) {
  const styles: Record<ReportStatus, string> = { Draft: "bg-surface-strong text-muted", Terkirim: "bg-blue/9 text-blue", Divalidasi: "bg-green/9 text-green", Perlu_Revisi: "bg-orange/9 text-orange", Disetujui: "bg-green/12 text-green", Ditolak: "bg-red-500/9 text-red-500" };
  return <span className={`rounded-full px-2.5 py-1 text-[0.58rem] font-black ${styles[status]}`}>{status.replace("_", " ")}</span>;
}

function Empty({ icon, title, description }: { icon: string; title: string; description: string }) {
  return <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border/65 bg-surface/45 px-6 text-center"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-strong text-muted"><Iconify icon={icon} width={22} /></span><p className="mt-3 text-sm font-extrabold text-muted">{title}</p><p className="mt-1 max-w-md text-xs font-semibold text-muted">{description}</p></div>;
}

function ReportState({ icon, title, description, tone = "neutral", action }: { icon: string; title: string; description: string; tone?: "neutral" | "error"; action?: React.ReactNode }) {
  return <div className="flex min-h-[50vh] items-center justify-center"><div className="max-w-md rounded-3xl border border-border bg-surface p-8 text-center"><span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${tone === "error" ? "bg-orange/10 text-orange" : "bg-background text-muted"}`}><Iconify icon={icon} width={28} /></span><h1 className="mt-4 text-lg font-black text-text">{title}</h1><p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>{action}</div></div>;
}

function ReportLoading() {
  return <div className="grid gap-5 animate-pulse"><div className="h-44 rounded-3xl bg-surface" /><div className="grid grid-cols-5 gap-2 max-md:grid-cols-2">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-20 rounded-xl bg-surface" />)}</div><div className="h-80 rounded-2xl bg-surface" /></div>;
}

function formatPeriod(start: string, end: string) { return start === end ? formatDate(start) : `${formatDate(start)} - ${formatDate(end)}`; }
function formatDate(value: string) { return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)); }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }
