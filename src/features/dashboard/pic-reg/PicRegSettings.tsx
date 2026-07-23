import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { santriList } from "../../../data/santriData";
import { useLocalStorageState } from "../../../lib/useLocalStorageState";

const CURRENT_REGION = "Regional Barat";
const PIC_NAME = "Kak Hana";

type SettingsTab = "profile" | "pic-management" | "notification" | "permission";

const tabs: { id: SettingsTab; label: string; icon: string; desc: string }[] = [
  {
    id: "profile",
    label: "Profil & Scope",
    icon: "solar:user-id-bold-duotone",
    desc: "Identitas PIC Reg dan cakupan regional",
  },
  {
    id: "pic-management",
    label: "Kelola PIC",
    icon: "solar:users-group-rounded-bold-duotone",
    desc: "Assign PIC Div dan undang ASR PIC",
  },
  {
    id: "notification",
    label: "Notifikasi",
    icon: "solar:bell-bold-duotone",
    desc: "Preferensi pengingat dan alert regional",
  },
  {
    id: "permission",
    label: "Hak Akses",
    icon: "solar:shield-user-bold-duotone",
    desc: "Batasan kewenangan PIC Regional",
  },
];

const permissions: { allowed: boolean; label: string; desc: string }[] = [
  {
    allowed: true,
    label: "Melihat seluruh santri dalam region",
    desc: "Akses profil, progress, dan laporan semua santri regional",
  },
  {
    allowed: true,
    label: "Approve placement change (Unit/Location/Region)",
    desc: "Final approve perubahan penempatan santri dalam region",
  },
  {
    allowed: true,
    label: "Final approve izin & dispensasi",
    desc: "Approve izin besar setelah review PIC Div",
  },
  {
    allowed: true,
    label: "Finalize monthly evaluation",
    desc: "Konfirmasi akhir evaluasi bulanan sebelum ke Admin",
  },
  {
    allowed: true,
    label: "Review mukafaah readiness",
    desc: "Cek dan finalize status mukafaah santri regional",
  },
  {
    allowed: true,
    label: "Assign PIC Div sesuai kebutuhan regional",
    desc: "Assign atau reassign PIC Div untuk divisi tertentu",
  },
  {
    allowed: true,
    label: "Invite/assign PIC baru (ASR)",
    desc: "Mengundang PIC baru untuk assignment fleksibel",
  },
  {
    allowed: false,
    label: "Hapus data global tanpa Admin",
    desc: "Penghapusan data global hanya boleh dilakukan Admin",
  },
  {
    allowed: false,
    label: "Ubah konfigurasi sistem global",
    desc: "Konfigurasi sistem di luar scope regional hanya Admin",
  },
];

const notifPrefs = [
  {
    id: "atRisk",
    title: "At-Risk Alert",
    desc: "Notifikasi saat ada santri masuk status Yellow/Red di region",
  },
  {
    id: "approval",
    title: "Approval Request",
    desc: "Alert saat ada placement change atau dispensasi menunggu",
  },
  {
    id: "mukafaah",
    title: "Mukafaah Readiness",
    desc: "Notifikasi saat santri mencapai kriteria mukafaah",
  },
  {
    id: "monthly",
    title: "Monthly Evaluation Due",
    desc: "Pengingat finalize evaluasi bulanan",
  },
  {
    id: "weekly",
    title: "Weekly Pending",
    desc: "Alert saat weekly review terlambat > 3 hari",
  },
];

const mockPicDivs = [
  { id: "PD001", name: "Kak Andy", division: "IT", assigned: true },
  { id: "PD002", name: "Kak Risma", division: "DKV", assigned: true },
  { id: "PD003", name: "Kak Fauzan", division: "OPS", assigned: true },
  { id: "PD004", name: "Kak Laila", division: "DEEN", assigned: false },
];

export function PicRegSettings() {
  const [active, setActive] = useState<SettingsTab>("profile");
  const activeMeta = useMemo(
    () => tabs.find((t) => t.id === active)!,
    [active],
  );

  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div>
        <div className="flex items-center gap-3">
          <p className="text-xs font-black uppercase tracking-widest text-primary">
            PIC Regional
          </p>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-black text-primary">
            {CURRENT_REGION}
          </span>
        </div>
        <h1 className="mt-1 font-(--font-family-head) text-4xl font-extrabold tracking-tight text-primary-dark">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted">
          Kelola profil, PIC, notifikasi, dan lihat hak akses regional.
        </p>
      </div>

      <div className="grid grid-cols-[260px_1fr] gap-4 max-lg:grid-cols-1">
        {/* Sidebar nav */}
        <aside className="rounded-2xl border border-border/70 bg-surface/78 p-2 shadow-[0_14px_40px_rgba(39,49,38,0.06)]">
          <nav className="grid gap-1">
            {tabs.map((tab) => {
              const sel = active === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-3 text-left text-[0.82rem] font-extrabold transition-all ${
                    sel
                      ? "bg-surface-strong text-text"
                      : "text-muted hover:bg-surface-strong/45 hover:text-text"
                  }`}
                >
                  <Iconify
                    icon={tab.icon}
                    width={16}
                    className={sel ? "text-primary" : "text-muted"}
                  />
                  <span className="min-w-0 flex-1 truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <section className="rounded-2xl border border-border/70 bg-surface/78 p-4 shadow-[0_14px_40px_rgba(39,49,38,0.06)]">
          <div className="mb-4 flex items-center gap-3 border-b border-border/60 pb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Iconify icon={activeMeta.icon} width={18} />
            </span>
            <div>
              <h2 className="font-(--font-family-head) text-base font-extrabold text-primary-dark">
                {activeMeta.label}
              </h2>
              <p className="text-[0.68rem] font-semibold text-muted">
                {activeMeta.desc}
              </p>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
            >
              {active === "profile" && <ProfileTab />}
              {active === "pic-management" && <PicManagementTab />}
              {active === "notification" && <NotificationTab />}
              {active === "permission" && <PermissionTab />}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </motion.div>
  );
}

function ProfileTab() {
  const santriCount = santriList.length;
  const locCount = [...new Set(santriList.map((s) => s.loc))].length;
  const activeCount = santriList.filter((s) => s.status === "Active").length;

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-surface-strong/24 p-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 font-(--font-family-head) text-2xl font-extrabold text-primary">
          {PIC_NAME.replace("Kak ", "").charAt(0)}
        </div>
        <div>
          <h3 className="font-(--font-family-head) text-lg font-extrabold text-primary-dark">
            {PIC_NAME}
          </h3>
          <p className="text-sm text-muted">PIC Regional · {CURRENT_REGION}</p>
          <div className="mt-2 flex gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[0.65rem] font-black text-primary">
              {CURRENT_REGION}
            </span>
            <span className="rounded-full bg-[#16a34a]/10 px-2.5 py-1 text-[0.65rem] font-black text-[#16a34a] ring-1 ring-inset ring-[#16a34a]/20">
              Aktif
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Santri", value: santriCount },
          { label: "Santri Aktif", value: activeCount },
          { label: "Lokasi", value: locCount },
        ].map((f) => (
          <div
            key={f.label}
            className="rounded-2xl border border-border/60 bg-surface-strong/28 p-4 text-center"
          >
            <p className="font-(--font-family-head) text-2xl font-extrabold text-primary-dark">
              {f.value}
            </p>
            <p className="mt-1 text-xs font-bold text-muted">{f.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PicManagementTab() {
  const [pics, setPics] = useState(mockPicDivs);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteDiv, setInviteDiv] = useState("");

  return (
    <div className="grid gap-4">
      <div>
        <h3 className="mb-3 text-sm font-extrabold text-text flex items-center gap-2">
          <Iconify
            icon="solar:users-group-rounded-bold-duotone"
            width={16}
            className="text-primary"
          />
          PIC Divisi Aktif
        </h3>
        <div className="grid gap-2">
          {pics.map((pic) => (
            <div
              key={pic.id}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface p-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-(--font-family-head) font-extrabold text-primary">
                {pic.name.replace("Kak ", "").charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-text">{pic.name}</p>
                <p className="text-xs text-muted">Divisi {pic.division}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[0.62rem] font-black ${
                  pic.assigned
                    ? "bg-[#16a34a]/10 text-[#16a34a]"
                    : "bg-border text-muted"
                }`}
              >
                {pic.assigned ? "Assigned" : "Available"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showInvite ? (
          <motion.div
            className="rounded-xl border border-primary/30 bg-primary-soft/20 p-4 grid gap-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-sm font-extrabold text-primary-dark">
              Undang PIC Baru (ASR)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Nama PIC..."
                className="rounded-lg border border-border/60 bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary/40"
              />
              <input
                value={inviteDiv}
                onChange={(e) => setInviteDiv(e.target.value)}
                placeholder="Divisi/scope..."
                className="rounded-lg border border-border/60 bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary/40"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-bold text-muted hover:bg-surface-strong"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (inviteName.trim() && inviteDiv.trim()) {
                    setPics((p) => [
                      ...p,
                      {
                        id: `PD00${p.length + 1}`,
                        name: inviteName,
                        division: inviteDiv,
                        assigned: false,
                      },
                    ]);
                    setInviteName("");
                    setInviteDiv("");
                    setShowInvite(false);
                  }
                }}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-black text-white hover:bg-primary-dark"
              >
                Undang
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            type="button"
            onClick={() => setShowInvite(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 px-3 py-3 text-[0.75rem] font-extrabold text-primary hover:bg-primary-soft/40"
          >
            <Iconify icon="solar:user-plus-bold-duotone" width={16} />
            Undang PIC Baru (ASR)
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationTab() {
  const [enabled, setEnabled] = useLocalStorageState<Record<string, boolean>>(
    "in_hsibs.picreg.settings.notif",
    Object.fromEntries(notifPrefs.map((p) => [p.id, true])),
  );

  return (
    <div className="grid gap-2">
      {notifPrefs.map((pref) => (
        <div
          key={pref.id}
          className="flex items-center justify-between gap-4 border-b border-border/50 py-3 last:border-b-0"
        >
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-text">{pref.title}</h3>
            <p className="mt-0.5 text-[0.75rem] font-semibold leading-relaxed text-muted">
              {pref.desc}
            </p>
          </div>
          <button
            type="button"
            aria-pressed={enabled[pref.id]}
            onClick={() =>
              setEnabled((p) => ({ ...p, [pref.id]: !p[pref.id] }))
            }
            className={`relative h-8 w-14 shrink-0 rounded-full p-1 transition-colors ${enabled[pref.id] ? "bg-[#16a34a]" : "bg-surface-strong"}`}
          >
            <span
              className={`block h-6 w-6 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-transform ${enabled[pref.id] ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}

function PermissionTab() {
  const allowed = permissions.filter((p) => p.allowed);
  const denied = permissions.filter((p) => !p.allowed);

  return (
    <div className="grid gap-4">
      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-text">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#16a34a]/10 text-[#16a34a]">
            <Iconify icon="solar:check-circle-bold-duotone" width={14} />
          </span>
          Yang Dapat Dilakukan
        </h3>
        <div className="grid gap-2">
          {allowed.map((p, i) => (
            <motion.div
              key={p.label}
              className="flex items-start gap-3 rounded-xl border border-[#16a34a]/20 bg-[#16a34a]/5 p-3"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.15 }}
            >
              <Iconify
                icon="solar:check-circle-bold-duotone"
                width={15}
                className="mt-0.5 shrink-0 text-[#16a34a]"
              />
              <div>
                <p className="text-[0.8rem] font-extrabold text-text">
                  {p.label}
                </p>
                <p className="mt-0.5 text-[0.7rem] text-muted">{p.desc}</p>
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
          {denied.map((p, i) => (
            <motion.div
              key={p.label}
              className="flex items-start gap-3 rounded-xl border border-pink-200/70 bg-pink-50/40 p-3"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.15 }}
            >
              <Iconify
                icon="solar:close-circle-bold-duotone"
                width={15}
                className="mt-0.5 shrink-0 text-pink-600"
              />
              <div>
                <p className="text-[0.8rem] font-extrabold text-text">
                  {p.label}
                </p>
                <p className="mt-0.5 text-[0.7rem] text-muted">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
