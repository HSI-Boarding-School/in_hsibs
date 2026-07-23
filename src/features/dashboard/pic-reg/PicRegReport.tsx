import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../../components/iconify/iconify";
import { santriList } from "../../../data/santriData";
import { monthlyEntries } from "../../../data/monitoring/reportData";

const CURRENT_REGION = "Regional Barat";
const shortId = (id: string) => id.replace("IN_HSIBS_", "");

type Filter = "all" | "Green" | "Yellow" | "Red";
const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "Green", label: "Green" },
  { id: "Yellow", label: "Yellow" },
  { id: "Red", label: "Red" },
];

export function PicRegReport() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [finalizedIds, setFinalizedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return monthlyEntries.filter((m) => {
      if (filter !== "all" && m.status !== filter) return false;
      if (search) {
        const santri = santriList.find((s) => shortId(s.id) === m.sid);
        const hay =
          `${m.sid} ${santri?.name ?? ""} ${santri?.loc ?? ""}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [filter, search]);

  const stats = useMemo(
    () => ({
      total: monthlyEntries.length,
      green: monthlyEntries.filter((m) => m.status === "Green").length,
      yellow: monthlyEntries.filter((m) => m.status === "Yellow").length,
      red: monthlyEntries.filter((m) => m.status === "Red").length,
      finalized: finalizedIds.size,
    }),
    [finalizedIds],
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
          Monthly Report Review
        </h1>
        <p className="mt-1 text-sm text-muted">
          Finalize evaluasi bulanan seluruh santri regional. PIC Reg melakukan
          final review sebelum ke Admin.
        </p>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-5 gap-3 max-lg:grid-cols-3">
        {[
          {
            label: "Total",
            value: stats.total,
            cls: "bg-primary/10 text-primary",
          },
          {
            label: "Green",
            value: stats.green,
            cls: "bg-[#16a34a]/10 text-[#16a34a]",
          },
          {
            label: "Yellow",
            value: stats.yellow,
            cls: "bg-amber/10 text-amber-700",
          },
          { label: "Red", value: stats.red, cls: "bg-pink-50 text-pink-700" },
          {
            label: "Finalized",
            value: `${stats.finalized}/${stats.total}`,
            cls: "bg-blue/10 text-blue",
          },
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
              <Iconify icon="solar:file-text-bold-duotone" width={15} />
            </span>
            <p className="mt-2 font-(--font-family-head) text-2xl font-extrabold text-primary-dark">
              {s.value}
            </p>
            <p className="text-xs font-bold text-muted">{s.label}</p>
          </motion.article>
        ))}
      </section>

      {/* Filters */}
      <div className="flex items-center gap-3 max-lg:flex-col max-lg:items-stretch">
        <div className="flex flex-1 items-center gap-2.5 rounded-[14px] border-[1.5px] border-border bg-surface px-3.5 text-muted focus-within:border-primary/40">
          <Iconify icon="solar:magnifer-bold-duotone" width={18} />
          <input
            className="flex-1 border-0 bg-transparent py-3 text-sm text-text outline-none placeholder:text-muted/55"
            placeholder="Cari santri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-xl px-3.5 py-2 text-[0.78rem] font-bold whitespace-nowrap transition-all ${
                filter === f.id
                  ? "bg-primary text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)]"
                  : "border border-border/50 bg-surface text-text hover:bg-primary-soft"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/60 bg-surface/40 py-14">
          <Iconify
            icon="solar:file-text-bold-duotone"
            width={36}
            className="text-muted/40"
          />
          <p className="text-sm font-bold text-muted">
            Tidak ada evaluasi yang cocok
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((entry, i) => {
            const santri = santriList.find((s) => shortId(s.id) === entry.sid);
            const isFinalized = finalizedIds.has(entry.sid);
            const statusCls =
              entry.status === "Green"
                ? "bg-green-50 text-green-700"
                : entry.status === "Yellow"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-pink-50 text-pink-700";
            return (
              <motion.article
                key={entry.sid}
                className={`rounded-xl border p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)] ${
                  isFinalized
                    ? "border-[#16a34a]/40 bg-[#16a34a]/5"
                    : "border-white/80 bg-surface/85"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.22 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-(--font-family-head) text-base font-extrabold text-primary-dark">
                      {santri?.name ?? entry.sid}
                    </h3>
                    <p className="text-xs text-muted">
                      {santri?.unit} · {santri?.loc} · {entry.month}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[0.65rem] font-black ${statusCls}`}
                    >
                      {entry.status}
                    </span>
                    {isFinalized && (
                      <span className="rounded-full bg-[#16a34a] px-2.5 py-1 text-[0.65rem] font-black text-white">
                        Finalized
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {[
                    { l: "SoW", v: `${entry.sowPct}%`, w: entry.sowPct < 60 },
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
                {(entry.picRegNote || entry.picDivNote) && (
                  <div className="mt-3 grid gap-2">
                    {entry.picRegNote && (
                      <p className="rounded-lg bg-blue/5 border border-blue/20 px-3 py-2 text-xs text-text">
                        <span className="font-black text-blue">PIC Reg: </span>
                        {entry.picRegNote}
                      </p>
                    )}
                    {entry.picDivNote && (
                      <p className="rounded-lg bg-purple/5 border border-purple/20 px-3 py-2 text-xs text-text">
                        <span className="font-black text-purple">
                          PIC Div:{" "}
                        </span>
                        {entry.picDivNote}
                      </p>
                    )}
                  </div>
                )}
                <div className="mt-3 flex justify-end border-t border-border/60 pt-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFinalizedIds((p) => {
                        const n = new Set(p);
                        if (n.has(entry.sid)) n.delete(entry.sid);
                        else n.add(entry.sid);
                        return n;
                      })
                    }
                    className={`rounded-lg px-4 py-2 text-[0.72rem] font-black transition-all active:scale-95 ${
                      isFinalized
                        ? "border border-[#16a34a]/40 bg-[#16a34a]/10 text-[#16a34a] hover:bg-[#16a34a]/20"
                        : "bg-[#16a34a] text-white shadow-[0_4px_10px_rgba(34,197,94,0.25)] hover:opacity-80"
                    }`}
                  >
                    {isFinalized ? "Batalkan Finalize" : "Finalize Evaluation"}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
