import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { useLocalStorageState } from "../../../lib/useLocalStorageState";

type SettingsTab =
  | "academic"
  | "users"
  | "org"
  | "report"
  | "journey"
  | "learn"
  | "notification"
  | "schema"
  | "security";

const tabs: { id: SettingsTab; label: string; icon: string; recommended?: boolean }[] = [
  { id: "academic", label: "Academic Year & Batch", icon: "solar:calendar-mark-bold-duotone" },
  { id: "users", label: "Users & Roles", icon: "solar:users-group-rounded-bold-duotone" },
  { id: "org", label: "Units, Divisions & Locations", icon: "solar:buildings-2-bold-duotone" },
  { id: "report", label: "Report Rules", icon: "solar:document-text-bold-duotone" },
  { id: "journey", label: "User Journey", icon: "solar:route-bold-duotone" },
  { id: "learn", label: "Learn & Webinar", icon: "solar:shield-keyhole-bold-duotone", recommended: true },
  { id: "notification", label: "Notification", icon: "solar:bell-bing-bold-duotone", recommended: true },
  { id: "schema", label: "Data Schema", icon: "solar:database-bold-duotone", recommended: true },
  { id: "security", label: "Security & Audit", icon: "solar:lock-keyhole-bold-duotone", recommended: true },
];

const reportRules = [
  { title: "Daily Log", desc: "Plan pagi + recap sore", rule: "Optional reminder" },
  { title: "Weekly Review", desc: "Submit tiap akhir pekan, PIC Div validate", rule: "Required" },
  { title: "Monthly Evaluation", desc: "PIC Div + PIC Reg review bersama", rule: "Mukafaah gate" },
  { title: "Mukafaah Eligibility", desc: "Learn + Weekly + Monthly + Project + Adab", rule: "Auto-check" },
];

const journeySteps = [
  { title: "Onboarding", desc: "Import data santri, set unit, lokasi, divisi, dan role awal." },
  { title: "Assignment", desc: "PIC memilih SoW dan target project berdasarkan role santri." },
  { title: "Daily Routine", desc: "Santri submit daily log, PIC memberi remind/revisi jika perlu." },
  { title: "Weekly Review", desc: "PIC validasi progress, blocker, dan catatan pembinaan." },
  { title: "Monthly Evaluation", desc: "Evaluasi SoW, project, learn attendance, adab, dan mukafaah." },
];

export function AdminDashboardSettings() {
  const [active, setActive] = useState<SettingsTab>("report");

  const activeMeta = useMemo(() => tabs.find((tab) => tab.id === active)!, [active]);

  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-primary">
          System Configuration
        </p>
        <h1 className="font-(--font-family-head) text-4xl font-extrabold tracking-tight text-primary-dark">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted">
          Atur struktur program, rule laporan, alur user, dan kontrol operasional dashboard.
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
                  {tab.recommended && !selected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/70" aria-label="Recommended" />
                  )}
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
                <p className="text-[0.68rem] font-semibold text-muted">
                  {activeMeta.recommended ? "Recommended configuration" : "Core configuration"}
                </p>
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
              {active === "academic" && <AcademicSettings />}
              {active === "users" && <UsersRolesSettings />}
              {active === "org" && <OrgSettings />}
              {active === "report" && <ReportRulesSettings />}
              {active === "journey" && <JourneySettings />}
              {active === "learn" && <LearnSettings />}
              {active === "notification" && <NotificationSettings />}
              {active === "schema" && <SchemaSettings />}
              {active === "security" && <SecuritySettings />}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </motion.div>
  );
}

function AcademicSettings() {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
        <Field label="Tahun Ajaran" value="2025/2026" icon="solar:calendar-bold-duotone" />
        <Field label="Angkatan Aktif" value="Angkatan 8" icon="solar:users-group-two-rounded-bold-duotone" />
      </div>
      <Card title="Batch Timeline" icon="solar:calendar-search-bold-duotone">
        <div className="grid gap-2">
          <TimelineRow label="Onboarding" date="Jul 2025" active />
          <TimelineRow label="Internship Active" date="Aug 2025 - May 2026" active />
          <TimelineRow label="Final Evaluation" date="Jun 2026" />
        </div>
      </Card>
    </div>
  );
}

function UsersRolesSettings() {
  const rows = [
    ["Admin", "Full dashboard access", "3 users"],
    ["PIC Div", "Review divisi, learn, project", "12 users"],
    ["PIC Reg", "Monitoring lokasi dan santri", "8 users"],
    ["Siswa", "Submit report dan lihat progres", "21 users"],
  ];
  return (
    <Card title="Role Matrix" icon="solar:shield-user-bold-duotone">
      <div className="grid gap-2">
        {rows.map(([role, desc, count]) => (
          <SettingRow key={role} title={role} desc={desc} right={<Badge>{count}</Badge>} />
        ))}
      </div>
    </Card>
  );
}

function OrgSettings() {
  return (
    <div className="grid gap-4">
      <Card title="Units" icon="solar:buildings-bold-duotone">
        <ChipList items={["HSI BS", "HSI BO", "STIT Riyadh"]} />
      </Card>
      <Card title="Divisions" icon="solar:widget-4-bold-duotone">
        <ChipList items={["AC", "DEEN", "DKV", "IT", "OPS", "PKBM"]} />
      </Card>
      <Card title="Locations" icon="solar:map-point-bold-duotone">
        <ChipList items={["Sukabumi", "Bekasi", "Purworejo", "Bantul", "Solo", "Pandeglang", "Remote"]} />
      </Card>
    </div>
  );
}

function ReportRulesSettings() {
  const [enabled, setEnabled] = useLocalStorageState<Record<string, boolean>>(
    "in_hsibs.settings.reportRules.enabled",
    Object.fromEntries(reportRules.map((rule) => [rule.title, true])),
  );

  return (
    <div className="grid gap-2">
      {reportRules.map((rule) => (
        <SettingRow
          key={rule.title}
          title={rule.title}
          desc={rule.desc}
          right={
            <div className="flex items-center gap-3 max-sm:w-full max-sm:justify-between">
              <span className="min-w-[220px] rounded-xl border border-border bg-surface-strong/45 px-3 py-2 text-[0.72rem] font-extrabold text-text max-sm:min-w-0">
                {rule.rule}
              </span>
              <Toggle checked={enabled[rule.title]} onChange={() => setEnabled((prev) => ({ ...prev, [rule.title]: !prev[rule.title] }))} />
            </div>
          }
        />
      ))}
    </div>
  );
}

function JourneySettings() {
  return (
    <div className="grid gap-3">
      {journeySteps.map((step, index) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.04, duration: 0.16 }}
          className="flex gap-3 rounded-xl border border-border/60 bg-surface-strong/30 p-3"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-[0.72rem] font-black text-primary">
            {index + 1}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-text">{step.title}</h3>
            <p className="mt-0.5 text-[0.76rem] leading-relaxed text-muted">{step.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function LearnSettings() {
  return (
    <div className="grid gap-2">
      <SettingRow title="Monthly Learn Attendance" desc="Minimal 1 sesi learn/webinar per bulan" right={<Toggle checked onChange={() => {}} />} />
      <SettingRow title="Role-Specific Learn" desc="Aktifkan sesi belajar berbasis role/divisi" right={<Toggle checked onChange={() => {}} />} />
      <SettingRow title="Certificate Gate" desc="Sertifikat muncul jika attendance dan evaluation lengkap" right={<Toggle checked={false} onChange={() => {}} />} />
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="grid gap-2">
      <SettingRow title="Daily Reminder" desc="Ingatkan santri yang belum submit daily log" right={<Badge>17:00</Badge>} />
      <SettingRow title="PIC Review Alert" desc="Notify PIC saat ada laporan pending/revisi" right={<Toggle checked onChange={() => {}} />} />
      <SettingRow title="Escalation" desc="Naikkan alert jika 3 hari berturut-turut belum submit" right={<Toggle checked onChange={() => {}} />} />
    </div>
  );
}

function SchemaSettings() {
  return (
    <div className="grid gap-2">
      <SettingRow title="Santri Profile" desc="Unit, divisi, role, lokasi, PIC, status" right={<Badge>Stable</Badge>} />
      <SettingRow title="Report Queue" desc="Daily, weekly, monthly, revision state, history event" right={<Badge>Active</Badge>} />
      <SettingRow title="SoW & Project" desc="Scope of work per role dan project templates" right={<Badge>Draft</Badge>} />
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="grid gap-2">
      <SettingRow title="Audit Trail" desc="Catat verify, revisi, remind, mark done, dan perubahan role" right={<Toggle checked onChange={() => {}} />} />
      <SettingRow title="Role Permissions" desc="Batasi akses fitur berdasarkan role user" right={<Toggle checked onChange={() => {}} />} />
      <SettingRow title="Backup & Export" desc="Export data report dan mapping per bulan" right={<Badge>Recommended</Badge>} />
    </div>
  );
}

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

function Field({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface-strong/28 p-4">
      <Iconify icon={icon} width={18} className="mb-3 text-primary" />
      <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 font-(--font-family-head) text-lg font-extrabold text-primary-dark">{value}</p>
    </div>
  );
}

function TimelineRow({ label, date, active }: { label: string; date: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-surface/70 px-3 py-2">
      <span className="flex items-center gap-2 text-sm font-bold text-text">
        <span className={`h-2 w-2 rounded-full ${active ? "bg-green-500" : "bg-border"}`} />
        {label}
      </span>
      <span className="text-[0.72rem] font-bold text-muted">{date}</span>
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
      <button type="button" className="rounded-full border border-dashed border-primary/40 px-3 py-1.5 text-[0.72rem] font-extrabold text-primary hover:bg-primary-soft/40">
        + Add
      </button>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full bg-primary-soft px-3 py-1 text-[0.68rem] font-extrabold text-primary ring-1 ring-inset ring-primary/20">
      {children}
    </span>
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
