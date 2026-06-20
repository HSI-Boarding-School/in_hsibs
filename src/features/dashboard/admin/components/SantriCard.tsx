import { Iconify } from "../../../../components/iconify/iconify";
import type { Santri } from "../../../../data/santriData";
import { getDivColor } from "../../../../data/santriData";

interface UnitTheme {
  avatar: string;
  pill: string;
  label: string;
}

const unitTheme: Record<Santri["unit"], UnitTheme> = {
  "HSI BS": {
    avatar: "bg-gradient-to-br from-blue-400 to-blue-600",
    pill: "bg-blue-50 text-blue-700 ring-blue-200",
    label: "HSI BS",
  },
  "HSI BO": {
    avatar: "bg-gradient-to-br from-purple-400 to-purple-600",
    pill: "bg-purple-50 text-purple-700 ring-purple-200",
    label: "HSI BO",
  },
  "STIT Riyadh": {
    avatar: "bg-gradient-to-br from-emerald-400 to-emerald-600",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    label: "STIT",
  },
};

interface StatusTheme {
  dot: string;
  text: string;
  label: string;
}

const statusTheme: Record<Santri["status"], StatusTheme> = {
  Active: { dot: "bg-green-500", text: "text-green-700", label: "Active" },
  "On Hold": { dot: "bg-amber-500", text: "text-amber-700", label: "On Hold" },
  Inactive: { dot: "bg-gray-400", text: "text-gray-500", label: "Inactive" },
  Alumni: { dot: "bg-gray-400", text: "text-gray-500", label: "Alumni" },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface SantriCardProps {
  santri: Santri;
  onOpen?: (santri: Santri) => void;
}

export function SantriCard({ santri, onOpen }: SantriCardProps) {
  const shortId = santri.id.replace("IN_HSIBS_", "");
  const unit = unitTheme[santri.unit];
  const status = statusTheme[santri.status];
  const initials = getInitials(santri.name);

  const MAX_ROLES = 2;
  const visibleRoles = santri.roles.slice(0, MAX_ROLES);
  const extraRoles = Math.max(0, santri.roles.length - MAX_ROLES);

  const handleClick = () => {
    onOpen?.(santri);
  };

  return (
    <article
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      aria-label={onOpen ? `Lihat detail ${santri.name}` : undefined}
      className="group relative cursor-pointer space-y-3 rounded-2xl border border-border/60 bg-surface/95 p-4 shadow-[0_4px_14px_rgba(39,49,38,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-[0_14px_36px_rgba(39,49,38,0.13)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      {/* Header: Square avatar + Name + Unit pill */}
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg font-(--font-family-head) text-base font-extrabold tracking-wide text-white shadow-[0_4px_10px_rgba(39,49,38,0.12)] ${unit.avatar}`}
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-(--font-family-head) text-[0.9rem] font-extrabold leading-snug text-primary-dark">
            {santri.name}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-[0.65rem]">
            <span className="font-mono font-bold text-primary">{shortId}</span>
            <span className="text-border" aria-hidden>
              •
            </span>
            <span className={`inline-flex items-center gap-1 font-semibold ${status.text}`}>
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${status.dot}`}
                aria-hidden
              />
              {status.label}
            </span>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold ring-1 ring-inset ${unit.pill}`}
        >
          {unit.label}
        </span>
      </div>

      {/* Divisi chips */}
      {santri.divs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {santri.divs.map((d) => (
            <span
              key={d}
              className={`rounded-md px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wide ${getDivColor(d)}`}
            >
              {d}
            </span>
          ))}
        </div>
      )}

      {/* Meta panel */}
      <div className="space-y-1.5 rounded-xl bg-surface-strong/55 px-3 py-2.5 text-[0.7rem]">
        <MetaRow icon="solar:map-point-bold-duotone" text={santri.loc} />
        <MetaRow
          icon="solar:user-id-bold-duotone"
          text={santri.picDivs.join(" • ") || "Belum ada PIC Divisi"}
          empty={santri.picDivs.length === 0}
        />
        <MetaRow
          icon="solar:shield-user-bold-duotone"
          text={santri.picReg || "Belum ada PIC Regional"}
          empty={!santri.picReg}
        />
      </div>

      {/* Roles compact line */}
      {santri.roles.length > 0 ? (
        <div className="flex items-center gap-1.5 text-[0.65rem] text-muted">
          <Iconify
            icon="solar:tag-horizontal-bold-duotone"
            width={13}
            className="shrink-0 text-primary/60"
          />
          <span className="min-w-0 flex-1 truncate">
            <span className="font-semibold text-text">{visibleRoles.join(" • ")}</span>
            {extraRoles > 0 && (
              <span className="ml-1 font-bold text-primary">+{extraRoles}</span>
            )}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[0.65rem] italic text-muted/60">
          <Iconify
            icon="solar:tag-horizontal-bold-duotone"
            width={13}
            className="shrink-0 text-muted/40"
          />
          <span>Belum ada role</span>
        </div>
      )}
    </article>
  );
}

interface MetaRowProps {
  icon: string;
  text: string;
  empty?: boolean;
}

function MetaRow({ icon, text, empty = false }: MetaRowProps) {
  return (
    <div className="flex items-center gap-2">
      <Iconify
        icon={icon}
        width={13}
        className={`shrink-0 ${empty ? "text-muted/40" : "text-primary/70"}`}
      />
      <span
        className={`min-w-0 flex-1 truncate ${
          empty ? "italic text-muted/60" : "font-semibold text-text"
        }`}
      >
        {text}
      </span>
    </div>
  );
}
