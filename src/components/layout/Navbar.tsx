import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../iconify/iconify";
import { useTheme } from "../../lib/theme";
import type { Session } from "../../types";

interface NavbarProps {
  onLogout: () => void;
  user: Session;
}

function Avatar({ user }: { user: Session }) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.roleLabel}
        className="h-9 w-9 rounded-full object-cover ring-2 ring-white dark:ring-border"
      />
    );
  }
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-dark text-sm font-black text-white ring-2 ring-white dark:ring-border">
      {user.roleLabel.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function Navbar({ onLogout, user }: NavbarProps) {
  const [showProfile, setShowProfile] = useState(false);
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="flex items-center justify-between gap-4 rounded-sm border border-white/80 bg-surface/80 px-5 py-3 shadow-[0_14px_40px_rgba(39,49,38,0.08)] backdrop-blur-sm dark:bg-surface/72 dark:shadow-[0_18px_54px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div>
        <label className="flex cursor-text items-center gap-2.5 rounded-sm border border-border bg-surface-strong px-4 py-3 transition-[border-color,box-shadow] duration-150 focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]">
          <Iconify
            icon="solar:magnifer-bold-duotone"
            width={17}
            className="shrink-0 text-muted"
          />
          <input
            className="w-44 border-0 bg-transparent text-sm text-text outline-none placeholder:text-muted/60 max-sm:w-28"
            placeholder="Cari..."
          />
          <kbd className="hidden rounded border border-border bg-surface px-1.5 py-0.5 text-[0.65rem] font-bold text-muted sm:inline">
            ⌘K
          </kbd>
        </label>
      </div>

      {/* Right — search + notif + profile */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          type="button"
          aria-label={isDark ? "Aktifkan light mode" : "Aktifkan dark mode"}
          aria-pressed={isDark}
          onClick={toggle}
          className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-strong text-muted transition-colors hover:border-primary/30 hover:bg-primary-soft/35 hover:text-primary-dark"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDark ? "moon" : "sun"}
              initial={{ y: -12, opacity: 0, rotate: -45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 12, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Iconify
                icon={
                  isDark
                    ? "solar:moon-bold-duotone"
                    : "solar:sun-2-bold-duotone"
                }
                width={20}
              />
            </motion.span>
          </AnimatePresence>
        </button>

        {/* Notification bell */}
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface-strong text-muted transition-colors hover:border-primary/30 hover:bg-primary-soft/35 hover:text-primary-dark"
        >
          <Iconify icon="solar:bell-bold-duotone" width={22} />
          {/* Unread dot */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange ring-2 ring-surface" />
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            type="button"
            aria-label="Profil"
            className="flex items-center gap-2 rounded-lg border border-border bg-surface-strong px-2 py-1.5 transition-colors hover:border-primary/30 hover:bg-primary-soft/25"
            onClick={() => setShowProfile((v) => !v)}
          >
            <Avatar user={user} />
            <span className="max-w-[80px] truncate text-sm font-bold text-text max-sm:hidden">
              {user.roleLabel}
            </span>
          </button>

          <AnimatePresence>
            {showProfile && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfile(false)}
                />
                <motion.div
                  className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[200px] rounded-xl border border-white/80 bg-surface/95 p-1.5 shadow-[0_16px_48px_rgba(39,49,38,0.16)] backdrop-blur-[18px] dark:bg-surface/92 dark:shadow-[0_22px_60px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.04)]"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 rounded-lg bg-surface-strong px-3 py-2.5 mb-1">
                    <Avatar user={user} />
                    <div className="min-w-0">
                      <strong className="block truncate text-sm text-primary-dark">
                        {user.roleLabel}
                      </strong>
                      <span className="block text-xs text-muted">
                        ID: {user.userId}
                      </span>
                    </div>
                  </div>

                  {/* Menu items */}
                  {[{ label: "Profil Saya" }, { label: "Pengaturan" }].map(
                    (item) => (
                      <button
                        key={item.label}
                        type="button"
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-text transition-colors hover:bg-surface-strong"
                      >
                        {item.label}
                      </button>
                    ),
                  )}

                  <div className="my-1 border-t border-border" />

                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-orange transition-colors hover:bg-orange/10"
                    onClick={onLogout}
                  >
                    Keluar
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
