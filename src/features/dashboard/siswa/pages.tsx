import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { getDivLabel, santriList } from "../../../data/santriData";
import { monthlyEntries, weeklyEntries } from "../../../data/monitoring/reportData";
import { Card, InfoPanel, Progress, SectionTitle, StatusRow } from "./components";

type Santri = (typeof santriList)[number];
type Weekly = (typeof weeklyEntries)[number] | undefined;
type Monthly = (typeof monthlyEntries)[number] | undefined;

const quickActions = [
  { label: "Daily Check-in", desc: "Plan, done, blocker", icon: "solar:checklist-minimalistic-bold-duotone" },
  { label: "Weekly Review", desc: "Review pekanan", icon: "solar:calendar-mark-bold-duotone" },
  { label: "Monthly Report", desc: "Summary bulanan", icon: "solar:file-text-bold-duotone" },
  { label: "Special Report", desc: "Case khusus", icon: "solar:document-add-bold-duotone" },
  { label: "Upload Evidence", desc: "Progress SoW", icon: "solar:upload-square-bold-duotone" },
  { label: "Remind PIC", desc: "Minta review", icon: "solar:chat-round-call-bold-duotone" },
];

export function SiswaHomePage({ santri, weekly, monthly, projectCount }: { santri: Santri; weekly: Weekly; monthly: Monthly; projectCount: number }) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const primary = santri.roles[0] ?? "Belum ada role utama";
  const secondary = santri.roles[1] ?? "Belum ada role kedua";
  const side = santri.roles.slice(2);

  return (
    <>
      <section className="grid grid-cols-[1.1fr_0.9fr] gap-4 max-xl:grid-cols-1">
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/12 blur-3xl" />
          <div className="relative">
            <SectionTitle eyebrow="Today" title="Ruang Kerja Santri" desc="Mulai dari check-in harian, upload evidence, atau remind PIC kalau butuh review." />
            <div className="mt-5 grid grid-cols-3 gap-2 max-md:grid-cols-2 max-sm:grid-cols-1">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => setActiveAction(action.label)}
                  className="group rounded-2xl border border-border/60 bg-surface px-3 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-soft/30"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Iconify icon={action.icon} width={20} />
                  </span>
                  <p className="mt-3 text-sm font-extrabold text-primary-dark">{action.label}</p>
                  <p className="mt-0.5 text-xs font-semibold text-muted">{action.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="Latest PIC Note" title="Catatan Terbaru" />
          <div className="mt-4 rounded-3xl bg-gradient-to-br from-primary/12 to-blue/8 p-4 ring-1 ring-inset ring-primary/10">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
                <Iconify icon="solar:chat-round-like-bold-duotone" width={20} />
              </span>
              <div>
                <p className="text-sm font-semibold leading-relaxed text-text">
                  Fokus selesaikan evidence SoW minggu ini. Kalau blocker belum clear, remind PIC Div lewat portal.
                </p>
                <p className="mt-3 text-xs font-black text-primary">PIC Divisi • 2 jam lalu</p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            <StatusRow label="Daily Check-in" value={activeAction === "Daily Check-in" ? "Draft dibuka" : "Belum submit"} tone="orange" />
            <StatusRow label="Weekly Deadline" value={weekly?.validated ? "Verified" : "Jumat, 21:00"} tone={weekly?.validated ? "green" : "blue"} />
            <StatusRow label="Monthly Deadline" value="Akhir bulan" tone="purple" />
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-3 gap-4 max-xl:grid-cols-1">
        <InfoPanel title="My Placement" icon="solar:map-point-bold-duotone" items={[["Unit", santri.unit], ["Location", santri.loc], ["PIC Reg", santri.picReg || "Belum ditentukan"]]} />
        <InfoPanel title="My Assignment" icon="solar:target-bold-duotone" items={[["Primary", primary], ["Secondary", secondary], ["Additional / Side", side.length ? side.join(" • ") : "Tidak ada"]]} />
        <Card>
          <SectionTitle eyebrow="Project" title="Progress" />
          <div className="mt-5 grid gap-4">
            <Progress label="SoW Evidence" value={monthly?.sowPct ?? 0} tone="bg-blue" />
            <Progress label="Project Progress" value={projectCount ? 70 : 20} tone="bg-green" />
          </div>
        </Card>
      </section>

      <Card>
        <SectionTitle eyebrow="Role & SoW" title="Assignment Cards" desc="SoW bersifat read-only. Santri hanya upload evidence atau progress." />
        <div className="mt-4 grid grid-cols-4 gap-3 max-xl:grid-cols-2 max-md:grid-cols-1">
          {santri.roles.slice(0, 4).map((role, index) => (
            <motion.div key={role} whileHover={{ y: -3 }} className="rounded-3xl bg-surface-strong/45 p-4 ring-1 ring-inset ring-border/50">
              <div className="flex items-center justify-between gap-3">
                <strong className="text-sm text-primary-dark">{role}</strong>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.62rem] font-black text-primary">SoW {index + 1}</span>
              </div>
              <p className="mt-3 text-xs font-semibold leading-relaxed text-muted">Upload evidence ketika progress siap direview PIC.</p>
            </motion.div>
          ))}
        </div>
      </Card>

      <ActionSheet action={activeAction} onClose={() => setActiveAction(null)} />
    </>
  );
}

export function SiswaMappingPage({ currentId }: { currentId: string }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4 max-md:flex-col">
        <SectionTitle eyebrow="Read-only Mapping" title="Basic Mapping Santri Lain" desc="Santri bisa melihat mapping dasar tanpa edit, approval, atau drag-drop." />
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">View only</span>
      </div>
      <div className="mt-5 grid gap-2">
        {santriList.slice(0, 10).map((item) => (
          <motion.div key={item.id} whileHover={{ x: 4 }} className="grid grid-cols-[1fr_120px_120px_120px] items-center gap-3 rounded-2xl bg-surface-strong/42 px-4 py-3 text-sm max-lg:grid-cols-1">
            <div className="min-w-0">
              <p className="truncate font-extrabold text-primary-dark">{item.name}</p>
              <p className="text-xs font-semibold text-muted">{item.id}{item.id === currentId ? " • Kamu" : ""}</p>
            </div>
            <span className="font-bold text-text">{item.unit}</span>
            <span className="font-bold text-muted">{item.loc}</span>
            <span className="font-bold text-primary">{item.divs.map(getDivLabel).join(", ")}</span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

export function SiswaMonitoringPage({ weekly, monthly, projectCount }: { weekly: Weekly; monthly: Monthly; projectCount: number }) {
  return (
    <section className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
      <Card>
        <SectionTitle eyebrow="Monitoring" title="Progress Pribadi" />
        <div className="mt-5 grid gap-4">
          <Progress label="SoW Evidence" value={monthly?.sowPct ?? 0} tone="bg-blue" />
          <Progress label="Adab & Discipline" value={monthly?.adab ? monthly.adab * 20 : 60} tone="bg-purple" />
          <Progress label="Project" value={projectCount ? 70 : 20} tone="bg-green" />
        </div>
      </Card>
      <Card>
        <SectionTitle eyebrow="Deadline" title="Weekly & Monthly" />
        <div className="mt-4 grid gap-3">
          <StatusRow label="Weekly Review" value={weekly?.validated ? "Verified" : "Need submit / waiting review"} tone={weekly?.validated ? "green" : "orange"} />
          <StatusRow label="Monthly Report" value="Deadline akhir bulan" tone="purple" />
          <StatusRow label="Special Report" value="Opsional saat ada case" tone="blue" />
        </div>
      </Card>
    </section>
  );
}

export function SiswaReportingPage() {
  const [selected, setSelected] = useState(quickActions[0].label);
  return (
    <section className="grid grid-cols-[0.85fr_1.15fr] gap-4 max-xl:grid-cols-1">
      <Card>
        <SectionTitle eyebrow="Reporting" title="Pilih Form" />
        <div className="mt-4 grid gap-2">
          {quickActions.map((action) => (
            <button key={action.label} type="button" onClick={() => setSelected(action.label)} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition-colors ${selected === action.label ? "bg-primary text-white" : "border border-border/60 bg-surface text-text hover:bg-primary-soft/35"}`}>
              <Iconify icon={action.icon} width={19} />
              {action.label}
            </button>
          ))}
        </div>
      </Card>
      <Card>
        <SectionTitle eyebrow="Form Preview" title={selected} desc="UI ini sementara untuk simulasi submit sebelum API/database asli disambungkan." />
        <div className="mt-5 grid gap-3">
          <textarea className="min-h-36 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary/40" placeholder="Tulis laporan/progress/evidence di sini..." />
          <button type="button" className="rounded-2xl bg-primary px-4 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)] hover:bg-primary-dark">
            Submit Draft
          </button>
        </div>
      </Card>
    </section>
  );
}

export function SiswaProfilePage({ santri }: { santri: Santri }) {
  return (
    <section className="grid grid-cols-[0.8fr_1.2fr] gap-4 max-xl:grid-cols-1">
      <Card className="text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary to-blue font-(--font-family-head) text-2xl font-extrabold text-white shadow-[0_14px_34px_rgba(37,99,235,0.25)]">
          {santri.name.slice(0, 2).toUpperCase()}
        </div>
        <h2 className="mt-4 font-(--font-family-head) text-2xl font-extrabold text-primary-dark">{santri.name}</h2>
        <p className="mt-1 text-sm font-semibold text-muted">{santri.id}</p>
      </Card>
      <InfoPanel title="Profile Mapping" icon="solar:user-id-bold-duotone" items={[["Unit", santri.unit], ["Location", santri.loc], ["Divisions", santri.divs.map(getDivLabel).join(", ")], ["Roles", santri.roles.join(" • ")], ["PIC Div", santri.picDivs.join(" • ") || "Belum ada"], ["PIC Reg", santri.picReg || "Belum ada"]]} />
    </section>
  );
}

function ActionSheet({ action, onClose }: { action: string | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {action && (
        <>
          <motion.div className="fixed inset-0 z-[70] bg-black/35 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed bottom-6 left-1/2 z-[71] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-[28px] border border-border/70 bg-surface p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)]" initial={{ opacity: 0, y: 30, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 20, x: "-50%" }}>
            <SectionTitle eyebrow="Quick Action" title={action} desc="Form detail akan disambungkan ke modul report/evidence berikutnya." />
            <button type="button" onClick={onClose} className="mt-4 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-black text-white">Buka Form</button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
