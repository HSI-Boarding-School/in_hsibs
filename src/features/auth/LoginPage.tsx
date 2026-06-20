import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Iconify } from "../../components/iconify/iconify";
import type { Role, RoleId } from "../../types";

interface LoginPageProps {
  onLogin: (credentials: {
    userId: string;
    role: RoleId;
    roleLabel: string;
    password: string;
  }) => void;
  roles: Role[];
}

const roleIcons: Record<RoleId, string> = {
  admin: "solar:shield-user-bold-duotone",
  "pic-div": "solar:chart-square-bold-duotone",
  "pic-reg": "solar:buildings-2-bold-duotone",
  siswa: "solar:square-academic-cap-bold-duotone",
};

export function LoginPage({ onLogin, roles }: LoginPageProps) {
  const [activeRole, setActiveRole] = useState<RoleId>(roles[0].id);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const selectedRole = roles.find((role) => role.id === activeRole)!;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onLogin({
      password,
      role: selectedRole.id,
      roleLabel: selectedRole.label,
      userId: userId || "demo-user",
    });
  }

  return (
    <motion.main
      className="relative flex min-h-svh items-center justify-center overflow-hidden bg-bg p-6 max-sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[120px] -top-[120px] h-[420px] w-[420px] animate-[orb-float_18s_ease-in-out_infinite] rounded-full bg-[rgba(37,99,235,0.22)] blur-[80px]" />
        <div className="absolute -bottom-[80px] -right-[60px] h-[320px] w-[320px] animate-[orb-float_22s_ease-in-out_infinite_reverse] rounded-full bg-[rgba(115,87,182,0.18)] blur-[80px]" />
        <div className="absolute right-[30%] top-[20%] h-[260px] w-[260px] animate-[orb-float_15s_ease-in-out_infinite_3s] rounded-full bg-[rgba(47,110,165,0.14)] blur-[80px]" />
      </div>

      <motion.div
        className="relative z-[2] grid w-full max-w-[460px] gap-[22px] rounded-[32px] border border-white/80 bg-[rgba(255,253,247,0.78)] p-8 shadow-[0_32px_96px_rgba(30,58,138,0.14),0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-[24px] saturate-[1.4] max-sm:rounded-3xl max-sm:p-[22px]"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <motion.div
            className="inline-flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-primary-dark to-[#1e54b8] font-[var(--font-family-head)] text-[1.3rem] font-black tracking-[-0.05em] text-white shadow-[0_8px_24px_rgba(30,58,138,0.3)]"
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            HS
          </motion.div>
          <div>
            <p className="font-[var(--font-family-head)] text-[0.76rem] font-extrabold tracking-[0.1em] uppercase text-primary">
              Monitoring Pengabdian
            </p>
            <h1 className="mt-0.5 font-[var(--font-family-head)] text-2xl font-extrabold tracking-[-0.04em] text-primary-dark">
              Masuk Akun
            </h1>
          </div>
        </div>

        {/* Role tabs */}
        <div
          className="grid grid-cols-4 gap-2 max-sm:grid-cols-2"
          role="tablist"
        >
          {roles.map((role, i) => (
            <motion.button
              key={role.id}
              role="tab"
              aria-selected={activeRole === role.id}
              className={[
                "relative flex flex-col items-center gap-1 overflow-hidden rounded-2xl border-[1.5px] px-1.5 py-3.5 transition-[border-color,background] duration-200 max-sm:flex-row max-sm:gap-2 max-sm:px-3.5 max-sm:py-3",
                activeRole === role.id
                  ? "border-primary bg-primary-soft text-primary-dark"
                  : "border-transparent bg-surface-strong text-muted hover:bg-primary-soft/60",
              ].join(" ")}
              onClick={() => setActiveRole(role.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Iconify icon={roleIcons[role.id]} width={28} />
              <span className="font-[var(--font-family-body)] text-[0.76rem] font-extrabold">
                {role.label}
              </span>
              {activeRole === role.id && (
                <motion.div
                  className="absolute bottom-0 left-[20%] right-[20%] h-[3px] rounded-t-full bg-primary"
                  layoutId="tab-indicator"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Role hint */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole}
            className="flex items-center gap-2.5 overflow-hidden rounded-[14px] bg-primary/[0.06] px-3.5 py-3 font-[var(--font-family-body)] text-[0.84rem] font-semibold text-primary-dark"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Iconify
              className="shrink-0 text-primary"
              icon={roleIcons[activeRole]}
              width={22}
            />
            <span>{selectedRole.hint}</span>
          </motion.div>
        </AnimatePresence>

        {/* Form */}
        <motion.form
          className="grid gap-4"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* User ID field */}
          <div className="grid gap-1.5">
            <label
              htmlFor="user-id"
              className="font-[var(--font-family-body)] text-[0.82rem] font-extrabold text-text"
            >
              ID Pengguna
            </label>
            <div className="flex items-center gap-2.5 rounded-[14px] border-[1.5px] border-border bg-white px-3.5 text-muted transition-[border-color,box-shadow] duration-[180ms]">
              <Iconify icon="solar:user-bold-duotone" width={20} />
              <input
                id="user-id"
                className="flex-1 border-0 bg-transparent py-3.5 font-[var(--font-family-body)] text-text outline-none placeholder:text-[#b4bcc0]"
                onChange={(event) => setUserId(event.target.value)}
                placeholder="contoh: ADM001"
                value={userId}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="grid gap-1.5">
            <label
              htmlFor="password"
              className="font-[var(--font-family-body)] text-[0.82rem] font-extrabold text-text"
            >
              Password
            </label>
            <div className="flex items-center gap-2.5 rounded-[14px] border-[1.5px] border-border bg-white px-3.5 text-muted transition-[border-color,box-shadow] duration-[180ms]">
              <Iconify
                icon="solar:lock-keyhole-minimalistic-bold-duotone"
                width={20}
              />
              <input
                id="password"
                className="flex-1 border-0 bg-transparent py-3.5 font-[var(--font-family-body)] text-text outline-none placeholder:text-[#b4bcc0]"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan password"
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="flex items-center rounded-lg border-0 bg-transparent p-1 text-muted transition-colors duration-150 hover:text-primary-dark"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                <Iconify
                  icon={
                    showPassword
                      ? "solar:eye-closed-line-duotone"
                      : "solar:eye-bold-duotone"
                  }
                  width={20}
                />
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-0 bg-gradient-to-br from-primary to-[#1d4ed8] py-4 font-[var(--font-family-body)] font-black text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)]"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 12px 32px rgba(37, 99, 235, 0.35)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Masuk sebagai {selectedRole.label}</span>
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.main>
  );
}
