import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <article className={`rounded-[28px] border border-border/70 bg-surface/84 p-5 shadow-[0_18px_54px_rgba(15,23,42,0.08)] backdrop-blur-xl ${className}`}>
      {children}
    </article>
  );
}

export function SectionTitle({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 className="mt-1 font-(--font-family-head) text-xl font-extrabold tracking-tight text-primary-dark">
        {title}
      </h2>
      {desc && <p className="mt-1 text-sm font-semibold leading-relaxed text-muted">{desc}</p>}
    </div>
  );
}

export function MiniBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface/80 px-4 py-3 ring-1 ring-inset ring-border/60">
      <p className="text-[0.65rem] font-black uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-(--font-family-head) text-lg font-extrabold text-primary-dark">{value}</p>
    </div>
  );
}

export function StatusRow({ label, value, tone }: { label: string; value: string; tone: "green" | "orange" | "blue" | "purple" }) {
  const cls = {
    green: "bg-green/10 text-green",
    orange: "bg-orange/10 text-orange",
    blue: "bg-blue/10 text-blue",
    purple: "bg-purple/10 text-purple",
  }[tone];

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface-strong/45 px-3 py-3 text-sm">
      <span className="font-bold text-muted">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs font-black ${cls}`}>{value}</span>
    </div>
  );
}

export function Progress({ label, value, tone = "bg-primary" }: { label: string; value: number; tone?: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-extrabold text-text">{label}</span>
        <span className="font-black text-primary-dark">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-strong">
        <motion.div className={`h-full rounded-full ${tone}`} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.45 }} />
      </div>
    </div>
  );
}

export function InfoPanel({ title, icon, items }: { title: string; icon: string; items: [string, string][] }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <SectionTitle eyebrow="Overview" title={title} />
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Iconify icon={icon} width={22} />
        </span>
      </div>
      <div className="mt-4 grid gap-2">
        {items.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded-2xl bg-surface-strong/45 px-3 py-2.5 text-sm">
            <span className="font-bold text-muted">{label}</span>
            <span className="text-right font-extrabold text-text">{value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
