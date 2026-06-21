import { Button } from "../ui/Button";
import type { Session, SidebarStat } from "../../types";

interface SidebarProps {
  onLogout: () => void;
  stats: SidebarStat[];
  user: Session;
}

export function Sidebar({ onLogout, stats, user }: SidebarProps) {
  return (
    <aside className="fixed bottom-6 left-6 top-6 z-8 flex w-[270px] flex-col gap-4 rounded-sm border border-white/80 bg-surface/85 p-5 shadow-[0_24px_70px_rgba(39,49,38,0.14)] backdrop-blur-[18px] max-lg:hidden justify-between">
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

          {/* Stats */}
          <div
            className="grid gap-0 border-t border-border pt-4"
            aria-label="Statistik ringkas"
          >
            {stats.map((item) => (
              <div
                className="flex items-center justify-between border-b border-border py-2.5"
                key={item.label}
              >
                <span className="text-xs text-muted">{item.label}</span>
                <strong className="text-lg text-primary-dark">
                  {item.value}
                </strong>
              </div>
            ))}
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
