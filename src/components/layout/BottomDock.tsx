import { useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { Iconify } from "../iconify/iconify";
import type { NavigationItem } from "../../types";

interface BottomDockProps {
  items: NavigationItem[];
}

export function BottomDock({ items }: BottomDockProps) {
  return (
    <>
      <DesktopDock items={items} />
      <MobileDock items={items} />
    </>
  );
}

function DesktopDock({ items }: BottomDockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.nav
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="fixed bottom-[max(2rem,calc(env(safe-area-inset-bottom)+1rem))] left-1/2 z-30 hidden -translate-x-1/2 items-end gap-3 rounded-full border border-white/80 bg-surface/75 px-4 pb-3 pt-3 shadow-[0_18px_60px_rgba(39,49,38,0.18),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-[22px] md:flex dark:bg-surface/72 dark:shadow-[0_24px_70px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.06)]"
      aria-label="Navigasi halaman"
    >
      {items.map((item) => (
        <DockIcon key={item.id} item={item} mouseX={mouseX} />
      ))}
    </motion.nav>
  );
}

function DockIcon({
  item,
  mouseX,
}: {
  item: NavigationItem;
  mouseX: MotionValue<number>;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);

  const currentTab = location.pathname.split("/").pop() || "home";
  const isActive = currentTab === item.id;

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const sizeTransform = useTransform(distance, [-150, 0, 150], [48, 72, 48]);
  const iconTransform = useTransform(distance, [-150, 0, 150], [22, 32, 22]);
  const yTransform = useTransform(distance, [-150, 0, 150], [0, -8, 0]);

  const size = useSpring(sizeTransform, { mass: 0.12, stiffness: 170, damping: 16 });
  const iconSize = useSpring(iconTransform, { mass: 0.12, stiffness: 170, damping: 16 });
  const y = useSpring(yTransform, { mass: 0.12, stiffness: 170, damping: 16 });

  return (
    <motion.button
      ref={ref}
      type="button"
      aria-current={isActive ? "page" : undefined}
      aria-label={item.label}
      onClick={() => navigate({ to: "/dashboard/$tab", params: { tab: item.id } })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: size, height: size, y }}
      className={`relative flex aspect-square items-center justify-center rounded-full transition-colors duration-200 ${
        isActive
          ? "bg-primary-dark text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_10px_28px_rgba(30,58,138,0.25)]"
          : "bg-white/45 text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] hover:bg-white/75 hover:text-primary-dark dark:bg-surface-strong/70 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:hover:bg-primary-soft/45"
      }`}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 4, x: "-50%" }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute -top-9 left-1/2 whitespace-nowrap rounded-lg bg-primary-dark/90 px-2.5 py-1 text-[0.7rem] font-bold text-white shadow-[0_8px_24px_rgba(30,58,138,0.24)] backdrop-blur-md"
          >
            {item.label}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.span
        style={{ width: iconSize, height: iconSize }}
        className="relative z-10 flex items-center justify-center"
      >
        <Iconify icon={item.icon} width={30} />
      </motion.span>

      {isActive && (
        <motion.span
          layoutId="desktop-dock-dot"
          className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-primary-soft ring-2 ring-primary-dark"
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        />
      )}
    </motion.button>
  );
}

function MobileDock({ items }: BottomDockProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = location.pathname.split("/").pop() || "home";

  return (
    <nav
      className="fixed bottom-[max(1rem,calc(env(safe-area-inset-bottom)+0.75rem))] left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-[440px] -translate-x-1/2 items-center justify-around rounded-full border border-white/80 bg-surface/82 px-2 py-2 shadow-[0_14px_44px_rgba(39,49,38,0.18),inset_0_1px_0_rgba(255,255,255,0.68)] backdrop-blur-[22px] md:hidden dark:bg-surface/76 dark:shadow-[0_20px_58px_rgba(0,0,0,0.44),inset_0_1px_0_rgba(255,255,255,0.06)]"
      aria-label="Navigasi halaman"
    >
      {items.map((item) => {
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => navigate({ to: "/dashboard/$tab", params: { tab: item.id } })}
            className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-2 py-1.5 transition-colors duration-200 ${
              isActive ? "text-white" : "text-muted hover:text-primary-dark"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="mobile-dock-active"
                className="absolute inset-0 rounded-full bg-primary-dark shadow-[0_8px_18px_rgba(30,58,138,0.24)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10 flex h-5 w-5 items-center justify-center">
              <Iconify icon={item.icon} width={20} />
            </span>
            <span className="relative z-10 max-w-full truncate text-[0.6rem] font-bold leading-none">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
