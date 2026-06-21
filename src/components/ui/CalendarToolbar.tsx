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
    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#f0f4ff] via-white to-[#faf5ff] p-4 shadow-[0_2px_16px_rgba(37,99,235,0.06)] max-sm:p-3 max-sm:mb-4">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-purple-500/5 blur-2xl" />

      {loading && (
        <div className="absolute inset-x-4 top-0 h-0.5 overflow-hidden rounded-full bg-[#e2e8f0]">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
        </div>
      )}

      <div className="relative flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch max-md:gap-3">
        {/* Date + nav — first on mobile for prominence */}
        <div className="flex items-center justify-center gap-1.5 max-md:order-first md:order-2">
          <button
            type="button"
            onClick={onPrev}
            className="flex items-center justify-center rounded-lg p-1.5 text-[#94a3b8] transition-all hover:bg-[#f1f5f9] hover:text-primary active:scale-90"
            aria-label="Previous"
          >
            <Iconify icon="mingcute:left-line" width={18} />
          </button>

          <div className="min-w-[170px] px-2 text-center max-sm:min-w-[140px]">
            <h3 className="font-(--font-family-head) text-[1.05rem] font-extrabold text-[#1e293b] leading-tight tracking-tight">
              {date}
            </h3>
            {subtitle && (
              <p className="text-[0.6rem] font-bold text-[#94a3b8] tracking-wider uppercase">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onNext}
            className="flex items-center justify-center rounded-lg p-1.5 text-[#94a3b8] transition-all hover:bg-[#f1f5f9] hover:text-primary active:scale-90"
            aria-label="Next"
          >
            <Iconify icon="mingcute:right-line" width={18} />
          </button>
        </div>

        {/* View switcher */}
        <div className="inline-flex items-center gap-0.5 rounded-xl border border-[#e2e8f0] bg-white/90 p-1 shadow-sm max-md:order-2 md:order-1 max-sm:self-start">
          {viewOptions.map((opt) => {
            const active = view === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChangeView(opt.value)}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[0.72rem] font-bold whitespace-nowrap transition-all duration-200 max-sm:px-2.5 max-sm:py-1.5 ${
                  active
                    ? "bg-primary text-white shadow-[0_2px_8px_rgba(37,99,235,0.2)]"
                    : "text-[#64748b] hover:text-[#1e293b] hover:bg-[#f8fafc]"
                }`}
              >
                <Iconify icon={opt.icon} width={15} />
                <span className="max-sm:hidden">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 max-md:order-3 max-md:justify-end max-md:flex-wrap md:order-3">
          <button
            type="button"
            onClick={onToday}
            className="rounded-lg border border-[#e2e8f0] bg-white/90 px-3.5 py-2 text-[0.72rem] font-bold text-[#475569] transition-all hover:bg-[#f1f5f9] hover:text-primary active:scale-95 shadow-sm max-sm:px-3"
          >
            Hari Ini
          </button>

          {onOpenFilters && (
            <button
              type="button"
              onClick={onOpenFilters}
              className="flex items-center justify-center rounded-lg border border-[#e2e8f0] bg-white/90 p-2 text-[#94a3b8] transition-all hover:bg-[#f1f5f9] hover:text-primary active:scale-95 shadow-sm"
              aria-label="Filters"
            >
              <Iconify icon="ic:round-filter-list" width={17} />
            </button>
          )}

          {onAddEvent && (
            <button
              type="button"
              onClick={onAddEvent}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[0.72rem] font-bold text-white transition-all hover:bg-primary-dark active:scale-95 shadow-[0_2px_8px_rgba(37,99,235,0.2)] max-sm:px-3"
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
