import { useEffect, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../../../components/iconify/iconify";
import { CustomSelect } from "../../../../../components/ui/CustomSelect";
import type { Project } from "../../../../../data/monitoring/projectData";

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, "id">) => void;
}

const TRACK_OPTIONS = [
  { value: "Storyteller", label: "Storyteller", description: "Konten naratif & cerita", icon: "solar:pen-bold-duotone" },
  { value: "Design Showcase", label: "Design Showcase", description: "Visual portfolio", icon: "solar:palette-bold-duotone" },
  { value: "Technical Builder", label: "Technical Builder", description: "Build / develop / ship", icon: "solar:code-bold-duotone" },
  { value: "Teaching & Knowledge", label: "Teaching & Knowledge", description: "Modul / kurikulum", icon: "solar:square-academic-cap-bold-duotone" },
  { value: "Operational Service", label: "Operational Service", description: "SOP / proses operasional", icon: "solar:settings-minimalistic-bold-duotone" },
  { value: "Dakwah & Public Speaking", label: "Dakwah & Public Speaking", description: "Konten dakwah & speaking", icon: "solar:microphone-3-bold-duotone" },
  { value: "PKBM Output", label: "PKBM Output", description: "Output sistem PKBM", icon: "solar:notebook-bold-duotone" },
];

const DIV_OPTIONS = [
  { value: "All", label: "Lintas Divisi", icon: "solar:layers-bold-duotone" },
  { value: "AC", label: "Academic", icon: "solar:graph-new-bold-duotone" },
  { value: "DEEN", label: "DEEN", icon: "solar:book-bookmark-bold-duotone" },
  { value: "DKV", label: "DKV / Creative", icon: "solar:palette-bold-duotone" },
  { value: "IT", label: "IT", icon: "solar:code-bold-duotone" },
  { value: "OPS", label: "Operations", icon: "solar:settings-minimalistic-bold-duotone" },
  { value: "PKBM", label: "PKBM", icon: "solar:notebook-bold-duotone" },
  { value: "Dakwah", label: "Dakwah", icon: "solar:microphone-3-bold-duotone" },
];

const STATUS_OPTIONS = [
  { value: "Idea", label: "Idea", description: "Baru sebatas ide", icon: "solar:lightbulb-bold-duotone" },
  { value: "In Progress", label: "In Progress", description: "Sedang dikerjakan", icon: "solar:clock-circle-bold-duotone" },
  { value: "Submitted", label: "Submitted", description: "Sudah dikirim untuk review", icon: "solar:upload-bold-duotone" },
  { value: "Approved", label: "Approved", description: "Sudah disetujui", icon: "solar:check-circle-bold-duotone" },
  { value: "Archived", label: "Archived", description: "Tidak aktif", icon: "solar:archive-bold-duotone" },
];

export function ProjectForm({ open, onClose, onSubmit }: ProjectFormProps) {
  const [name, setName] = useState("");
  const [track, setTrack] = useState("Technical Builder");
  const [div, setDiv] = useState("IT");
  const [owners, setOwners] = useState("");
  const [platform, setPlatform] = useState("");
  const [link, setLink] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [status, setStatus] = useState("Idea");
  const [wajib, setWajib] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setTrack("Technical Builder");
      setDiv("IT");
      setOwners("");
      setPlatform("");
      setLink("");
      setReviewer("");
      setStatus("Idea");
      setWajib(false);
    }
  }, [open]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const ownerList = owners
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);

    onSubmit({
      name: name.trim(),
      track,
      div,
      owners: ownerList,
      platform: platform.trim(),
      link: link.trim(),
      reviewer: reviewer.trim(),
      status: status as Project["status"],
      wajib,
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
                  <Iconify icon="solar:folder-with-files-bold-duotone" width={17} />
                </span>
                <div>
                  <h2 className="font-(--font-family-head) text-base font-extrabold leading-none text-primary-dark">
                    Tambah Project
                  </h2>
                  <p className="mt-1 text-[0.65rem] text-muted">
                    Lengkapi info projek pengabdian baru
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
              <Field label="Nama Project *">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Modul Tahfidz Digital"
                  required
                  className="w-full rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.8rem] font-bold text-text outline-none transition-all placeholder:text-muted/50 focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Track">
                  <CustomSelect
                    value={track}
                    onChange={setTrack}
                    options={TRACK_OPTIONS}
                    icon="solar:tag-bold-duotone"
                  />
                </Field>
                <Field label="Divisi">
                  <CustomSelect
                    value={div}
                    onChange={setDiv}
                    options={DIV_OPTIONS}
                    icon="solar:widget-4-bold-duotone"
                  />
                </Field>
              </div>

              <Field label="Status">
                <CustomSelect
                  value={status}
                  onChange={setStatus}
                  options={STATUS_OPTIONS}
                  icon="solar:pulse-bold-duotone"
                />
              </Field>

              <Field label="Owners (pisah koma)">
                <input
                  type="text"
                  value={owners}
                  onChange={(e) => setOwners(e.target.value)}
                  placeholder="S03, S08, S11"
                  className="w-full rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.8rem] text-text outline-none transition-all placeholder:text-muted/50 focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Platform">
                  <input
                    type="text"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    placeholder="GitHub / Notion / Behance"
                    className="w-full rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.8rem] text-text outline-none transition-all placeholder:text-muted/50 focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                  />
                </Field>
                <Field label="Reviewer">
                  <input
                    type="text"
                    value={reviewer}
                    onChange={(e) => setReviewer(e.target.value)}
                    placeholder="PIC Div · PIC Reg"
                    className="w-full rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.8rem] text-text outline-none transition-all placeholder:text-muted/50 focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                  />
                </Field>
              </div>

              <Field label="Link">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.8rem] text-text outline-none transition-all placeholder:text-muted/50 focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                />
              </Field>

              <button
                type="button"
                role="checkbox"
                aria-checked={wajib}
                onClick={() => setWajib((v) => !v)}
                className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  wajib
                    ? "border-orange/40 bg-orange/5"
                    : "border-border/60 bg-surface hover:bg-surface-strong/50"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    wajib
                      ? "border-orange bg-orange text-white"
                      : "border-border/60 bg-surface"
                  }`}
                >
                  {wajib && <Iconify icon="mingcute:check-line" width={13} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[0.78rem] font-bold ${wajib ? "text-orange" : "text-text"}`}>
                    Project Wajib
                  </span>
                  <span className="block text-[0.65rem] text-muted">
                    Project ini wajib diselesaikan oleh santri yang ditunjuk
                  </span>
                </span>
              </button>

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
                  Tambah Project
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
