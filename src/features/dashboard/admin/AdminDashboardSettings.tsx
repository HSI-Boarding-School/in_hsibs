import { motion } from "motion/react";
const settingsItems = [
  {
    label: "Profil Akun",
    desc: "Ubah nama, email, dan password akun Anda",
  },
  {
    label: "Notifikasi",
    desc: "Atur preferensi notifikasi laporan dan follow up",
  },
  {
    label: "Tampilan",
    desc: "Sesuaikan tema, bahasa, dan tata letak dashboard",
  },
  {
    label: "Keamanan",
    desc: "Kelola sesi aktif dan autentikasi dua faktor",
  },
];

export function AdminDashboardSettings() {
  return (
    <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
      {settingsItems.map((item, i) => (
        <motion.article
          key={item.label}
          className="rounded-xl border border-white/80 bg-surface/85 p-5 shadow-[0_14px_40px_rgba(39,49,38,0.08)] cursor-pointer hover:border-primary/30 transition-colors"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.25 }}
          whileHover={{ y: -2 }}
        >
          <h3 className="font-(--font-family-head) font-extrabold text-primary-dark">
            {item.label}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {item.desc}
          </p>
        </motion.article>
      ))}
    </div>
  );
}
