import { Iconify } from "../iconify/iconify";

const priorities = [
  { value: "low", icon: "solar:double-alt-arrow-down-bold-duotone", color: "text-blue" },
  { value: "medium", icon: "solar:double-alt-arrow-right-bold-duotone", color: "text-orange" },
  { value: "hight", icon: "solar:double-alt-arrow-up-bold-duotone", color: "text-orange" },
] as const;

interface PrioritySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {priorities.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold capitalize transition-all ${
            value === p.value
              ? "ring-2 ring-text ring-inset"
              : "ring-1 ring-border ring-inset"
          }`}
        >
          <Iconify icon={p.icon} width={14} className={p.color} />
          {p.value}
        </button>
      ))}
    </div>
  );
}
