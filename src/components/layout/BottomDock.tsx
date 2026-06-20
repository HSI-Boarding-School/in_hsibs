import { motion } from "motion/react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { Iconify } from "../iconify/iconify";
import type { NavigationItem } from "../../types";

interface BottomDockProps {
  items: NavigationItem[];
}

export function BottomDock({ items }: BottomDockProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = location.pathname.split("/").pop() || "home";

  return (
    <nav
      className="fixed bottom-[max(2rem,calc(env(safe-area-inset-bottom)+1rem))] left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-sm border border-white/80 bg-surface/90 p-3 shadow-[0_24px_70px_rgba(39,49,38,0.14)] backdrop-blur-[18px] max-sm:gap-1 max-sm:p-2"
      aria-label="Navigasi halaman"
    >
      {items.map((item) => {
        const isActive = currentTab === item.id;
        return (
          <motion.button
            key={item.id}
            aria-current={isActive ? "page" : undefined}
            type="button"
            onClick={() => navigate({ to: "/dashboard/$tab", params: { tab: item.id } })}
            className={[
              "relative flex flex-col items-center justify-center gap-1.5 rounded-sm px-6 py-3 transition-colors max-sm:gap-1 max-sm:px-3 max-sm:py-2",
              isActive ? "text-white" : "text-muted hover:text-text",
            ].join(" ")}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {isActive && (
              <motion.div
                layoutId="dock-active"
                className="absolute inset-0 rounded-sm bg-primary-dark"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <span className="relative z-10">
              <Iconify icon={item.icon} width={26} />
            </span>
            <span className="relative z-10 text-xs font-bold">
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}
