import { Iconify } from "../iconify/iconify";

export type CalendarViewOption = {
  value: string;
  label: string;
  icon: string;
};

interface CalendarToolbarProps {
  date: string;
  subtitle?: string;
  view: string;
  viewOptions: CalendarViewOption[];
  loading?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onChangeView: (view: string) => void;
  onOpenFilters?: () => void;
  onAddEvent?: () => void;
}

export function CalendarToolbar({
  date,
  subtitle,
  view,
  viewOptions,
  loading,
  onPrev,
  onNext,
  onToday,
  onChangeView,
  onOpenFilters,
  onAddEvent,
}: CalendarToolbarProps) {
  return (
    <div className="relative mb-3">
      {loading && (
        <div className="absolute inset-x-0 -top-2 h-0.5 overflow-hidden rounded-full bg-surface-strong">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
        </div>
      )}

      <div className="relative flex items-center justify-between gap-3 max-md:flex-wrap">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onPrev}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-all hover:bg-surface-strong hover:text-primary active:scale-90"
            aria-label="Previous"
          >
            <Iconify icon="mingcute:left-line" width={18} />
          </button>

          <div className="min-w-0 px-1">
            <h3 className="font-(--font-family-head) text-[1rem] font-extrabold leading-tight tracking-tight text-text">
              {date}
            </h3>
            {subtitle && (
              <p className="text-[0.6rem] font-bold text-muted tracking-wider uppercase">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onNext}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-all hover:bg-surface-strong hover:text-primary active:scale-90"
            aria-label="Next"
          >
            <Iconify icon="mingcute:right-line" width={18} />
          </button>
        </div>

        <div className="ml-auto inline-flex items-center gap-0.5 rounded-2xl border border-border bg-surface-strong/50 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] max-sm:order-2 max-sm:ml-0">
          {viewOptions.map((opt) => {
            const active = view === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChangeView(opt.value)}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-[0.72rem] font-bold whitespace-nowrap transition-all duration-200 max-sm:px-3 max-sm:py-1.5 ${
                  active
                    ? "bg-surface text-text shadow-[0_8px_20px_rgba(0,0,0,0.08)] dark:bg-bg/65"
                    : "text-muted hover:text-text"
                }`}
              >
                <Iconify icon={opt.icon} width={15} className="max-sm:hidden" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 max-md:flex-wrap max-sm:order-3 max-sm:w-full max-sm:justify-end">
          <button
            type="button"
            onClick={onToday}
            className="rounded-xl border border-border bg-surface/90 px-3.5 py-2 text-[0.72rem] font-bold text-text transition-all hover:bg-surface-strong hover:text-primary active:scale-95 max-sm:px-3"
          >
            Hari Ini
          </button>

          {onOpenFilters && (
            <button
              type="button"
              onClick={onOpenFilters}
              className="flex items-center justify-center rounded-xl border border-border bg-surface/90 p-2 text-muted transition-all hover:bg-surface-strong hover:text-primary active:scale-95"
              aria-label="Filters"
            >
              <Iconify icon="ic:round-filter-list" width={17} />
            </button>
          )}

          {onAddEvent && (
            <button
              type="button"
              onClick={onAddEvent}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[0.72rem] font-bold text-white transition-all hover:bg-primary-dark active:scale-95 shadow-[0_8px_20px_rgba(37,99,235,0.22)] max-sm:px-3"
            >
              <Iconify icon="mingcute:add-line" width={15} />
              Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
