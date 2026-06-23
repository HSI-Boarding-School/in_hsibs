import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../../../components/iconify/iconify";
import { Scrollbar } from "../../../../../components/scrollbar";
import { getPhaseName } from "../../../../../data/monitoring/learnData";
import type { LearnSession } from "../../../../../data/monitoring/learnData";
import type { Santri } from "../../../../../data/santriData";

export type AttendStatus = "Hadir" | "Izin" | "Alpha";

const themeBgCls: Record<string, string> = {
  "c-deen": "from-green-400/15 via-green-300/8 to-transparent",
  "c-it": "from-amber-400/15 via-amber-300/8 to-transparent",
  "c-ops": "from-pink-400/15 via-pink-300/8 to-transparent",
  "c-dkv": "from-purple-400/15 via-purple-300/8 to-transparent",
  "c-ac": "from-blue-400/15 via-blue-300/8 to-transparent",
};

const themeBadgeCls: Record<string, string> = {
  "c-deen": "bg-green/10 text-green ring-green/20",
  "c-it": "bg-amber/10 text-amber-dark ring-amber/30",
  "c-ops": "bg-pink/10 text-pink-dark ring-pink/30",
  "c-dkv": "bg-purple/10 text-purple ring-purple/30",
  "c-ac": "bg-blue/10 text-blue ring-blue/30",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface LearnSessionDetailDrawerProps {
  session: LearnSession | null;
  open: boolean;
  onClose: () => void;
  santriList: Santri[];
  attendance: Record<string, "Izin" | "Alpha">;
  onUpdateStatus: (status: LearnSession["status"]) => void;
  onSetAttendance: (santriId: string, status: AttendStatus) => void;
}

export function LearnSessionDetailDrawer({
  session,
  open,
  onClose,
  santriList,
  attendance,
  onUpdateStatus,
  onSetAttendance,
}: LearnSessionDetailDrawerProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && session && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`Detail ${session.title}`}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-border bg-surface shadow-[0_0_60px_rgba(0,0,0,0.18)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <DrawerContent
              session={session}
              onClose={onClose}
              santriList={santriList}
              attendance={attendance}
              onUpdateStatus={onUpdateStatus}
              onSetAttendance={onSetAttendance}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerContent({
  session,
  onClose,
  santriList,
  attendance,
  onUpdateStatus,
  onSetAttendance,
}: {
  session: LearnSession;
  onClose: () => void;
  santriList: Santri[];
  attendance: Record<string, "Izin" | "Alpha">;
  onUpdateStatus: (status: LearnSession["status"]) => void;
  onSetAttendance: (santriId: string, status: AttendStatus) => void;
}) {
  const heroBg = themeBgCls[session.themeCls] || "from-primary/10 via-primary/5 to-transparent";
  const themeBadge = themeBadgeCls[session.themeCls] || "bg-surface-strong text-muted ring-border";

  // Counts
  let izinCount = 0;
  let alphaCount = 0;
  Object.values(attendance).forEach((v) => {
    if (v === "Izin") izinCount++;
    else if (v === "Alpha") alphaCount++;
  });
  const hadirCount = santriList.length - izinCount - alphaCount;
  const attendPct = santriList.length > 0 ? Math.round((hadirCount / santriList.length) * 100) : 0;

  const getStatus = (id: string): AttendStatus =>
    attendance[id] ?? "Hadir";

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-surface/88 px-5 py-3 backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Iconify icon="solar:book-bookmark-bold-duotone" width={18} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-(--font-family-head) text-sm font-extrabold text-text">
              Learn Session
            </h3>
            <p className="truncate text-[0.65rem] font-bold text-muted">
              {session.id} · {getPhaseName(session.phase)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-2 text-muted transition-colors hover:bg-surface-strong hover:text-text"
          aria-label="Tutup"
        >
          <Iconify icon="mingcute:close-line" width={18} />
        </button>
      </div>

      <Scrollbar className="flex-1">
        <div className={`relative overflow-hidden border-b border-border/60 bg-gradient-to-b ${heroBg}`}>
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/12 blur-3xl" />
          <div className="relative space-y-4 px-5 py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-surface/70 px-2.5 py-1 font-mono text-[0.68rem] font-extrabold text-primary ring-1 ring-inset ring-border/50">
                    {session.id}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-[0.62rem] font-extrabold ring-1 ring-inset ${themeBadge}`}>
                    {session.theme}
                  </span>
                  <span className="rounded-full bg-surface-strong/75 px-2.5 py-1 text-[0.62rem] font-extrabold text-muted ring-1 ring-inset ring-border/50">
                    {session.type === "mandatory" ? "Mandatory" : "Role-Specific"}
                  </span>
                </div>

                <div>
                  <h2 className="font-(--font-family-head) text-xl font-extrabold leading-tight tracking-tight text-primary-dark">
                    {session.title}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-muted">{session.subtitle}</p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="text-[0.6rem] font-black uppercase tracking-[0.16em] text-muted">
                  Status
                </span>
                <StatusEditor value={session.status} onChange={onUpdateStatus} />
              </div>
            </div>

            <p className="rounded-2xl border border-border/50 bg-surface/52 p-3 text-[0.8rem] font-medium leading-relaxed text-text/90 backdrop-blur-sm">
              {session.what}
            </p>

            <div className="grid grid-cols-4 gap-2 max-sm:grid-cols-2">
              <HeroMetric icon="solar:users-group-rounded-bold-duotone" label="Hadir" value={`${hadirCount}/${santriList.length}`} tone="emerald" />
              <HeroMetric icon="solar:chart-2-bold-duotone" label="Rate" value={`${attendPct}%`} tone="sky" />
              <HeroMetric icon="solar:clock-circle-bold-duotone" label="Waktu" value={session.when} tone="amber" />
              <HeroMetric icon="solar:microphone-3-bold-duotone" label="Pemateri" value={session.speaker} tone="purple" />
            </div>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5">
          <section className="rounded-2xl border border-border/60 bg-surface/72 p-3.5 shadow-[0_8px_24px_rgba(39,49,38,0.05)]">
            <SectionTitle icon="solar:document-text-bold-duotone" title="Session Brief" />
            <div className="mt-3 grid gap-2">
              <InfoRow icon="solar:calendar-bold-duotone" label="Kapan" value={session.when} />
              <InfoRow icon="solar:map-point-bold-duotone" label="Dimana" value={session.where} />
              <InfoRow icon="solar:users-group-rounded-bold-duotone" label="Peserta" value={session.who} />
              <InfoRow icon="solar:lightbulb-bold-duotone" label="Mengapa" value={session.why} />
              <InfoRow icon="solar:notebook-bold-duotone" label="Bagaimana" value={session.how} />
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-surface/72 p-3.5 shadow-[0_8px_24px_rgba(39,49,38,0.05)]">
            <div className="mb-3 flex items-start justify-between gap-3">
              <SectionTitle icon="solar:clipboard-check-bold-duotone" title="Attendance Editor" />
              <span className="rounded-full bg-surface-strong px-2.5 py-1 text-[0.62rem] font-extrabold text-muted">
                {santriList.length} santri
              </span>
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2">
              <SummaryCard label="Hadir" value={hadirCount} tone="green" />
              <SummaryCard label="Izin" value={izinCount} tone="amber" />
              <SummaryCard label="Alpha" value={alphaCount} tone="pink" />
            </div>

            <div className="mb-3 rounded-xl border border-primary/15 bg-primary-soft/25 px-3 py-2 text-[0.68rem] font-semibold leading-relaxed text-primary-dark">
              <Iconify icon="solar:info-circle-bold-duotone" width={12} className="mr-1 inline align-[-2px] text-primary" />
              Klik status di kanan nama santri untuk edit absensi. Default semua santri adalah Hadir.
            </div>

            <ul className="grid gap-2">
              {santriList.map((s) => {
                const status = getStatus(s.id);
                return (
                  <li
                    key={s.id}
                    className="rounded-2xl border border-border/60 bg-surface/86 p-2.5 transition-colors duration-150 hover:border-primary/20 hover:bg-surface-strong/35"
                  >
                    <div className="flex items-center gap-3 max-sm:flex-wrap">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-[0.76rem] font-extrabold tracking-wide text-white shadow-[0_6px_16px_rgba(37,99,235,0.2)]"
                        aria-hidden
                      >
                        {getInitials(s.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.82rem] font-extrabold text-text">
                          {s.name}
                        </p>
                        <p className="truncate text-[0.65rem] font-mono font-bold text-muted">
                          {s.id.replace("IN_HSIBS_", "")} · {s.unit} · {s.divs.join(", ")}
                        </p>
                      </div>

                      <AttendanceEditor
                        value={status}
                        onChange={(next) => onSetAttendance(s.id, next)}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </Scrollbar>
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 text-[0.75rem]">
      <Iconify icon={icon} width={14} className="mt-0.5 shrink-0 text-primary/70" />
      <div className="min-w-0 flex-1">
        <span className="text-[0.6rem] font-bold uppercase tracking-wider text-muted">
          {label}
        </span>
        <p className="font-semibold text-text leading-snug">{value}</p>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <h4 className="flex items-center gap-2 font-(--font-family-head) text-sm font-extrabold text-primary-dark">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Iconify icon={icon} width={15} />
      </span>
      {title}
    </h4>
  );
}

function HeroMetric({
  icon,
  label,
  value,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  tone: "emerald" | "sky" | "amber" | "purple";
}) {
  const toneCls = {
    emerald: "border-emerald-300/60 bg-emerald-50/80 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/12 dark:text-emerald-200",
    sky: "border-sky-300/60 bg-sky-50/80 text-sky-700 dark:border-sky-400/30 dark:bg-sky-500/12 dark:text-sky-200",
    amber: "border-amber-300/60 bg-amber-50/80 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/12 dark:text-amber-200",
    purple: "border-purple-300/60 bg-purple-50/80 text-purple-700 dark:border-purple-400/30 dark:bg-purple-500/12 dark:text-purple-200",
  }[tone];

  return (
    <div className={`min-w-0 rounded-2xl border p-3 backdrop-blur-sm ${toneCls}`}>
      <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/55 text-current dark:bg-white/10">
        <Iconify icon={icon} width={15} />
      </div>
      <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] opacity-75">
        {label}
      </p>
      <p className="mt-0.5 truncate text-[0.75rem] font-extrabold text-current">
        {value}
      </p>
    </div>
  );
}

function StatusEditor({
  value,
  onChange,
}: {
  value: LearnSession["status"];
  onChange: (status: LearnSession["status"]) => void;
}) {
  const options: { value: LearnSession["status"]; label: string; icon: string }[] = [
    { value: "Planned", label: "Planned", icon: "solar:clock-circle-bold-duotone" },
    { value: "Done", label: "Done", icon: "solar:check-circle-bold-duotone" },
  ];

  return (
    <div className="inline-flex rounded-2xl border border-border bg-bg/55 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[0.7rem] font-extrabold transition-all ${
              active
                ? opt.value === "Done"
                  ? "bg-emerald-500 text-white ring-1 ring-emerald-300/70 shadow-[0_8px_18px_rgba(16,185,129,0.32)]"
                  : "bg-amber-500 text-white ring-1 ring-amber-300/70 shadow-[0_8px_18px_rgba(245,158,11,0.3)]"
                : "text-muted hover:bg-surface hover:text-text"
            }`}
          >
            <Iconify icon={opt.icon} width={13} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function AttendanceEditor({
  value,
  onChange,
}: {
  value: AttendStatus;
  onChange: (status: AttendStatus) => void;
}) {
  const options: { value: AttendStatus; short: string; label: string; cls: string }[] = [
    { value: "Hadir", short: "H", label: "Hadir", cls: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-400/35 dark:bg-emerald-500/14 dark:text-emerald-200" },
    { value: "Izin", short: "I", label: "Izin", cls: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-400/35 dark:bg-amber-500/14 dark:text-amber-200" },
    { value: "Alpha", short: "A", label: "Alpha", cls: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-400/35 dark:bg-rose-500/14 dark:text-rose-200" },
  ];

  return (
    <div className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-border bg-surface-strong/45 p-1 max-sm:w-full">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`flex min-w-0 items-center justify-center rounded-lg border px-2.5 py-1.5 text-[0.68rem] font-extrabold transition-all max-sm:flex-1 ${
              active ? opt.cls : "border-transparent text-muted hover:bg-surface hover:text-text"
            }`}
          >
            <span className="sm:hidden">{opt.short}</span>
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "amber" | "pink";
}) {
  const toneCls = {
    green: "text-emerald-600 dark:text-emerald-300",
    amber: "text-amber-600 dark:text-amber-300",
    pink: "text-rose-600 dark:text-rose-300",
  }[tone];

  return (
    <div className="rounded-xl border border-border/60 bg-surface-strong/38 px-3 py-2.5 text-center">
      <div className={`font-(--font-family-head) text-xl font-extrabold leading-none ${toneCls}`}>
        {value}
      </div>
      <div className="mt-1 text-[0.6rem] font-bold uppercase tracking-wider text-muted">
        {label}
      </div>
    </div>
  );
}
