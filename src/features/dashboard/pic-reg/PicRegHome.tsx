import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { useToast } from "../../../components/ui/ToastProvider";
import { useAuth } from "../../../lib/auth";
import { getErrorMessage } from "../../../lib/errors";
import { usePicRegDashboard, type PicRegApprovalItem, type PicRegLocationSummary, type PicRegMukafaahItem, type PicRegWarningItem } from "../../../models/pic-reg";
import { setReportManagementStatus } from "../../../models/report";

export function PicRegHome() {
  const { profile } = useAuth();
  const toast = useToast();
  const { data, isLoading, error, refresh } = usePicRegDashboard(profile?.regionId);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function updateApproval(item: PicRegApprovalItem, status: "Disetujui" | "Perlu_Revisi") {
    setBusyId(item.reportId);
    try {
      await setReportManagementStatus(item.reportId, status);
      toast.success(status === "Disetujui" ? "Laporan disetujui" : "Revisi diminta", `${item.studentName} · ${item.period}`);
    } catch (err) {
      toast.error("Approval gagal", getErrorMessage(err, "Coba kembali beberapa saat lagi."));
      setBusyId(null);
      return;
    }
    try {
      await refresh();
    } catch (err) {
      toast.error("Data gagal dimuat ulang", getErrorMessage(err, "Approval sudah tersimpan, tetapi dashboard belum dapat diperbarui."));
    } finally {
      setBusyId(null);
    }
  }

  if (!profile?.regionId) return <StatePanel icon="solar:map-point-wave-linear" title="Regional belum terhubung" description="Akun ini belum memiliki region pada pengabdian_staff.region_id." />;
  if (isLoading) return <HomeLoading />;
  if (error || !data) return <StatePanel icon="solar:danger-triangle-bold-duotone" title="Dashboard regional belum dapat dimuat" description={error ?? "Data regional tidak tersedia."} tone="error" action={<button type="button" onClick={() => void refresh().catch(() => undefined)} className="mt-5 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-white">Coba lagi</button>} />;

  return (
    <motion.div className="grid gap-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3"><p className="text-xs font-black uppercase tracking-widest text-primary">PIC Regional</p><span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-black text-primary">{data.region.name}</span></div>
            <h1 className="mt-2 font-(--font-family-head) text-3xl font-extrabold tracking-tight text-primary-dark md:text-4xl">Regional Dashboard</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted">Assalamualaikum, {profile.name}. Pantau santri, laporan, risiko, dan kesiapan Mukafaah dalam scope regional.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/65 px-4 py-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-black text-primary">{profile.name.charAt(0).toUpperCase()}</span><div><p className="text-[0.6rem] font-black uppercase tracking-wide text-muted">PIC aktif</p><p className="text-sm font-extrabold text-text">{profile.name}</p></div></div>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <Metric label="Santri Regional" value={data.totalStudents} description={`${data.locations.length} lokasi dalam scope`} icon="solar:square-academic-cap-bold-duotone" tone="sky" />
        <Metric label="Butuh Tindak Lanjut" value={data.atRiskCount} description="Evaluasi Yellow atau Red" icon="solar:shield-warning-bold-duotone" tone="orange" />
        <Metric label="Pending Approval" value={data.pendingApprovals.length} description="Monthly sudah divalidasi" icon="solar:file-text-bold-duotone" tone="purple" />
        <Metric label="Mukafaah Ready" value={data.mukafaahReadyCount} description="Evaluasi terbaru eligible" icon="solar:wallet-money-bold-duotone" tone="emerald" />
      </section>

      <section className="grid grid-cols-[1fr_360px] gap-4 max-xl:grid-cols-1">
        <div className="grid content-start gap-4">
          <Panel eyebrow="Region Scope" title="Breakdown per Lokasi" description={`${data.locations.length} lokasi terhubung ke ${data.region.name}`} icon="solar:buildings-2-bold-duotone" tone="sky">
            {data.locations.length ? <div className="grid gap-3">{data.locations.map((location, index) => <LocationRow key={location.id} location={location} index={index} />)}</div> : <Empty text="Belum ada lokasi pada regional ini." />}
          </Panel>

          <Panel eyebrow="Pending Approval" title="Monthly Final Review" description={`${data.pendingApprovals.length} laporan menunggu keputusan PIC Regional`} icon="solar:shield-user-bold-duotone" tone="orange">
            {data.pendingApprovals.length ? <div className="grid gap-2.5">{data.pendingApprovals.map((item, index) => <ApprovalRow key={item.reportId} item={item} index={index} busy={busyId === item.reportId} onApprove={() => void updateApproval(item, "Disetujui")} onRevision={() => void updateApproval(item, "Perlu_Revisi")} />)}</div> : <Empty text="Tidak ada Monthly report yang menunggu final review." success />}
          </Panel>
        </div>

        <div className="grid content-start gap-4">
          <Panel eyebrow="Early Warning" title="Sinyal Perlu Perhatian" description={`${data.warnings.length} indikator aktif`} icon="solar:shield-warning-bold-duotone" tone="orange">
            {data.warnings.length ? <div className="grid gap-2">{data.warnings.slice(0, 8).map((warning, index) => <WarningRow key={warning.id} warning={warning} index={index} />)}</div> : <Empty text="Tidak ada risk report atau evaluasi berisiko aktif." success />}
          </Panel>

          <Panel eyebrow="Mukafaah" title="Readiness Status" description={`${data.mukafaahReadyCount} dari ${data.mukafaah.length} evaluasi sudah siap`} icon="solar:wallet-money-bold-duotone" tone="emerald">
            {data.mukafaah.length ? <div className="grid gap-2">{data.mukafaah.slice(0, 8).map((item, index) => <MukafaahRow key={item.evaluationId} item={item} index={index} />)}</div> : <Empty text="Belum ada evaluasi bulanan untuk readiness Mukafaah." />}
          </Panel>
        </div>
      </section>
    </motion.div>
  );
}

function Metric({ label, value, description, icon, tone }: { label: string; value: number; description: string; icon: string; tone: "sky" | "orange" | "purple" | "emerald" }) {
  const color = { sky: "bg-sky-500/10 text-sky-400", orange: "bg-orange/10 text-orange", purple: "bg-purple/10 text-purple", emerald: "bg-emerald-500/10 text-emerald-500" }[tone];
  return <motion.article className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><span className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Iconify icon={icon} width={22} /></span><p className="text-xs font-bold text-muted">{label}</p><p className="mt-2 font-(--font-family-head) text-4xl font-extrabold tracking-tight text-text">{value}</p><p className="mt-1 text-xs text-muted">{description}</p></motion.article>;
}

function Panel({ eyebrow, title, description, icon, tone, children }: { eyebrow: string; title: string; description: string; icon: string; tone: "sky" | "orange" | "emerald"; children: ReactNode }) {
  const color = tone === "orange" ? "bg-orange/10 text-orange" : tone === "emerald" ? "bg-emerald-500/10 text-emerald-500" : "bg-sky-500/10 text-sky-400";
  return <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm"><header className="mb-4 flex items-start justify-between gap-3"><div><p className={`text-xs font-black uppercase tracking-widest ${tone === "orange" ? "text-orange" : tone === "emerald" ? "text-emerald-500" : "text-primary"}`}>{eyebrow}</p><h2 className="mt-0.5 font-(--font-family-head) text-xl font-extrabold text-primary-dark">{title}</h2><p className="text-sm text-muted">{description}</p></div><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}><Iconify icon={icon} width={22} /></span></header>{children}</article>;
}

function LocationRow({ location, index }: { location: PicRegLocationSummary; index: number }) {
  const known = location.green + location.yellow + location.red;
  const denominator = location.totalStudents || 1;
  return <motion.div className="rounded-xl border border-border/60 bg-background/40 p-3.5" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}><div className="mb-2 flex items-center justify-between gap-2"><strong className="text-sm text-primary-dark">{location.name}</strong><span className="text-xs font-black text-muted">{location.totalStudents} santri</span></div><div className="flex h-2 overflow-hidden rounded-full bg-border/40"><span className="bg-emerald-500" style={{ width: `${(location.green / denominator) * 100}%` }} /><span className="bg-amber-400" style={{ width: `${(location.yellow / denominator) * 100}%` }} /><span className="bg-rose-500" style={{ width: `${(location.red / denominator) * 100}%` }} /></div><div className="mt-2 flex flex-wrap gap-3 text-[0.62rem] font-bold text-muted"><Dot color="bg-emerald-500" label={`Green ${location.green}`} /><Dot color="bg-amber-400" label={`Yellow ${location.yellow}`} /><Dot color="bg-rose-500" label={`Red ${location.red}`} />{known < location.totalStudents && <Dot color="bg-border" label={`Belum dinilai ${location.totalStudents - known}`} />}</div></motion.div>;
}

function ApprovalRow({ item, index, busy, onApprove, onRevision }: { item: PicRegApprovalItem; index: number; busy: boolean; onApprove: () => void; onRevision: () => void }) {
  return <motion.div className="rounded-xl border border-border/60 bg-background/40 p-3.5" initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-primary-dark">{item.studentName}</strong><span className="font-mono text-[0.62rem] font-bold text-primary">{item.studentCode}</span></div><p className="mt-1 text-xs font-semibold text-muted">{item.location} · {item.period}</p></div><div className="flex shrink-0 gap-1.5"><button type="button" disabled={busy} onClick={onApprove} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[0.68rem] font-black text-white disabled:cursor-wait disabled:opacity-60">{busy && <Iconify icon="solar:refresh-linear" width={12} className="animate-spin" />}Setujui</button><button type="button" disabled={busy} onClick={onRevision} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[0.68rem] font-bold text-muted hover:text-orange disabled:opacity-60">Revisi</button></div></div></motion.div>;
}

function WarningRow({ warning, index }: { warning: PicRegWarningItem; index: number }) {
  const critical = warning.severity === "Critical" || warning.severity === "High";
  return <motion.div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/40 p-3.5" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${critical ? "bg-rose-500" : warning.severity === "Medium" ? "bg-amber-400" : "bg-border"}`} /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-primary-dark">{warning.studentName}</strong><span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-black ${critical ? "bg-rose-500/10 text-rose-500" : warning.severity === "Medium" ? "bg-amber-500/10 text-amber-500" : "bg-surface-strong text-muted"}`}>{warning.severity}</span></div><p className="text-[0.64rem] font-semibold text-muted">{warning.location}</p><p className="mt-1 text-xs font-bold text-text">{warning.title}</p><p className="mt-0.5 line-clamp-2 text-[0.7rem] leading-relaxed text-muted">{warning.description}</p></div></motion.div>;
}

function MukafaahRow({ item, index }: { item: PicRegMukafaahItem; index: number }) {
  return <motion.div className="rounded-xl border border-border/60 bg-background/40 p-3" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}><div className="flex items-center justify-between gap-2"><div className="min-w-0"><strong className="block truncate text-sm text-primary-dark">{item.studentName}</strong><span className="font-mono text-[0.6rem] font-bold text-primary">{item.studentCode}</span></div><span className={`rounded-full px-2.5 py-1 text-[0.62rem] font-black ${item.ready ? "bg-emerald-500/10 text-emerald-500" : "bg-surface-strong text-muted"}`}>{item.ready ? "Ready" : "Belum Ready"}</span></div><div className="mt-2 grid grid-cols-4 gap-1 text-center"><Mini label="SoW" value={`${item.sowProgress}%`} /><Mini label="Adab" value={`${item.adabScore}/5`} /><Mini label="Learn" value={item.learnCount} /><Mini label="Project" value={item.projectCount} /></div></motion.div>;
}

function Mini({ label, value }: { label: string; value: string | number }) { return <div className="rounded-lg bg-surface px-1 py-1.5"><p className="text-xs font-black text-text">{value}</p><p className="text-[0.5rem] font-black uppercase tracking-wide text-muted">{label}</p></div>; }
function Dot({ color, label }: { color: string; label: string }) { return <span className="flex items-center gap-1"><span className={`h-1.5 w-1.5 rounded-full ${color}`} />{label}</span>; }
function Empty({ text, success = false }: { text: string; success?: boolean }) { return <div className="rounded-xl border border-dashed border-border bg-background/35 px-4 py-8 text-center"><Iconify icon={success ? "solar:check-circle-bold-duotone" : "solar:inbox-line-bold-duotone"} width={26} className={`mx-auto ${success ? "text-emerald-500/50" : "text-muted/40"}`} /><p className="mt-2 text-xs font-bold text-muted">{text}</p></div>; }

function StatePanel({ icon, title, description, tone = "neutral", action }: { icon: string; title: string; description: string; tone?: "neutral" | "error"; action?: ReactNode }) { return <div className="flex min-h-[55vh] items-center justify-center"><div className="max-w-md rounded-3xl border border-border bg-surface p-8 text-center"><span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${tone === "error" ? "bg-orange/10 text-orange" : "bg-background text-muted"}`}><Iconify icon={icon} width={28} /></span><h1 className="mt-4 text-lg font-black text-text">{title}</h1><p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>{action}</div></div>; }
function HomeLoading() { return <div className="grid gap-5 animate-pulse"><div className="h-48 rounded-3xl bg-surface" /><div className="grid grid-cols-4 gap-3 max-md:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 rounded-2xl bg-surface" />)}</div><div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1"><div className="h-96 rounded-2xl bg-surface" /><div className="h-96 rounded-2xl bg-surface" /></div></div>; }
