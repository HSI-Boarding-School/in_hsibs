import { useState, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../../../components/iconify/iconify";
import { CustomSelect } from "../../../../../components/ui/CustomSelect";
import { projects as initialProjects, trackColors, statusBadge } from "../../../../../data/monitoring/projectData";
import type { Project } from "../../../../../data/monitoring/projectData";
import { santriList } from "../../../../../data/santriData";
import { ProjectForm } from "./ProjectForm";
import { useLocalStorageState } from "../../../../../lib/useLocalStorageState";

const santriNameMap = new Map(santriList.map((s) => [s.id, s.name]));

const DIV_FILTER_OPTIONS = [
  { value: "All", label: "Semua Divisi", icon: "solar:layers-bold-duotone" },
  { value: "AC", label: "Academic", icon: "solar:graph-new-bold-duotone" },
  { value: "DEEN", label: "DEEN", icon: "solar:book-bookmark-bold-duotone" },
  { value: "DKV", label: "DKV", icon: "solar:palette-bold-duotone" },
  { value: "IT", label: "IT", icon: "solar:code-bold-duotone" },
  { value: "OPS", label: "OPS", icon: "solar:settings-minimalistic-bold-duotone" },
  { value: "PKBM", label: "PKBM", icon: "solar:notebook-bold-duotone" },
  { value: "Dakwah", label: "Dakwah", icon: "solar:microphone-3-bold-duotone" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "All", label: "Semua Status", icon: "solar:layers-bold-duotone" },
  { value: "Idea", label: "Idea", icon: "solar:lightbulb-bold-duotone" },
  { value: "In Progress", label: "In Progress", icon: "solar:clock-circle-bold-duotone" },
  { value: "Submitted", label: "Submitted", icon: "solar:upload-bold-duotone" },
  { value: "Approved", label: "Approved", icon: "solar:check-circle-bold-duotone" },
  { value: "Archived", label: "Archived", icon: "solar:archive-bold-duotone" },
];

export function ProjectView() {
  const [projects, setProjects] = useLocalStorageState<Project[]>(
    "in_hsibs.monitoring.projects",
    initialProjects,
  );
  const [filterDiv, setFilterDiv] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        if (filterDiv !== "All" && !(p.div === filterDiv || p.track.includes(filterDiv))) return false;
        if (filterStatus !== "All" && p.status !== filterStatus) return false;
        if (search) {
          const q = search.toLowerCase();
          const hay = `${p.id} ${p.name} ${p.track} ${p.div} ${p.platform} ${p.reviewer}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      }),
    [projects, filterDiv, filterStatus, search],
  );

  const stats = useMemo(() => {
    return {
      total: projects.length,
      idea: projects.filter((p) => p.status === "Idea").length,
      inProgress: projects.filter((p) => p.status === "In Progress").length,
      submitted: projects.filter((p) => p.status === "Submitted").length,
      approved: projects.filter((p) => p.status === "Approved").length,
    };
  }, [projects]);

  const handleAddProject = useCallback((draft: Omit<Project, "id">) => {
    setProjects((prev) => {
      const nextNum = String(prev.length + 1).padStart(3, "0");
      const id = `P${nextNum}`;
      return [{ ...draft, id }, ...prev];
    });
  }, []);

  const hasActiveFilters = filterDiv !== "All" || filterStatus !== "All" || search !== "";

  const resetFilters = () => {
    setFilterDiv("All");
    setFilterStatus("All");
    setSearch("");
  };

  return (
    <motion.div
      className="grid gap-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-surface/85 p-2 shadow-[0_4px_14px_rgba(39,49,38,0.05)]">
        <div className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-surface-strong/60 px-3 py-2 ring-1 ring-inset ring-transparent transition-all duration-150 focus-within:bg-surface focus-within:ring-primary/40 max-md:basis-full md:min-w-[180px]">
          <Iconify
            icon="solar:magnifer-bold-duotone"
            width={14}
            className="shrink-0 text-muted/70 transition-colors group-focus-within:text-primary"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari project..."
            className="min-w-0 flex-1 border-0 bg-transparent text-[0.8rem] text-text outline-none placeholder:text-muted/50"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-muted/70 transition-colors hover:text-text"
              aria-label="Clear"
            >
              <Iconify icon="solar:close-circle-bold-duotone" width={13} />
            </button>
          )}
        </div>

        <CustomSelect
          value={filterDiv}
          onChange={setFilterDiv}
          options={DIV_FILTER_OPTIONS}
          icon="solar:widget-4-bold-duotone"
          className="flex-1 max-sm:basis-[calc(50%-0.25rem)] md:flex-none md:min-w-[170px]"
        />
        <CustomSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={STATUS_FILTER_OPTIONS}
          icon="solar:pulse-bold-duotone"
          className="flex-1 max-sm:basis-[calc(50%-0.25rem)] md:flex-none md:min-w-[170px]"
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-[0.7rem] font-bold text-muted transition-colors hover:bg-surface-strong hover:text-primary max-md:basis-full max-md:justify-center"
            title="Reset filter"
          >
            <Iconify icon="solar:restart-bold" width={13} />
            Reset
          </button>
        )}

        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[0.75rem] font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all hover:bg-primary-dark active:scale-95 max-md:ml-0 max-md:w-full max-md:justify-center"
        >
          <Iconify icon="mingcute:add-line" width={14} />
          Tambah Project
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
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

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/40 py-16">
          <Iconify
            icon="solar:folder-with-files-bold-duotone"
            width={40}
            className="text-muted/40"
          />
          <p className="mt-3 text-sm font-bold text-muted">Tidak ada project yang cocok</p>
          <p className="mt-1 text-xs text-muted/60">Coba ubah filter atau tambah project baru</p>
        </div>
      ) : (
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
                      {project.owners.length > 0
                        ? project.owners.map((oid) => santriNameMap.get(oid) || oid).join(", ")
                        : "Belum ada owner"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Iconify icon="solar:folder-with-files-bold-duotone" width={12} />
                      {project.platform || "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Iconify icon="solar:shield-user-bold-duotone" width={12} />
                      {project.reviewer || "—"}
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
      )}

      <ProjectForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleAddProject}
      />
    </motion.div>
  );
}
