import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../../components/iconify/iconify";
import { Scrollbar } from "../../../../components/scrollbar";
import type { Santri } from "../../../../data/santriData";
import { getDivColor, getDivLabel } from "../../../../data/santriData";

interface UnitTheme {
  avatar: string;
  pill: string;
  label: string;
  hero: string;
}

const unitTheme: Record<Santri["unit"], UnitTheme> = {
  "HSI BS": {
    avatar: "bg-gradient-to-br from-blue-400 to-blue-600",
    pill: "bg-blue-50 text-blue-700 ring-blue-200",
    label: "HSI BS",
    hero: "from-blue-500/15 via-blue-400/5 to-transparent",
  },
  "HSI BO": {
    avatar: "bg-gradient-to-br from-purple-400 to-purple-600",
    pill: "bg-purple-50 text-purple-700 ring-purple-200",
    label: "HSI BO",
    hero: "from-purple-500/15 via-purple-400/5 to-transparent",
  },
  "STIT Riyadh": {
    avatar: "bg-gradient-to-br from-emerald-400 to-emerald-600",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    label: "STIT Riyadh",
    hero: "from-emerald-500/15 via-emerald-400/5 to-transparent",
  },
};

interface StatusTheme {
  dot: string;
  text: string;
  bg: string;
  label: string;
}

const statusTheme: Record<Santri["status"], StatusTheme> = {
  Active: { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50 ring-green-200", label: "Active" },
  "On Hold": { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50 ring-amber-200", label: "On Hold" },
  Inactive: { dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-100 ring-gray-200", label: "Inactive" },
  Alumni: { dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-100 ring-gray-200", label: "Alumni" },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface SantriDetailDrawerProps {
  santri: Santri | null;
  open: boolean;
  onClose: () => void;
}

export function SantriDetailDrawer({ santri, open, onClose }: SantriDetailDrawerProps) {
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
      {open && santri && (
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
            aria-label={`Detail ${santri.name}`}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-[0_0_60px_rgba(0,0,0,0.18)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <DrawerContent santri={santri} onClose={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerContent({ santri, onClose }: { santri: Santri; onClose: () => void }) {
  const shortId = santri.id.replace("IN_HSIBS_", "");
  const unit = unitTheme[santri.unit];
  const status = statusTheme[santri.status];
  const initials = getInitials(santri.name);

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
        <div className="flex items-center gap-2">
          <Iconify
            icon="solar:user-rounded-bold-duotone"
            width={18}
            className="text-primary"
          />
          <h3 className="font-(--font-family-head) text-sm font-extrabold text-primary-dark">
            Detail Santri
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
        <div className={`relative overflow-hidden bg-gradient-to-b ${unit.hero}`}>
          <div className="flex flex-col items-center gap-3 px-6 pb-6 pt-8 text-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-2xl font-(--font-family-head) text-2xl font-extrabold tracking-wide text-white shadow-[0_10px_28px_rgba(39,49,38,0.18)] ${unit.avatar}`}
              aria-hidden
            >
              {initials}
            </div>
            <div>
              <h2 className="font-(--font-family-head) text-lg font-extrabold leading-tight text-primary-dark">
                {santri.name}
              </h2>
              <div className="mt-1.5 flex items-center justify-center gap-2 text-[0.7rem]">
                <span className="font-mono font-bold text-primary">{shortId}</span>
                <span className="text-border" aria-hidden>
                  •
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ring-1 ring-inset ${status.bg} ${status.text}`}
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${status.dot}`}
                    aria-hidden
                  />
                  {status.label}
                </span>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[0.65rem] font-bold ring-1 ring-inset ${unit.pill}`}
            >
              {unit.label}
            </span>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-5 px-5 py-5">
          {/* Penempatan */}
          <Section title="Penempatan" icon="solar:map-point-bold-duotone">
            <InfoRow
              icon="solar:map-point-wave-bold-duotone"
              label="Lokasi"
              value={santri.loc}
            />
            <InfoRow
              icon="solar:shield-user-bold-duotone"
              label="PIC Regional"
              value={santri.picReg}
              empty={!santri.picReg}
              emptyText="Belum ada PIC Regional"
            />
          </Section>

          {/* Divisi */}
          <Section title="Divisi" icon="solar:widget-4-bold-duotone">
            {santri.divs.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {santri.divs.map((d) => (
                  <span
                    key={d}
                    className={`rounded-md px-2 py-1 text-[0.7rem] font-bold tracking-wide ${getDivColor(d)}`}
                    title={getDivLabel(d)}
                  >
                    {d}
                    <span className="ml-1.5 font-normal opacity-70">
                      {getDivLabel(d)}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <EmptyText>Belum ada divisi</EmptyText>
            )}
          </Section>

          {/* PIC Divisi */}
          <Section title="PIC Divisi" icon="solar:user-id-bold-duotone">
            {santri.picDivs.length > 0 ? (
              <ul className="grid gap-1.5">
                {santri.picDivs.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2 rounded-lg bg-surface-strong/55 px-3 py-2 text-[0.75rem] font-semibold text-text"
                  >
                    <Iconify
                      icon="solar:user-bold-duotone"
                      width={14}
                      className="text-primary/70"
                    />
                    {p}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyText>Belum ada PIC Divisi</EmptyText>
            )}
          </Section>

          {/* Roles */}
          <Section title="Role" icon="solar:tag-horizontal-bold-duotone">
            {santri.roles.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {santri.roles.map((r) => (
                  <span
                    key={r}
                    className="rounded-md bg-surface-strong px-2 py-1 text-[0.7rem] font-semibold text-text"
                  >
                    {r}
                  </span>
                ))}
              </div>
            ) : (
              <EmptyText>Belum ada role</EmptyText>
            )}
          </Section>
        </div>
      </Scrollbar>
    </>
  );
}

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <section>
      <h4 className="mb-2 flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-muted">
        <Iconify icon={icon} width={13} className="text-primary/60" />
        {title}
      </h4>
      <div>{children}</div>
    </section>
  );
}

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  empty?: boolean;
  emptyText?: string;
}

function InfoRow({ icon, label, value, empty = false, emptyText }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-surface-strong/55 px-3 py-2.5">
      <Iconify
        icon={icon}
        width={16}
        className={`shrink-0 ${empty ? "text-muted/40" : "text-primary/70"}`}
      />
      <div className="min-w-0 flex-1">
        <div className="text-[0.6rem] font-bold uppercase tracking-wider text-muted">
          {label}
        </div>
        <div
          className={`text-[0.8rem] font-semibold ${
            empty ? "italic text-muted/60" : "text-text"
          }`}
        >
          {empty ? emptyText : value}
        </div>
      </div>
    </div>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-surface-strong/40 px-3 py-2.5 text-[0.75rem] italic text-muted/60">
      {children}
    </p>
  );
}
