import type { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}

const variantClasses = {
  primary:
    "bg-primary text-white shadow-[0_14px_34px_rgba(37,99,235,0.26)] hover:shadow-[0_18px_40px_rgba(37,99,235,0.32)]",
  secondary: "bg-primary-soft text-primary-dark",
  ghost: "bg-surface/70 text-primary-dark hover:bg-surface-strong/70",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full border-0 px-[18px] py-3 font-[var(--font-family-body)] font-extrabold transition-[transform,box-shadow,background] duration-[160ms] ease-[ease] hover:-translate-y-px",
        variantClasses[variant],
        className,
      ].join(" ")}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
