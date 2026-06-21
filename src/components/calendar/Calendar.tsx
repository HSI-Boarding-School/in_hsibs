import { useMemo, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../iconify/iconify";
import { Scrollbar } from "../scrollbar";
import { useCalendar } from "./hooks/useCalendar";
import { CalendarToolbar } from "../ui/CalendarToolbar";
import { FilterChips } from "../ui/FilterChips";
import type { CalendarEvent, CalendarViewType } from "./types";

// ─── Constants ─────────────────────────────────────────────
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAYS_LONG = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const VIEW_OPTIONS = [
  { value: "month", label: "Bulan", icon: "mingcute:calendar-month-line" },
  { value: "week", label: "Minggu", icon: "mingcute:calendar-week-line" },
  { value: "day", label: "Hari", icon: "mingcute:calendar-day-line" },
];

const COLOR_MAP: Record<string, Record<string, string>> = {
  learn:     { scheduled: "bg-[#3b82f6]", submitted: "bg-[#3b82f6]", "due-soon": "bg-[#3b82f6]", overdue: "bg-[#3b82f6]" },
  project:   { scheduled: "bg-[#8b5cf6]", submitted: "bg-[#8b5cf6]", "due-soon": "bg-[#8b5cf6]", overdue: "bg-[#8b5cf6]" },
  report:    { scheduled: "bg-[#94a3b8]", submitted: "bg-[#22c55e]", "due-soon": "bg-[#eab308]", overdue: "bg-[#ec4899]" },
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Terjadwal", submitted: "Submitted",
  "due-soon": "Due Soon", overdue: "Overdue",
};

function evColor(ev: CalendarEvent): string {
  return COLOR_MAP[ev.type]?.[ev.status] || COLOR_MAP[ev.type]?.scheduled || "bg-[#94a3b8]";
}

function evDotColor(ev: CalendarEvent): string {
  const m: Record<string, string> = {
    "bg-[#3b82f6]": "bg-blue-500",
    "bg-[#8b5cf6]": "bg-purple-500",
    "bg-[#22c55e]": "bg-green-500",
    "bg-[#eab308]": "bg-yellow-500",
    "bg-[#ec4899]": "bg-pink-500",
    "bg-[#94a3b8]": "bg-slate-400",
  };
  return m[evColor(ev)] || "bg-slate-400";
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

// ─── Month grid ────────────────────────────────────────────
function useMonthGrid(year: number, month: number) {
  return useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ] as (number | null)[];
  }, [year, month]);
}

// ─── Event popover dot ─────────────────────────────────────
function EventDot({ event }: { event: CalendarEvent }) {
  return (
    <div className="group/dot relative inline-flex">
      <span className={`block h-2 w-2 rounded-full ${evDotColor(event)} shadow-sm ring-1 ring-white/50`} />
      <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1e293b] px-2.5 py-1.5 text-[0.65rem] font-bold text-white opacity-0 shadow-lg transition-all duration-150 group-hover/dot:opacity-100">
        <p className="max-w-[200px] truncate">{event.title}</p>
        <p className="text-[0.55rem] text-slate-300 font-medium">{STATUS_LABELS[event.status] || event.status}</p>
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1e293b]" />
      </div>
    </div>
  );
}

// ─── Day cell ──────────────────────────────────────────────
function DayCell({
  day,
  events,
  isToday,
  isSelected,
  isOutside,
  compact,
  onClick,
  onQuickAdd,
}: {
  day: number;
  events: CalendarEvent[];
  isToday: boolean;
  isSelected: boolean;
  isOutside?: boolean;
  compact?: boolean;
  onClick: () => void;
  onQuickAdd?: () => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      whileTap={{ scale: 0.97 }}
      className={`group relative flex w-full cursor-pointer flex-col items-center gap-0.5 rounded-xl text-xs transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
        compact ? "min-h-[48px] p-1" : "min-h-[72px] p-1.5 sm:min-h-[88px] sm:p-2"
      } ${
        isSelected
          ? "bg-primary/8 ring-2 ring-primary/40 shadow-[0_0_0_1px_rgba(37,99,235,0.06)]"
          : isOutside
            ? "opacity-30"
            : "hover:bg-primary/5 hover:shadow-[0_0_0_1px_rgba(37,99,235,0.04)]"
      }`}
    >
      {/* Today ring */}
      {isToday && (
        <span className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary/30 ring-offset-1 ring-offset-white" />
      )}

      <span
        className={`relative flex h-7 w-7 items-center justify-center rounded-full text-[0.75rem] font-bold transition-all ${
          isToday
            ? "bg-primary text-white shadow-[0_2px_8px_rgba(37,99,235,0.35)]"
            : isSelected
              ? "bg-primary/15 text-primary"
              : "text-[#334155] group-hover:text-primary-dark"
        }`}
      >
        {day}
      </span>

      {events.length > 0 && (
        <div className="flex w-full flex-wrap justify-center gap-1 px-0.5">
          {events.slice(0, compact ? 1 : 3).map((ev) => (
            <EventDot key={ev.id} event={ev} />
          ))}
          {!compact && events.length > 3 && (
            <span className="w-full text-center text-[0.55rem] font-bold text-[#94a3b8]">
              +{events.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Quick-add — visible on hover/focus (desktop only) */}
      {onQuickAdd && !isOutside && !compact && (
        <button
          type="button"
          aria-label={`Tambah event tanggal ${day}`}
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd();
          }}
          className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-primary/90 text-white opacity-0 shadow-[0_2px_6px_rgba(37,99,235,0.35)] transition-all duration-150 group-hover:opacity-100 group-focus-within:opacity-100 hover:scale-110 hover:bg-primary sm:flex"
        >
          <Iconify icon="mingcute:add-line" width={12} />
        </button>
      )}
    </motion.div>
  );
}

// ─── Event badge ───────────────────────────────────────────
function EventBadge({
  event,
  onClick,
  typeLabels,
  renderBadge,
}: {
  event: CalendarEvent;
  onClick?: (ev: CalendarEvent) => void;
  typeLabels?: Record<string, string>;
  renderBadge?: (ev: CalendarEvent) => string;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onClick?.(event)}
      whileTap={{ scale: 0.98 }}
      className={`group flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-150 ${
        onClick
          ? "border-[#e2e8f0] bg-white hover:border-primary/25 hover:bg-primary/[0.03] hover:shadow-[0_2px_12px_rgba(37,99,235,0.06)] cursor-pointer active:scale-[0.98]"
          : "border-[#e2e8f0] bg-white cursor-default"
      }`}
    >
      <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${evDotColor(event)} shadow-[0_0_0_2px_rgba(255,255,255,0.8)]`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#1e293b]">{event.title}</p>
        {event.subtitle && <p className="mt-0.5 text-xs text-[#64748b]">{event.subtitle}</p>}
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-[0.6rem] font-bold text-[#475569]">
            <span className={`h-1.5 w-1.5 rounded-full ${evDotColor(event)}`} />
            {typeLabels?.[event.type] || event.type}
          </span>
          <span className="text-[0.6rem] font-semibold text-[#94a3b8]">
            {STATUS_LABELS[event.status] || event.status}
          </span>
        </div>
        {renderBadge && (
          <span className="mt-1.5 block text-[0.6rem] text-[#94a3b8]">{renderBadge(event)}</span>
        )}
      </div>
    </motion.button>
  );
}

// ─── Detail panel ──────────────────────────────────────────
function DetailPanel({
  title,
  subtitle,
  events,
  onEventClick,
  onAddEvent,
  typeLabels,
  renderBadge,
}: {
  title: string;
  subtitle?: string;
  events: CalendarEvent[];
  onEventClick?: (ev: CalendarEvent) => void;
  onAddEvent?: () => void;
  typeLabels?: Record<string, string>;
  renderBadge?: (ev: CalendarEvent) => string;
}) {
  return (
    <motion.article
      layout
      className="flex flex-col rounded-2xl border border-[#e2e8f0] bg-white/80 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] max-sm:p-4"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-(--font-family-head) text-base font-extrabold text-[#1e293b] leading-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-[0.7rem] font-bold text-[#94a3b8] uppercase tracking-wider">{subtitle}</p>
          )}
        </div>
        {onAddEvent && events.length > 0 && (
          <button
            type="button"
            onClick={onAddEvent}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-[0_2px_8px_rgba(37,99,235,0.25)] transition-all hover:bg-primary-dark active:scale-95"
            title="Tambah event di tanggal ini"
            aria-label="Tambah event"
          >
            <Iconify icon="mingcute:add-line" width={16} />
          </button>
        )}
      </div>

      <Scrollbar className="flex-1 -mr-1 pr-1 max-h-[520px]">
        <AnimatePresence mode="popLayout">
          {events.length > 0 ? (
            <motion.div layout className="grid gap-2" key="events">
              {events.map((ev) => (
                <motion.div
                  key={ev.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <EventBadge
                    event={ev}
                    onClick={onEventClick}
                    typeLabels={typeLabels}
                    renderBadge={renderBadge}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e2e8f0] py-14"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8fafc]">
                <Iconify icon="solar:calendar-mark-bold-duotone" width={24} className="text-[#94a3b8]" />
              </div>
              <p className="mt-3 text-sm font-medium text-[#94a3b8]">Belum ada event</p>
              <p className="mt-1 text-[0.7rem] text-[#cbd5e1]">Tambah event di tanggal ini</p>
              {onAddEvent && (
                <button
                  type="button"
                  onClick={onAddEvent}
                  className="mt-4 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-[0.75rem] font-bold text-white transition-all hover:bg-primary-dark active:scale-95 shadow-[0_2px_8px_rgba(37,99,235,0.2)]"
                >
                  <Iconify icon="mingcute:add-line" width={16} />
                  Tambah Event
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Scrollbar>
    </motion.article>
  );
}

// ─── Props ─────────────────────────────────────────────────
interface CalendarProps {
  events: CalendarEvent[];
  loading?: boolean;
  onAddEvent?: (dateStr?: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
  renderEventBadge?: (event: CalendarEvent) => string;
  typeLabels?: Record<string, string>;
  filters?: { colors: string[]; startDate: string | null; endDate: string | null };
  onFilterChange?: (f: { colors: string[]; startDate: string | null; endDate: string | null }) => void;
  filterContent?: ReactNode;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
export function Calendar({
  events,
  loading,
  onAddEvent,
  onEventClick,
  renderEventBadge,
  typeLabels,
  filters,
  onFilterChange,
  filterContent,
}: CalendarProps) {
  const cal = useCalendar();
  const monthCells = useMonthGrid(cal.year, cal.month);
  const today = new Date();

  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((ev) => {
      const key = ev.date;
      const existing = map.get(key) || [];
      existing.push(ev);
      map.set(key, existing);
    });
    return map;
  }, [events]);

  const getEventsForDay = useCallback(
    (y: number, m: number, d: number): CalendarEvent[] =>
      eventMap.get(formatDateKey(y, m, d)) || [],
    [eventMap],
  );

  const handleWeekDayClick = useCallback(
    (dayNum: number, monthNum: number, yearNum: number) => {
      if (monthNum !== cal.month || yearNum !== cal.year) {
        cal.setMonth(monthNum);
        cal.setYear(yearNum);
      }
      cal.selectDay(dayNum);
    },
    [cal.month, cal.year],
  );

  // ── Toolbar ──────────────────────────────────────────────
  const toolbarTitle =
    cal.view === "month"
      ? `${MONTHS_LONG[cal.month]} ${cal.year}`
      : cal.view === "week"
        ? (() => {
            const s = cal.weekDays[0];
            const e = cal.weekDays[6];
            return s.getMonth() === e.getMonth()
              ? `${s.getDate()} – ${e.getDate()} ${MONTHS_LONG[s.getMonth()]} ${s.getFullYear()}`
              : `${s.getDate()} ${MONTHS_SHORT[s.getMonth()]} – ${e.getDate()} ${MONTHS_SHORT[e.getMonth()]} ${s.getFullYear()}`;
          })()
        : `${cal.selectedDay} ${MONTHS_LONG[cal.month]} ${cal.year}`;

  const toolbarSub =
    cal.view === "day" && cal.selectedDay !== null
      ? DAYS_LONG[new Date(cal.year, cal.month, cal.selectedDay).getDay()]
      : undefined;

  // ── Filters ──────────────────────────────────────────────
  const activeChips = filters
    ? [
        ...filters.colors.map((c) => ({
          key: `color-${c}`,
          label: (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c }} />
              {c}
            </span>
          ),
          onRemove: () =>
            onFilterChange?.({ ...filters!, colors: filters!.colors.filter((x) => x !== c) }),
        })),
        ...(filters.startDate && filters.endDate
          ? [{
              key: "date",
              label: `${filters.startDate} – ${filters.endDate}`,
              onRemove: () => onFilterChange?.({ ...filters!, startDate: null, endDate: null }),
            }]
          : []),
      ]
    : [];

  const hasFilters = activeChips.length > 0;

  // ── Detail ───────────────────────────────────────────────
  const detailEvents = cal.selectedDateStr
    ? events.filter((ev) => ev.date === cal.selectedDateStr)
    : [];

  const detailTitle =
    cal.selectedDay !== null
      ? `${cal.selectedDay} ${MONTHS_SHORT[cal.month]} ${cal.year}`
      : "Pilih tanggal";

  const detailSub =
    cal.selectedDay !== null
      ? DAYS_LONG[new Date(cal.year, cal.month, cal.selectedDay).getDay()]
      : undefined;

  // ═════════════════════════════════════════════════════════
  // VIEWS
  // ═════════════════════════════════════════════════════════

  function renderDayView() {
    if (cal.selectedDay === null) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f8fafc]">
            <Iconify icon="solar:calendar-mark-bold-duotone" width={32} className="text-[#cbd5e1]" />
          </div>
          <p className="mt-4 text-sm font-medium text-[#94a3b8]">Pilih tanggal untuk melihat event</p>
        </div>
      );
    }

    const dayEvts = getEventsForDay(cal.year, cal.month, cal.selectedDay);
    const dayDate = new Date(cal.year, cal.month, cal.selectedDay);

    return (
      <motion.div
        key="day"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="grid gap-4"
      >
        {/* Day hero */}
        <motion.div
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-5 shadow-[0_8px_24px_rgba(37,99,235,0.2)]"
        >
          <div className="absolute right-4 top-4 text-white/10">
            <Iconify icon="solar:calendar-mark-bold-duotone" width={64} />
          </div>
          <div className="relative">
            <div className="flex items-end gap-4">
              <span className="font-(--font-family-head) text-5xl font-black text-white drop-shadow-sm leading-none">
                {cal.selectedDay}
              </span>
              <div className="pb-0.5">
                <p className="text-sm font-bold text-white/80">
                  {DAYS_LONG[dayDate.getDay()]}
                </p>
                <p className="text-[0.7rem] font-semibold text-white/60">
                  {MONTHS_LONG[cal.month]} {cal.year}
                </p>
              </div>
              <div className="ml-auto self-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-[0.7rem] font-bold text-white backdrop-blur-sm">
                  <Iconify icon="solar:users-group-rounded-bold-duotone" width={14} />
                  {dayEvts.length} events
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {dayEvts.length > 0 ? (
            <div className="grid gap-2">
              {dayEvts.map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.04, duration: 0.2 }}
                >
                  <EventBadge
                    event={ev}
                    onClick={onEventClick}
                    typeLabels={typeLabels}
                    renderBadge={renderEventBadge}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e2e8f0] py-14">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8fafc]">
                <Iconify icon="solar:calendar-mark-bold-duotone" width={24} className="text-[#94a3b8]" />
              </div>
              <p className="mt-3 text-sm font-medium text-[#94a3b8]">Tidak ada event di tanggal ini</p>
              {onAddEvent && (
                <button
                  type="button"
                  onClick={() => onAddEvent(cal.selectedDateStr ?? undefined)}
                  className="mt-4 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-[0.75rem] font-bold text-white transition-all hover:bg-primary-dark active:scale-95 shadow-[0_2px_8px_rgba(37,99,235,0.2)]"
                >
                  <Iconify icon="mingcute:add-line" width={16} />
                  Tambah Event
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  function renderWeekView() {
    return (
      <motion.div
        key="week"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="mb-3 grid grid-cols-7 gap-1">
          {DAYS_SHORT.map((d) => (
            <span
              key={d}
              className="py-2 text-center text-[0.6rem] font-black uppercase tracking-widest text-[#94a3b8]"
            >
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cal.weekDays.map((d) => {
            const dayNum = d.getDate();
            const monthNum = d.getMonth();
            const yearNum = d.getFullYear();
            return (
              <DayCell
                key={d.toISOString()}
                day={dayNum}
                events={getEventsForDay(yearNum, monthNum, dayNum)}
                isToday={isSameDay(d, today)}
                isSelected={dayNum === cal.selectedDay && monthNum === cal.month && yearNum === cal.year}
                isOutside={monthNum !== cal.month}
                onClick={() => handleWeekDayClick(dayNum, monthNum, yearNum)}
                onQuickAdd={
                  onAddEvent
                    ? () => onAddEvent(formatDateKey(yearNum, monthNum, dayNum))
                    : undefined
                }
                compact
              />
            );
          })}
        </div>
      </motion.div>
    );
  }

  function renderMonthView() {
    return (
      <motion.div
        key="month"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="mb-3 grid grid-cols-7 gap-1">
          {DAYS_SHORT.map((d) => (
            <span
              key={d}
              className="py-2.5 text-center text-[0.6rem] font-black uppercase tracking-widest text-[#94a3b8]"
            >
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {monthCells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;
            return (
              <DayCell
                key={formatDateKey(cal.year, cal.month, day)}
                day={day}
                events={getEventsForDay(cal.year, cal.month, day)}
                isToday={
                  day === today.getDate() &&
                  cal.month === today.getMonth() &&
                  cal.year === today.getFullYear()
                }
                isSelected={day === cal.selectedDay}
                onClick={() => cal.selectDay(day)}
                onQuickAdd={
                  onAddEvent
                    ? () => onAddEvent(formatDateKey(cal.year, cal.month, day))
                    : undefined
                }
              />
            );
          })}
        </div>
      </motion.div>
    );
  }

  // ═════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════
  return (
    <div className="grid grid-cols-[1fr_340px] gap-5 max-lg:grid-cols-1">
      <motion.article
        layout
        className="rounded-2xl border border-[#e2e8f0] bg-white/80 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] max-sm:p-3"
      >
        <CalendarToolbar
          date={toolbarTitle}
          subtitle={toolbarSub}
          view={cal.view}
          viewOptions={VIEW_OPTIONS}
          loading={loading}
          onPrev={cal.goPrev}
          onNext={cal.goNext}
          onToday={cal.goToday}
          onChangeView={(v) => cal.changeView(v as CalendarViewType)}
          onOpenFilters={filterContent ? cal.toggleFilters : undefined}
          onAddEvent={
            onAddEvent
              ? () => onAddEvent(cal.selectedDateStr ?? undefined)
              : undefined
          }
        />

        {hasFilters && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <FilterChips
              chips={activeChips}
              totalResults={events.length}
              onResetAll={() => onFilterChange?.({ colors: [], startDate: null, endDate: null })}
            />
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {cal.view === "month" && renderMonthView()}
          {cal.view === "week" && renderWeekView()}
          {cal.view === "day" && renderDayView()}
        </AnimatePresence>
      </motion.article>

      <DetailPanel
        title={detailTitle}
        subtitle={detailSub}
        events={detailEvents}
        onEventClick={onEventClick}
        onAddEvent={onAddEvent ? () => onAddEvent(cal.selectedDateStr ?? undefined) : undefined}
        typeLabels={typeLabels}
        renderBadge={renderEventBadge}
      />
    </div>
  );
}