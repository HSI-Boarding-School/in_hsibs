import { type ReactNode } from "react";
import { Iconify } from "../iconify/iconify";

interface Chip {
  key: string;
  label: ReactNode;
  onRemove: () => void;
}

interface FilterChipsProps {
  chips: Chip[];
  totalResults?: number;
  onResetAll?: () => void;
}

export function FilterChips({ chips, totalResults, onResetAll }: FilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[0.75rem] font-bold text-muted">
        {totalResults !== undefined ? `${totalResults} results` : "Filters:"}
      </span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 rounded-full bg-surface-strong px-3 py-1.5 text-[0.7rem] font-bold text-text"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className="flex items-center text-muted transition-colors hover:text-text"
          >
            <Iconify icon="mingcute:close-line" width={14} />
          </button>
        </span>
      ))}
      {onResetAll && (
        <button
          type="button"
          onClick={onResetAll}
          className="rounded-full px-3 py-1.5 text-[0.7rem] font-bold text-muted transition-colors hover:bg-surface-strong hover:text-text"
        >
          Reset all
        </button>
      )}
    </div>
  );
}
