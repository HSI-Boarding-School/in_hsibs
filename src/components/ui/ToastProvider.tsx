import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { Iconify } from "../iconify/iconify";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: number;
  title: string;
  message?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function push(tone: ToastTone, title: string, message?: string) {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, tone, title, message }]);
  }

  function remove(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  return (
    <ToastContext.Provider
      value={{
        success: (title, message) => push("success", title, message),
        error: (title, message) => push("error", title, message),
        info: (title, message) => push("info", title, message),
      }}
    >
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] grid w-[calc(100%-2rem)] max-w-sm gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={() => remove(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  const style = {
    success: {
      box: "border-emerald-300/20 bg-surface/94 shadow-[0_20px_70px_rgba(16,185,129,0.16)]",
      accent: "bg-emerald-400",
      glow: "bg-emerald-400/12",
      icon: "bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-300/18",
      text: "text-primary-dark",
      message: "text-muted",
      close: "text-muted hover:bg-surface-strong hover:text-text",
      iconName: "solar:check-circle-bold-duotone",
    },
    error: {
      box: "border-orange-300/24 bg-surface/94 shadow-[0_20px_70px_rgba(251,146,60,0.18)]",
      accent: "bg-orange-400",
      glow: "bg-orange-400/12",
      icon: "bg-orange-400/12 text-orange ring-1 ring-orange/18",
      text: "text-primary-dark",
      message: "text-muted",
      close: "text-muted hover:bg-surface-strong hover:text-text",
      iconName: "solar:danger-triangle-bold-duotone",
    },
    info: {
      box: "border-sky-300/22 bg-surface/94 shadow-[0_20px_70px_rgba(14,165,233,0.16)]",
      accent: "bg-sky-400",
      glow: "bg-sky-400/12",
      icon: "bg-sky-400/12 text-sky-300 ring-1 ring-sky-300/18",
      text: "text-primary-dark",
      message: "text-muted",
      close: "text-muted hover:bg-surface-strong hover:text-text",
      iconName: "solar:info-circle-bold-duotone",
    },
  }[toast.tone];

  return (
    <motion.div
      initial={{ opacity: 0, x: 24, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.96 }}
      className={`pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl border p-3.5 shadow-[0_18px_54px_rgba(0,0,0,0.2)] backdrop-blur-xl ${style.box}`}
    >
      <span className={`absolute inset-y-3 left-0 w-1 rounded-r-full ${style.accent}`} />
      <span className={`pointer-events-none absolute -left-10 -top-10 h-24 w-24 rounded-full blur-2xl ${style.glow}`} />
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.icon}`}>
        <Iconify icon={style.iconName} width={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-extrabold ${style.text}`}>{toast.title}</p>
        {toast.message && <p className={`mt-0.5 text-xs font-semibold leading-relaxed ${style.message}`}>{toast.message}</p>}
      </div>
      <button type="button" onClick={onClose} aria-label="Tutup notifikasi" className={`rounded-lg p-1 ${style.close}`}>
        <Iconify icon="mingcute:close-line" width={16} />
      </button>
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
