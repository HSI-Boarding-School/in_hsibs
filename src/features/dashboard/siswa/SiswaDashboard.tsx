import { motion } from "motion/react";
import type { Session } from "../../../types";
import { projects } from "../../../data/monitoring/projectData";
import { monthlyEntries, weeklyEntries } from "../../../data/monitoring/reportData";
import { MiniBadge } from "./components";
import {
  SiswaHomePage,
  SiswaMappingPage,
  SiswaMonitoringPage,
  SiswaProfilePage,
  SiswaReportingPage,
} from "./pages";
import { getSiswaProfile, shortId } from "./utils";

interface SiswaDashboardProps {
  user: Session;
  activePage: string;
}

const siswaPages = ["home", "mapping", "monitoring", "report", "profile"];

export function SiswaDashboard({ user, activePage }: SiswaDashboardProps) {
  const santri = getSiswaProfile(user.userId);
  const sid = shortId(santri.id);
  const weekly = weeklyEntries.find((entry) => entry.sid === sid);
  const monthly = monthlyEntries.find((entry) => entry.sid === sid);
  const myProjects = projects.filter((project) => project.div === santri.divs[0]);
  const page = siswaPages.includes(activePage) ? activePage : "home";

  return (
    <motion.div
      className="grid gap-6"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <Hero userId={user.userId} santriName={santri.name} page={page} />
      {page === "home" && (
        <SiswaHomePage
          santri={santri}
          weekly={weekly}
          monthly={monthly}
          projectCount={myProjects.length}
        />
      )}
      {page === "mapping" && <SiswaMappingPage currentId={santri.id} />}
      {page === "monitoring" && (
        <SiswaMonitoringPage weekly={weekly} monthly={monthly} projectCount={myProjects.length} />
      )}
      {page === "report" && <SiswaReportingPage />}
      {page === "profile" && <SiswaProfilePage santri={santri} />}
    </motion.div>
  );
}

function Hero({ userId, santriName, page }: { userId: string; santriName: string; page: string }) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-border/70 bg-gradient-to-br from-surface via-surface/92 to-primary/8 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.09)] max-sm:p-5">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/14 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue/10 blur-3xl" />
      <div className="relative flex items-end justify-between gap-5 max-lg:flex-col max-lg:items-start">
        <div>
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-primary">
            Siswa Portal
          </span>
          <h1 className="mt-4 font-(--font-family-head) text-4xl font-extrabold tracking-tight text-primary-dark max-sm:text-3xl">
            Assalamualaikum, {santriName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-muted">
            Portal pribadi untuk submit laporan, upload evidence, memantau deadline, dan melihat mapping secara read-only.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 max-sm:w-full">
          <MiniBadge label="User" value={userId} />
          <MiniBadge label="Page" value={page} />
        </div>
      </div>
    </section>
  );
}
