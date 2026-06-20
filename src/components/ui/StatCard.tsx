import type { Tone } from "../../types";

interface StatCardProps {
  label: string;
  value: string;
  tone?: Tone;
}

const toneValueClasses: Record<Tone, string> = {
  green: "text-primary-dark",
  blue: "text-blue",
  orange: "text-orange",
  purple: "text-purple",
};

export function StatCard({ label, value, tone = "green" }: StatCardProps) {
  return (
    <article className="bg-surface border border-white/80 rounded-3xl shadow-[0_14px_40px_rgba(39,49,38,0.08)] p-5">
      <span className="block font-bold text-muted mb-3">{label}</span>
      <strong
        className={[
          "text-[2.25rem] tracking-[-0.05em]",
          toneValueClasses[tone],
        ].join(" ")}
      >
        {value}
      </strong>
    </article>
  );
}
