import { useEffect, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../../../components/iconify/iconify";
import { CustomSelect } from "../../../../../components/ui/CustomSelect";
import { CustomDatePicker } from "../../../../../components/ui/CustomDatePicker";
import type { LearnSession } from "../../../../../data/monitoring/learnData";

interface LearnFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (session: Omit<LearnSession, "id">) => void;
}

const TYPE_OPTIONS = [
  { value: "mandatory", label: "Mandatory", description: "Wajib untuk semua santri", icon: "solar:star-bold-duotone" },
  { value: "rolespec", label: "Role-Specific", description: "Sesuai role / divisi", icon: "solar:tag-bold-duotone" },
];

const PHASE_OPTIONS = [
  { value: "1", label: "Phase 1 · Niyah", icon: "solar:square-academic-cap-bold-duotone" },
  { value: "2", label: "Phase 2 · Fikrah", icon: "solar:square-academic-cap-bold-duotone" },
  { value: "3", label: "Phase 3 · Amaliyah", icon: "solar:square-academic-cap-bold-duotone" },
  { value: "4", label: "Phase 4 · Khidmah", icon: "solar:square-academic-cap-bold-duotone" },
  { value: "5", label: "Phase 5 · Jariyah", icon: "solar:square-academic-cap-bold-duotone" },
];

const RS_PHASE_OPTION = { value: "rs", label: "Role-Specific", icon: "solar:tag-bold-duotone" };

const STATUS_OPTIONS = [
  { value: "Planned", label: "Planned", icon: "solar:clock-circle-bold-duotone" },
  { value: "Done", label: "Done", icon: "solar:check-circle-bold-duotone" },
];

const THEME_OPTIONS = [
  { value: "c-deen", label: "DEEN", description: "Diniyah · Tarbiyah", icon: "solar:book-bookmark-bold-duotone" },
  { value: "c-ac", label: "Academic", description: "Pendidikan · Pengajaran", icon: "solar:graph-new-bold-duotone" },
  { value: "c-dkv", label: "DKV", description: "Design · Visual · Media", icon: "solar:palette-bold-duotone" },
  { value: "c-it", label: "IT", description: "Tech · Build · Deploy", icon: "solar:code-bold-duotone" },
  { value: "c-ops", label: "OPS", description: "Operasional · Layanan", icon: "solar:settings-minimalistic-bold-duotone" },
];

const TOTAL_SANTRI_DEFAULT = 21;

function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function LearnForm({ open, onClose, onSubmit }: LearnFormProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [type, setType] = useState("mandatory");
  const [phase, setPhase] = useState("1");
  const [themeCls, setThemeCls] = useState("c-deen");
  const [theme, setTheme] = useState("Fondasi Diri");
  const [what, setWhat] = useState("");
  const [who, setWho] = useState("Semua santri");
  const [why, setWhy] = useState("");
  const [when, setWhen] = useState(todayKey());
  const [where, setWhere] = useState("Online");
  const [how, setHow] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [status, setStatus] = useState("Planned");

  useEffect(() => {
    if (open) {
      setTitle("");
      setSubtitle("");
      setType("mandatory");
      setPhase("1");
      setThemeCls("c-deen");
      setTheme("");
      setWhat("");
      setWho("Semua santri");
      setWhy("");
      setWhen(todayKey());
      setWhere("Online");
      setHow("");
      setSpeaker("");
      setStatus("Planned");
    }
  }, [open]);

  // Sync phase if type changes
  useEffect(() => {
    if (type === "rolespec") setPhase("rs");
    else if (phase === "rs") setPhase("1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // Sync default theme label from theme class
  useEffect(() => {
    const opt = THEME_OPTIONS.find((t) => t.value === themeCls);
    if (opt && !theme) setTheme(opt.label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeCls]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const phaseValue: number | string = phase === "rs" ? "rs" : Number(phase);
    const monthValue = type === "mandatory" && phase !== "rs" ? Number(phase) : null;
    const quarterValue = type === "rolespec" ? "Q1" : null;

    onSubmit({
      type: type as LearnSession["type"],
      phase: phaseValue,
      month: monthValue,
      quarter: quarterValue,
      theme: theme.trim() || THEME_OPTIONS.find((t) => t.value === themeCls)?.label || "Umum",
      themeCls,
      title: title.trim(),
      subtitle: subtitle.trim(),
      what: what.trim() || subtitle.trim() || title.trim(),
      who: who.trim() || "Semua santri",
      why: why.trim(),
      when: when, // YYYY-MM-DD
      where: where.trim() || "Online",
      how: how.trim(),
      speaker: speaker.trim() || "TBD",
      status: status as LearnSession["status"],
      attendance: 0,
      totalSantri: TOTAL_SANTRI_DEFAULT,
    });
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-[0_24px_64px_rgba(39,49,38,0.18)]"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Iconify icon="solar:book-bookmark-bold-duotone" width={17} />
                </span>
                <div>
                  <h2 className="font-(--font-family-head) text-base font-extrabold leading-none text-primary-dark">
                    Tambah Jadwal Belajar
                  </h2>
                  <p className="mt-1 text-[0.65rem] text-muted">
                    Lengkapi info sesi yang akan diadakan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-strong hover:text-text"
                aria-label="Tutup"
              >
                <Iconify icon="mingcute:close-line" width={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid max-h-[78vh] gap-3 overflow-y-auto scrollbar-v-thin p-5">
              <Field label="Judul *">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Public Speaking 101"
                  required
                  className="w-full rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.8rem] font-bold text-text outline-none transition-all placeholder:text-muted/50 focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                />
              </Field>

              <Field label="Subjudul">
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Tagline singkat sesi"
                  className="w-full rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.8rem] text-text outline-none transition-all placeholder:text-muted/50 focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Tipe">
                  <CustomSelect
                    value={type}
                    onChange={setType}
                    options={TYPE_OPTIONS}
                    icon="solar:filter-bold-duotone"
                  />
                </Field>
                <Field label="Phase">
                  <CustomSelect
                    value={phase}
                    onChange={setPhase}
                    options={type === "rolespec" ? [RS_PHASE_OPTION] : PHASE_OPTIONS}
                    icon="solar:square-academic-cap-bold-duotone"
                    disabled={type === "rolespec"}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Theme">
                  <CustomSelect
                    value={themeCls}
                    onChange={(v) => {
                      setThemeCls(v);
                      const opt = THEME_OPTIONS.find((t) => t.value === v);
                      if (opt) setTheme(opt.label);
                    }}
                    options={THEME_OPTIONS}
                    icon="solar:palette-bold-duotone"
                  />
                </Field>
                <Field label="Status">
                  <CustomSelect
                    value={status}
                    onChange={setStatus}
                    options={STATUS_OPTIONS}
                    icon="solar:pulse-bold-duotone"
                  />
                </Field>
              </div>

              <Field label="Tanggal">
                <CustomDatePicker value={when} onChange={setWhen} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Lokasi">
                  <input
                    type="text"
                    value={where}
                    onChange={(e) => setWhere(e.target.value)}
                    placeholder="Online / On-site / Studio"
                    className="w-full rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.8rem] text-text outline-none transition-all placeholder:text-muted/50 focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                  />
                </Field>
                <Field label="Pemateri">
                  <input
                    type="text"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    placeholder="Nama pemateri / coach"
                    className="w-full rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.8rem] text-text outline-none transition-all placeholder:text-muted/50 focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                  />
                </Field>
              </div>

              <Field label="Peserta">
                <input
                  type="text"
                  value={who}
                  onChange={(e) => setWho(e.target.value)}
                  placeholder="Misal: Semua santri / Santri IT"
                  className="w-full rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.8rem] text-text outline-none transition-all placeholder:text-muted/50 focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                />
              </Field>

              <Field label="Materi (What)">
                <textarea
                  value={what}
                  onChange={(e) => setWhat(e.target.value)}
                  placeholder="Ringkasan materi yang akan dibawakan"
                  rows={2}
                  className="w-full resize-none rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.8rem] text-text outline-none transition-all placeholder:text-muted/50 focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Mengapa (Why)">
                  <textarea
                    value={why}
                    onChange={(e) => setWhy(e.target.value)}
                    placeholder="Alasan sesi ini penting"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.78rem] text-text outline-none transition-all placeholder:text-muted/50 focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                  />
                </Field>
                <Field label="Bagaimana (How)">
                  <textarea
                    value={how}
                    onChange={(e) => setHow(e.target.value)}
                    placeholder="Format / metode delivery"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.78rem] text-text outline-none transition-all placeholder:text-muted/50 focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                  />
                </Field>
              </div>

              <div className="mt-1 flex items-center justify-end gap-2 border-t border-border/40 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-border/60 bg-surface px-4 py-2 text-[0.75rem] font-bold text-muted transition-colors hover:bg-surface-strong hover:text-text"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[0.75rem] font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all hover:bg-primary-dark active:scale-95"
                >
                  <Iconify icon="mingcute:add-line" width={14} />
                  Tambah Sesi
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[0.6rem] font-extrabold uppercase tracking-wider text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
