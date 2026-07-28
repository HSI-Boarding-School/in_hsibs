import { useState } from "react";
import { Iconify } from "../../../components/iconify/iconify";
import { useToast } from "../../../components/ui/ToastProvider";
import { useAuth } from "../../../lib/auth";
import { getErrorMessage } from "../../../lib/errors";
import { usePicDivDashboard } from "../../../models/pic-div";
import { setReportManagementStatus } from "../../../models/report";

const projectStatusOrder = ["Approved", "Submitted", "In Progress", "Idea", "Archived"];

export function PicDivHome() {
  const { profile } = useAuth();
  const toast = useToast();
  const { data, isLoading, error, refresh } = usePicDivDashboard(profile?.divisionId);
  const [validatingId, setValidatingId] = useState<string | null>(null);

  async function validateReport(reportId: string) {
    setValidatingId(reportId);
    try {
      await setReportManagementStatus(reportId, "Divalidasi");
      toast.success("Laporan divalidasi", "Weekly report telah masuk ke tahap berikutnya.");
    } catch (err) {
      toast.error("Validasi gagal", getErrorMessage(err, "Coba kembali beberapa saat lagi."));
      setValidatingId(null);
      return;
    }
    try {
      await refresh();
    } catch (err) {
      toast.error("Data gagal dimuat ulang", getErrorMessage(err, "Validasi sudah tersimpan, tetapi dashboard belum dapat diperbarui."));
    } finally {
      setValidatingId(null);
    }
  }

  if (!profile?.divisionId) {
    return <StatePanel icon="solar:buildings-3-linear" title="Divisi belum terhubung" description="Akun ini belum memiliki divisi pada pengabdian_staff.divisi_id." />;
  }

  if (isLoading) return <LoadingState />;

  if (error || !data) {
    return (
      <StatePanel
        icon="solar:danger-triangle-linear"
        title="Dashboard belum dapat dimuat"
        description={error ?? "Data divisi tidak tersedia."}
        action={<button type="button" onClick={() => void refresh().catch(() => undefined)} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">Coba lagi</button>}
      />
    );
  }

  const projectStatus = projectStatusOrder.filter((status) => data.projectStats[status]);

  return (
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              <Iconify icon="solar:shield-user-bold-duotone" width={16} /> PIC Divisi
            </div>
            <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">{data.division.name}</h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-muted">Pantau validasi, progres SoW, project, dan kondisi santri dalam satu ruang kerja.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-black text-primary">{profile.name.charAt(0).toUpperCase()}</div>
            <div><p className="text-xs font-semibold text-muted">PIC aktif</p><p className="text-sm font-extrabold text-text">{profile.name}</p></div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon="solar:users-group-rounded-bold-duotone" label="Santri Divisi" value={data.students.length} tone="sky" />
        <Metric icon="solar:inbox-unread-bold-duotone" label="Menunggu Validasi" value={data.pendingWeekly.length} tone="orange" />
        <Metric icon="solar:chart-2-bold-duotone" label="Rata-rata SoW" value={`${data.averageSowProgress}%`} tone="emerald" />
        <Metric icon="solar:danger-triangle-bold-duotone" label="Perlu Perhatian" value={data.atRisk.length} tone="rose" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-5">
          <Panel title="Weekly Menunggu Validasi" subtitle="Laporan terkirim yang membutuhkan review PIC Divisi" icon="solar:clipboard-check-bold-duotone">
            {data.pendingWeekly.length ? (
              <div className="divide-y divide-border">
                {data.pendingWeekly.map((item) => (
                  <article key={item.reportId} className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <Avatar name={item.studentName} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-extrabold text-text">{item.studentName}</h3><span className="rounded-md bg-background px-2 py-0.5 text-[10px] font-bold text-muted">{item.studentCode}</span></div>
                        <p className="mt-1 text-xs font-semibold text-muted">{item.week} · {item.sowStatus}</p>
                        {item.highlight && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{item.highlight}</p>}
                      </div>
                    </div>
                    <button type="button" disabled={validatingId === item.reportId} onClick={() => void validateReport(item.reportId)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-extrabold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60">
                      <Iconify icon={validatingId === item.reportId ? "solar:refresh-linear" : "solar:check-circle-bold"} width={16} className={validatingId === item.reportId ? "animate-spin" : ""} />
                      Validasi
                    </button>
                  </article>
                ))}
              </div>
            ) : <Empty label="Tidak ada weekly report yang menunggu validasi." />}
          </Panel>

          <Panel title="Santri Perlu Perhatian" subtitle="Evaluasi bulanan terbaru berstatus Yellow atau Red" icon="solar:danger-circle-bold-duotone">
            {data.atRisk.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.atRisk.map((item) => (
                  <article key={item.pengabdianId} className="rounded-2xl border border-border bg-background/60 p-4">
                    <div className="flex items-center gap-3"><Avatar name={item.studentName} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold text-text">{item.studentName}</p><p className="text-xs font-semibold text-muted">{item.studentCode}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${item.gyr === "Red" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"}`}>{item.gyr}</span></div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center"><MiniStat label="SoW" value={`${item.sowProgress}%`} /><MiniStat label="Adab" value={item.adabScore || "-"} /><MiniStat label="Learn" value={item.learnCount} /></div>
                    {item.note && <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted">{item.note}</p>}
                  </article>
                ))}
              </div>
            ) : <Empty label="Belum ada santri berstatus Yellow atau Red." />}
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Workload Project" subtitle={`${data.mandatoryProjects} wajib dari ${data.totalProjects} project`} icon="solar:folder-with-files-bold-duotone">
            {data.totalProjects ? <div className="space-y-3">{projectStatus.map((status) => <ProgressRow key={status} label={status} value={data.projectStats[status]} total={data.totalProjects} />)}</div> : <Empty label="Belum ada project untuk divisi ini." />}
          </Panel>

          <Panel title="Mood Check-in" subtitle="Distribusi daily report yang tersedia" icon="solar:emoji-funny-square-bold-duotone">
            <div className="grid grid-cols-3 gap-2"><Mood label="Good" value={data.mood.good} total={data.mood.total} color="bg-emerald-400" /><Mood label="Okay" value={data.mood.okay} total={data.mood.total} color="bg-amber-400" /><Mood label="Tough" value={data.mood.tough} total={data.mood.total} color="bg-rose-400" /></div>
          </Panel>

          <Panel title="Progres SoW Rendah" subtitle="Evaluasi terbaru di bawah 60%" icon="solar:graph-down-bold-duotone">
            {data.lowProgress.length ? <div className="space-y-3">{data.lowProgress.slice(0, 5).map((item) => <ProgressRow key={item.pengabdianId} label={item.studentName} value={item.sowProgress} total={100} suffix="%" />)}</div> : <Empty label="Tidak ada progres SoW di bawah 60%." />}
          </Panel>
        </div>
      </section>
    </div>
  );
}

function Panel({ title, subtitle, icon, children }: { title: string; subtitle: string; icon: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm"><header className="mb-5 flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Iconify icon={icon} width={21} /></span><div><h2 className="text-sm font-black text-text">{title}</h2><p className="mt-0.5 text-xs font-medium text-muted">{subtitle}</p></div></header>{children}</section>;
}

function Metric({ icon, label, value, tone }: { icon: string; label: string; value: string | number; tone: "sky" | "orange" | "emerald" | "rose" }) {
  const colors = { sky: "bg-sky-500/10 text-sky-400", orange: "bg-orange-500/10 text-orange-400", emerald: "bg-emerald-500/10 text-emerald-400", rose: "bg-rose-500/10 text-rose-400" };
  return <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors[tone]}`}><Iconify icon={icon} width={23} /></span><div><p className="text-2xl font-black text-text">{value}</p><p className="text-xs font-bold text-muted">{label}</p></div></div>;
}

function Avatar({ name }: { name: string }) { return <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-black text-primary">{name.charAt(0).toUpperCase()}</span>; }
function MiniStat({ label, value }: { label: string; value: string | number }) { return <div className="rounded-xl bg-surface p-2"><p className="text-sm font-black text-text">{value}</p><p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p></div>; }
function Empty({ label }: { label: string }) { return <div className="rounded-2xl border border-dashed border-border bg-background/40 px-4 py-7 text-center text-xs font-semibold text-muted">{label}</div>; }

function ProgressRow({ label, value, total, suffix = "" }: { label: string; value: number; total: number; suffix?: string }) {
  const percentage = total ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return <div><div className="mb-1.5 flex justify-between gap-3 text-xs font-bold"><span className="truncate text-text">{label}</span><span className="shrink-0 text-muted">{value}{suffix}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} /></div></div>;
}

function Mood({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  return <div className="rounded-2xl bg-background/60 p-3 text-center"><span className={`mx-auto mb-2 block h-2 w-2 rounded-full ${color}`} /><p className="text-xl font-black text-text">{Math.round((value / total) * 100)}%</p><p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p></div>;
}

function StatePanel({ icon, title, description, action }: { icon: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="flex min-h-[55vh] items-center justify-center"><div className="max-w-md rounded-3xl border border-border bg-surface p-8 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-background text-muted"><Iconify icon={icon} width={28} /></span><h1 className="mt-4 text-lg font-black text-text">{title}</h1><p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>{action && <div className="mt-5">{action}</div>}</div></div>;
}

function LoadingState() {
  return <div className="space-y-5 animate-pulse"><div className="h-48 rounded-3xl bg-surface" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-24 rounded-2xl bg-surface" />)}</div><div className="grid gap-5 xl:grid-cols-2"><div className="h-96 rounded-3xl bg-surface" /><div className="h-96 rounded-3xl bg-surface" /></div></div>;
}
