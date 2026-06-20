import { Iconify } from "../../../../components/iconify/iconify";
import { units, divisions, locations } from "../../../../data/santriData";
import { getDivColor } from "../../../../data/santriData";

export interface FilterState {
  search: string;
  unit: string[];
  div: string[];
  loc: string[];
  status: string[];
}

interface MappingToolbarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  resultCount: number;
}

export const statusOptions = ["Active", "On Hold", "Inactive", "Alumni"];

const unitChipTheme: Record<string, { active: string; idle: string }> = {
  "HSI BS": {
    active: "bg-blue-500 text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)]",
    idle: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-100",
  },
  "HSI BO": {
    active: "bg-purple-500 text-white shadow-[0_4px_10px_rgba(168,85,247,0.3)]",
    idle: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200 hover:bg-purple-100",
  },
  "STIT Riyadh": {
    active: "bg-emerald-500 text-white shadow-[0_4px_10px_rgba(16,185,129,0.3)]",
    idle: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 hover:bg-emerald-100",
  },
};

const statusDot: Record<string, string> = {
  Active: "bg-green-500",
  "On Hold": "bg-amber-500",
  Inactive: "bg-gray-400",
  Alumni: "bg-gray-400",
};

const divLabelMap = new Map(divisions.map((d) => [d.code, d.label]));

export function MappingToolbar({ filters, onFilterChange, resultCount }: MappingToolbarProps) {
  function toggle(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  }

  const activeFilterCount =
    filters.unit.length +
    filters.div.length +
    filters.loc.length +
    filters.status.length;
  const hasActiveFilters = activeFilterCount > 0;
  const hasSearch = filters.search.length > 0;

  function clearAll() {
    onFilterChange({ search: "", unit: [], div: [], loc: [], status: [] });
  }

  function clearGroup(key: keyof Omit<FilterState, "search">) {
    onFilterChange({ ...filters, [key]: [] });
  }

  return (
    <aside className="w-72 shrink-0 max-lg:w-full">
      <div
        className="overflow-hidden rounded-2xl border border-white/80 bg-surface/90 shadow-[0_14px_40px_rgba(39,49,38,0.08)]"
        style={{ position: "sticky", top: "calc(1.5rem + 64px + 1.5rem)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-border/50 bg-gradient-to-b from-surface to-surface/80 px-4 py-3.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Iconify icon="solar:tuning-2-bold-duotone" width={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-(--font-family-head) text-[0.85rem] font-extrabold leading-none text-primary-dark">
              Filters
            </p>
            <p className="mt-0.5 text-[0.65rem] text-muted">
              <strong className="text-text">{resultCount}</strong> santri ditampilkan
            </p>
          </div>
          {(hasActiveFilters || hasSearch) && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[0.65rem] font-bold text-muted transition-colors hover:bg-surface-strong hover:text-primary"
              title="Reset semua filter"
            >
              <Iconify icon="solar:restart-bold" width={12} />
              Reset
            </button>
          )}
        </div>

        <div className="grid gap-4 p-4">
          {/* Search */}
          <div className="group flex items-center gap-2 rounded-lg bg-surface-strong/70 px-3 py-2.5 ring-1 ring-inset ring-transparent transition-all duration-150 focus-within:bg-surface focus-within:ring-primary/40 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]">
            <Iconify
              icon="solar:magnifer-bold-duotone"
              width={15}
              className="shrink-0 text-muted/70 transition-colors group-focus-within:text-primary"
            />
            <input
              className="flex-1 border-0 bg-transparent text-[0.8rem] text-text outline-none placeholder:text-muted/50"
              placeholder="Cari nama atau ID..."
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            />
            {hasSearch && (
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, search: "" })}
                className="text-muted/70 transition-colors hover:text-text"
                aria-label="Clear search"
              >
                <Iconify icon="solar:close-circle-bold-duotone" width={14} />
              </button>
            )}
          </div>

          {/* Active filters strip */}
          {hasActiveFilters && (
            <div className="rounded-lg border border-primary/15 bg-primary-soft/40 p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[0.6rem] font-bold uppercase tracking-wider text-primary-dark">
                  Aktif · {activeFilterCount}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {filters.unit.map((v) => (
                  <ActiveChip
                    key={`u-${v}`}
                    label={v === "STIT Riyadh" ? "STIT" : v}
                    onRemove={() => onFilterChange({ ...filters, unit: filters.unit.filter((x) => x !== v) })}
                  />
                ))}
                {filters.div.map((v) => (
                  <ActiveChip
                    key={`d-${v}`}
                    label={v}
                    onRemove={() => onFilterChange({ ...filters, div: filters.div.filter((x) => x !== v) })}
                  />
                ))}
                {filters.loc.map((v) => (
                  <ActiveChip
                    key={`l-${v}`}
                    label={v}
                    onRemove={() => onFilterChange({ ...filters, loc: filters.loc.filter((x) => x !== v) })}
                  />
                ))}
                {filters.status.map((v) => (
                  <ActiveChip
                    key={`s-${v}`}
                    label={v}
                    onRemove={() => onFilterChange({ ...filters, status: filters.status.filter((x) => x !== v) })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Filter groups */}
          <div className="grid gap-4">
            <FilterGroup
              label="Unit"
              icon="solar:shop-2-bold-duotone"
              count={filters.unit.length}
              onClear={() => clearGroup("unit")}
            >
              {[...units].map((opt) => {
                const isActive = filters.unit.includes(opt);
                const theme = unitChipTheme[opt];
                return (
                  <Chip
                    key={opt}
                    active={isActive}
                    onClick={() =>
                      onFilterChange({ ...filters, unit: toggle(filters.unit, opt) })
                    }
                    activeCls={theme?.active}
                    idleCls={theme?.idle}
                  >
                    {opt === "STIT Riyadh" ? "STIT" : opt}
                  </Chip>
                );
              })}
            </FilterGroup>

            <FilterGroup
              label="Divisi"
              icon="solar:widget-4-bold-duotone"
              count={filters.div.length}
              onClear={() => clearGroup("div")}
            >
              {divisions.map((d) => {
                const isActive = filters.div.includes(d.code);
                return (
                  <Chip
                    key={d.code}
                    active={isActive}
                    onClick={() =>
                      onFilterChange({ ...filters, div: toggle(filters.div, d.code) })
                    }
                    activeCls="bg-primary text-white shadow-[0_4px_10px_rgba(37,99,235,0.25)]"
                    idleCls={`${getDivColor(d.code)} ring-1 ring-inset ring-black/[0.04] hover:brightness-95`}
                    title={divLabelMap.get(d.code) ?? d.code}
                  >
                    {d.code}
                  </Chip>
                );
              })}
            </FilterGroup>

            <FilterGroup
              label="Lokasi"
              icon="solar:map-point-wave-bold-duotone"
              count={filters.loc.length}
              onClear={() => clearGroup("loc")}
            >
              {locations.map((opt) => {
                const isActive = filters.loc.includes(opt);
                return (
                  <Chip
                    key={opt}
                    active={isActive}
                    onClick={() =>
                      onFilterChange({ ...filters, loc: toggle(filters.loc, opt) })
                    }
                  >
                    {opt}
                  </Chip>
                );
              })}
            </FilterGroup>

            <FilterGroup
              label="Status"
              icon="solar:pulse-bold-duotone"
              count={filters.status.length}
              onClear={() => clearGroup("status")}
            >
              {statusOptions.map((opt) => {
                const isActive = filters.status.includes(opt);
                return (
                  <Chip
                    key={opt}
                    active={isActive}
                    onClick={() =>
                      onFilterChange({ ...filters, status: toggle(filters.status, opt) })
                    }
                  >
                    <span
                      className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${statusDot[opt] ?? "bg-gray-400"}`}
                      aria-hidden
                    />
                    {opt}
                  </Chip>
                );
              })}
            </FilterGroup>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface FilterGroupProps {
  label: string;
  icon: string;
  count: number;
  onClear: () => void;
  children: React.ReactNode;
}

function FilterGroup({ label, icon, count, onClear, children }: FilterGroupProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <Iconify icon={icon} width={13} className="text-primary/60" />
        <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-text">
          {label}
        </span>
        {count > 0 && (
          <>
            <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[0.55rem] font-bold text-white">
              {count}
            </span>
            <button
              type="button"
              onClick={onClear}
              className="ml-auto text-[0.6rem] font-bold text-muted transition-colors hover:text-primary"
              title={`Reset ${label}`}
            >
              Clear
            </button>
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  activeCls?: string;
  idleCls?: string;
  title?: string;
}

function Chip({
  active,
  onClick,
  children,
  activeCls = "bg-primary text-white shadow-[0_4px_10px_rgba(37,99,235,0.25)]",
  idleCls = "bg-surface-strong text-muted hover:bg-primary-soft hover:text-primary-dark",
  title,
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`inline-flex items-center rounded-lg px-2.5 py-1.5 text-[0.7rem] font-bold transition-all duration-150 ${
        active ? activeCls : idleCls
      }`}
    >
      {children}
    </button>
  );
}

interface ActiveChipProps {
  label: string;
  onRemove: () => void;
}

function ActiveChip({ label, onRemove }: ActiveChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-0.5 text-[0.65rem] font-bold text-text shadow-[0_1px_2px_rgba(39,49,38,0.06)] ring-1 ring-inset ring-border/60">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="-mr-1 flex h-4 w-4 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-strong hover:text-primary"
        aria-label={`Remove ${label}`}
      >
        <Iconify icon="mingcute:close-line" width={11} />
      </button>
    </span>
  );
}
