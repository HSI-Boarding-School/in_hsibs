import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { santriList } from "../../../data/santriData";
import {
  weeklyEntries,
  monthlyEntries,
} from "../../../data/monitoring/reportData";

const CURRENT_REGION = "Regional Barat";
const PIC_NAME = "Kak Hana";
const shortId = (id: string) => id.replace("IN_HSIBS_", "");

// ─── Data ────────────────────────────────────────────────────────────────────

const locationBreakdown = [
  { loc: "Pondok Al-Huda", santri: 18, gyr: { G: 12, Y: 4, R: 2 } },
  { loc: "Kantor Regional Barat", santri: 14, gyr: { G: 10, Y: 3, R: 1 } },
  { loc: "Masjid Baiturrahman", santri: 11, gyr: { G: 8, Y: 2, R: 1 } },
  { loc: "Unit Tahfidz Utara", santri: 9, gyr: { G: 7, Y: 1, R: 1 } },
  { loc: "SDIT Al-Ikhwan", santri: 8, gyr: { G: 6, Y: 2, R: 0 } },
  { loc: "TPQ Al-Falah", santri: 8, gyr: { G: 5, Y: 2, R: 1 } },
];

const pendingApprovals = [
  {
    id: "PA001",
    santri: "Ahmad Rasyid",
    type: "Placement Change",
    from: "Unit Tahfidz",
    to: "Unit IT",
    requestedBy: "PIC Div IT",
    date: "2025-07-18",
  },
  {
    id: "PA002",
    santri: "Nabila Zahra",
    type: "Location Change",
    from: "Pondok Al-Huda",
    to: "Kantor Regional Barat",
    requestedBy: "Admin",
    date: "2025-07-19",
  },
  {
    id: "PA003",
    santri: "Raka Maulana",
    type: "Dispensasi Izin",
    from: "-",
    to: "-",
    requestedBy: "Santri",
    date: "2025-07-20",
  },
  {
    id: "PA004",
    santri: "Hilman Syauqi",
    type: "Role Adjustment",
    from: "Developer",
    to: "QA",
    requestedBy: "PIC Div IT",
    date: "2025-07-21",
  },
];

const earlyWarnings = [
  {
    id: "EW001",
    santri: "Farid Maulana",
    loc: "Masjid Baiturrahman",
    issue: "Tidak check-in 5 hari berturut-turut",
    level: "high" as const,
  },
  {
    id: "EW002",
    santri: "Siti Aisyah",
    loc: "Pondok Al-Huda",
    issue: "SoW progress < 40% memasuki bulan ke-2",
    level: "high" as const,
  },
  {
    id: "EW003",
    santri: "Zulfa Nur Aini",
    loc: "SDIT Al-Ikhwan",
    issue: "Weekly report 2x berturut-turut tidak terkirim",
    level: "medium" as const,
  },
  {
    id: "EW004",
    santri: "Rizky Aditya",
    loc: "TPQ Al-Falah",
    issue: "Adab score 2/5 pada evaluasi terakhir",
    level: "medium" as const,
  },
  {
    id: "EW005",
    santri: "Salsabila Putri",
    loc: "Unit Tahfidz Utara",
    issue: "Belum ada PIC note 3 minggu terakhir",
    level: "low" as const,
  },
];

const mukafaahReadiness = [
  {
    santri: "Ahmad Fikri",
    sowPct: 92,
    adab: 5,
    learnAtt: 1,
    projApproved: 2,
    status: "ready" as const,
  },
  {
    santri: "Nabila Zahra",
    sowPct: 74,
    adab: 4,
    learnAtt: 1,
    projApproved: 1,
    status: "partial" as const,
  },
  {
    santri: "Raka Maulana",
    sowPct: 61,
    adab: 3,
    learnAtt: 0,
    projApproved: 1,
    status: "not-yet" as const,
  },
  {
    santri: "Siti Aisyah",
    sowPct: 88,
    adab: 4,
    learnAtt: 1,
    projApproved: 2,
    status: "ready" as const,
  },
  {
    santri: "Hilman Syauqi",
    sowPct: 45,
    adab: 2,
    learnAtt: 0,
    projApproved: 0,
    status: "not-yet" as const,
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function GyrBar({
  G,
  Y,
  R,
  total,
}: {
  G: number;
  Y: number;
  R: number;
  total: number;
}) {
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-border/40">
      <span
        className="bg-[#16a34a]"
        style={{ width: `${(G / total) * 100}%` }}
      />
      <span className="bg-amber" style={{ width: `${(Y / total) * 100}%` }} />
      <span className="bg-pink" style={{ width: `${(R / total) * 100}%` }} />
    </div>
  );
}

function LocationBreakdownCard() {
  return (
    <article className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary">
            Region Scope
          </p>
          <h3 className="mt-0.5 font-(--font-family-head) text-xl font-extrabold text-primary-dark">
            Breakdown per Location
          </h3>
          <p className="text-sm text-muted">
            {locationBreakdown.length} lokasi aktif di region
          </p>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue/10">
          <Iconify
            icon="solar:buildings-2-bold-duotone"
            width={22}
            className="text-blue"
          />
        </span>
      </div>
      <div className="grid gap-3">
        {locationBreakdown.map((loc, i) => (
          <motion.div
            key={loc.loc}
            className="rounded-lg border border-border/60 bg-surface p-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.25 }}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-extrabold text-primary-dark">
                {loc.loc}
              </span>
              <span className="text-xs font-black text-muted">
                {loc.santri} santri
              </span>
            </div>
            <GyrBar
              G={loc.gyr.G}
              Y={loc.gyr.Y}
              R={loc.gyr.R}
              total={loc.santri}
            />
            <div className="mt-1.5 flex gap-3 text-[0.62rem] font-bold text-muted">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />G{" "}
                {loc.gyr.G}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber" />Y{" "}
                {loc.gyr.Y}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-pink" />R{" "}
                {loc.gyr.R}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </article>
  );
}

function PendingApprovalCard() {
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [rejected, setRejected] = useState<Set<string>>(new Set());
  const pending = pendingApprovals.filter(
    (p) => !approved.has(p.id) && !rejected.has(p.id),
  );

  return (
    <article className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-orange">
            Pending Approval
          </p>
          <h3 className="mt-0.5 font-(--font-family-head) text-xl font-extrabold text-primary-dark">
            Approval Queue
          </h3>
          <p className="text-sm text-muted">
            {pending.length} item menunggu persetujuan
          </p>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange/10">
          <Iconify
            icon="solar:shield-user-bold-duotone"
            width={22}
            className="text-orange"
          />
        </span>
      </div>
      {pending.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Iconify
            icon="solar:shield-check-bold-duotone"
            width={36}
            className="text-[#16a34a]/40"
          />
          <p className="text-sm font-bold text-muted">
            Semua approval sudah diproses
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {pending.map((item, i) => (
            <motion.div
              key={item.id}
              className="rounded-lg border border-border/60 bg-surface p-3.5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-sm text-primary-dark">
                      {item.santri}
                    </strong>
                    <span className="rounded-full bg-orange/10 px-2 py-0.5 text-[0.62rem] font-black text-orange">
                      {item.type}
                    </span>
                  </div>
                  {item.from !== "-" && (
                    <p className="mt-0.5 text-xs text-muted">
                      {item.from} → {item.to}
                    </p>
                  )}
                  <p className="text-[0.65rem] text-muted">
                    By {item.requestedBy} · {item.date}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setApproved((p) => new Set([...p, item.id]))}
                    className="rounded-lg bg-[#16a34a] px-3 py-1.5 text-[0.68rem] font-black text-white hover:opacity-80"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejected((p) => new Set([...p, item.id]))}
                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[0.68rem] font-bold text-muted hover:bg-surface-strong"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </article>
  );
}

function EarlyWarningCard() {
  const levelCfg = {
    high: {
      dot: "bg-orange",
      badge: "bg-orange/10 text-orange",
      label: "Kritis",
    },
    medium: {
      dot: "bg-amber",
      badge: "bg-amber/10 text-amber-700",
      label: "Sedang",
    },
    low: {
      dot: "bg-border",
      badge: "bg-surface-strong text-muted",
      label: "Rendah",
    },
  };

  return (
    <article className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-orange">
            Early Warning
          </p>
          <h3 className="mt-0.5 font-(--font-family-head) text-xl font-extrabold text-primary-dark">
            Sinyal Perlu Perhatian
          </h3>
          <p className="text-sm text-muted">
            {earlyWarnings.length} indikator aktif
          </p>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange/10">
          <Iconify
            icon="solar:shield-warning-bold-duotone"
            width={22}
            className="text-orange"
          />
        </span>
      </div>
      <div className="grid gap-2">
        {earlyWarnings.map((w, i) => {
          const cfg = levelCfg[w.level];
          return (
            <motion.div
              key={w.id}
              className="flex items-start gap-3 rounded-lg border border-border/60 bg-surface p-3.5 hover:border-orange/30 hover:bg-orange/5 transition-colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25 }}
            >
              <span
                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dot}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <strong className="text-sm text-primary-dark">
                    {w.santri}
                  </strong>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.62rem] font-black ${cfg.badge}`}
                  >
                    {cfg.label}
                  </span>
                </div>
                <p className="text-[0.65rem] text-muted">{w.loc}</p>
                <p className="mt-1 text-xs font-semibold text-text">
                  {w.issue}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-md bg-primary-dark px-2.5 py-1 text-[0.62rem] font-black text-white hover:opacity-80"
              >
                Tindak
              </button>
            </motion.div>
          );
        })}
      </div>
    </article>
  );
}

function MukafaahReadinessCard() {
  const readyCfg = {
    ready: {
      label: "Ready",
      cls: "bg-[#16a34a]/10 text-[#16a34a]",
      dot: "bg-[#16a34a]",
    },
    partial: {
      label: "Partial",
      cls: "bg-amber/10 text-amber-700",
      dot: "bg-amber",
    },
    "not-yet": {
      label: "Belum",
      cls: "bg-border text-muted",
      dot: "bg-border",
    },
  };
  const ready = mukafaahReadiness.filter((m) => m.status === "ready").length;
  const partial = mukafaahReadiness.filter(
    (m) => m.status === "partial",
  ).length;
  const notYet = mukafaahReadiness.filter((m) => m.status === "not-yet").length;

  return (
    <article className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#16a34a]">
            Mukafaah
          </p>
          <h3 className="mt-0.5 font-(--font-family-head) text-xl font-extrabold text-primary-dark">
            Readiness Status
          </h3>
          <p className="text-sm text-muted">
            {ready} siap · {partial} partial · {notYet} belum
          </p>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#16a34a]/10">
          <Iconify
            icon="solar:wallet-money-bold-duotone"
            width={22}
            className="text-[#16a34a]"
          />
        </span>
      </div>
      <div className="grid gap-2">
        {mukafaahReadiness.map((m, i) => {
          const cfg = readyCfg[m.status];
          return (
            <motion.div
              key={m.santri}
              className="rounded-lg border border-border/60 bg-surface p-3"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.22 }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                  <strong className="text-sm text-primary-dark">
                    {m.santri}
                  </strong>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[0.62rem] font-black ${cfg.cls}`}
                >
                  {cfg.label}
                </span>
              </div>
              <div className="mt-2 flex gap-3 text-[0.65rem] text-muted">
                <span>SoW {m.sowPct}%</span>
                <span>Adab {m.adab}/5</span>
                <span>Learn {m.learnAtt}</span>
                <span>Project {m.projApproved}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted">
          Finalize oleh PIC Reg setelah semua kriterira terpenuhi
        </span>
        <button
          type="button"
          className="rounded-lg bg-[#16a34a] px-3 py-1.5 text-[0.68rem] font-black text-white hover:opacity-80 disabled:opacity-40"
          disabled={ready === 0}
        >
          Finalize {ready} Santri
        </button>
      </div>
    </article>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function PicRegHome() {
  const regionSantri = useMemo(() => santriList, []);
  const totalSantri = regionSantri.length;
  const atRiskCount = useMemo(
    () =>
      monthlyEntries.filter((m) => m.status === "Yellow" || m.status === "Red")
        .length,
    [],
  );
  const pendingCount = useMemo(
    () => weeklyEntries.filter((w) => !w.validated).length,
    [],
  );
  const mukafaahReady = mukafaahReadiness.filter(
    (m) => m.status === "ready",
  ).length;

  const homeStats = [
    {
      id: "santri",
      label: "Santri Regional",
      value: totalSantri,
      sub: `Dalam scope ${CURRENT_REGION}`,
      icon: "solar:square-academic-cap-bold-duotone",
      tone: "blue" as const,
      bg: "bg-blue/10",
      iconColor: "text-blue",
    },
    {
      id: "atRisk",
      label: "Butuh Tindak Lanjut",
      value: atRiskCount,
      sub: "Status Yellow/Red",
      icon: "solar:shield-warning-bold-duotone",
      tone: "orange" as const,
      bg: "bg-orange/10",
      iconColor: "text-orange",
    },
    {
      id: "pending",
      label: "Pending Approval",
      value: pendingApprovals.length,
      sub: "Menunggu persetujuan",
      icon: "solar:file-text-bold-duotone",
      tone: "purple" as const,
      bg: "bg-purple/10",
      iconColor: "text-purple",
    },
    {
      id: "mukafaah",
      label: "Mukafaah Ready",
      value: mukafaahReady,
      sub: "Siap di-finalize",
      icon: "solar:wallet-money-bold-duotone",
      tone: "green" as const,
      bg: "bg-[#16a34a]/10",
      iconColor: "text-[#16a34a]",
    },
  ];

  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
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
          Regional Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted">
          Assalamualaikum, {PIC_NAME}. Monitor seluruh santri regional, kelola
          approval, dan finalize mukafaah.
        </p>
      </div>

      {/* Stat cards */}
      <section className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {homeStats.map((stat, i) => (
          <motion.article
            key={stat.id}
            className="relative overflow-hidden rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.25 }}
          >
            <span
              className={`absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}
            >
              <Iconify icon={stat.icon} width={22} className={stat.iconColor} />
            </span>
            <p className="text-xs font-bold text-muted">{stat.label}</p>
            <p
              className={[
                "mt-2 font-(--font-family-head) text-4xl font-extrabold tracking-tight",
                stat.tone === "blue"
                  ? "text-blue"
                  : stat.tone === "orange"
                    ? "text-orange"
                    : stat.tone === "purple"
                      ? "text-purple"
                      : "text-[#16a34a]",
              ].join(" ")}
            >
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted">{stat.sub}</p>
          </motion.article>
        ))}
      </section>

      {/* Main layout — wide left, narrow right */}
      <section className="grid grid-cols-[1fr_340px] gap-4 max-lg:grid-cols-1">
        <div className="grid gap-4">
          <LocationBreakdownCard />
          <PendingApprovalCard />
        </div>
        <div className="flex flex-col gap-4">
          <EarlyWarningCard />
          <MukafaahReadinessCard />
        </div>
      </section>
    </motion.div>
  );
}
