import { Button } from "../ui/Button";
import { Iconify } from "../iconify/iconify";
import type { Session, SidebarStat } from "../../types";

interface SidebarProps {
  onLogout: () => void;
  stats: SidebarStat[];
  user: Session;
}

const overviewItems = [
  { label: "Active Interns", value: "21", icon: "solar:user-rounded-bold-duotone", tone: "text-purple bg-purple/12" },
  { label: "HSI BS", value: "12", icon: "solar:buildings-2-bold-duotone", tone: "text-blue bg-blue/12" },
  { label: "HSI BO", value: "7", icon: "solar:puzzle-bold-duotone", tone: "text-green bg-green/12" },
  { label: "STIT Riyadh", value: "2", icon: "solar:users-group-rounded-bold-duotone", tone: "text-orange bg-orange/12" },
  { label: "Locations", value: "7", icon: "solar:map-point-bold-duotone", tone: "text-pink-700 bg-pink-100" },
  { label: "Divisions", value: "6", icon: "solar:target-bold-duotone", tone: "text-primary bg-primary/12" },
  { label: "Learn Sessions", value: "16", icon: "solar:shield-keyhole-bold-duotone", tone: "text-muted bg-surface-strong" },
  { label: "Project Templates", value: "8", icon: "solar:rocket-bold-duotone", tone: "text-pink-700 bg-pink-100" },
];

export function Sidebar({ onLogout, stats: _stats, user }: SidebarProps) {
  return (
    <aside className="fixed bottom-6 left-6 top-6 z-8 flex w-[270px] flex-col gap-4 rounded-sm border border-white/80 bg-surface/85 p-5 shadow-[0_24px_70px_rgba(39,49,38,0.14)] backdrop-blur-[18px] max-lg:hidden justify-between dark:bg-surface/74 dark:shadow-[0_28px_80px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 mb-9">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-dark font-black tracking-tighter text-white">
            HS
          </span>
          <div>
            <strong className="block text-sm text-primary-dark">
              HSIBS Monitor
            </strong>
            <small className="block text-xs text-muted">
              Santri Pengabdian
            </small>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Profile */}
          <div className="flex items-center gap-3 rounded-sm bg-surface-strong p-3">
            <p>Assalamualaikum, {user.role}</p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-bg/30 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" aria-label="Program overview">
            <div className="mb-2.5 flex items-center justify-between gap-3 px-0.5">
              <h2 className="text-[0.8rem] font-extrabold tracking-tight text-text">
                Program Overview
              </h2>
              <span className="text-[0.72rem] font-extrabold text-text">Live</span>
            </div>

            <div className="grid">
              {overviewItems.map((item, index) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2.5 py-2.5 ${
                    index === overviewItems.length - 1 ? "" : "border-b border-border/55"
                  }`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${item.tone}`}>
                    <Iconify icon={item.icon} width={14} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[0.82rem] font-bold text-text">
                    {item.label}
                  </span>
                  <strong className="shrink-0 text-[0.82rem] font-extrabold tabular-nums text-text">
                    {item.value}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Note — takes remaining space */}

      <Button
        onClick={onLogout}
        variant="primary"
        className="w-full justify-center rounded-sm"
      >
        Keluar
      </Button>
    </aside>
  );
}
