import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../../../components/iconify/iconify";
import { projects, trackColors, statusBadge } from "../../../../../data/monitoring/projectData";
import { santriList } from "../../../../../data/santriData";

const santriNameMap = new Map(santriList.map((s) => [s.id, s.name]));

const divs = ["All", "AC", "DEEN", "DKV", "IT", "OPS", "PKBM", "Dakwah"];

export function ProjectView() {
  const [filterDiv, setFilterDiv] = useState("All");

  const filtered = useMemo(
    () => (filterDiv === "All" ? projects : projects.filter((p) => p.div === filterDiv || p.track.includes(filterDiv))),
    [filterDiv],
  );

  const stats = useMemo(() => {
    return {
      total: projects.length,
      idea: projects.filter((p) => p.status === "Idea").length,
      inProgress: projects.filter((p) => p.status === "In Progress").length,
      submitted: projects.filter((p) => p.status === "Submitted").length,
      approved: projects.filter((p) => p.status === "Approved").length,
    };
  }, []);

  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="flex items-center gap-4 max-sm:flex-col max-sm:items-start">
        <div className="flex items-center gap-2 scrollbar-x pb-1">
          {divs.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setFilterDiv(d)}
              className={`rounded-full px-4 py-1.5 text-[0.75rem] font-bold whitespace-nowrap transition-all ${
                filterDiv === d
                  ? "bg-primary text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]"
                  : "bg-surface text-text hover:bg-primary-soft hover:text-primary-dark border border-border/50"
              }`}
            >
              {d === "All" ? "All Divisions" : d}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-muted/40" />
          Idea {stats.idea}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber" />
          In Progress {stats.inProgress}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue" />
          Submitted {stats.submitted}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green" />
          Approved {stats.approved}
        </span>
        <span className="font-bold text-text">{stats.total} Total</span>
      </div>

      <div className="grid gap-3">
        {filtered.map((project, i) => (
          <motion.div
            key={project.id}
            className="rounded-xl border border-white/80 bg-surface/85 p-[18px] shadow-[0_8px_30px_rgba(39,49,38,0.06)]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.18 }}
          >
            <div className="flex items-start justify-between gap-4 max-sm:flex-col">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[0.7rem] font-bold text-primary">
                    {project.id}
                  </span>
                  {project.wajib && (
                    <span className="rounded-full bg-orange/10 px-2.5 py-0.5 text-[0.6rem] font-bold text-orange">
                      Wajib
                    </span>
                  )}
                  <span className={`rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold ${trackColors[project.track] || "bg-surface-strong text-muted"}`}>
                    {project.track}
                  </span>
                  <span className="rounded-full bg-surface-strong px-2.5 py-0.5 text-[0.6rem] font-bold text-muted">
                    {project.div}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold ${statusBadge[project.status] || "bg-surface-strong text-muted"}`}>
                    {project.status}
                  </span>
                </div>

                <h3 className="mt-2 font-(--font-family-head) text-base font-extrabold text-primary-dark">
                  {project.name}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.7rem] text-muted">
                  <span className="flex items-center gap-1">
                    <Iconify icon="solar:users-group-rounded-bold-duotone" width={12} />
                    {project.owners.map((oid) => santriNameMap.get(oid) || oid).join(", ")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Iconify icon="solar:folder-with-files-bold-duotone" width={12} />
                    {project.platform}
                  </span>
                  <span className="flex items-center gap-1">
                    <Iconify icon="solar:shield-user-bold-duotone" width={12} />
                    {project.reviewer}
                  </span>
                </div>
              </div>

              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[0.7rem] font-bold text-white transition-all hover:bg-primary-dark"
                >
                  <Iconify icon="solar:link-bold-duotone" width={14} />
                  Open
                </a>
              ) : (
                <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-surface-strong px-3 py-2 text-[0.7rem] font-bold text-muted">
                  <Iconify icon="solar:link-bold-duotone" width={14} />
                  No link
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
