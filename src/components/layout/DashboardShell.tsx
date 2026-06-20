import type { ReactNode } from "react";
import { BottomDock } from "./BottomDock";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import {
  sidebarStats as adminSidebarStats,
  navigationItems,
  roleDashboardContent,
} from "../../data/monitoringData";
import type { Session } from "../../types";

interface DashboardShellProps {
  children: ReactNode;
  onLogout: () => void;
  user: Session;
}

export function DashboardShell({
  children,
  onLogout,
  user,
}: DashboardShellProps) {
  const stats =
    user.role === "admin"
      ? adminSidebarStats
      : (roleDashboardContent[user.role as keyof typeof roleDashboardContent]
          ?.sidebarStats ?? adminSidebarStats);

  return (
    <div className="min-h-svh pl-[318px] max-lg:pl-[max(1rem,env(safe-area-inset-left))] max-lg:pr-[max(1rem,env(safe-area-inset-right))]">
      <Sidebar onLogout={onLogout} stats={stats} user={user} />

      {/* Fixed navbar — uses its own padding (parent padding doesn't apply to fixed) */}
      <div className="fixed left-[318px] right-0 top-0 z-20 px-8 pt-6 max-lg:left-0 max-lg:pt-3 max-lg:pl-[max(1rem,env(safe-area-inset-left))] max-lg:pr-[max(1rem,env(safe-area-inset-right))]">
        <Navbar onLogout={onLogout} user={user} />
      </div>

      {/* Scrollable content — inherits horizontal padding from root at mobile */}
      <main className="px-8 pb-[120px] pt-[132px] max-lg:px-0 max-lg:pt-[108px]">
        {children}
      </main>

      <BottomDock items={navigationItems} />
    </div>
  );
}
