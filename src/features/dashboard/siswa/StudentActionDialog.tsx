import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import { useToast } from "../../../components/ui/ToastProvider";
import {
  remindStudentPic,
  submitDailyReport,
  submitMonthlyReport,
  submitSpecialReport,
  submitWeeklyReport,
  uploadStudentEvidence,
  type StudentActionId,
  type StudentWorkspaceData,
} from "../../../models/siswa";

const actionCopy: Record<StudentActionId, { title: string; description: string; icon: string }> = {
  daily: { title: "Daily Check-in", description: "Catat rencana, hasil, kendala, dan mood hari ini.", icon: "solar:checklist-minimalistic-bold-duotone" },
  weekly: { title: "Weekly Review", description: "Kirim progres SoW dan refleksi pekanan.", icon: "solar:calendar-mark-bold-duotone" },
  monthly: { title: "Monthly Report", description: "Rangkum pencapaian dan rencana bulan berikutnya.", icon: "solar:file-text-bold-duotone" },
  special: { title: "Special Report", description: "Laporkan case khusus di luar report berkala.", icon: "solar:document-add-bold-duotone" },
  evidence: { title: "Upload Evidence", description: "Lampirkan bukti progres ke salah satu report.", icon: "solar:upload-square-bold-duotone" },
  remind: { title: "Remind PIC", description: "Kirim permintaan review kepada PIC Divisi.", icon: "solar:chat-round-call-bold-duotone" },
};

export function StudentActionDialog({ action, data, authUserId, onClose, onSuccess }: { action: StudentActionId | null; data: StudentWorkspaceData; authUserId: string; onClose: () => void; onSuccess: () => Promise<void> }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => { setFields({}); setFile(null); }, [action]);
  useEffect(() => {
    if (!action) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape" && !saving) onClose(); };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", closeOnEscape); document.body.style.overflow = ""; };
  }, [action, onClose, saving]);
  if (!action) return null;
  const copy = actionCopy[action];
  const set = (key: string, value: string) => setFields((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      if (action === "daily") await submitDailyReport(data.profile.pengabdianId, { plan: fields.plan ?? "", recap: fields.recap ?? "", blocker: fields.blocker ?? "", mood: (fields.mood || "Okay") as "Good" | "Okay" | "Tough" });
      if (action === "weekly") await submitWeeklyReport(data.profile.pengabdianId, { progressStatus: (fields.progressStatus || "On Track") as "On Track" | "Behind" | "Ahead", progressPercent: Number(fields.progressPercent || 0), highlight: fields.highlight ?? "", lowlight: fields.lowlight ?? "", reflection: fields.reflection ?? "" });
      if (action === "monthly") await submitMonthlyReport(data.profile.pengabdianId, { reflection: fields.reflection ?? "", achievement: fields.achievement ?? "", challenge: fields.challenge ?? "", nextPlan: fields.nextPlan ?? "" });
      if (action === "special") await submitSpecialReport(data.profile.pengabdianId, { category: fields.category || "Other", title: fields.title ?? "", description: fields.description ?? "" });
      if (action === "evidence") {
        if (!file || !fields.reportId) throw new Error("Pilih report dan file evidence terlebih dahulu.");
        await uploadStudentEvidence(data.profile.pengabdianId, authUserId, { reportId: fields.reportId, file });
      }
      if (action === "remind") await remindStudentPic(data.profile.pengabdianId, data.primaryAssignmentId, data.primaryPicDivisionId, { reportId: fields.reportId || null, message: fields.message ?? "" });
      await onSuccess();
      toast.success(`${copy.title} berhasil`, action === "evidence" ? "Evidence sudah tersimpan." : action === "remind" ? "Permintaan review sudah dikirim." : "Data sudah dikirim ke PIC.");
      onClose();
    } catch (err) {
      toast.error(`${copy.title} gagal`, err instanceof Error ? err.message : "Silakan coba lagi.");
    } finally { setSaving(false); }
  }

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        <motion.form onSubmit={submit} className="scrollbar-v-hover max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-surface shadow-[0_28px_90px_rgba(0,0,0,0.3)] sm:max-h-[90vh] sm:rounded-3xl" initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}>
          <header className="flex items-start gap-3 border-b border-border/55 px-5 py-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/9 text-primary"><Iconify icon={copy.icon} width={20} /></span><div className="min-w-0 flex-1"><p className="text-[0.58rem] font-black uppercase tracking-[0.15em] text-primary">Ruang Kerja</p><h2 className="mt-0.5 text-base font-extrabold text-primary-dark">{copy.title}</h2><p className="mt-0.5 text-xs font-medium leading-relaxed text-muted">{copy.description}</p></div><button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-surface-strong hover:text-text" aria-label="Tutup"><Iconify icon="mingcute:close-line" width={18} /></button></header>
          <div className="px-5 pt-4"><div className="flex items-center gap-2 text-[0.6rem] font-black uppercase tracking-wide"><span className="rounded-full bg-primary px-2 py-1 text-white">1 · Isi data</span><span className="h-px flex-1 bg-border" /><span className="rounded-full bg-surface-strong px-2 py-1 text-muted">2 · Kirim</span><span className="h-px flex-1 bg-border" /><span className="rounded-full bg-surface-strong px-2 py-1 text-muted">3 · Review PIC</span></div></div>
          <div className="grid gap-3 px-5 py-4">{renderFields(action, fields, set, file, setFile, data)}</div>
          <footer className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border/60 bg-surface/95 px-5 py-4 backdrop-blur-xl"><p className="hidden text-[0.65rem] font-semibold text-muted sm:block">Pastikan data sudah benar sebelum dikirim.</p><div className="ml-auto flex gap-2"><button type="button" onClick={onClose} disabled={saving} className="rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-muted hover:bg-surface-strong">Batal</button><button type="submit" disabled={saving || !isReady(action, fields, file)} className="inline-flex min-w-28 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(37,99,235,0.2)] disabled:cursor-not-allowed disabled:opacity-40">{saving && <Iconify icon="svg-spinners:ring-resize" width={14} />}{saving ? "Menyimpan..." : action === "evidence" ? "Upload" : action === "remind" ? "Kirim" : "Submit"}</button></div></footer>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}

function renderFields(action: StudentActionId, fields: Record<string, string>, set: (key: string, value: string) => void, file: File | null, setFile: (file: File | null) => void, data: StudentWorkspaceData) {
  if (action === "daily") return <><FormGroup title="Aktivitas hari ini" description="Isi minimal rencana atau hasil pekerjaan."><Area label="Rencana" value={fields.plan} onChange={(value) => set("plan", value)} placeholder="Apa yang akan dikerjakan?" required={false} /><Area label="Hasil / recap" value={fields.recap} onChange={(value) => set("recap", value)} placeholder="Apa yang sudah selesai?" required={false} /></FormGroup><FormGroup title="Kondisi" description="Bagian ini membantu PIC memahami keadaanmu."><Area label="Kendala (opsional)" value={fields.blocker} onChange={(value) => set("blocker", value)} placeholder="Tulis kendala jika ada..." required={false} /><Field label="Mood"><CustomSelect value={fields.mood || "Okay"} onChange={(value) => set("mood", value)} options={[{ value: "Good", label: "Good" }, { value: "Okay", label: "Okay" }, { value: "Tough", label: "Tough" }]} /></Field></FormGroup></>;
  if (action === "weekly") return <><FormGroup title="Progress SoW"><div className="grid gap-3 sm:grid-cols-2"><Field label="Status progres"><CustomSelect value={fields.progressStatus || "On Track"} onChange={(value) => set("progressStatus", value)} options={[{ value: "On Track", label: "On Track" }, { value: "Ahead", label: "Ahead" }, { value: "Behind", label: "Behind" }]} /></Field><Input label="Progress (%)" type="number" min="0" max="100" value={fields.progressPercent} onChange={(value) => set("progressPercent", value)} /></div></FormGroup><FormGroup title="Review pekanan"><Area label="Highlight" value={fields.highlight} onChange={(value) => set("highlight", value)} placeholder="Pencapaian utama minggu ini..." /><Area label="Lowlight / blocker (opsional)" value={fields.lowlight} onChange={(value) => set("lowlight", value)} placeholder="Apa yang masih menghambat?" required={false} /><Area label="Refleksi" value={fields.reflection} onChange={(value) => set("reflection", value)} placeholder="Pelajaran minggu ini..." /></FormGroup></>;
  if (action === "monthly") return <><FormGroup title="Ringkasan bulan ini"><Area label="Refleksi" value={fields.reflection} onChange={(value) => set("reflection", value)} /><Area label="Pencapaian utama" value={fields.achievement} onChange={(value) => set("achievement", value)} /><Area label="Tantangan (opsional)" value={fields.challenge} onChange={(value) => set("challenge", value)} required={false} /></FormGroup><FormGroup title="Bulan berikutnya"><Area label="Rencana dan target" value={fields.nextPlan} onChange={(value) => set("nextPlan", value)} /></FormGroup></>;
  if (action === "special") return <FormGroup title="Detail case" description="Gunakan hanya untuk kebutuhan di luar report berkala."><Field label="Kategori"><CustomSelect value={fields.category || "Other"} onChange={(value) => set("category", value)} options={[{ value: "Izin", label: "Izin" }, { value: "Kesehatan", label: "Kesehatan" }, { value: "Penempatan", label: "Penempatan" }, { value: "Project", label: "Project" }, { value: "Other", label: "Lainnya" }]} /></Field><Input label="Judul singkat" value={fields.title} onChange={(value) => set("title", value)} /><Area label="Kronologi / deskripsi" value={fields.description} onChange={(value) => set("description", value)} /></FormGroup>;
  if (action === "evidence") return <FormGroup title="File evidence" description="Pilih report tujuan agar evidence mudah direview."><ReportSelect reports={data.reports} value={fields.reportId} onChange={(value) => set("reportId", value)} /><Field label="File (maks. 10 MB)"><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/4 p-4 text-xs font-bold text-primary transition-colors hover:bg-primary/8"><Iconify icon="solar:upload-square-bold-duotone" width={22} /><span className="min-w-0 flex-1 truncate">{file?.name ?? "Klik untuk memilih file"}</span>{file && <span className="text-muted">{formatSize(file.size)}</span>}<input type="file" className="sr-only" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>{file && file.size > 10 * 1024 * 1024 && <p className="mt-1 text-[0.65rem] font-bold text-orange">Ukuran file melebihi batas 10 MB.</p>}</Field></FormGroup>;
  return <FormGroup title="Permintaan review" description="PIC akan menerima request ini pada antrean clarification."><ReportSelect reports={data.reports} value={fields.reportId} onChange={(value) => set("reportId", value)} optional /><Area label="Pesan untuk PIC" value={fields.message} onChange={(value) => set("message", value)} placeholder="Contoh: Mohon review Weekly Report saya..." />{!data.primaryPicDivisionId && <p className="rounded-xl bg-orange/8 p-3 text-xs font-bold text-orange">PIC Divisi belum tersedia. Request tetap tercatat tanpa penerima langsung.</p>}</FormGroup>;
}

function ReportSelect({ reports, value, onChange, optional = false }: { reports: StudentWorkspaceData["reports"]; value?: string; onChange: (value: string) => void; optional?: boolean }) { return <Field label={`Report tujuan${optional ? " (opsional)" : ""}`}><CustomSelect value={value || ""} onChange={onChange} options={[...(optional ? [{ value: "", label: "Tidak terkait report tertentu" }] : []), ...reports.map((report) => ({ value: report.id, label: `${report.type} · ${formatDate(report.periodStart)} · ${report.status.replace("_", " ")}` }))]} /></Field>; }
function FormGroup({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-border/55 bg-background/25 p-4"><div className="mb-3"><h3 className="text-xs font-black text-primary-dark">{title}</h3>{description && <p className="mt-0.5 text-[0.68rem] font-medium leading-relaxed text-muted">{description}</p>}</div><div className="grid gap-3">{children}</div></section>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1.5 text-xs font-extrabold text-text"><span>{label}</span>{children}</label>; }
function Input({ label, value = "", onChange, type = "text", min, max }: { label: string; value?: string; onChange: (value: string) => void; type?: string; min?: string; max?: string }) { return <Field label={label}><input required type={type} min={min} max={max} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-border bg-background/45 px-3 py-2.5 text-sm font-semibold text-text outline-none focus:border-primary/40" /></Field>; }
function Area({ label, value = "", onChange, placeholder, required = true }: { label: string; value?: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }) { return <Field label={label}><textarea required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} className="resize-none rounded-xl border border-border bg-background/45 px-3 py-2.5 text-sm font-semibold text-text outline-none placeholder:text-muted/50 focus:border-primary/40" /></Field>; }
function isReady(action: StudentActionId, fields: Record<string, string>, file: File | null) { if (action === "daily") return Boolean(fields.plan || fields.recap); if (action === "weekly") return Boolean(fields.highlight && fields.reflection); if (action === "monthly") return Boolean(fields.reflection && fields.achievement && fields.nextPlan); if (action === "special") return Boolean(fields.title && fields.description); if (action === "evidence") return Boolean(fields.reportId && file && file.size <= 10 * 1024 * 1024); return Boolean(fields.message); }
function formatDate(value: string) { return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(`${value}T00:00:00`)); }
function formatSize(value: number) { return value < 1024 * 1024 ? `${Math.ceil(value / 1024)} KB` : `${(value / 1024 / 1024).toFixed(1)} MB`; }
