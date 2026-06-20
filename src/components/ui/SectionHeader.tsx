import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 bg-gradient-to-br from-surface/70 to-[rgba(220,238,227,0.72)] border border-white/70 rounded-[var(--radius-xl)] p-7">
      <div>
        {eyebrow ? (
          <span className="inline-flex mb-3 text-[0.78rem] font-black tracking-[0.12em] uppercase text-primary">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="text-primary-dark text-[clamp(2.2rem,5vw,4.8rem)] tracking-[-0.07em] leading-[0.95] mb-3">
          {title}
        </h1>
        {description ? (
          <p className="text-muted leading-relaxed">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
