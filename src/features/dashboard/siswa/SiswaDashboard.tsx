import { motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import type { Session } from "../../../types";

interface SiswaDashboardProps {
  user: Session;
  activePage: string;
}

const progressItems = [
  { label: "Daily Log", value: "18/24", pct: 75, tone: "bg-sky-500" },
  { label: "Weekly Review", value: "3/4", pct: 75, tone: "bg-emerald-500" },
  { label: "Project", value: "4/6", pct: 67, tone: "bg-violet-500" },
  { label: "Learn", value: "1/1", pct: 100, tone: "bg-amber-500" },
];

const agenda = [
  { title: "Kirim daily log hari ini", desc: "Plan, done, blocker, dan mood", icon: "solar:document-text-bold-duotone" },
  { title: "Update progress project", desc: "Tambahkan bukti/link progress terbaru", icon: "solar:folder-with-files-bold-duotone" },
  { title: "Cek catatan PIC", desc: "Ada 2 feedback yang perlu ditindaklanjuti", icon: "solar:chat-round-like-bold-duotone" },
];

export function SiswaDashboard({ user, activePage }: SiswaDashboardProps) {
  return (
    <motion.div
      className="grid gap-6"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <section className="relative overflow-hidden rounded-[var(--radius-xl)] border border-white/80 bg-surface/85 p-6 shadow-[0_24px_70px_rgba(39,49,38,0.12)] max-sm:p-5">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary/12 blur-3xl" />
        <div className="relative flex items-start justify-between gap-5 max-md:flex-col">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-primary">
              Siswa Portal
            </p>
            <h1 className="mt-1 font-(--font-family-head) text-4xl font-extrabold tracking-tight text-primary-dark max-sm:text-3xl">
              Assalamualaikum, {user.userId}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Ruang kerja khusus santri untuk melihat tugas harian, report, project, learn, dan feedback PIC.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-surface-strong/45 px-4 py-3 text-right max-md:text-left">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-muted">Current Page</p>
            <p className="mt-1 font-(--font-family-head) text-lg font-extrabold text-primary-dark">{activePage}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {progressItems.map((item, i) => (
          <motion.article
            key={item.label}
            className="rounded-2xl border border-border/60 bg-surface/85 p-4 shadow-[0_8px_24px_rgba(39,49,38,0.05)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.18 }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-extrabold text-text">{item.label}</span>
              <strong className="text-sm text-primary-dark">{item.value}</strong>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-strong">
              <motion.div
                className={`h-full rounded-full ${item.tone}`}
                initial={{ width: 0 }}
                animate={{ width: `${item.pct}%` }}
                transition={{ delay: 0.12 + i * 0.04, duration: 0.45 }}
              />
            </div>
          </motion.article>
        ))}
      </section>

      <section className="grid grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] gap-4 max-lg:grid-cols-1">
        <article className="rounded-[var(--radius-xl)] border border-white/80 bg-surface/85 p-5 shadow-[0_18px_48px_rgba(39,49,38,0.08)]">
          <h2 className="font-(--font-family-head) text-xl font-extrabold text-primary-dark">Agenda Hari Ini</h2>
          <div className="mt-4 grid gap-3">
            {agenda.map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-2xl bg-surface-strong/45 p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Iconify icon={item.icon} width={20} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-text">{item.title}</h3>
                  <p className="mt-0.5 text-[0.76rem] font-semibold text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[var(--radius-xl)] border border-white/80 bg-surface/85 p-5 shadow-[0_18px_48px_rgba(39,49,38,0.08)]">
          <h2 className="font-(--font-family-head) text-xl font-extrabold text-primary-dark">Quick Actions</h2>
          <div className="mt-4 grid gap-2">
            {["Submit Daily Log", "Upload Project", "Lihat Feedback", "Jadwal Learn"].map((action) => (
              <button
                key={action}
                type="button"
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface px-3 py-3 text-left text-sm font-extrabold text-text transition-colors hover:border-primary/30 hover:bg-primary-soft/35"
              >
                {action}
                <Iconify icon="solar:arrow-right-up-bold-duotone" width={17} className="text-primary" />
              </button>
            ))}
          </div>
        </article>
      </section>
    </motion.div>
  );
}
