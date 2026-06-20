import { motion } from "motion/react";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { StatCard } from "../../../components/ui/StatCard";
import { roleDashboardContent } from "../../../data/monitoringData";
import type { Session } from "../../../types";

interface RoleDashboardContentProps {
  user: Session;
  activePage: string;
}

export function RoleDashboardContent({
  user,
  activePage,
}: RoleDashboardContentProps) {
  const content =
    roleDashboardContent[user.role as keyof typeof roleDashboardContent];

  if (!content) return null;

  return (
    <motion.div
      className="grid gap-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <SectionHeader
        description={content.description}
        eyebrow={user.roleLabel}
        title={content.title}
      />

      <section
        className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1"
        aria-label="Statistik role"
      >
        {content.stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)] gap-4 max-lg:grid-cols-1">
        <article className="rounded-[var(--radius-xl)] border border-white/80 bg-surface/85 p-[22px] shadow-[0_24px_70px_rgba(39,49,38,0.14)]">
          <div className="mb-5 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
            <div>
              <h2 className="text-[1.25rem] font-[var(--font-family-head)] text-primary-dark">
                {content.panelTitle}
              </h2>
              <p className="leading-[1.7] text-muted">
                Isi dashboard menyesuaikan kebutuhan role yang sedang login.
              </p>
            </div>
            <span className="inline-flex rounded-full bg-primary-soft px-[11px] py-[7px] text-[0.8rem] font-black text-primary-dark">
              Role
            </span>
          </div>
          <div className="grid gap-3">
            {content.panelItems.map((item) => (
              <div
                className="flex items-center justify-between rounded-[var(--radius-lg)] bg-surface-strong p-4"
                key={item}
              >
                <span className="font-extrabold text-text">{item}</span>
                <strong className="text-primary-dark">Aktif</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[var(--radius-xl)] border border-white/80 bg-surface/85 p-[22px] shadow-[0_24px_70px_rgba(39,49,38,0.14)]">
          <div className="mb-5">
            <h2 className="text-[1.25rem] font-[var(--font-family-head)] text-primary-dark">
              Ruang Kerja
            </h2>
            <p className="leading-[1.7] text-muted">
              Komponen ini bisa diisi fitur detail berikutnya.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              { label: "Akses", value: user.roleLabel },
              { label: "Halaman", value: activePage },
            ].map(({ label, value }) => (
              <div
                className="flex items-center justify-between rounded-[var(--radius-lg)] bg-surface-strong p-3.5"
                key={label}
              >
                <span className="text-muted">{label}</span>
                <strong className="text-primary-dark">{value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>
    </motion.div>
  );
}
