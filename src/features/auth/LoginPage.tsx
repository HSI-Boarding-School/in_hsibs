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
  initialRole?: RoleId;
  onSelectRole?: (role: RoleId) => void;
  onBackToChooser?: () => void;
  showBackToChooser?: boolean;
  onNavigateToSiswaPortal?: () => void;
}

const roleIcons: Record<RoleId, string> = {
  admin: "solar:shield-user-bold-duotone",
  "pic-div": "solar:chart-square-bold-duotone",
  "pic-reg": "solar:buildings-2-bold-duotone",
  siswa: "solar:square-academic-cap-bold-duotone",
};

const roleAccent: Record<RoleId, { title: string; tone: string; sampleId: string }> = {
  admin: {
    title: "Admin Portal",
    tone: "from-sky-500 to-blue-700",
    sampleId: "ADM001",
  },
  "pic-div": {
    title: "PIC Divisi",
    tone: "from-violet-500 to-purple-700",
    sampleId: "PICDIV01",
  },
  "pic-reg": {
    title: "PIC Regional",
    tone: "from-emerald-500 to-teal-700",
    sampleId: "PICREG01",
  },
  siswa: {
    title: "Siswa/Santri",
    tone: "from-amber-500 to-orange-700",
    sampleId: "S01",
  },
};

export function LoginPage({
  onLogin,
  roles,
  initialRole,
  onSelectRole,
  onBackToChooser,
  showBackToChooser = true,
  onNavigateToSiswaPortal,
}: LoginPageProps) {
  const [activeRole, setActiveRole] = useState<RoleId | null>(initialRole ?? null);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const selectedRole = activeRole
    ? roles.find((role) => role.id === activeRole) ?? null
    : null;
  const selectedAccent = activeRole ? roleAccent[activeRole] : null;

  function selectRole(roleId: RoleId) {
    if (onSelectRole) {
      onSelectRole(roleId);
      return;
    }
    setActiveRole(roleId);
    setUserId("");
    setPassword("");
    setShowPassword(false);
  }

  function backToChooser() {
    setActiveRole(null);
    setUserId("");
    setPassword("");
    setShowPassword(false);
    onBackToChooser?.();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRole) return;
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
        <div className="absolute -left-[120px] -top-[120px] h-[420px] w-[420px] animate-[orb-float_18s_ease-in-out_infinite] rounded-full bg-primary/20 blur-[80px] dark:bg-primary/16" />
        <div className="absolute -bottom-[80px] -right-[60px] h-[320px] w-[320px] animate-[orb-float_22s_ease-in-out_infinite_reverse] rounded-full bg-purple/18 blur-[80px] dark:bg-purple/14" />
        <div className="absolute right-[30%] top-[20%] h-[260px] w-[260px] animate-[orb-float_15s_ease-in-out_infinite_3s] rounded-full bg-blue/14 blur-[80px] dark:bg-blue/12" />
      </div>

      <motion.div
        className="relative z-[2] grid w-full max-w-[860px] gap-[22px] rounded-[32px] border border-white/80 bg-surface/78 p-8 shadow-[0_32px_96px_rgba(30,58,138,0.14),0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-[24px] saturate-[1.4] max-sm:rounded-3xl max-sm:p-[22px] dark:bg-surface/76 dark:shadow-[0_36px_110px_rgba(0,0,0,0.46),inset_0_1px_0_rgba(255,255,255,0.05)]"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <motion.div
            className="inline-flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-primary-dark to-[#1e54b8] font-[var(--font-family-head)] text-[1.3rem] font-black tracking-[-0.05em] text-white"
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

        <AnimatePresence mode="wait">
          {!selectedRole ? (
            <motion.div
              key="role-picker"
              className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
            >
              {roles.map((role, i) => {
                const accent = roleAccent[role.id];
                return (
                  <motion.button
                    key={role.id}
                    type="button"
                    onClick={() => selectRole(role.id)}
                    className="group relative min-h-[220px] overflow-hidden rounded-3xl border border-border/70 bg-surface-strong/44 p-4 text-left transition-all hover:-translate-y-1 hover:border-primary/35 hover:bg-surface-strong/70"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.04, duration: 0.2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className={`relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent.tone} text-white`}>
                      <Iconify icon={roleIcons[role.id]} width={25} />
                    </span>
                    <div className="relative mt-5">
                      <h2 className="font-(--font-family-head) text-lg font-extrabold text-primary-dark">
                        {accent.title}
                      </h2>
                      <p className="mt-2 text-[0.78rem] font-semibold leading-relaxed text-muted">
                        {role.hint}
                      </p>
                    </div>
                    <div className="relative mt-5 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-surface px-2.5 py-1 font-mono text-[0.65rem] font-extrabold text-primary">
                        {accent.sampleId}
                      </span>
                      <Iconify icon="solar:arrow-right-up-bold-duotone" width={18} className="text-muted transition-colors group-hover:text-primary" />
                    </div>
                  </motion.button>
                );
              })}

              {onNavigateToSiswaPortal && (
                <motion.div
                  className="col-span-full mt-3 flex flex-col items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.2 }}
                >
                  <div className="flex w-full items-center gap-3">
                    <span className="h-px flex-1 bg-border/50" />
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">Atau</span>
                    <span className="h-px flex-1 bg-border/50" />
                  </div>
                  <button
                    type="button"
                    onClick={onNavigateToSiswaPortal}
                    className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-strong/40 px-5 py-2.5 text-[0.78rem] font-bold text-muted transition-all hover:border-amber-500/30 hover:bg-amber-50/40 hover:text-amber-700"
                  >
                    <Iconify icon="solar:square-academic-cap-bold-duotone" width={16} className="text-amber-500" />
                    Siswa/Santri? Masuk di Portal Santri
                    <Iconify icon="solar:arrow-right-up-bold-duotone" width={14} className="text-muted transition-colors group-hover:text-amber-600" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.form
              key={selectedRole.id}
              className="grid grid-cols-[0.9fr_1.1fr] gap-5 max-lg:grid-cols-1"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
            >
              <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${selectedAccent?.tone} p-5 text-white shadow-[0_18px_50px_rgba(37,99,235,0.22)]`}>
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/16 blur-3xl" />
                {showBackToChooser ? (
                  <button
                    type="button"
                    onClick={backToChooser}
                    className="relative mb-8 inline-flex items-center gap-1.5 rounded-full bg-white/16 px-3 py-1.5 text-[0.68rem] font-extrabold text-white backdrop-blur-sm transition-colors hover:bg-white/24"
                  >
                    <Iconify icon="mingcute:left-line" width={14} />
                    Ganti Portal
                  </button>
                ) : (
                  <div className="relative mb-8 inline-flex items-center gap-1.5 rounded-full bg-white/16 px-3 py-1.5 text-[0.68rem] font-extrabold text-white backdrop-blur-sm">
                    Portal Siswa
                  </div>
                )}
                <div className="relative">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/18 backdrop-blur-sm">
                    <Iconify icon={roleIcons[selectedRole.id]} width={30} />
                  </span>
                  <h2 className="mt-5 font-(--font-family-head) text-2xl font-extrabold tracking-tight">
                    {selectedAccent?.title}
                  </h2>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-white/78">
                    {selectedRole.hint}
                  </p>
                  <div className="mt-6 rounded-2xl bg-black/12 p-3 text-[0.72rem] font-bold text-white/82 ring-1 ring-inset ring-white/14">
                    Demo ID: {selectedAccent?.sampleId}
                  </div>
                </div>
              </div>

              <div className="grid content-center gap-4">
          {/* User ID field */}
          <div className="grid gap-1.5">
            <label
              htmlFor="user-id"
              className="font-[var(--font-family-body)] text-[0.82rem] font-extrabold text-text"
            >
              ID Pengguna
            </label>
            <div className="flex items-center gap-2.5 rounded-[14px] border-[1.5px] border-border bg-surface px-3.5 text-muted transition-[border-color,box-shadow] duration-[180ms] focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]">
              <Iconify icon="solar:user-bold-duotone" width={20} />
              <input
                id="user-id"
                className="flex-1 border-0 bg-transparent py-3.5 font-[var(--font-family-body)] text-text outline-none placeholder:text-muted/55"
                onChange={(event) => setUserId(event.target.value)}
                placeholder={`contoh: ${selectedAccent?.sampleId ?? "USER001"}`}
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
            <div className="flex items-center gap-2.5 rounded-[14px] border-[1.5px] border-border bg-surface px-3.5 text-muted transition-[border-color,box-shadow] duration-[180ms] focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]">
              <Iconify
                icon="solar:lock-keyhole-minimalistic-bold-duotone"
                width={20}
              />
              <input
                id="password"
                className="flex-1 border-0 bg-transparent py-3.5 font-[var(--font-family-body)] text-text outline-none placeholder:text-muted/55"
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
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-0 bg-gradient-to-br from-primary to-[#1d4ed8] py-4 font-[var(--font-family-body)] font-black text-white"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 12px 32px rgba(37, 99, 235, 0.35)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Masuk sebagai {selectedRole.label}</span>
          </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.main>
  );
}
