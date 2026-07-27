import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Iconify } from "../../../../../components/iconify/iconify";
import { CustomSelect } from "../../../../../components/ui/CustomSelect";
import type { Project } from "../../../../../data/monitoring/projectData";
import type { MonitoringProjectInput, MonitoringProjectOptions } from "../../../../../models/monitoring";
import { ConfirmDeleteDialog } from "../../../../../components/ui/ConfirmDeleteDialog";

interface ProjectFormProps {
  open: boolean;
  project?: Project | null;
  options: MonitoringProjectOptions;
  onClose: () => void;
  onSubmit: (project: MonitoringProjectInput) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const statusOptions = [
  { value: "Idea", label: "Idea", icon: "solar:lightbulb-bold-duotone" },
  { value: "In Progress", label: "In Progress", icon: "solar:clock-circle-bold-duotone" },
  { value: "Submitted", label: "Submitted", icon: "solar:upload-bold-duotone" },
  { value: "Approved", label: "Approved", icon: "solar:check-circle-bold-duotone" },
  { value: "Archived", label: "Archived", icon: "solar:archive-bold-duotone" },
];

export function ProjectForm({ open, project, options, onClose, onSubmit, onDelete }: ProjectFormProps) {
  const [name, setName] = useState("");
  const [trackId, setTrackId] = useState("");
  const [divisionId, setDivisionId] = useState("");
  const [ownerIds, setOwnerIds] = useState<string[]>([]);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [link, setLink] = useState("");
  const [reviewerId, setReviewerId] = useState("");
  const [status, setStatus] = useState<Project["status"]>("Idea");
  const [wajib, setWajib] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(project?.name ?? "");
    setTrackId(project?.trackId ? String(project.trackId) : options.tracks[0] ? String(options.tracks[0].value) : "");
    setDivisionId(project?.divisionId ?? "");
    setOwnerIds(project?.ownerIds ?? []);
    setOwnerSearch("");
    setPlatform(project?.platform ?? "");
    setLink(project?.link ?? "");
    setReviewerId(project?.reviewerId ?? "");
    setStatus(project?.status ?? "Idea");
    setWajib(project?.wajib ?? false);
      setError(null);
      setConfirmDelete(false);
  }, [open, options.tracks, project]);

  const filteredOwners = useMemo(() => {
    const query = ownerSearch.trim().toLowerCase();
    return options.owners.filter((owner) => !query || `${owner.label} ${owner.description ?? ""}`.toLowerCase().includes(query));
  }, [options.owners, ownerSearch]);

  const selectedOwners = options.owners.filter((owner) => ownerIds.includes(String(owner.value)));

  function toggleOwner(id: string) {
    setOwnerIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        trackId: trackId ? Number(trackId) : null,
        divisionId: divisionId || null,
        ownerIds,
        platform: platform.trim(),
        reviewerId: reviewerId || null,
        link: link.trim(),
        status,
        wajib,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan project.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setSaving(true);
    setError(null);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus project.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm"
          onClick={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border/70 bg-surface shadow-[0_28px_90px_rgba(0,0,0,0.28)]"
          >
            <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Iconify icon="solar:folder-with-files-bold-duotone" width={19} />
                </span>
                <div>
                  <h2 className="font-(--font-family-head) text-base font-extrabold text-primary-dark">{project ? "Edit Project" : "Tambah Project"}</h2>
                  <p className="text-[0.66rem] font-semibold text-muted">Project, track, dan owner tersimpan ke Supabase.</p>
                </div>
              </div>
              <button type="button" onClick={onClose} disabled={saving} className="rounded-lg p-2 text-muted hover:bg-surface-strong hover:text-text">
                <Iconify icon="mingcute:close-line" width={18} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="grid max-h-[78vh] gap-4 overflow-y-auto p-5 scrollbar-v-thin">
              {error && <div className="rounded-xl border border-orange/20 bg-orange/7 px-3 py-2 text-xs font-bold text-orange">{error}</div>}

              <Field label="Nama project *">
                <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Nama project" className={inputClass} />
              </Field>

              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <Field label="Track">
                  <CustomSelect
                    value={trackId}
                    onChange={setTrackId}
                    icon="solar:route-bold-duotone"
                    placeholder="Pilih track"
                    options={options.tracks.length
                      ? options.tracks.map((item) => ({ ...item, value: String(item.value) }))
                      : [{ value: "", label: "Track tidak dapat dibaca", description: "Periksa SELECT policy pengabdian_track", icon: "solar:database-bold-duotone", disabled: true }]}
                  />
                  {options.tracks.length === 0 && (
                    <p className="mt-1 text-[0.62rem] font-semibold text-orange">Data ada di database tetapi belum terlihat oleh role aplikasi? Jalankan migration akses track.</p>
                  )}
                </Field>
                <Field label="Divisi">
                  <CustomSelect value={divisionId} onChange={setDivisionId} icon="solar:widget-4-bold-duotone" options={[{ value: "", label: "Lintas Divisi", icon: "solar:layers-bold-duotone" }, ...options.divisions]} />
                </Field>
              </div>

              <Field label={`Owner santri · ${ownerIds.length} dipilih`}>
                <div className="overflow-hidden rounded-2xl border border-border/65 bg-surface-strong/25">
                  <div className="flex items-center gap-2 border-b border-border/55 px-3 py-2.5">
                    <Iconify icon="solar:magnifer-bold-duotone" width={15} className="text-muted" />
                    <input
                      value={ownerSearch}
                      onChange={(event) => setOwnerSearch(event.target.value)}
                      placeholder="Cari nama atau kode santri..."
                      className="min-w-0 flex-1 border-0 bg-transparent text-xs font-semibold text-text outline-none placeholder:text-muted/55"
                    />
                    {ownerIds.length > 0 && (
                      <button type="button" onClick={() => setOwnerIds([])} className="text-[0.62rem] font-bold text-muted hover:text-orange">Reset</button>
                    )}
                  </div>

                  {selectedOwners.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 border-b border-border/45 px-3 py-2.5">
                      {selectedOwners.map((owner) => (
                        <button key={owner.value} type="button" onClick={() => toggleOwner(String(owner.value))} className="inline-flex items-center gap-1 rounded-lg bg-primary-soft px-2 py-1 text-[0.62rem] font-extrabold text-primary">
                          {owner.label}
                          <Iconify icon="mingcute:close-line" width={11} />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="grid max-h-52 grid-cols-2 gap-1 overflow-y-auto p-2 max-sm:grid-cols-1 scrollbar-v-thin">
                    {filteredOwners.map((owner) => {
                      const id = String(owner.value);
                      const selected = ownerIds.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleOwner(id)}
                          className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors ${selected ? "bg-primary-soft text-primary-dark" : "hover:bg-surface-strong text-text"}`}
                        >
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${selected ? "border-primary bg-primary text-white" : "border-border bg-surface"}`}>
                            {selected && <Iconify icon="mingcute:check-line" width={12} />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.72rem] font-extrabold">{owner.label}</span>
                            {owner.description && <span className="block truncate font-mono text-[0.58rem] text-muted">{owner.description}</span>}
                          </span>
                        </button>
                      );
                    })}
                    {filteredOwners.length === 0 && <p className="col-span-full py-5 text-center text-xs font-semibold text-muted">Santri tidak ditemukan.</p>}
                  </div>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <Field label="Status">
                  <CustomSelect value={status} onChange={(value) => setStatus(value as Project["status"])} icon="solar:pulse-bold-duotone" options={statusOptions} />
                </Field>
                <Field label="Reviewer">
                  <CustomSelect value={reviewerId} onChange={setReviewerId} icon="solar:shield-user-bold-duotone" options={[{ value: "", label: "Belum ditentukan", icon: "solar:user-cross-bold-duotone" }, ...options.reviewers]} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <Field label="Platform">
                  <input value={platform} onChange={(event) => setPlatform(event.target.value)} placeholder="GitHub / Notion / Behance" className={inputClass} />
                </Field>
                <Field label="Link">
                  <input type="url" value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://..." className={inputClass} />
                </Field>
              </div>

              <button type="button" onClick={() => setWajib((value) => !value)} className={`flex items-center gap-3 rounded-xl border p-3 text-left ${wajib ? "border-orange/35 bg-orange/6" : "border-border/60"}`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${wajib ? "border-orange bg-orange text-white" : "border-border"}`}>
                  {wajib && <Iconify icon="mingcute:check-line" width={13} />}
                </span>
                <span><strong className="block text-xs text-text">Project wajib</strong><span className="text-[0.65rem] text-muted">Wajib diselesaikan owner yang dipilih.</span></span>
              </button>

              <footer className="flex items-center gap-2 border-t border-border/55 pt-4">
                {onDelete && (
                  <button type="button" onClick={() => setConfirmDelete(true)} disabled={saving} className="mr-auto rounded-xl px-4 py-2 text-xs font-extrabold text-orange hover:bg-orange/8 disabled:opacity-50">Hapus</button>
                )}
                <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-border px-4 py-2 text-xs font-extrabold text-muted hover:bg-surface-strong">Batal</button>
                <button type="submit" disabled={saving || !name.trim()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-white disabled:opacity-50">
                  {saving && <Iconify icon="svg-spinners:ring-resize" width={14} />}
                  {project ? "Simpan Perubahan" : "Tambah Project"}
                </button>
              </footer>
            </form>
            <ConfirmDeleteDialog
              open={confirmDelete}
              title="Hapus project?"
              description={`Project ${project?.name ?? "ini"} dan seluruh relasi owner-nya akan dihapus.`}
              loading={saving}
              onCancel={() => setConfirmDelete(false)}
              onConfirm={handleDelete}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const inputClass = "w-full rounded-xl border border-border/65 bg-surface px-3 py-2.5 text-xs font-semibold text-text outline-none placeholder:text-muted/50 focus:border-primary/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5"><span className="text-[0.6rem] font-black uppercase tracking-[0.1em] text-muted">{label}</span>{children}</label>;
}
