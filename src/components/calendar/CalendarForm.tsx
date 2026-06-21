import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../iconify/iconify";
import type { CalendarEvent, CalendarEventType, CalendarEventStatus } from "./types";

interface CalendarFormProps {
  open: boolean;
  defaultDate?: string;
  onClose: () => void;
  onSubmit: (ev: Omit<CalendarEvent, "id">) => void;
}

const TYPE_OPTIONS: { value: CalendarEventType; label: string }[] = [
  { value: "learn", label: "Learn" },
  { value: "project", label: "Project" },
  { value: "report", label: "Report" },
];

const STATUS_OPTIONS: { value: CalendarEventStatus; label: string }[] = [
  { value: "scheduled", label: "Terjadwal" },
  { value: "submitted", label: "Submitted" },
  { value: "due-soon", label: "Due Soon" },
  { value: "overdue", label: "Overdue" },
];

function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function CalendarForm({ open, defaultDate, onClose, onSubmit }: CalendarFormProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [type, setType] = useState<CalendarEventType>("learn");
  const [status, setStatus] = useState<CalendarEventStatus>("scheduled");
  const [date, setDate] = useState(defaultDate || todayKey());
  const [allDay, setAllDay] = useState(true);
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("09:00");
  const [description, setDescription] = useState("");

  // Sync date with defaultDate every time the modal is opened
  useEffect(() => {
    if (open) {
      setTitle("");
      setSubtitle("");
      setType("learn");
      setStatus("scheduled");
      setDate(defaultDate || todayKey());
      setAllDay(true);
      setStart("08:00");
      setEnd("09:00");
      setDescription("");
    }
  }, [open, defaultDate]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      date,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      type,
      status,
      allDay,
      start: allDay ? undefined : start,
      end: allDay ? undefined : end,
      description: description.trim() || undefined,
      color: undefined,
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.12)]"
          >
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-6 py-4">
              <div className="min-w-0">
                <h2 className="font-(--font-family-head) text-base font-extrabold text-[#1e293b]">Tambah Event</h2>
                {date && (
                  <p className="mt-0.5 flex items-center gap-1 text-[0.7rem] font-semibold text-[#64748b]">
                    <Iconify icon="solar:calendar-bold-duotone" width={12} className="text-primary" />
                    {(() => {
                      const d = new Date(date + "T00:00:00");
                      return d.toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      });
                    })()}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-[#f1f5f9] hover:text-[#475569]"
              >
                <Iconify icon="mingcute:close-line" width={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 px-6 py-5">
              <div className="grid gap-1.5">
                <label className="text-[0.7rem] font-bold uppercase tracking-wider text-[#64748b]">Judul *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nama event..."
                  className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#1e293b] outline-none transition-all placeholder:text-[#94a3b8] focus:border-primary/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-[0.7rem] font-bold uppercase tracking-wider text-[#64748b]">Subjudul</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Deskripsi singkat..."
                  className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#1e293b] outline-none transition-all placeholder:text-[#94a3b8] focus:border-primary/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <label className="text-[0.7rem] font-bold uppercase tracking-wider text-[#64748b]">Tipe</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CalendarEventType)}
                    className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#1e293b] outline-none transition-all focus:border-primary/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                  >
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-1.5">
                  <label className="text-[0.7rem] font-bold uppercase tracking-wider text-[#64748b]">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CalendarEventStatus)}
                    className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#1e293b] outline-none transition-all focus:border-primary/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-[0.7rem] font-bold uppercase tracking-wider text-[#64748b]">Tanggal</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#1e293b] outline-none transition-all focus:border-primary/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="h-4 w-4 rounded border-[#e2e8f0] text-primary focus:ring-primary/30"
                />
                <label htmlFor="allDay" className="text-sm text-[#475569]">All day</label>
              </div>

              {!allDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <label className="text-[0.7rem] font-bold uppercase tracking-wider text-[#64748b]">Mulai</label>
                    <input
                      type="time"
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                      className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#1e293b] outline-none transition-all focus:border-primary/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[0.7rem] font-bold uppercase tracking-wider text-[#64748b]">Selesai</label>
                    <input
                      type="time"
                      value={end}
                      onChange={(e) => setEnd(e.target.value)}
                      className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#1e293b] outline-none transition-all focus:border-primary/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-1.5">
                <label className="text-[0.7rem] font-bold uppercase tracking-wider text-[#64748b]">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail event..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#1e293b] outline-none transition-all placeholder:text-[#94a3b8] focus:border-primary/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#e2e8f0] pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm font-bold text-[#64748b] transition-all hover:bg-[#f8fafc] active:scale-[0.97]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-dark active:scale-[0.97] shadow-[0_2px_8px_rgba(37,99,235,0.2)]"
                >
                  Simpan
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
