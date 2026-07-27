import { useState } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import type { Session } from "../../../types";
import { useAuth } from "../../../lib/auth";
import { useStudentWorkspace, type StudentActionId } from "../../../models/siswa";
import { StudentActionDialog } from "./StudentActionDialog";
import { SiswaHomePage, SiswaMappingPage, SiswaMonitoringPage, SiswaProfilePage, SiswaReportingPage } from "./pages";

interface SiswaDashboardProps { user: Session; activePage: string; }
const siswaPages = ["home", "mapping", "monitoring", "report", "profile"];

export function SiswaDashboard({ user, activePage }: SiswaDashboardProps) {
  const { sbSession } = useAuth();
  const { data, isLoading, error, refresh } = useStudentWorkspace(sbSession?.user.id);
  const [activeAction, setActiveAction] = useState<StudentActionId | null>(null);
  const page = siswaPages.includes(activePage) ? activePage : "home";

  if (!sbSession?.user) return <DashboardState icon="solar:lock-keyhole-minimalistic-bold-duotone" title="Session Supabase diperlukan" description="Silakan logout lalu login kembali menggunakan email akun Santri agar report dan evidence dapat disimpan dengan aman." />;
  if (isLoading) return <DashboardLoading />;
  if (error || !data) return <DashboardState icon="solar:danger-triangle-bold-duotone" title="Ruang kerja belum dapat dimuat" description={error ?? "Profil Santri tidak ditemukan."} action={<button type="button" onClick={() => void refresh().catch(() => undefined)} className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-white">Coba lagi</button>} />;

  return <motion.div className="grid gap-6" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
    <Hero userId={user.userId} santriName={data.profile.name} location={data.profile.location} />
    {page === "home" && <SiswaHomePage data={data} onAction={setActiveAction} />}
    {page === "mapping" && <SiswaMappingPage data={data} />}
    {page === "monitoring" && <SiswaMonitoringPage data={data} />}
    {page === "report" && <SiswaReportingPage data={data} onAction={setActiveAction} />}
    {page === "profile" && <SiswaProfilePage data={data} />}
    <StudentActionDialog action={activeAction} data={data} authUserId={sbSession.user.id} onClose={() => setActiveAction(null)} onSuccess={refresh} />
  </motion.div>;
}

function Hero({ userId, santriName, location }: { userId: string; santriName: string; location: string }) {
  return <section className="relative overflow-hidden rounded-3xl border border-border/65 bg-surface/86 px-5 py-4 shadow-[0_14px_44px_rgba(15,23,42,0.06)]"><div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" /><div className="relative flex items-center gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-black text-white">{santriName.charAt(0).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-primary">Santri Portal</p><h1 className="mt-0.5 truncate text-2xl font-extrabold tracking-tight text-primary-dark max-sm:text-xl">Assalamualaikum, {santriName}</h1><div className="mt-1 flex flex-wrap items-center gap-2 text-[0.68rem] font-semibold text-muted"><span>{userId}</span><span className="h-1 w-1 rounded-full bg-border" /><span>{location}</span></div></div><span className="hidden rounded-xl bg-emerald-500/9 px-3 py-2 text-[0.65rem] font-black text-emerald-600 sm:inline-flex">Akun aktif</span></div></section>;
}
function DashboardState({ icon, title, description, action }: { icon: string; title: string; description: string; action?: React.ReactNode }) { return <div className="flex min-h-[55vh] items-center justify-center"><div className="max-w-md rounded-3xl border border-border bg-surface p-8 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 text-orange"><Iconify icon={icon} width={28} /></span><h1 className="mt-4 text-lg font-black text-text">{title}</h1><p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>{action}</div></div>; }
function DashboardLoading() { return <div className="grid gap-5 animate-pulse"><div className="h-52 rounded-[32px] bg-surface" /><div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1"><div className="h-80 rounded-3xl bg-surface" /><div className="h-80 rounded-3xl bg-surface" /></div></div>; }
