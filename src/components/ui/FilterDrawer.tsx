import { type ReactNode, useEffect } from "react";
import { Iconify } from "../iconify/iconify";
import { Scrollbar } from "../scrollbar";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  onReset?: () => void;
  canReset?: boolean;
  children: ReactNode;
}

export function FilterDrawer({
  open,
  onClose,
  title = "Filters",
  onReset,
  canReset,
  children,
}: FilterDrawerProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border bg-surface shadow-[0_0_60px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="font-(--font-family-head) text-base font-extrabold text-primary-dark">
            {title}
          </h3>
          <div className="flex items-center gap-1">
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="relative rounded-lg p-2 text-muted transition-colors hover:bg-surface-strong hover:text-text"
                title="Reset"
              >
                <Iconify icon="solar:restart-bold" width={18} />
                {canReset && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-orange" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-strong hover:text-text"
            >
              <Iconify icon="mingcute:close-line" width={18} />
            </button>
          </div>
        </div>

        <Scrollbar className="flex-1 px-5 py-4">
          <div className="grid gap-6">{children}</div>
        </Scrollbar>
      </div>
    </>
  );
}

interface FilterSectionProps {
  label: string;
  children: ReactNode;
}

export function FilterSection({ label, children }: FilterSectionProps) {
  return (
    <div>
      <h4 className="mb-2 text-[0.75rem] font-bold uppercase tracking-wider text-muted">
        {label}
      </h4>
      {children}
    </div>
  );
}
