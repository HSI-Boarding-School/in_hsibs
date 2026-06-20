import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import {
  CalendarView,
  LearnsView,
  ProjectView,
  ReportView,
  AtRiskView,
  MukafaahView,
} from "./components/monitoring";

type ViewTab = "calendar" | "learns" | "projects" | "reports" | "atrisk" | "mukafaah";

const viewTabs: { id: ViewTab; label: string; icon: string }[] = [
  { id: "calendar", label: "Calendar", icon: "solar:calendar-minimalistic-bold-duotone" },
  { id: "learns", label: "Learns", icon: "solar:book-bookmark-bold-duotone" },
  { id: "projects", label: "Projects", icon: "solar:folder-with-files-bold-duotone" },
  { id: "reports", label: "Reports", icon: "solar:clipboard-list-bold-duotone" },
  { id: "atrisk", label: "At Risk", icon: "solar:shield-warning-bold-duotone" },
  { id: "mukafaah", label: "Mukafaah", icon: "solar:wallet-money-bold-duotone" },
];

export function AdminDashboardMonitoring() {
  const [viewTab, setViewTab] = useState<ViewTab>("calendar");

  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-primary">
          Monitoring Pengabdian
        </p>
        <h1 className="font-(--font-family-head) text-4xl font-extrabold tracking-tight text-primary-dark">
          Monitoring
        </h1>
        <p className="mt-1 text-sm text-muted">
          Pantau progress learn, project, report, dan status santri secara real-time.
        </p>
      </div>

      <div className="flex items-center gap-2 scrollbar-x pb-1">
        {viewTabs.map((tab) => {
          const isActive = viewTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setViewTab(tab.id)}
              className={`relative flex items-center gap-2.5 rounded-xl px-5 py-3 text-[0.82rem] font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)]"
                  : "bg-surface text-text hover:bg-primary-soft hover:text-primary-dark border border-border/50"
              }`}
            >
              <Iconify icon={tab.icon} width={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {viewTab === "calendar" && <CalendarView />}
          {viewTab === "learns" && <LearnsView />}
          {viewTab === "projects" && <ProjectView />}
          {viewTab === "reports" && <ReportView />}
          {viewTab === "atrisk" && <AtRiskView />}
          {viewTab === "mukafaah" && <MukafaahView />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
