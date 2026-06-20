import { useState } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { Scrollbar } from "../../../components/scrollbar";

// ─── Types ──────────────────────────────────────────────────────────────────

interface TodoItem {
  id: number;
  text: string;
  done: boolean;
  priority: "high" | "medium" | "low";
}

// ─── Hijri helpers ──────────────────────────────────────────────────────────

function toHijri(date: Date): { day: number; month: number; year: number } {
  // Algorithmic Gregorian → Hijri conversion (Umm al-Qura approximation)
  const jd =
    Math.floor((date.getTime() - new Date("1970-01-01").getTime()) / 86400000) +
    2440588;
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const ll = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - ll) / 5316) * Math.floor((50 * ll) / 17719) +
    Math.floor(ll / 5670) * Math.floor((43 * ll) / 15238);
  const ll2 =
    ll -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * ll2) / 709);
  const day = ll2 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { day, month, year };
}

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabiul Awal",
  "Rabiul Akhir",
  "Jumadal Ula",
  "Jumadal Akhirah",
  "Rajab",
  "Sya'ban",
  "Ramadan",
  "Syawal",
  "Dzulqo'dah",
  "Dzulhijjah",
];

const HIJRI_DAYS = [
  "Ahad",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

// ─── Data ────────────────────────────────────────────────────────────────────

const homeStats = [
  {
    id: "active",
    label: "Active Santri",
    value: 221,
    sub: "Aktif internship saat ini",
    icon: "solar:square-academic-cap-bold-duotone",
    tone: "blue" as const,
    bg: "bg-blue/10",
    iconColor: "text-blue",
  },
  {
    id: "reports",
    label: "Total Report",
    value: 86,
    sub: "Report tersedia",
    icon: "solar:file-text-bold-duotone",
    tone: "purple" as const,
    bg: "bg-purple/10",
    iconColor: "text-purple",
  },
  {
    id: "atRisk",
    label: "Butuh Tindak Lanjut",
    value: 17,
    sub: "Perlu tindakan segera",
    icon: "solar:shield-user-bold-duotone",
    tone: "orange" as const,
    bg: "bg-orange/10",
    iconColor: "text-orange",
  },
  {
    id: "mukafaah",
    label: "Mukafaah Ready",
    value: 0,
    sub: "Eligible saat data terpenuhi",
    icon: "solar:wallet-money-bold-duotone",
    tone: "green" as const,
    bg: "bg-[#16a34a]/10",
    iconColor: "text-[#16a34a]",
  },
];

const initialTodos: TodoItem[] = [
  {
    id: 1,
    text: "Review laporan harian santri regional timur",
    done: false,
    priority: "high",
  },
  {
    id: 2,
    text: "Validasi data penempatan batch Q2",
    done: false,
    priority: "high",
  },
  {
    id: 3,
    text: "Kirim notifikasi follow-up ke 17 santri at-risk",
    done: false,
    priority: "high",
  },
  {
    id: 4,
    text: "Update mapping divisi Dakwah",
    done: true,
    priority: "medium",
  },
  {
    id: 5,
    text: "Koordinasi PIC Regional untuk kunjungan bulan ini",
    done: false,
    priority: "medium",
  },
  {
    id: 6,
    text: "Cek kelengkapan data mukafaah",
    done: false,
    priority: "low",
  },
];

const unitDistribution = [
  { label: "Pendidikan", value: 58, color: "bg-primary" },
  { label: "Dakwah", value: 42, color: "bg-blue" },
  { label: "Administrasi", value: 35, color: "bg-purple" },
  { label: "Tahfidz", value: 48, color: "bg-[#2f6ea5]" },
  { label: "IT & Media", value: 21, color: "bg-orange" },
  { label: "Kesehatan", value: 17, color: "bg-[#7357b6]" },
];
const maxUnit = Math.max(...unitDistribution.map((u) => u.value));

const atRiskSantri = [
  {
    id: 1,
    name: "Ahmad Rasyid Hakim",
    unit: "Pendidikan",
    region: "Jakarta Timur",
    issue: "Laporan mingguan belum dikirim",
    lastActive: "3 hari lalu",
    severity: "high" as const,
  },
  {
    id: 2,
    name: "Farid Maulana",
    unit: "Dakwah",
    region: "Bandung Barat",
    issue: "Progres di bawah 60% — perlu review",
    lastActive: "2 hari lalu",
    severity: "high" as const,
  },
  {
    id: 3,
    name: "Zulfa Nur Aini",
    unit: "Administrasi",
    region: "Surabaya Utara",
    issue: "Data penempatan belum diverifikasi",
    lastActive: "5 hari lalu",
    severity: "medium" as const,
  },
  {
    id: 4,
    name: "Hilman Syauqi",
    unit: "Tahfidz",
    region: "Yogyakarta",
    issue: "Tidak ada check-in selama 1 minggu",
    lastActive: "7 hari lalu",
    severity: "high" as const,
  },
  {
    id: 5,
    name: "Salsabila Putri",
    unit: "IT & Media",
    region: "Semarang",
    issue: "PIC belum melakukan validasi bulanan",
    lastActive: "4 hari lalu",
    severity: "medium" as const,
  },
  {
    id: 6,
    name: "Rizky Aditya",
    unit: "Kesehatan",
    region: "Malang",
    issue: "Mukafaah pending — dokumen tidak lengkap",
    lastActive: "1 hari lalu",
    severity: "low" as const,
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function HijriCalendarCard() {
  const today = new Date();
  const hijri = toHijri(today);
  const dayName = HIJRI_DAYS[today.getDay()];
  const monthName = HIJRI_MONTHS[(hijri.month - 1 + 12) % 12];

  // Build a simple mini-month grid (1–30 days)
  const daysInMonth = 30;
  // Approximate first-day-of-month offset (simplified)
  const firstDayOffset = (today.getDay() - ((hijri.day - 1) % 7) + 7) % 7;
  const cells: (number | null)[] = [
    ...Array(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <article className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-muted">
            Kalender Hijriah
          </p>
          <h3 className="mt-0.5 font-(--font-family-head) text-xl font-extrabold text-primary-dark">
            {monthName} {hijri.year}H
          </h3>
          <p className="text-sm text-muted">
            {dayName}, {hijri.day} {monthName}
          </p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Iconify
            icon="solar:calendar-minimalistic-bold-duotone"
            width={22}
            className="text-primary"
          />
        </span>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {["Ah", "Sn", "Sl", "Rb", "Km", "Jm", "Sb"].map((d) => (
          <span
            key={d}
            className="text-[0.65rem] font-black uppercase text-muted"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-y-0.5 text-center text-xs">
        {cells.map((cell, i) => (
          <span
            key={i}
            className={[
              "inline-flex h-7 w-full items-center justify-center rounded-md text-[0.72rem] font-semibold",
              cell === hijri.day
                ? "bg-primary font-black text-white"
                : cell !== null
                  ? "text-text hover:bg-surface-strong"
                  : "",
            ].join(" ")}
          >
            {cell ?? ""}
          </span>
        ))}
      </div>
    </article>
  );
}

function UnitDistributionCard() {
  return (
    <article className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-muted">
            Unit Distribution
          </p>
          <h3 className="mt-0.5 font-(--font-family-head) text-xl font-extrabold text-primary-dark">
            Distribusi Santri per Unit
          </h3>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Iconify
            icon="solar:chart-square-bold-duotone"
            width={22}
            className="text-primary"
          />
        </span>
      </div>

      <div className="grid gap-3">
        {unitDistribution.map((unit, i) => (
          <motion.div
            key={unit.label}
            className="grid gap-1"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 + i * 0.07, duration: 0.3 }}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text">{unit.label}</span>
              <span className="font-black text-primary-dark">{unit.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-strong">
              <motion.div
                className={["h-full rounded-full", unit.color].join(" ")}
                initial={{ width: 0 }}
                animate={{ width: `${(unit.value / maxUnit) * 100}%` }}
                transition={{
                  delay: 0.1 + i * 0.07,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Donut-style summary */}
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs text-muted">Total santri terdistribusi</span>
        <strong className="text-lg text-primary-dark">
          {unitDistribution.reduce((a, b) => a + b.value, 0)}
        </strong>
      </div>
    </article>
  );
}

function CommandCenter() {
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [newText, setNewText] = useState("");

  function toggle(id: number) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  function addTodo() {
    const text = newText.trim();
    if (!text) return;
    setTodos((prev) => [
      ...prev,
      { id: Date.now(), text, done: false, priority: "medium" },
    ]);
    setNewText("");
  }

  function removeTodo(id: number) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  const priorityDot: Record<string, string> = {
    high: "bg-orange",
    medium: "bg-blue",
    low: "bg-border",
  };

  const done = todos.filter((t) => t.done).length;
  const pct = todos.length ? Math.round((done / todos.length) * 100) : 0;
  const circumference = 2 * Math.PI * 15;

  return (
    <article className="flex flex-col self-start rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
      {/* Header */}
      <div className="mb-4 flex items-center gap-4">
        {/* Progress ring — kiri, lebih besar */}
        <div className="relative h-14 w-14 shrink-0">
          <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="currentColor"
              className="text-surface-strong"
              strokeWidth="2.5"
            />
            <motion.circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="currentColor"
              className="text-primary"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (pct / 100) * circumference}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{
                strokeDashoffset: circumference - (pct / 100) * circumference,
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[0.6rem] font-black text-primary-dark">
            {pct}%
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[0.68rem] font-black uppercase tracking-widest text-primary">
            Admin Command Center
          </p>
          <h3 className="font-(--font-family-head) text-xl font-extrabold leading-tight text-primary-dark">
            Task List
          </h3>
          <p className="text-sm text-muted">
            {done} dari {todos.length} tugas selesai
          </p>
        </div>

        {/* Quick counters */}
        <div className="flex shrink-0 gap-2">
          <div className="flex flex-col items-center rounded-lg bg-orange/10 px-3 py-2">
            <span className="text-lg font-black leading-none text-orange">
              {todos.filter((t) => t.priority === "high" && !t.done).length}
            </span>
            <span className="mt-0.5 text-[0.58rem] font-bold uppercase text-orange/70">
              Kritis
            </span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-surface-strong px-3 py-2">
            <span className="text-lg font-black leading-none text-primary-dark">
              {todos.filter((t) => !t.done).length}
            </span>
            <span className="mt-0.5 text-[0.58rem] font-bold uppercase text-muted">
              Pending
            </span>
          </div>
        </div>
      </div>

      <div className="mb-3 border-t border-border" />

      {/* Todo list — max height agar tidak overflow layout */}
      <Scrollbar className="mb-3 grid max-h-[260px] gap-1.5 content-start pr-1">
        {todos.map((todo) => (
          <motion.div
            key={todo.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={[
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
              todo.done
                ? "bg-surface-strong/40"
                : "bg-surface-strong hover:bg-primary-soft/40",
            ].join(" ")}
          >
            {/* Checkbox */}
            <button
              type="button"
              onClick={() => toggle(todo.id)}
              className={[
                "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all",
                todo.done
                  ? "border-primary bg-primary"
                  : "border-border bg-white hover:border-primary",
              ].join(" ")}
              aria-label={todo.done ? "Tandai belum selesai" : "Tandai selesai"}
            >
              {todo.done && (
                <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            {/* Priority dot */}
            <span
              className={[
                "h-2 w-2 shrink-0 rounded-full",
                priorityDot[todo.priority],
              ].join(" ")}
            />

            {/* Text */}
            <span
              className={[
                "flex-1 text-sm leading-snug",
                todo.done ? "text-muted line-through" : "font-medium text-text",
              ].join(" ")}
            >
              {todo.text}
            </span>

            {/* Kritis badge */}
            {!todo.done && todo.priority === "high" && (
              <span className="shrink-0 rounded-full bg-orange/10 px-2 py-0.5 text-[0.6rem] font-black text-orange">
                Kritis
              </span>
            )}

            {/* Delete */}
            <button
              type="button"
              onClick={() => removeTodo(todo.id)}
              className="invisible ml-1 shrink-0 text-muted transition-colors hover:text-orange group-hover:visible"
              aria-label="Hapus"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </motion.div>
        ))}
      </Scrollbar>

      {/* Add todo */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 transition-all focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]">
        <input
          className="flex-1 border-0 bg-transparent text-sm text-text outline-none placeholder:text-muted/50"
          placeholder="Tambah tugas baru..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
        />
        <button
          type="button"
          onClick={addTodo}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-black text-white transition-all hover:bg-primary-dark disabled:opacity-40"
          disabled={!newText.trim()}
        >
          Tambah
        </button>
      </div>
    </article>
  );
}

function AtRiskCard() {
  const severityConfig = {
    high: {
      label: "Kritis",
      dot: "bg-orange",
      badge: "bg-orange/10 text-orange",
    },
    medium: { label: "Sedang", dot: "bg-blue", badge: "bg-blue/10 text-blue" },
    low: {
      label: "Rendah",
      dot: "bg-border",
      badge: "bg-surface-strong text-muted",
    },
  };

  return (
    <article className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-orange">
            Butuh Tindak Lanjut
          </p>
          <h3 className="mt-0.5 font-(--font-family-head) text-xl font-extrabold text-primary-dark">
            Santri At-Risk
          </h3>
          <p className="text-sm text-muted">
            {atRiskSantri.length} santri memerlukan perhatian segera
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

      {/* List */}
      <div className="grid gap-2">
        {atRiskSantri.map((santri, i) => {
          const cfg = severityConfig[santri.severity];
          return (
            <motion.div
              key={santri.id}
              className="flex items-start gap-3 rounded-lg border border-border/60 bg-surface p-3.5 transition-colors hover:border-orange/30 hover:bg-orange/5"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25 }}
            >
              {/* Severity dot */}
              <span
                className={[
                  "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                  cfg.dot,
                ].join(" ")}
              />

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <strong className="text-sm text-primary-dark">
                    {santri.name}
                  </strong>
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-[0.65rem] font-black",
                      cfg.badge,
                    ].join(" ")}
                  >
                    {cfg.label}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {santri.unit} · {santri.region}
                </p>
                <p className="mt-1 text-xs font-semibold text-text">
                  {santri.issue}
                </p>
              </div>

              {/* Last active + action */}
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="text-[0.65rem] text-muted whitespace-nowrap">
                  {santri.lastActive}
                </span>
                <button
                  type="button"
                  className="rounded-md bg-primary-dark px-2.5 py-1 text-[0.65rem] font-black text-white transition-opacity hover:opacity-80"
                >
                  Tindak Lanjut
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted">
          {atRiskSantri.filter((s) => s.severity === "high").length} kritis ·{" "}
          {atRiskSantri.filter((s) => s.severity === "medium").length} sedang ·{" "}
          {atRiskSantri.filter((s) => s.severity === "low").length} rendah
        </span>
        <button
          type="button"
          className="text-xs font-black text-primary transition-colors hover:text-primary-dark"
        >
          Lihat semua →
        </button>
      </div>
    </article>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function AdminDashboardHome() {
  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-primary">
          Command Center
        </p>
        <h1 className="font-(--font-family-head) text-4xl font-extrabold tracking-tight text-primary-dark">
          Home
        </h1>
        <p className="mt-1 text-sm text-muted">
          Ringkasan real data, prioritas aksi, dan status program.
        </p>
      </div>

      {/* Stat cards */}
      <section
        className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1"
        aria-label="Statistik utama"
      >
        {homeStats.map((stat, i) => (
          <motion.article
            key={stat.id}
            className="relative overflow-hidden rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.25 }}
          >
            {/* Icon bg blob */}
            <span
              className={[
                "absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-lg",
                stat.bg,
              ].join(" ")}
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
                      : "text-primary-dark",
              ].join(" ")}
            >
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted">{stat.sub}</p>
          </motion.article>
        ))}
      </section>

      {/* Command center + Calendar + Unit distribution */}
      <section className="grid grid-cols-[1fr_320px] gap-4 max-lg:grid-cols-1">
        {/* Left: Command center (todo) */}
        <CommandCenter />

        {/* Right: Calendar + Unit distribution stacked */}
        <div className="flex flex-col gap-4">
          <HijriCalendarCard />
          <UnitDistributionCard />
        </div>
      </section>

      {/* At-risk santri */}
      <AtRiskCard />
    </motion.div>
  );
}
