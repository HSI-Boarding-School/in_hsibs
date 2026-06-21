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
  onSetAttendance: (santriId: string, status: AttendStatus) => void;
}

export function LearnSessionDetailDrawer({
  session,
  open,
  onClose,
  santriList,
  attendance,
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
  onSetAttendance,
}: {
  session: LearnSession;
  onClose: () => void;
  santriList: Santri[];
  attendance: Record<string, "Izin" | "Alpha">;
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

  const getStatus = (id: string): AttendStatus =>
    attendance[id] ?? "Hadir";

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border/60 bg-surface/95 px-5 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Iconify icon="solar:book-bookmark-bold-duotone" width={18} className="text-primary shrink-0" />
          <h3 className="font-(--font-family-head) text-sm font-extrabold text-primary-dark truncate">
            Detail Session
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-strong hover:text-text"
          aria-label="Tutup"
        >
          <Iconify icon="mingcute:close-line" width={18} />
        </button>
      </div>

      <Scrollbar className="flex-1">
        {/* Hero */}
        <div className={`relative overflow-hidden bg-gradient-to-b ${heroBg}`}>
          <div className="space-y-3 px-5 py-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[0.7rem] font-bold text-primary">
                {session.id}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold ring-1 ring-inset ${themeBadge}`}>
                {session.theme}
              </span>
              <span className="rounded-full bg-surface-strong px-2.5 py-0.5 text-[0.6rem] font-bold text-muted">
                {getPhaseName(session.phase)}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold ${
                  session.status === "Done"
                    ? "bg-green/10 text-green"
                    : "bg-amber/10 text-amber-dark"
                }`}
              >
                {session.status}
              </span>
            </div>

            <div>
              <h2 className="font-(--font-family-head) text-lg font-extrabold leading-tight text-primary-dark">
                {session.title}
              </h2>
              <p className="mt-0.5 text-sm text-muted">{session.subtitle}</p>
            </div>

            <p className="text-[0.8rem] leading-relaxed text-text/85">{session.what}</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-5 px-5 py-5">
          <div className="grid gap-2 rounded-xl bg-surface-strong/50 p-3">
            <InfoRow icon="solar:calendar-bold-duotone" label="Kapan" value={session.when} />
            <InfoRow icon="solar:map-point-bold-duotone" label="Dimana" value={session.where} />
            <InfoRow icon="solar:users-group-rounded-bold-duotone" label="Peserta" value={session.who} />
            <InfoRow icon="solar:microphone-3-bold-duotone" label="Pemateri" value={session.speaker} />
            <InfoRow icon="solar:lightbulb-bold-duotone" label="Mengapa" value={session.why} />
            <InfoRow icon="solar:notebook-bold-duotone" label="Bagaimana" value={session.how} />
          </div>

          {/* Attendance */}
          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h4 className="flex items-center gap-1.5 font-(--font-family-head) text-sm font-extrabold text-primary-dark">
                <Iconify icon="solar:clipboard-check-bold-duotone" width={16} className="text-primary" />
                Absensi Santri
              </h4>
              <span className="text-[0.65rem] font-semibold text-muted">
                {santriList.length} santri
              </span>
            </div>

            {/* Summary */}
            <div className="mb-3 grid grid-cols-3 gap-2">
              <SummaryCard label="Hadir" value={hadirCount} tone="green" />
              <SummaryCard label="Izin" value={izinCount} tone="amber" />
              <SummaryCard label="Alpha" value={alphaCount} tone="pink" />
            </div>

            <p className="mb-2 flex items-center gap-1.5 text-[0.65rem] italic text-muted">
              <Iconify icon="solar:info-circle-bold-duotone" width={11} />
              Default semua santri Hadir. Pilih Izin atau Alpha untuk yang tidak hadir.
            </p>

            <ul className="grid gap-1.5">
              {santriList.map((s) => {
                const status = getStatus(s.id);
                return (
                  <li
                    key={s.id}
                    className={`flex items-center gap-3 rounded-xl border p-2.5 transition-all duration-150 ${
                      status === "Hadir"
                        ? "border-border/60 bg-surface"
                        : status === "Izin"
                          ? "border-amber-300 bg-amber-50/60"
                          : "border-pink-300 bg-pink-50/60"
                    }`}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark text-[0.75rem] font-extrabold text-white"
                      aria-hidden
                    >
                      {getInitials(s.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.8rem] font-bold text-text">
                        {s.name}
                      </p>
                      <p className="truncate text-[0.65rem] font-mono text-muted">
                        {s.id.replace("IN_HSIBS_", "")} · {s.unit}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1 rounded-lg bg-surface-strong p-0.5">
                      <AttendBtn
                        active={status === "Hadir"}
                        onClick={() => onSetAttendance(s.id, "Hadir")}
                        tone="green"
                        label="H"
                        title="Hadir"
                      />
                      <AttendBtn
                        active={status === "Izin"}
                        onClick={() =>
                          onSetAttendance(s.id, status === "Izin" ? "Hadir" : "Izin")
                        }
                        tone="amber"
                        label="I"
                        title="Izin"
                      />
                      <AttendBtn
                        active={status === "Alpha"}
                        onClick={() =>
                          onSetAttendance(s.id, status === "Alpha" ? "Hadir" : "Alpha")
                        }
                        tone="pink"
                        label="A"
                        title="Alpha"
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
    green: "bg-green-50 text-green-700 ring-green-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    pink: "bg-pink-50 text-pink-700 ring-pink-200",
  }[tone];

  return (
    <div className={`rounded-xl px-3 py-2.5 text-center ring-1 ring-inset ${toneCls}`}>
      <div className="font-(--font-family-head) text-xl font-extrabold leading-none">
        {value}
      </div>
      <div className="mt-1 text-[0.6rem] font-bold uppercase tracking-wider opacity-80">
        {label}
      </div>
    </div>
  );
}

function AttendBtn({
  active,
  onClick,
  tone,
  label,
  title,
}: {
  active: boolean;
  onClick: () => void;
  tone: "green" | "amber" | "pink";
  label: string;
  title: string;
}) {
  const activeCls = {
    green: "bg-green-500 text-white shadow-[0_2px_6px_rgba(34,197,94,0.35)]",
    amber: "bg-amber-500 text-white shadow-[0_2px_6px_rgba(245,158,11,0.35)]",
    pink: "bg-pink-500 text-white shadow-[0_2px_6px_rgba(236,72,153,0.35)]",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`flex h-7 w-7 items-center justify-center rounded-md text-[0.7rem] font-extrabold transition-all duration-150 ${
        active ? activeCls : "text-muted hover:bg-surface hover:text-text"
      }`}
    >
      {label}
    </button>
  );
}
