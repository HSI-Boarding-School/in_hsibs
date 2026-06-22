import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../iconify/iconify";

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  align?: "left" | "right";
  className?: string;
  id?: string;
  min?: string;
  max?: string;
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseKey(key: string): { year: number; month: number; day: number } | null {
  if (!key) return null;
  const m = key.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { year: +m[1], month: +m[2] - 1, day: +m[3] };
}

function formatDisplay(key: string): string {
  const p = parseKey(key);
  if (!p) return "";
  const d = new Date(p.year, p.month, p.day);
  const weekday = d.toLocaleDateString("id-ID", { weekday: "short" });
  return `${weekday}, ${p.day} ${MONTHS[p.month].slice(0, 3)} ${p.year}`;
}

export function CustomDatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  disabled,
  align = "left",
  className = "",
  id,
  min,
  max,
}: CustomDatePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const initial = parseKey(value) ?? (() => {
    const t = new Date();
    return { year: t.getFullYear(), month: t.getMonth(), day: t.getDate() };
  })();

  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  // Sync calendar view when external value changes
  useEffect(() => {
    const p = parseKey(value);
    if (p) {
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const today = new Date();
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  const minDate = useMemo(() => parseKey(min ?? ""), [min]);
  const maxDate = useMemo(() => parseKey(max ?? ""), [max]);

  const grid = useMemo(() => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    return [
      ...Array(firstWeekday).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ] as (number | null)[];
  }, [viewYear, viewMonth]);

  function goPrev() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNext() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function goToday() {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    onChange(toKey(t.getFullYear(), t.getMonth(), t.getDate()));
    setOpen(false);
  }

  function pick(day: number) {
    onChange(toKey(viewYear, viewMonth, day));
    setOpen(false);
  }

  function isDisabledDay(day: number) {
    const k = toKey(viewYear, viewMonth, day);
    if (minDate) {
      const minK = toKey(minDate.year, minDate.month, minDate.day);
      if (k < minK) return true;
    }
    if (maxDate) {
      const maxK = toKey(maxDate.year, maxDate.month, maxDate.day);
      if (k > maxK) return true;
    }
    return false;
  }

  const selectedKey = value;
  const display = formatDisplay(value);

  return (
    <div
      ref={wrapperRef}
      className={`relative inline-block ${className}`}
    >
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-2 rounded-lg border bg-surface px-3 py-2 text-left text-[0.8rem] font-bold text-text transition-all ${
          disabled
            ? "cursor-not-allowed border-border/40 opacity-50"
            : open
              ? "border-primary/50 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
              : "border-border/60 hover:border-primary/30 hover:bg-surface-strong/40"
        }`}
      >
        <Iconify
          icon="solar:calendar-bold-duotone"
          width={14}
          className="shrink-0 text-primary/70"
        />
        <span
          className={`min-w-0 flex-1 truncate ${
            value ? "text-text" : "text-muted/60 font-semibold"
          }`}
        >
          {display || placeholder}
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
            className={`absolute z-50 mt-1.5 w-[300px] overflow-hidden rounded-2xl border border-border/60 bg-surface p-3 shadow-[0_18px_44px_rgba(39,49,38,0.16)] backdrop-blur-md ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={goPrev}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-strong hover:text-primary-dark"
                aria-label="Bulan sebelumnya"
              >
                <Iconify icon="mingcute:left-line" width={15} />
              </button>
              <div className="min-w-0 flex-1 text-center">
                <div className="font-(--font-family-head) text-sm font-extrabold text-primary-dark">
                  {MONTHS[viewMonth]} {viewYear}
                </div>
              </div>
              <button
                type="button"
                onClick={goNext}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-strong hover:text-primary-dark"
                aria-label="Bulan berikutnya"
              >
                <Iconify icon="mingcute:right-line" width={15} />
              </button>
            </div>

            {/* Day labels */}
            <div className="mb-1 grid grid-cols-7 gap-0.5">
              {DAYS_SHORT.map((d) => (
                <div
                  key={d}
                  className="py-1 text-center text-[0.55rem] font-extrabold uppercase tracking-wider text-muted/70"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {grid.map((day, i) => {
                if (day === null) return <div key={`e-${i}`} className="h-8" />;
                const k = toKey(viewYear, viewMonth, day);
                const isSelected = k === selectedKey;
                const isToday = k === todayKey;
                const isDisabledDate = isDisabledDay(day);
                return (
                  <button
                    key={k}
                    type="button"
                    disabled={isDisabledDate}
                    onClick={() => pick(day)}
                    className={`relative flex h-8 items-center justify-center rounded-lg text-[0.72rem] font-bold transition-all ${
                      isDisabledDate
                        ? "cursor-not-allowed text-muted/30"
                        : isSelected
                          ? "bg-primary text-white shadow-[0_4px_10px_rgba(37,99,235,0.3)]"
                          : isToday
                            ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                            : "text-text hover:bg-surface-strong"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/40 pt-2">
              <button
                type="button"
                onClick={goToday}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[0.65rem] font-bold text-primary transition-colors hover:bg-primary-soft/50"
              >
                <Iconify icon="solar:calendar-mark-bold-duotone" width={12} />
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1.5 text-[0.65rem] font-bold text-muted transition-colors hover:bg-surface-strong hover:text-text"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
