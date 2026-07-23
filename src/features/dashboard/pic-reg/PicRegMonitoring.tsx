import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { santriList } from "../../../data/santriData";
import {
  monthlyEntries,
  weeklyEntries,
} from "../../../data/monitoring/reportData";

const CURRENT_REGION = "Regional Barat";
const PIC_NAME = "Kak Hana";
const shortId = (id: string) => id.replace("IN_HSIBS_", "");

type MonTab = "monthly" | "weekly" | "dispensasi";
const tabs: { id: MonTab; label: string; icon: string }[] = [
  {
    id: "monthly",
    label: "Monthly Evaluation",
    icon: "solar:calendar-minimalistic-bold-duotone",
  },
  {
    id: "weekly",
    label: "Weekly Review",
    icon: "solar:file-text-bold-duotone",
  },
  {
    id: "dispensasi",
    label: "Izin & Dispensasi",
    icon: "solar:shield-user-bold-duotone",
  },
];

const dispensasiList = [
  {
    id: "D001",
    santri: "Raka Maulana",
    type: "Izin Tidak Hadir",
    date: "2025-07-20",
    reason: "Keperluan keluarga mendesak",
    status: "pending" as const,
  },
  {
    id: "D002",
    santri: "Siti Aisyah",
    type: "Dispensasi Terlambat",
    date: "2025-07-21",
    reason: "Perjalanan dari lokasi jauh",
    status: "pending" as const,
  },
  {
    id: "D003",
    santri: "Hilman Syauqi",
    type: "Perpanjangan Deadline",
    date: "2025-07-22",
    reason: "Butuh waktu tambahan QA project",
    status: "approved" as const,
  },
];

export function PicRegMonitoring() {
  const [activeTab, setActiveTab] = useState<MonTab>("monthly");
  const [approvedIds, setApprovedIds] = useState<Set<string>>(
    new Set(["D003"]),
  );
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());

  const gyrStats = useMemo(
    () => ({
      G: monthlyEntries.filter((m) => m.status === "Green").length,
      Y: monthlyEntries.filter((m) => m.status === "Yellow").length,
      R: monthlyEntries.filter((m) => m.status === "Red").length,
      total: monthlyEntries.length || 1,
    }),
    [],
  );

  const pendingWeekly = useMemo(
    () => weeklyEntries.filter((w) => !w.validated),
    [],
  );

  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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
          Monitoring Regional
        </h1>
        <p className="mt-1 text-sm text-muted">
          Review evaluasi bulanan, validasi weekly, dan approve izin/dispensasi
          santri regional.
        </p>
      </div>

      {/* GYR overview */}
      <section className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Total Evaluasi",
            value: gyrStats.total,
            cls: "bg-primary/10 text-primary",
          },
          {
            label: "Green",
            value: gyrStats.G,
            cls: "bg-[#16a34a]/10 text-[#16a34a]",
          },
          {
            label: "Yellow",
            value: gyrStats.Y,
            cls: "bg-amber/10 text-amber-700",
          },
          { label: "Red", value: gyrStats.R, cls: "bg-pink-50 text-pink-700" },
        ].map((s, i) => (
          <motion.article
            key={s.label}
            className="rounded-xl border border-white/80 bg-surface/85 p-4 shadow-[0_14px_40px_rgba(39,49,38,0.08)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.22 }}
          >
            <span
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${s.cls}`}
            >
              <Iconify icon="solar:chart-square-bold-duotone" width={16} />
            </span>
            <p className="mt-3 font-(--font-family-head) text-2xl font-extrabold text-primary-dark">
              {s.value}
            </p>
            <p className="text-xs font-bold text-muted">{s.label}</p>
          </motion.article>
        ))}
      </section>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const count =
            tab.id === "weekly"
              ? pendingWeekly.length
              : tab.id === "dispensasi"
                ? dispensasiList.filter(
                    (d) => !approvedIds.has(d.id) && !rejectedIds.has(d.id),
                  ).length
                : 0;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-[0.82rem] font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)]"
                  : "border border-border/50 bg-surface text-text hover:bg-primary-soft"
              }`}
            >
              <Iconify icon={tab.icon} width={17} />
              {tab.label}
              {count > 0 && (
                <span
                  className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.6rem] font-black ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-orange/10 text-orange"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {/* Monthly */}
          {activeTab === "monthly" && (
            <div className="grid gap-3">
              {monthlyEntries.map((entry, i) => {
                const santri = santriList.find(
                  (s) => shortId(s.id) === entry.sid,
                );
                const statusCls =
                  entry.status === "Green"
                    ? "bg-green-50 text-green-700"
                    : entry.status === "Yellow"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-pink-50 text-pink-700";
                return (
                  <motion.article
                    key={entry.sid}
                    className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.22 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-(--font-family-head) text-base font-extrabold text-primary-dark">
                          {santri?.name ?? entry.sid}
                        </h3>
                        <p className="text-xs text-muted">
                          {santri?.loc} · {entry.month}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[0.65rem] font-black ${statusCls}`}
                      >
                        {entry.status}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {[
                        {
                          l: "SoW",
                          v: `${entry.sowPct}%`,
                          w: entry.sowPct < 60,
                        },
                        { l: "Adab", v: `${entry.adab}/5`, w: entry.adab < 3 },
                        {
                          l: "Learn",
                          v: String(entry.learnAtt),
                          w: entry.learnAtt === 0,
                        },
                        {
                          l: "Project",
                          v: String(entry.projApproved),
                          w: entry.projApproved === 0,
                        },
                      ].map((m) => (
                        <div
                          key={m.l}
                          className="rounded-lg bg-surface-strong/60 p-2 text-center"
                        >
                          <p className="text-[0.55rem] font-bold uppercase text-muted">
                            {m.l}
                          </p>
                          <p
                            className={`mt-0.5 text-sm font-black ${m.w ? "text-orange" : "text-primary-dark"}`}
                          >
                            {m.v}
                          </p>
                        </div>
                      ))}
                    </div>
                    {entry.issues && (
                      <p className="mt-2 rounded-lg bg-orange/5 border border-orange/20 px-3 py-2 text-xs font-semibold text-orange">
                        ⚠ {entry.issues}
                      </p>
                    )}
                    <div className="mt-3 flex justify-end border-t border-border/60 pt-3">
                      <button
                        type="button"
                        className="rounded-lg bg-primary px-4 py-2 text-[0.72rem] font-black text-white hover:bg-primary-dark active:scale-95"
                      >
                        Finalize Evaluation
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}

          {/* Weekly */}
          {activeTab === "weekly" && (
            <div className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
              <h3 className="mb-1 font-(--font-family-head) text-lg font-extrabold text-primary-dark">
                Pending Weekly Validation
              </h3>
              <p className="mb-4 text-sm text-muted">
                {pendingWeekly.length} laporan menunggu validasi
              </p>
              {pendingWeekly.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Iconify
                    icon="solar:check-circle-bold-duotone"
                    width={36}
                    className="text-[#16a34a]/40"
                  />
                  <p className="text-sm font-bold text-muted">
                    Semua weekly sudah divalidasi
                  </p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {pendingWeekly.map((entry, i) => {
                    const santri = santriList.find(
                      (s) => shortId(s.id) === entry.sid,
                    );
                    return (
                      <motion.div
                        key={entry.sid}
                        className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-surface p-3.5"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.22 }}
                      >
                        <div className="min-w-0 flex-1">
                          <strong className="text-sm text-primary-dark">
                            {santri?.name ?? entry.sid}
                          </strong>
                          <p className="text-xs text-muted">
                            {entry.week} · {santri?.loc}
                          </p>
                          {entry.highlight && (
                            <p className="mt-1 text-xs font-semibold text-text">
                              {entry.highlight}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          className="shrink-0 rounded-lg bg-primary px-3.5 py-2 text-[0.72rem] font-black text-white hover:bg-primary-dark active:scale-95"
                        >
                          Validate
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Dispensasi */}
          {activeTab === "dispensasi" && (
            <div className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
              <h3 className="mb-1 font-(--font-family-head) text-lg font-extrabold text-primary-dark">
                Izin & Dispensasi
              </h3>
              <p className="mb-4 text-sm text-muted">
                Final approve dilakukan oleh PIC Reg. PIC Div hanya melakukan
                review tahap pertama.
              </p>
              <div className="grid gap-3">
                {dispensasiList.map((item, i) => {
                  const isApproved = approvedIds.has(item.id);
                  const isRejected = rejectedIds.has(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      className={`rounded-xl border p-4 transition-colors ${
                        isApproved
                          ? "border-green-300/60 bg-green-50/30"
                          : isRejected
                            ? "border-pink-300/60 bg-pink-50/20"
                            : "border-white/80 bg-surface"
                      }`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.22 }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-sm text-primary-dark">
                              {item.santri}
                            </strong>
                            <span className="rounded-full bg-purple/10 px-2 py-0.5 text-[0.62rem] font-black text-purple">
                              {item.type}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted">
                            {item.reason}
                          </p>
                          <p className="text-[0.62rem] text-muted">
                            {item.date}
                          </p>
                        </div>
                        {isApproved ? (
                          <span className="rounded-full bg-[#16a34a] px-3 py-1 text-[0.62rem] font-black text-white">
                            Approved
                          </span>
                        ) : isRejected ? (
                          <span className="rounded-full bg-pink-600 px-3 py-1 text-[0.62rem] font-black text-white">
                            Rejected
                          </span>
                        ) : (
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setApprovedIds((p) => new Set([...p, item.id]))
                              }
                              className="rounded-lg bg-[#16a34a] px-3 py-1.5 text-[0.68rem] font-black text-white hover:opacity-80"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setRejectedIds((p) => new Set([...p, item.id]))
                              }
                              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[0.68rem] font-bold text-muted hover:bg-surface-strong"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
