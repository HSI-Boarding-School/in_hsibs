import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../../components/iconify/iconify";
import { Scrollbar } from "../../../../components/scrollbar";
import type { Santri } from "../../../../data/santriData";
import { getDivColor, getDivLabel } from "../../../../data/santriData";

interface UnitTheme {
  avatar: string;
  pill: string;
  label: string;
  hero: string;
}

const unitTheme: Record<Santri["unit"], UnitTheme> = {
  "HSI BS": {
    avatar: "bg-gradient-to-br from-blue-400 to-blue-600",
    pill: "bg-blue-50 text-blue-700 ring-blue-200",
    label: "HSI BS",
    hero: "from-blue-500/15 via-blue-400/5 to-transparent",
  },
  "HSI BO": {
    avatar: "bg-gradient-to-br from-purple-400 to-purple-600",
    pill: "bg-purple-50 text-purple-700 ring-purple-200",
    label: "HSI BO",
    hero: "from-purple-500/15 via-purple-400/5 to-transparent",
  },
  "STIT Riyadh": {
    avatar: "bg-gradient-to-br from-emerald-400 to-emerald-600",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    label: "STIT Riyadh",
    hero: "from-emerald-500/15 via-emerald-400/5 to-transparent",
  },
};

interface StatusTheme {
  dot: string;
  text: string;
  bg: string;
  label: string;
}

const statusTheme: Record<Santri["status"], StatusTheme> = {
  Active: { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50 ring-green-200", label: "Active" },
  "On Hold": { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50 ring-amber-200", label: "On Hold" },
  Inactive: { dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-100 ring-gray-200", label: "Inactive" },
  Alumni: { dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-100 ring-gray-200", label: "Alumni" },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const sowTemplates: Record<string, string[]> = {
  Developer: [
    "Implementasi fitur sesuai prioritas sprint",
    "Fix bug dan refactor komponen yang menjadi tanggung jawab",
    "Update progres harian dan dokumentasi teknis singkat",
  ],
  QA: [
    "Membuat test scenario untuk fitur baru",
    "Melakukan regression test sebelum release",
    "Mencatat bug lengkap dengan langkah reproduksi",
  ],
  Designer: [
    "Membuat asset visual sesuai brief program",
    "Menjaga konsistensi style desain publikasi",
    "Menyiapkan file final dan source terstruktur",
  ],
  "Video Editor": [
    "Editing video pembelajaran atau publikasi",
    "Menyiapkan subtitle, thumbnail, dan export final",
    "Arsipkan project file sesuai folder standar",
  ],
  "Social Media": [
    "Menjadwalkan konten sesuai kalender publikasi",
    "Monitoring insight dan engagement konten",
    "Koordinasi materi dengan tim desain/copywriter",
  ],
  Copywriter: [
    "Menyusun caption dan copy publikasi",
    "Review tone komunikasi agar sesuai brand",
    "Menyiapkan draft konten sebelum desain final",
  ],
  Tahfidz: [
    "Mendampingi setoran dan murajaah santri",
    "Mencatat progres hafalan harian/pekanan",
    "Follow up santri yang tertinggal target",
  ],
  Arabic: [
    "Mendampingi latihan bahasa Arab dasar",
    "Menyiapkan materi latihan sesuai level",
    "Mencatat kehadiran dan progres peserta",
  ],
  Musyrif: [
    "Monitoring adab, ibadah, dan kedisiplinan santri",
    "Memberi pendampingan dan catatan pembinaan",
    "Koordinasi dengan PIC jika ada case khusus",
  ],
  Administration: [
    "Mengelola data administrasi harian",
    "Merapikan dokumen dan arsip operasional",
    "Membantu rekap kebutuhan laporan PIC",
  ],
  "Customer Service": [
    "Menjawab pertanyaan sesuai SOP layanan",
    "Mencatat tiket/keluhan dan status follow up",
    "Eskalasi case penting ke PIC terkait",
  ],
  "Asmen IT": [
    "Membantu monitoring perangkat dan sistem belajar",
    "Mencatat kendala teknis dan solusi awal",
    "Koordinasi support dengan tim IT",
  ],
};

function buildInitialSow(roles: string[]) {
  return roles.reduce<Record<string, string[]>>((acc, role) => {
    acc[role] = sowTemplates[role] ? [...sowTemplates[role]] : [];
    return acc;
  }, {});
}

const profileBannerUrl =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80";

interface SantriDetailDrawerProps {
  santri: Santri | null;
  open: boolean;
  onClose: () => void;
}

export function SantriDetailDrawer({ santri, open, onClose }: SantriDetailDrawerProps) {
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

  return (
    <AnimatePresence>
      {open && santri && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`Detail ${santri.name}`}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-[0_0_60px_rgba(0,0,0,0.18)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <DrawerContent santri={santri} onClose={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerContent({ santri, onClose }: { santri: Santri; onClose: () => void }) {
  const shortId = santri.id.replace("IN_HSIBS_", "");
  const unit = unitTheme[santri.unit];
  const status = statusTheme[santri.status];
  const initials = getInitials(santri.name);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [sowMap, setSowMap] = useState<Record<string, string[]>>(() => buildInitialSow(santri.roles));
  const [newSow, setNewSow] = useState("");

  useEffect(() => {
    setSelectedRole(null);
    setSowMap(buildInitialSow(santri.roles));
    setNewSow("");
  }, [santri.id, santri.roles]);

  const selectedSow = selectedRole ? sowMap[selectedRole] ?? [] : [];

  function addSowItem() {
    const text = newSow.trim();
    if (!text || !selectedRole) return;
    setSowMap((prev) => ({
      ...prev,
      [selectedRole]: [...(prev[selectedRole] ?? []), text],
    }));
    setNewSow("");
  }

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
        <div className="flex items-center gap-2">
          <Iconify
            icon="solar:user-rounded-bold-duotone"
            width={18}
            className="text-primary"
          />
          <h3 className="font-(--font-family-head) text-sm font-extrabold text-primary-dark">
            Detail Santri
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-strong hover:text-text"
          aria-label="Tutup"
        >
          <Iconify icon="mingcute:close-line" width={18} />
        </button>
      </div>

      <Scrollbar className="flex-1">
        {/* Hero */}
        <div className="relative overflow-hidden border-b border-border/60">
          <div className="relative h-44 overflow-hidden">
            <img
              src={profileBannerUrl}
              alt="Santri activity banner"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/38 to-black/10" />
            <div className={`absolute inset-0 bg-gradient-to-br ${unit.hero}`} />
            <div className="absolute left-5 right-5 top-4 flex items-start justify-between gap-3">
              <span className={`rounded-full px-3 py-1 text-[0.65rem] font-extrabold ring-1 ring-inset backdrop-blur-md ${unit.pill}`}>
                {unit.label}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-extrabold ring-1 ring-inset backdrop-blur-md ${status.bg} ${status.text}`}
              >
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden />
                {status.label}
              </span>
            </div>
          </div>

          <div className="relative z-[1] -mt-10 flex items-end gap-4 px-5 pb-5 pt-0">
            <div
              className={`flex h-22 w-22 shrink-0 items-center justify-center rounded-3xl font-(--font-family-head) text-2xl font-extrabold tracking-wide text-white shadow-[0_16px_36px_rgba(39,49,38,0.24)] ring-4 ring-surface ${unit.avatar}`}
              aria-hidden
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <h2 className="font-(--font-family-head) text-xl font-extrabold leading-tight text-primary-dark">
                {santri.name}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.7rem]">
                <span className="rounded-full bg-primary-soft px-2.5 py-1 font-mono font-extrabold text-primary">
                  {shortId}
                </span>
                <span className="rounded-full bg-surface-strong px-2.5 py-1 font-bold text-muted">
                  {santri.loc}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-5 px-5 py-5">
          {/* Penempatan */}
          <Section title="Penempatan" icon="solar:map-point-bold-duotone">
            <InfoRow
              icon="solar:map-point-wave-bold-duotone"
              label="Lokasi"
              value={santri.loc}
            />
            <InfoRow
              icon="solar:shield-user-bold-duotone"
              label="PIC Regional"
              value={santri.picReg}
              empty={!santri.picReg}
              emptyText="Belum ada PIC Regional"
            />
          </Section>

          {/* Divisi */}
          <Section title="Divisi" icon="solar:widget-4-bold-duotone">
            {santri.divs.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {santri.divs.map((d) => (
                  <span
                    key={d}
                    className={`rounded-md px-2 py-1 text-[0.7rem] font-bold tracking-wide ${getDivColor(d)}`}
                    title={getDivLabel(d)}
                  >
                    {d}
                    <span className="ml-1.5 font-normal opacity-70">
                      {getDivLabel(d)}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <EmptyText>Belum ada divisi</EmptyText>
            )}
          </Section>

          {/* PIC Divisi */}
          <Section title="PIC Divisi" icon="solar:user-id-bold-duotone">
            {santri.picDivs.length > 0 ? (
              <ul className="grid gap-1.5">
                {santri.picDivs.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2 rounded-lg bg-surface-strong/55 px-3 py-2 text-[0.75rem] font-semibold text-text"
                  >
                    <Iconify
                      icon="solar:user-bold-duotone"
                      width={14}
                      className="text-primary/70"
                    />
                    {p}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyText>Belum ada PIC Divisi</EmptyText>
            )}
          </Section>

          {/* Roles */}
          <Section title="Role" icon="solar:tag-horizontal-bold-duotone">
            {santri.roles.length > 0 ? (
              <div className="grid gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {santri.roles.map((r) => {
                    const active = selectedRole === r;
                    const count = sowMap[r]?.length ?? 0;
                    return (
                      <motion.button
                        key={r}
                        type="button"
                        onClick={() => {
                          setSelectedRole((current) => (current === r ? null : r));
                          setNewSow("");
                        }}
                        whileTap={{ scale: 0.96 }}
                        layout
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.7rem] font-extrabold transition-all ${
                          active
                            ? "border-primary/50 bg-primary-soft text-primary-dark shadow-[0_8px_18px_rgba(37,99,235,0.16)]"
                            : "border-border/60 bg-surface-strong/65 text-text hover:border-primary/30 hover:text-primary-dark"
                        }`}
                      >
                        <Iconify
                          icon={active ? "solar:folder-open-bold-duotone" : "solar:folder-with-files-bold-duotone"}
                          width={13}
                          className={active ? "text-primary" : "text-muted"}
                        />
                        {r}
                        <span className={`rounded-full px-1.5 py-0.5 text-[0.55rem] font-black ${active ? "bg-primary text-white" : "bg-surface text-muted"}`}>
                          {count}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {!selectedRole && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-dashed border-border/70 bg-surface-strong/22 px-3 py-3 text-[0.72rem] font-semibold text-muted"
                  >
                    <Iconify icon="solar:cursor-bold-duotone" width={13} className="mr-1.5 inline align-[-2px] text-primary/70" />
                    Klik salah satu role untuk melihat atau menambahkan Scope of Work.
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  {selectedRole && (
                    <motion.div
                      key={selectedRole}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden rounded-2xl border border-border/60 bg-surface/72 p-3.5 shadow-[0_12px_32px_rgba(39,49,38,0.07)]"
                    >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[0.6rem] font-black uppercase tracking-[0.14em] text-muted">
                          Scope of Work
                        </p>
                        <h5 className="truncate font-(--font-family-head) text-sm font-extrabold text-primary-dark">
                          {selectedRole}
                        </h5>
                      </div>
                      <span className="shrink-0 rounded-full bg-surface-strong px-2.5 py-1 text-[0.62rem] font-extrabold text-muted">
                        {selectedSow.length} item
                      </span>
                    </div>

                    {selectedSow.length > 0 ? (
                      <ul className="grid gap-2">
                        {selectedSow.map((item, idx) => (
                          <li
                            key={`${selectedRole}-${idx}-${item}`}
                            className="flex items-start gap-2 rounded-xl border border-border/50 bg-surface-strong/38 px-3 py-2 text-[0.75rem] font-semibold leading-relaxed text-text"
                          >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[0.6rem] font-black text-primary">
                              {idx + 1}
                            </span>
                            <span className="min-w-0 flex-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border/70 bg-surface-strong/25 px-3 py-4 text-center">
                        <Iconify icon="solar:clipboard-remove-bold-duotone" width={22} className="mx-auto text-muted/50" />
                        <p className="mt-2 text-[0.75rem] font-bold text-muted">
                          Belum ada SoW untuk role ini
                        </p>
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-border/60 bg-surface px-2.5 py-2 focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]">
                      <Iconify icon="solar:add-circle-bold-duotone" width={15} className="shrink-0 text-primary/70" />
                      <input
                        type="text"
                        value={newSow}
                        onChange={(e) => setNewSow(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addSowItem();
                        }}
                        placeholder="Tambah SoW baru..."
                        className="min-w-0 flex-1 border-0 bg-transparent text-[0.75rem] font-semibold text-text outline-none placeholder:text-muted/50"
                      />
                      <button
                        type="button"
                        onClick={addSowItem}
                        disabled={!newSow.trim()}
                        className="rounded-lg bg-primary px-3 py-1.5 text-[0.68rem] font-extrabold text-white transition-all hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Add
                      </button>
                    </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyText>Belum ada role</EmptyText>
            )}
          </Section>
        </div>
      </Scrollbar>
    </>
  );
}

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <section>
      <h4 className="mb-2 flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-muted">
        <Iconify icon={icon} width={13} className="text-primary/60" />
        {title}
      </h4>
      <div>{children}</div>
    </section>
  );
}

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  empty?: boolean;
  emptyText?: string;
}

function InfoRow({ icon, label, value, empty = false, emptyText }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-surface-strong/55 px-3 py-2.5">
      <Iconify
        icon={icon}
        width={16}
        className={`shrink-0 ${empty ? "text-muted/40" : "text-primary/70"}`}
      />
      <div className="min-w-0 flex-1">
        <div className="text-[0.6rem] font-bold uppercase tracking-wider text-muted">
          {label}
        </div>
        <div
          className={`text-[0.8rem] font-semibold ${
            empty ? "italic text-muted/60" : "text-text"
          }`}
        >
          {empty ? emptyText : value}
        </div>
      </div>
    </div>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-surface-strong/40 px-3 py-2.5 text-[0.75rem] italic text-muted/60">
      {children}
    </p>
  );
}
