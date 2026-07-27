import { AnimatePresence, motion } from "motion/react";
import { Iconify } from "../iconify/iconify";

export function ConfirmDeleteDialog({
  open,
  title,
  description,
  loading = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-sm rounded-3xl border border-border/70 bg-surface p-5 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange/10 text-orange">
              <Iconify icon="solar:trash-bin-trash-bold-duotone" width={22} />
            </span>
            <h3 className="mt-4 font-(--font-family-head) text-lg font-extrabold text-primary-dark">{title}</h3>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-muted">{description}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={onCancel} disabled={loading} className="rounded-xl border border-border px-4 py-2 text-xs font-extrabold text-muted hover:bg-surface-strong disabled:opacity-50">Batal</button>
              <button type="button" onClick={onConfirm} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-orange px-4 py-2 text-xs font-extrabold text-white disabled:opacity-50">
                {loading && <Iconify icon="svg-spinners:ring-resize" width={13} />}
                Hapus
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
