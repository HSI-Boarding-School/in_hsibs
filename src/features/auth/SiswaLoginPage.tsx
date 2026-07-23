import { useState } from "react";
import { motion } from "motion/react";
import { Iconify } from "../../components/iconify/iconify";
import type { RoleId } from "../../types";

interface SiswaLoginPageProps {
  onLogin: (credentials: {
    userId: string;
    role: RoleId;
    roleLabel: string;
    password: string;
  }) => void;
  onBackToMainPortal?: () => void;
}

export function SiswaLoginPage({
  onLogin,
  onBackToMainPortal,
}: SiswaLoginPageProps) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onLogin({
      password,
      role: "siswa",
      roleLabel: "Siswa",
      userId: userId || "demo-siswa",
    });
  }

  return (
    <motion.main
      className="relative flex min-h-svh items-center justify-center overflow-hidden bg-bg p-6 max-sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background orbs — amber/orange theme */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[120px] -top-[120px] h-[420px] w-[420px] animate-[orb-float_18s_ease-in-out_infinite] rounded-full bg-amber-500/20 blur-[80px] dark:bg-amber-500/14" />
        <div className="absolute -bottom-[80px] -right-[60px] h-[320px] w-[320px] animate-[orb-float_22s_ease-in-out_infinite_reverse] rounded-full bg-orange-500/18 blur-[80px] dark:bg-orange-500/12" />
        <div className="absolute right-[30%] top-[20%] h-[260px] w-[260px] animate-[orb-float_15s_ease-in-out_infinite_3s] rounded-full bg-yellow-400/14 blur-[80px] dark:bg-yellow-400/10" />
      </div>

      <motion.div
        className="relative z-[2] w-full max-w-[480px] overflow-hidden rounded-[32px] border border-white/80 bg-surface/78 p-8 shadow-[0_32px_96px_rgba(245,158,11,0.14),0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-[24px] saturate-[1.4] max-sm:rounded-3xl max-sm:p-[22px] dark:bg-surface/76 dark:shadow-[0_36px_110px_rgba(0,0,0,0.46),inset_0_1px_0_rgba(255,255,255,0.05)]"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Hero header with amber gradient */}
        <div className="relative mb-7 overflow-hidden rounded-[24px] bg-gradient-to-br from-amber-500 to-orange-700 p-6 text-white shadow-[0_18px_50px_rgba(245,158,11,0.28)]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/16 blur-3xl" />

          {onBackToMainPortal && (
            <button
              type="button"
              onClick={onBackToMainPortal}
              className="relative mb-5 inline-flex items-center gap-1.5 rounded-full bg-white/16 px-3 py-1.5 text-[0.68rem] font-extrabold text-white backdrop-blur-sm transition-colors hover:bg-white/24"
            >
              <Iconify icon="mingcute:left-line" width={14} />
              Portal Utama
            </button>
          )}

          <div className="relative flex items-center gap-4">
            <motion.div
              className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-white/18 backdrop-blur-sm"
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Iconify icon="solar:square-academic-cap-bold-duotone" width={30} />
            </motion.div>
            <div className="min-w-0">
              <p className="font-[var(--font-family-head)] text-[0.76rem] font-extrabold tracking-[0.1em] uppercase text-white/80">
                Monitoring Pengabdian
              </p>
              <h1 className="mt-0.5 font-[var(--font-family-head)] text-2xl font-extrabold tracking-[-0.04em]">
                Portal Santri
              </h1>
            </div>
          </div>

          <p className="relative mt-4 text-sm font-semibold leading-relaxed text-white/78">
            Ruang kerja khusus santri untuk melihat tugas harian, report,
            project, learn, dan feedback PIC.
          </p>

          <div className="relative mt-5 rounded-2xl bg-black/12 p-3 text-[0.72rem] font-bold text-white/82 ring-1 ring-inset ring-white/14">
            Demo ID: S01
          </div>
        </div>

        {/* Login form */}
        <motion.form
          className="grid gap-4"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.1 }}
        >
          {/* User ID field */}
          <div className="grid gap-1.5">
            <label
              htmlFor="siswa-user-id"
              className="font-[var(--font-family-body)] text-[0.82rem] font-extrabold text-text"
            >
              ID Santri
            </label>
            <div className="flex items-center gap-2.5 rounded-[14px] border-[1.5px] border-border bg-surface px-3.5 text-muted transition-[border-color,box-shadow] duration-[180ms] focus-within:border-amber-500/40 focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.1)]">
              <Iconify icon="solar:user-bold-duotone" width={20} />
              <input
                id="siswa-user-id"
                className="flex-1 border-0 bg-transparent py-3.5 font-[var(--font-family-body)] text-text outline-none placeholder:text-muted/55"
                onChange={(event) => setUserId(event.target.value)}
                placeholder="contoh: S01"
                value={userId}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="grid gap-1.5">
            <label
              htmlFor="siswa-password"
              className="font-[var(--font-family-body)] text-[0.82rem] font-extrabold text-text"
            >
              Password
            </label>
            <div className="flex items-center gap-2.5 rounded-[14px] border-[1.5px] border-border bg-surface px-3.5 text-muted transition-[border-color,box-shadow] duration-[180ms] focus-within:border-amber-500/40 focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.1)]">
              <Iconify
                icon="solar:lock-keyhole-minimalistic-bold-duotone"
                width={20}
              />
              <input
                id="siswa-password"
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
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-0 bg-gradient-to-br from-amber-500 to-orange-700 py-4 font-[var(--font-family-body)] font-black text-white shadow-[0_8px_24px_rgba(245,158,11,0.28)]"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 12px 32px rgba(245, 158, 11, 0.35)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Masuk sebagai Siswa</span>
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.main>
  );
}
