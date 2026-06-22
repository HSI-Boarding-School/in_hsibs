import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../iconify/iconify";

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: string;
  disabled?: boolean;
  align?: "left" | "right";
  width?: string;
  className?: string;
  id?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  icon,
  disabled,
  align = "left",
  width,
  className = "",
  id,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function handleSelect(v: string) {
    onChange(v);
    setOpen(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
    }
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={`relative inline-block ${className}`}
      style={width ? { width } : undefined}
    >
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center gap-2 rounded-lg border bg-surface px-3 py-2 text-left text-[0.8rem] font-bold text-text transition-all dark:bg-surface/85 ${
          disabled
            ? "cursor-not-allowed border-border/40 opacity-50"
            : open
              ? "border-primary/50 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
              : "border-border/60 hover:border-primary/30 hover:bg-surface-strong/40"
        }`}
      >
        {icon && (
          <Iconify
            icon={icon}
            width={14}
            className="shrink-0 text-primary/70"
          />
        )}
        {selected?.icon && !icon && (
          <Iconify
            icon={selected.icon}
            width={14}
            className="shrink-0 text-primary/70"
          />
        )}
        <span
          className={`min-w-0 flex-1 truncate ${
            selected ? "text-text" : "text-muted/60 font-semibold"
          }`}
        >
          {selected?.label ?? placeholder}
        </span>
        <Iconify
          icon="solar:alt-arrow-down-bold-duotone"
          width={12}
          className={`shrink-0 text-muted transition-transform duration-200 ${
            open ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            role="listbox"
            className={`absolute z-50 mt-1.5 min-w-full max-w-[280px] overflow-hidden rounded-xl border border-border/60 bg-surface shadow-[0_18px_44px_rgba(39,49,38,0.16)] backdrop-blur-md dark:bg-surface/96 dark:shadow-[0_22px_60px_rgba(0,0,0,0.44),inset_0_1px_0_rgba(255,255,255,0.04)] ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            <ul className="max-h-[260px] overflow-y-auto scrollbar-v-thin py-1">
              {options.map((opt) => {
                const isActive = opt.value === value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      disabled={opt.disabled}
                      onClick={() => !opt.disabled && handleSelect(opt.value)}
                      className={`flex w-full items-start gap-2 px-3 py-2 text-left text-[0.78rem] transition-colors ${
                        opt.disabled
                          ? "cursor-not-allowed text-muted/40"
                          : isActive
                            ? "bg-primary-soft/60 text-primary-dark"
                            : "text-text hover:bg-surface-strong/60"
                      }`}
                    >
                      {opt.icon && (
                        <Iconify
                          icon={opt.icon}
                          width={14}
                          className={`mt-0.5 shrink-0 ${
                            isActive ? "text-primary" : "text-muted/70"
                          }`}
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold leading-snug">{opt.label}</span>
                        {opt.description && (
                          <span className="block text-[0.65rem] font-medium text-muted">
                            {opt.description}
                          </span>
                        )}
                      </span>
                      {isActive && (
                        <Iconify
                          icon="solar:check-circle-bold-duotone"
                          width={14}
                          className="mt-0.5 shrink-0 text-primary"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
