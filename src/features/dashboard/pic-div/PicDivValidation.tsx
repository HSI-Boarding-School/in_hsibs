import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { useToast } from "../../../components/ui/ToastProvider";
import { useAuth } from "../../../lib/auth";
import { useAdminMappingData } from "../../../models/admin";
import { setReportManagementStatus, useReportManagement, type ReportQueueItem } from "../../../models/report";
import { ProjectView } from "../admin/components/monitoring/ProjectView";

type MonitoringTab = "weekly" | "monthly" | "projects";

const tabs: { id: MonitoringTab; label: string; icon: string; description: string }[] = [
  { id: "weekly", label: "Weekly Review", icon: "solar:clipboard-list-bold-duotone", description: "Validasi laporan mingguan" },
  { id: "monthly", label: "Monthly Report", icon: "solar:calendar-minimalistic-bold-duotone", description: "Review laporan bulanan" },
  { id: "projects", label: "Projects", icon: "solar:folder-with-files-bold-duotone", description: "Project yang kamu buat" },
];

export function PicDivValidation() {
  const { profile } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<MonitoringTab>("weekly");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [noteTargetId, setNoteTargetId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const mapping = useAdminMappingData({ divisionId: profile?.divisionId ?? undefined });
  const reports = useReportManagement();

  if (!profile?.divisionId) {
    return <StatePanel icon="solar:buildings-3-linear" title="Divisi belum terhubung" description="Akun ini belum memiliki divisi pada pengabdian_staff.divisi_id." />;
  }
  if (mapping.isLoading || reports.isLoading) return <MonitoringLoading />;
  if (mapping.error || reports.error || !mapping.data?.scopeDivision) {
    return <StatePanel icon="solar:danger-triangle-bold-duotone" title="Monitoring belum dapat dimuat" description={mapping.error ?? reports.error ?? "Data divisi tidak ditemukan."} tone="error" />;
  }

  const studentIds = new Set(mapping.data.santri.map((student) => student.pengabdianId).filter((id): id is string => Boolean(id)));
  const scopedReports = reports.data.queue.filter((report) => studentIds.has(report.pengabdianId));
  const weeklyQueue = scopedReports.filter((report) => report.scope === "Weekly" && report.status === "Terkirim");
  const monthlyQueue = scopedReports.filter((report) => report.scope === "Monthly" && report.status === "Terkirim");
  const tabCount: Record<MonitoringTab, number | null> = { weekly: weeklyQueue.length, monthly: monthlyQueue.length, projects: null };

  async function changeStatus(report: ReportQueueItem, status: "Divalidasi" | "Perlu_Revisi") {
    setSavingId(report.id);
    try {
      await setReportManagementStatus(report.id, status, noteTargetId === report.id ? noteText : undefined);
      await reports.refresh();
      setNoteTargetId(null);
      setNoteText("");
      toast.success(status === "Divalidasi" ? "Laporan divalidasi" : "Revisi diminta", `${report.studentName} · ${report.summary}`);
    } catch (error) {
      toast.error("Status gagal diperbarui", error instanceof Error ? error.message : "Coba kembali beberapa saat lagi.");
    } finally {
      setSavingId(null);
    }
  }

  function openNote(report: ReportQueueItem) {
    setNoteTargetId(report.id);
    setNoteText(report.latestNote ?? "");
  }

  return (
    <motion.div className="grid gap-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3"><p className="text-xs font-black uppercase tracking-widest text-primary">PIC Divisi</p><span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-black text-primary">{mapping.data.scopeDivision.code}</span></div>
          <h1 className="mt-2 font-(--font-family-head) text-3xl font-extrabold tracking-tight text-primary-dark md:text-4xl">Validation & Monitoring</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">Review laporan santri divisi {mapping.data.scopeDivision.label} dan kelola project milik {profile.name}.</p>
        </div>
      </section>

      <nav className="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Monitoring PIC Divisi">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          const count = tabCount[tab.id];
          return <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} title={tab.description} className={`flex items-center gap-2.5 whitespace-nowrap rounded-xl px-5 py-3 text-[0.82rem] font-bold transition-all ${active ? "bg-primary text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)]" : "border border-border/50 bg-surface text-text hover:bg-primary-soft"}`}><Iconify icon={tab.icon} width={18} />{tab.label}{count !== null && <span className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.6rem] font-black ${active ? "bg-white/20 text-white" : count ? "bg-orange/10 text-orange" : "bg-surface-strong text-muted"}`}>{count}</span>}</button>;
        })}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          {activeTab === "weekly" && <ReportQueue title="Pending Weekly Validation" description={`${weeklyQueue.length} laporan mingguan menunggu validasi dari ${profile.name}.`} reports={weeklyQueue} savingId={savingId} noteTargetId={noteTargetId} noteText={noteText} setNoteText={setNoteText} openNote={openNote} closeNote={() => { setNoteTargetId(null); setNoteText(""); }} changeStatus={changeStatus} />}
          {activeTab === "monthly" && <ReportQueue title="Pending Monthly Review" description={`${monthlyQueue.length} laporan bulanan menunggu review dari ${profile.name}.`} reports={monthlyQueue} savingId={savingId} noteTargetId={noteTargetId} noteText={noteText} setNoteText={setNoteText} openNote={openNote} closeNote={() => { setNoteTargetId(null); setNoteText(""); }} changeStatus={changeStatus} />}
          {activeTab === "projects" && <ProjectView creatorId={profile.id} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

interface ReportQueueProps {
  title: string;
  description: string;
  reports: ReportQueueItem[];
  savingId: string | null;
  noteTargetId: string | null;
  noteText: string;
  setNoteText: (value: string) => void;
  openNote: (report: ReportQueueItem) => void;
  closeNote: () => void;
  changeStatus: (report: ReportQueueItem, status: "Divalidasi" | "Perlu_Revisi") => Promise<void>;
}

function ReportQueue({ title, description, reports, savingId, noteTargetId, noteText, setNoteText, openNote, closeNote, changeStatus }: ReportQueueProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <header className="mb-4"><h2 className="font-(--font-family-head) text-lg font-extrabold text-primary-dark">{title}</h2><p className="text-sm text-muted">{description}</p></header>
      {reports.length ? <div className="grid gap-3">{reports.map((report, index) => (
        <motion.article key={report.id} className="rounded-2xl border border-border/60 bg-background/45 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-primary-dark">{report.studentName}</strong><span className="rounded-full bg-surface-strong px-2 py-0.5 text-[0.62rem] font-bold text-muted">{report.studentCode}</span><span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.62rem] font-black text-primary">{report.summary}</span>{report.hasBlocker && <span className="rounded-full bg-orange/10 px-2 py-0.5 text-[0.62rem] font-black text-orange">Ada kendala</span>}</div>
              <p className="mt-1 text-xs font-semibold text-muted">{formatPeriod(report.periodStart, report.periodEnd)} · Versi {report.version}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" disabled={savingId === report.id} onClick={() => void changeStatus(report, "Divalidasi")} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[0.72rem] font-black text-white hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60"><Iconify icon={savingId === report.id ? "solar:refresh-linear" : "solar:check-circle-bold"} width={14} className={savingId === report.id ? "animate-spin" : ""} />Validasi</button>
              <button type="button" disabled={savingId === report.id} onClick={() => void changeStatus(report, "Perlu_Revisi")} className="rounded-lg border border-border bg-surface px-3.5 py-2 text-[0.72rem] font-bold text-muted hover:border-orange/30 hover:text-orange disabled:opacity-60">Revisi</button>
            </div>
          </div>

          {report.details.length > 0 && <div className="mt-3 grid gap-2 md:grid-cols-2">{report.details.map((detail) => <div key={detail.label} className="rounded-xl border border-border/40 bg-surface p-3"><p className="text-[0.6rem] font-black uppercase tracking-wide text-muted">{detail.label}</p><p className="mt-1 text-xs font-semibold leading-relaxed text-text">{detail.value || "-"}</p></div>)}</div>}

          <div className="mt-3 border-t border-border/40 pt-3">
            {noteTargetId === report.id ? <div className="flex flex-col gap-2 sm:flex-row"><input value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Catatan disimpan bersama aksi validasi atau revisi..." className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text outline-none focus:border-primary/40" /><button type="button" onClick={closeNote} className="rounded-lg border border-border px-3 py-2 text-xs font-bold text-muted">Batal</button></div> : <button type="button" onClick={() => openNote(report)} className="inline-flex items-center gap-1.5 text-[0.72rem] font-bold text-primary"><Iconify icon="solar:pen-bold-duotone" width={14} />{report.latestNote ? "Edit catatan" : "Tambah catatan"}</button>}
            {report.latestNote && noteTargetId !== report.id && <p className="mt-2 rounded-lg border border-primary/15 bg-primary/5 p-2.5 text-xs text-text">{report.latestNote}</p>}
          </div>
        </motion.article>
      ))}</div> : <EmptyState />}
    </section>
  );
}

function formatPeriod(start: string, end: string) {
  const formatter = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });
  return `${formatter.format(new Date(`${start}T00:00:00`))} - ${formatter.format(new Date(`${end}T00:00:00`))}`;
}

function EmptyState() {
  return <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-background/35 py-12 text-center"><Iconify icon="solar:checkmark-circle-bold-duotone" width={40} className="text-emerald-400/50" /><p className="text-sm font-bold text-muted">Tidak ada laporan yang menunggu review.</p></div>;
}

function StatePanel({ icon, title, description, tone = "neutral", action }: { icon: string; title: string; description: string; tone?: "neutral" | "error"; action?: ReactNode }) {
  return <div className="flex min-h-[50vh] items-center justify-center"><div className="max-w-md rounded-3xl border border-border bg-surface p-8 text-center"><span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${tone === "error" ? "bg-orange/10 text-orange" : "bg-background text-muted"}`}><Iconify icon={icon} width={28} /></span><h1 className="mt-4 text-lg font-black text-text">{title}</h1><p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>{action}</div></div>;
}

function MonitoringLoading() {
  return <div className="grid gap-5 animate-pulse"><div className="h-44 rounded-3xl bg-surface" /><div className="h-12 max-w-2xl rounded-xl bg-surface" /><div className="h-96 rounded-2xl bg-surface" /></div>;
}
