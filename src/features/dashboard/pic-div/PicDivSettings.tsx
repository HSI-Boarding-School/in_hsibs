import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { useLocalStorageState } from "../../../lib/useLocalStorageState";
import { santriList } from "../../../data/santriData";

const CURRENT_DIVISION = "IT";
const CURRENT_DIVISION_LABEL = "IT";
const PIC_NAME = "Kak Andy";

type SettingsTab = "profile" | "sow" | "notification" | "permission";

const tabs: { id: SettingsTab; label: string; icon: string; desc: string }[] = [
  { id: "profile", label: "Profil & Scope", icon: "solar:user-id-bold-duotone", desc: "Identitas PIC dan cakupan divisi" },
  { id: "sow", label: "Role & SoW Divisi", icon: "solar:document-add-bold-duotone", desc: "Kelola role dan scope of work divisi" },
  { id: "notification", label: "Notifikasi", icon: "solar:bell-bing-bold-duotone", desc: "Preferensi pengingat dan alert" },
  { id: "permission", label: "Hak Akses", icon: "solar:shield-keyhole-bold-duotone", desc: "Batasan kewenangan PIC Divisi" },
];

const divisionRoles: Record<string, string[]> = {
  AC: ["Asmen IT", "Asmen B. English", "Pengajar SDIT", "Pengajar TPQ"],
  DEEN: ["Tahfidz", "Arabic", "Musyrif"],
  DKV: ["Designer", "Video Editor", "OBS Operator", "Photographer", "Social Media", "Copywriter"],
  IT: ["Developer", "QA", "IT Helpdesk", "System Admin"],
  OPS: ["Administration", "Customer Service", "Sarpras", "Imam", "Muadzin", "Front Office"],
  PKBM: ["BOS Operator", "ARKAS Operator", "SIMBOS Operator"],
};

// Permissions — mirrors the PRD for PIC Div role
const permissions: { allowed: boolean; label: string; desc: string }[] = [
  { allowed: true, label: "Melihat santri dalam scope divisi", desc: "Akses profil, progress, dan laporan santri binaan divisi" },
  { allowed: true, label: "Validasi Weekly Review", desc: "Approve/reject laporan mingguan santri divisi" },
  { allowed: true, label: "Review Monthly Evaluation draft", desc: "Review dan beri catatan pada draft evaluasi bulanan" },
  { allowed: true, label: "CRUD Role & SoW dalam scope divisi", desc: "Kelola role dan scope of work khusus divisinya" },
  { allowed: true, label: "Assign/custom SoW untuk santri binaan", desc: "Menetapkan dan menyesuaikan SoW per santri" },
  { allowed: true, label: "Memberikan PIC note", desc: "Catatan pembinaan pada weekly dan monthly report" },
  { allowed: true, label: "Request placement/role adjustment", desc: "Mengajukan perubahan penempatan atau role santri" },
  { allowed: true, label: "Review special report tahap pertama", desc: "Screening awal laporan khusus sebelum ke Admin" },
  { allowed: false, label: "Final approve perubahan Unit/Location/Region", desc: "Hanya dapat mengajukan — approval final oleh Admin" },
  { allowed: false, label: "Final approve izin besar", desc: "Izin besar membutuhkan approval Admin" },
  { allowed: false, label: "Full CRUD master data global", desc: "Master data global dikelola oleh Admin" },
];

export function PicDivSettings() {
  const [active, setActive] = useState<SettingsTab>("profile");

  const activeMeta = useMemo(() => tabs.find((t) => t.id === active)!, [active]);

  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div>
        <div className="flex items-center gap-3">
          <p className="text-xs font-black uppercase tracking-widest text-primary">PIC Divisi</p>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-black text-primary">
            {CURRENT_DIVISION_LABEL}
          </span>
        </div>
        <h1 className="mt-1 font-(--font-family-head) text-4xl font-extrabold tracking-tight text-primary-dark">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted">
          Kelola profil, SoW divisi, preferensi notifikasi, dan lihat batasan kewenangan.
        </p>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-4 max-lg:grid-cols-1">
        <aside className="rounded-2xl border border-border/70 bg-surface/78 p-2 shadow-[0_14px_40px_rgba(39,49,38,0.06)] backdrop-blur-md">
          <nav className="grid gap-1" aria-label="Settings sections">
            {tabs.map((tab) => {
              const selected = active === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-3 text-left text-[0.82rem] font-extrabold transition-all ${
                    selected
                      ? "bg-surface-strong text-text shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      : "text-muted hover:bg-surface-strong/45 hover:text-text"
                  }`}
                >
                  <Iconify icon={tab.icon} width={16} className={selected ? "text-primary" : "text-muted"} />
                  <span className="min-w-0 flex-1 truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 rounded-2xl border border-border/70 bg-surface/78 p-4 shadow-[0_14px_40px_rgba(39,49,38,0.06)] backdrop-blur-md max-sm:p-3">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Iconify icon={activeMeta.icon} width={18} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-(--font-family-head) text-base font-extrabold text-primary-dark">
                  {activeMeta.label}
                </h2>
                <p className="text-[0.68rem] font-semibold text-muted">{activeMeta.desc}</p>
              </div>
            </div>
            <span className="hidden rounded-full bg-green-50 px-2.5 py-1 text-[0.62rem] font-extrabold text-green-700 ring-1 ring-inset ring-green-200 sm:inline-flex">
              Live
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
            >
              {active === "profile" && <ProfileSettings />}
              {active === "sow" && <SowSettings />}
              {active === "notification" && <NotificationSettings />}
              {active === "permission" && <PermissionSettings />}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </motion.div>
  );
}

// ─── Profile & Scope ─────────────────────────────────────────

function ProfileSettings() {
  const divisionSantri = useMemo(
    () => santriList.filter((s) => s.divs.includes(CURRENT_DIVISION)),
    [],
  );
  const activeCount = divisionSantri.filter((s) => s.status === "Active").length;
  const uniqueLocs = [...new Set(divisionSantri.map((s) => s.loc))];
  const uniqueUnits = [...new Set(divisionSantri.map((s) => s.unit))];

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-surface-strong/24 p-4 max-sm:flex-col max-sm:items-start">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-(--font-family-head) text-2xl font-extrabold text-primary">
          {PIC_NAME.replace("Kak ", "").charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-(--font-family-head) text-lg font-extrabold text-primary-dark">{PIC_NAME}</h3>
          <p className="text-sm text-muted">PIC Divisi {CURRENT_DIVISION_LABEL}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[0.65rem] font-black text-primary">
              Divisi {CURRENT_DIVISION_LABEL}
            </span>
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[0.65rem] font-black text-green-700 ring-1 ring-inset ring-green-200">
              Akun Aktif
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
        <Field label="Santri Binaan" value={`${divisionSantri.length} santri`} icon="solar:users-group-rounded-bold-duotone" />
        <Field label="Santri Aktif" value={`${activeCount} santri`} icon="solar:user-check-bold-duotone" />
      </div>

      <Card title="Cakupan Lokasi" icon="solar:map-point-bold-duotone">
        <ChipList items={uniqueLocs} />
      </Card>
      <Card title="Cakupan Unit" icon="solar:buildings-bold-duotone">
        <ChipList items={uniqueUnits} />
      </Card>
    </div>
  );
}

// ─── Role & SoW Management ───────────────────────────────────

interface SowItem {
  id: string;
  role: string;
  title: string;
  target: string;
}

const defaultSows: SowItem[] = [
  { id: "sow-1", role: "Developer", title: "Bangun fitur sesuai sprint", target: "2 fitur/bulan" },
  { id: "sow-2", role: "QA", title: "Testing & dokumentasi bug", target: "10 test case/bulan" },
  { id: "sow-3", role: "IT Helpdesk", title: "Support tiket unit", target: "Respon < 24 jam" },
  { id: "sow-4", role: "System Admin", title: "Maintenance server & backup", target: "Uptime 99%" },
];

function SowSettings() {
  const [sows, setSows] = useLocalStorageState<SowItem[]>(
    `in_hsibs.picdiv.sow.${CURRENT_DIVISION}`,
    defaultSows,
  );
  const [newRole, setNewRole] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [showForm, setShowForm] = useState(false);

  const roles = divisionRoles[CURRENT_DIVISION] ?? [];

  function handleAdd() {
    if (!newRole || !newTitle.trim() || !newTarget.trim()) return;
    setSows((prev) => [
      ...prev,
      {
        id: `sow-${Date.now()}`,
        role: newRole,
        title: newTitle.trim(),
        target: newTarget.trim(),
      },
    ]);
    setNewRole("");
    setNewTitle("");
    setNewTarget("");
    setShowForm(false);
  }

  function handleDelete(id: string) {
    setSows((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="grid gap-4">
      <Card title={`Role di Divisi ${CURRENT_DIVISION_LABEL}`} icon="solar:shield-user-bold-duotone">
        <div className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <span key={role} className="rounded-full border border-border/60 bg-surface px-3 py-1.5 text-[0.72rem] font-extrabold text-text">
              {role}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[0.7rem] text-muted">
          Penambahan role baru ke master data membutuhkan approval Admin.
        </p>
      </Card>

      <Card title="Scope of Work (SoW) Divisi" icon="solar:document-text-bold-duotone">
        <div className="grid gap-2">
          {sows.map((sow) => (
            <div
              key={sow.id}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface p-3 max-sm:flex-col max-sm:items-stretch"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Iconify icon="solar:clipboard-list-bold-duotone" width={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-extrabold text-text">{sow.title}</p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-black text-primary">
                    {sow.role}
                  </span>
                </div>
                <p className="mt-0.5 text-[0.72rem] text-muted">Target: {sow.target}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(sow.id)}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-border/60 bg-surface px-2.5 py-1.5 text-[0.68rem] font-bold text-muted transition-colors hover:bg-pink-50 hover:text-pink-700 max-sm:justify-center"
              >
                <Iconify icon="solar:trash-bin-2-bold-duotone" width={12} />
                Hapus
              </button>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {showForm ? (
            <motion.div
              className="mt-3 grid gap-2 rounded-xl border border-primary/30 bg-primary-soft/20 p-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="grid grid-cols-3 gap-2 max-md:grid-cols-1">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.78rem] font-bold text-text outline-none focus:border-primary/40"
                >
                  <option value="">Pilih role...</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Judul SoW..."
                  className="rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.78rem] text-text outline-none placeholder:text-muted/55 focus:border-primary/40"
                />
                <input
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  placeholder="Target (mis. 2 fitur/bulan)..."
                  className="rounded-lg border border-border/60 bg-surface px-3 py-2 text-[0.78rem] text-text outline-none placeholder:text-muted/55 focus:border-primary/40"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-[0.72rem] font-bold text-muted transition-colors hover:bg-surface-strong"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!newRole || !newTitle.trim() || !newTarget.trim()}
                  className="rounded-lg bg-primary px-4 py-2 text-[0.72rem] font-black text-white transition-all hover:bg-primary-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Tambah SoW
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="add-sow"
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 px-3 py-2.5 text-[0.75rem] font-extrabold text-primary transition-colors hover:bg-primary-soft/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Iconify icon="solar:add-circle-bold-duotone" width={16} />
              Tambah SoW Baru
            </motion.button>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}

// ─── Notifications ───────────────────────────────────────────

const notifPrefs = [
  { id: "weekly", title: "Weekly Report Reminder", desc: "Alert saat ada weekly review yang belum divalidasi > 2 hari" },
  { id: "sow", title: "SoW Evidence Alert", desc: "Notifikasi saat santri submit bukti SoW baru" },
  { id: "atRisk", title: "At-Risk Santri Alert", desc: "Alert saat santri divisi masuk status Yellow/Red" },
  { id: "special", title: "Special Report Notification", desc: "Notifikasi saat ada special report baru dari santri divisi" },
];

function NotificationSettings() {
  const [enabled, setEnabled] = useLocalStorageState<Record<string, boolean>>(
    "in_hsibs.picdiv.settings.notif",
    Object.fromEntries(notifPrefs.map((p) => [p.id, true])),
  );

  return (
    <div className="grid gap-2">
      {notifPrefs.map((pref) => (
        <SettingRow
          key={pref.id}
          title={pref.title}
          desc={pref.desc}
          right={
            <Toggle
              checked={enabled[pref.id]}
              onChange={() => setEnabled((prev) => ({ ...prev, [pref.id]: !prev[pref.id] }))}
            />
          }
        />
      ))}
    </div>
  );
}

// ─── Permissions ─────────────────────────────────────────────

function PermissionSettings() {
  const allowed = permissions.filter((p) => p.allowed);
  const denied = permissions.filter((p) => !p.allowed);

  return (
    <div className="grid gap-4">
      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-text">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-green-100 text-green-700">
            <Iconify icon="solar:check-circle-bold-duotone" width={14} />
          </span>
          Yang Dapat Dilakukan
        </h3>
        <div className="grid gap-2">
          {allowed.map((perm, i) => (
            <motion.div
              key={perm.label}
              className="flex items-start gap-3 rounded-xl border border-green-200/70 bg-green-50/40 p-3"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.15 }}
            >
              <Iconify icon="solar:check-circle-bold-duotone" width={16} className="mt-0.5 shrink-0 text-green-600" />
              <div className="min-w-0">
                <p className="text-[0.8rem] font-extrabold text-text">{perm.label}</p>
                <p className="mt-0.5 text-[0.7rem] text-muted">{perm.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-text">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-pink-100 text-pink-700">
            <Iconify icon="solar:close-circle-bold-duotone" width={14} />
          </span>
          Yang Tidak Dapat Dilakukan
        </h3>
        <div className="grid gap-2">
          {denied.map((perm, i) => (
            <motion.div
              key={perm.label}
              className="flex items-start gap-3 rounded-xl border border-pink-200/70 bg-pink-50/40 p-3"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.15 }}
            >
              <Iconify icon="solar:close-circle-bold-duotone" width={16} className="mt-0.5 shrink-0 text-pink-600" />
              <div className="min-w-0">
                <p className="text-[0.8rem] font-extrabold text-text">{perm.label}</p>
                <p className="mt-0.5 text-[0.7rem] text-muted">{perm.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-surface-strong/30 p-3">
        <p className="text-[0.72rem] text-muted">
          <Iconify icon="solar:info-circle-bold-duotone" width={13} className="mr-1 inline text-primary" />
          Butuh kewenangan tambahan? Ajukan request ke Admin melalui menu Santri → Request Adjustment.
        </p>
      </div>
    </div>
  );
}

// ─── Shared UI ───────────────────────────────────────────────

function Card({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface-strong/24 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-text">
        <Iconify icon={icon} width={16} className="text-primary" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface-strong/28 p-4">
      <Iconify icon={icon} width={18} className="mb-3 text-primary" />
      <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 font-(--font-family-head) text-lg font-extrabold text-primary-dark">{value}</p>
    </div>
  );
}

function ChipList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full border border-border/60 bg-surface px-3 py-1.5 text-[0.72rem] font-extrabold text-text">
          {item}
        </span>
      ))}
    </div>
  );
}

function SettingRow({ title, desc, right }: { title: string; desc: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 py-3 last:border-b-0 max-sm:flex-col max-sm:items-stretch">
      <div className="min-w-0">
        <h3 className="text-sm font-extrabold text-text">{title}</h3>
        <p className="mt-0.5 text-[0.75rem] font-semibold leading-relaxed text-muted">{desc}</p>
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onChange}
      className={`relative h-8 w-14 rounded-full p-1 transition-colors ${checked ? "bg-green-600" : "bg-surface-strong"}`}
    >
      <span
        className={`block h-6 w-6 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-transform ${checked ? "translate-x-6" : "translate-x-0"}`}
      />
    </button>
  );
}
