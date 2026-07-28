import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import { useToast } from "../../../components/ui/ToastProvider";
import { getErrorMessage } from "../../../lib/errors";
import {
  sendReportReminder,
  setReportManagementStatus,
  useReportManagement,
  type MissingReportItem,
  type ReportHistoryItem,
  type ReportQueueItem,
  type ReportScope,
} from "../../../models/report";
import type { ReportStatus } from "../../../lib/supabase/types";

type PageTab = "queue" | "missing" | "history";

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

export function AdminDashboardReport() {
  const { data, isLoading, error, refresh } = useReportManagement();
  const toast = useToast();
  const [tab, setTab] = useState<PageTab>("queue");
  const [scope, setScope] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [revisionItem, setRevisionItem] = useState<ReportQueueItem | null>(null);
  const [revisionNote, setRevisionNote] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const queue = useMemo(() => data.queue.filter((item) => {
    if (scope !== "all" && item.scope !== scope) return false;
    if (status !== "all" && item.status !== status) return false;
    if (search && !`${item.studentName} ${item.studentCode} ${item.summary}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [data.queue, scope, search, status]);

  const stats = useMemo(() => ({
    pending: data.queue.filter((item) => item.status === "Terkirim").length,
    revision: data.queue.filter((item) => item.status === "Perlu_Revisi").length,
    verified: data.queue.filter((item) => item.status === "Divalidasi" || item.status === "Disetujui").length,
    missing: data.missing.length,
  }), [data]);

  async function updateStatus(item: ReportQueueItem, nextStatus: ReportStatus, note?: string) {
    setBusyId(item.id);
    try {
      await setReportManagementStatus(item.id, nextStatus, note);
      toast.success("Status laporan diperbarui", `${item.studentName} · ${nextStatus.replace("_", " ")}`);
      setRevisionItem(null);
      setRevisionNote("");
    } catch (err) {
      toast.error("Update laporan gagal", getErrorMessage(err, "Silakan coba lagi."));
      setBusyId(null);
      return;
    }
    try {
      await refresh();
    } catch (err) {
      toast.error("Data gagal dimuat ulang", getErrorMessage(err, "Status sudah tersimpan, tetapi data terbaru belum dapat dimuat."));
    } finally {
      setBusyId(null);
    }
  }

  async function remind(item: MissingReportItem) {
    setBusyId(item.id);
    try {
      await sendReportReminder(item);
      toast.success("Reminder dikirim", `${item.studentName} · ${item.scope}`);
    } catch (err) {
      toast.error("Reminder gagal", getErrorMessage(err, "Silakan coba lagi."));
      setBusyId(null);
      return;
    }
    try {
      await refresh();
    } catch (err) {
      toast.error("Data gagal dimuat ulang", getErrorMessage(err, "Reminder sudah dikirim, tetapi data terbaru belum dapat dimuat."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <motion.div className="grid gap-6" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <header>
        <p className="text-xs font-black uppercase tracking-widest text-primary">Report Management</p>
        <h1 className="font-(--font-family-head) text-4xl font-extrabold tracking-tight text-primary-dark">Report</h1>
        <p className="mt-1 text-sm font-semibold text-muted">Review, validasi, revisi, dan reminder laporan santri dari Supabase.</p>
      </header>

      <section className="grid grid-cols-4 overflow-hidden rounded-2xl border border-border/65 bg-surface/78 max-md:grid-cols-2">
        <Stat label="Pending" value={stats.pending} icon="solar:inbox-line-bold-duotone" />
        <Stat label="Perlu revisi" value={stats.revision} icon="solar:refresh-circle-bold-duotone" tone="warning" />
        <Stat label="Verified" value={stats.verified} icon="solar:verified-check-bold-duotone" tone="success" />
        <Stat label="Missing" value={stats.missing} icon="solar:bell-bing-bold-duotone" tone="warning" />
      </section>

      <nav className="flex items-center gap-2 overflow-x-auto">
        {([
          ["queue", "Review Queue", "solar:inbox-line-bold-duotone", data.queue.length],
          ["missing", "Missing Reports", "solar:bell-bing-bold-duotone", data.missing.length],
          ["history", "History", "solar:history-bold-duotone", data.history.length],
        ] as const).map(([id, label, icon, count]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-extrabold transition-colors ${tab === id ? "bg-primary text-white" : "border border-border/60 bg-surface text-muted hover:text-text"}`}>
            <Iconify icon={icon} width={16} />
            {label}
            <span className={`rounded-full px-1.5 py-0.5 text-[0.58rem] ${tab === id ? "bg-white/18" : "bg-surface-strong"}`}>{count}</span>
          </button>
        ))}
      </nav>

      {isLoading ? (
        <ReportLoading />
      ) : error ? (
        <ReportError message={error} onRetry={() => void refresh().catch(() => undefined)} />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
            {tab === "queue" && (
              <QueueView
                items={queue}
                scope={scope}
                status={status}
                search={search}
                busyId={busyId}
                onScope={setScope}
                onStatus={setStatus}
                onSearch={setSearch}
                onVerify={(item) => updateStatus(item, "Divalidasi")}
                onApprove={(item) => updateStatus(item, "Disetujui")}
                onRevision={(item) => { setRevisionItem(item); setRevisionNote(""); }}
              />
            )}
            {tab === "missing" && <MissingView items={data.missing} busyId={busyId} onRemind={remind} />}
            {tab === "history" && <HistoryView items={data.history} />}
          </motion.div>
        </AnimatePresence>
      )}

      <RevisionDialog
        item={revisionItem}
        note={revisionNote}
        loading={Boolean(revisionItem && busyId === revisionItem.id)}
        onNote={setRevisionNote}
        onClose={() => setRevisionItem(null)}
        onSubmit={() => { if (revisionItem) void updateStatus(revisionItem, "Perlu_Revisi", revisionNote); }}
      />
    </motion.div>
  );
}

function QueueView({ items, scope, status, search, busyId, onScope, onStatus, onSearch, onVerify, onApprove, onRevision }: {
  items: ReportQueueItem[];
  scope: string;
  status: string;
  search: string;
  busyId: string | null;
  onScope: (value: string) => void;
  onStatus: (value: string) => void;
  onSearch: (value: string) => void;
  onVerify: (item: ReportQueueItem) => void;
  onApprove: (item: ReportQueueItem) => void;
  onRevision: (item: ReportQueueItem) => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2 rounded-xl border border-border/60 bg-surface/78 p-2">
        <div className="flex min-w-52 flex-1 items-center gap-2 rounded-lg bg-surface-strong/55 px-3 py-2">
          <Iconify icon="solar:magnifer-bold-duotone" width={14} className="text-muted" />
          <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Cari santri atau laporan..." className="min-w-0 flex-1 border-0 bg-transparent text-xs font-semibold text-text outline-none placeholder:text-muted/55" />
        </div>
        <CustomSelect value={scope} onChange={onScope} options={scopeOptions} className="max-sm:flex-1" />
        <CustomSelect value={status} onChange={onStatus} options={statusOptions} className="max-sm:flex-1" />
      </div>

      {items.length === 0 ? <Empty icon="solar:inbox-line-bold-duotone" title="Queue kosong" description="Belum ada laporan yang sesuai dengan filter aktif." /> : (
        <div className="grid gap-3">
          {items.map((item, index) => (
            <ReportCard key={item.id} item={item} index={index} busy={busyId === item.id} onVerify={() => onVerify(item)} onApprove={() => onApprove(item)} onRevision={() => onRevision(item)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportCard({ item, index, busy, onVerify, onApprove, onRevision }: { item: ReportQueueItem; index: number; busy: boolean; onVerify: () => void; onApprove: () => void; onRevision: () => void }) {
  return (
    <motion.article initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.025, 0.2) }} className="rounded-2xl border border-border/60 bg-surface/78 p-4">
      <div className="grid grid-cols-[1fr_auto] gap-4 max-md:grid-cols-1">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <ScopePill scope={item.scope} />
            <StatusPill status={item.status} />
            {item.hasBlocker && <span className="rounded-full bg-orange/9 px-2.5 py-1 text-[0.58rem] font-black text-orange">Ada blocker</span>}
            <span className="text-[0.62rem] font-semibold text-muted">{formatPeriod(item.periodStart, item.periodEnd)}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <h3 className="font-(--font-family-head) text-base font-extrabold text-primary-dark">{item.studentName}</h3>
            <span className="font-mono text-[0.62rem] font-bold text-primary">{item.studentCode}</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-muted">{item.summary}</p>

          {item.details.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 max-sm:grid-cols-1">
              {item.details.map((detail) => (
                <div key={detail.label} className="rounded-xl bg-surface-strong/48 px-3 py-2">
                  <p className="text-[0.54rem] font-black uppercase tracking-[0.1em] text-muted">{detail.label}</p>
                  <p className="mt-0.5 line-clamp-2 text-[0.7rem] font-semibold leading-relaxed text-text">{detail.value}</p>
                </div>
              ))}
            </div>
          )}
          {item.latestNote && <p className="mt-3 text-[0.68rem] font-semibold text-orange">Catatan: {item.latestNote}</p>}
        </div>

        <div className="flex min-w-36 flex-col justify-between gap-3 border-l border-border/55 pl-4 max-md:min-w-0 max-md:flex-row max-md:border-l-0 max-md:border-t max-md:pl-0 max-md:pt-3">
          <div className="text-[0.62rem] font-semibold text-muted">
            <p>Versi {item.version}</p>
            <p className="mt-1">Update {formatDateTime(item.updatedAt)}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            {(item.status === "Terkirim" || item.status === "Divalidasi") && (
              <button type="button" onClick={onRevision} disabled={busy} className="rounded-lg border border-orange/20 px-2.5 py-2 text-[0.64rem] font-extrabold text-orange hover:bg-orange/7 disabled:opacity-50">Revisi</button>
            )}
            {item.status === "Terkirim" && (
              <button type="button" onClick={onVerify} disabled={busy} className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-2 text-[0.64rem] font-extrabold text-white disabled:opacity-50">
                {busy && <Iconify icon="svg-spinners:ring-resize" width={12} />}Verifikasi
              </button>
            )}
            {item.scope === "Monthly" && item.status === "Divalidasi" && (
              <button type="button" onClick={onApprove} disabled={busy} className="inline-flex items-center gap-1 rounded-lg bg-green px-2.5 py-2 text-[0.64rem] font-extrabold text-white disabled:opacity-50">Setujui</button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function MissingView({ items, busyId, onRemind }: { items: MissingReportItem[]; busyId: string | null; onRemind: (item: MissingReportItem) => void }) {
  return items.length === 0 ? <Empty icon="solar:shield-check-bold-duotone" title="Tidak ada laporan tertunda" description="Semua santri sudah memiliki report untuk periode berjalan." /> : (
    <div className="grid gap-2.5">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-surface/78 p-4 max-sm:flex-wrap">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-strong text-muted"><Iconify icon="solar:document-add-bold-duotone" width={18} /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-primary-dark">{item.studentName}</strong><span className="font-mono text-[0.62rem] font-bold text-primary">{item.studentCode}</span></div>
            <p className="mt-1 text-[0.68rem] font-semibold text-muted">{item.scope} · {item.periodLabel}</p>
          </div>
          {item.remindedAt ? (
            <span className="rounded-lg bg-surface-strong px-3 py-2 text-[0.64rem] font-bold text-muted">Diingatkan {formatDateTime(item.remindedAt)}</span>
          ) : (
            <button type="button" onClick={() => onRemind(item)} disabled={busyId === item.id} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[0.66rem] font-extrabold text-white disabled:opacity-50">
              {busyId === item.id ? <Iconify icon="svg-spinners:ring-resize" width={13} /> : <Iconify icon="solar:bell-bing-bold-duotone" width={13} />}Remind
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function HistoryView({ items }: { items: ReportHistoryItem[] }) {
  return items.length === 0 ? <Empty icon="solar:history-bold-duotone" title="Belum ada history" description="Aktivitas review laporan akan tampil di sini." /> : (
    <div className="relative grid gap-2.5 before:absolute before:bottom-5 before:left-[18px] before:top-5 before:w-px before:bg-border/70">
      {items.map((item) => (
        <div key={item.id} className="relative flex gap-3 rounded-2xl border border-border/55 bg-surface/72 p-3.5">
          <span className="z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-strong text-primary"><Iconify icon="solar:history-bold-duotone" width={16} /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-primary-dark">{item.studentName}</strong><ScopePill scope={item.scope} /><StatusPill status={item.statusAfter} /></div>
            <p className="mt-1 text-[0.7rem] font-semibold text-text">{item.action}</p>
            {item.note && <p className="mt-1 text-[0.68rem] text-muted">{item.note}</p>}
            <p className="mt-2 text-[0.6rem] font-semibold text-muted">{item.actor} · {formatDateTime(item.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RevisionDialog({ item, note, loading, onNote, onClose, onSubmit }: { item: ReportQueueItem | null; note: string; loading: boolean; onNote: (value: string) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-border/70 bg-surface p-5 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange/10 text-orange"><Iconify icon="solar:refresh-circle-bold-duotone" width={22} /></span>
            <h3 className="mt-4 font-(--font-family-head) text-lg font-extrabold text-primary-dark">Minta revisi laporan</h3>
            <p className="mt-1 text-xs font-semibold text-muted">{item.studentName} · {item.scope}</p>
            <textarea value={note} onChange={(event) => onNote(event.target.value)} rows={4} placeholder="Jelaskan bagian yang perlu diperbaiki..." className="mt-4 w-full resize-none rounded-xl border border-border bg-surface-strong/45 p-3 text-xs font-semibold text-text outline-none focus:border-primary/40" />
            <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onClose} disabled={loading} className="rounded-xl border border-border px-4 py-2 text-xs font-extrabold text-muted">Batal</button><button type="button" onClick={onSubmit} disabled={loading || !note.trim()} className="inline-flex items-center gap-2 rounded-xl bg-orange px-4 py-2 text-xs font-extrabold text-white disabled:opacity-50">{loading && <Iconify icon="svg-spinners:ring-resize" width={13} />}Kirim revisi</button></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({ label, value, icon, tone = "primary" }: { label: string; value: number; icon: string; tone?: "primary" | "success" | "warning" }) {
  const style = tone === "success" ? "bg-green/10 text-green" : tone === "warning" ? "bg-orange/10 text-orange" : "bg-primary/9 text-primary";
  return <div className="flex items-center gap-3 border-r border-border/55 px-4 py-4 last:border-r-0"><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${style}`}><Iconify icon={icon} width={18} /></span><div><p className="text-[0.56rem] font-black uppercase tracking-[0.11em] text-muted">{label}</p><p className="font-(--font-family-head) text-xl font-extrabold text-primary-dark">{value}</p></div></div>;
}

function ScopePill({ scope }: { scope: ReportScope }) {
  const style = scope === "Daily" ? "bg-blue/9 text-blue" : scope === "Weekly" ? "bg-purple/9 text-purple" : "bg-green/9 text-green";
  return <span className={`rounded-full px-2.5 py-1 text-[0.58rem] font-black ${style}`}>{scope}</span>;
}

function StatusPill({ status }: { status: ReportStatus }) {
  const style: Record<ReportStatus, string> = { Draft: "bg-surface-strong text-muted", Terkirim: "bg-blue/9 text-blue", Divalidasi: "bg-green/9 text-green", Perlu_Revisi: "bg-orange/9 text-orange", Disetujui: "bg-green/12 text-green", Ditolak: "bg-red-500/9 text-red-500" };
  return <span className={`rounded-full px-2.5 py-1 text-[0.58rem] font-black ${style[status]}`}>{status.replace("_", " ")}</span>;
}

function Empty({ icon, title, description }: { icon: string; title: string; description: string }) {
  return <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border/65 bg-surface/45 px-6 text-center"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-strong text-muted"><Iconify icon={icon} width={22} /></span><p className="mt-3 text-sm font-extrabold text-muted">{title}</p><p className="mt-1 max-w-md text-xs font-semibold text-muted">{description}</p></div>;
}

function ReportLoading() {
  return <div className="grid gap-3">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl border border-border/55 bg-surface-strong/55" />)}</div>;
}

function ReportError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-orange/25 bg-orange/5 px-6 text-center"><Iconify icon="solar:danger-triangle-bold-duotone" width={25} className="text-orange" /><p className="mt-3 text-sm font-extrabold text-primary-dark">Report Management gagal dimuat</p><p className="mt-1 max-w-lg text-xs font-semibold text-muted">{message}</p><button type="button" onClick={onRetry} className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-white">Coba lagi</button></div>;
}

function formatPeriod(start: string, end: string) {
  return start === end ? formatDate(start) : `${formatDate(start)} - ${formatDate(end)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
