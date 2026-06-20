export interface LearnSession {
  id: string;
  type: "mandatory" | "rolespec";
  phase: number | string;
  month: number | null;
  quarter: string | null;
  theme: string;
  themeCls: string;
  title: string;
  subtitle: string;
  what: string;
  who: string;
  why: string;
  when: string;
  where: string;
  how: string;
  speaker: string;
  status: "Planned" | "Done";
  attendance: number;
  totalSantri: number;
}

const MONTHS = [
  "Jul 2025", "Aug 2025", "Sep 2025", "Oct 2025", "Nov 2025", "Dec 2025",
  "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026",
];

const TOTAL = 21;

export const learnSessions: LearnSession[] = [
  {
    id: "L01", type: "mandatory", phase: 1, month: 1, quarter: null,
    theme: "Fondasi Diri", themeCls: "c-deen",
    title: "Who Am I Before I Work?", subtitle: "Identitas Muslim di Dunia Kerja",
    what: "Mengenal identitas diri sebagai Muslim sebelum masuk dunia kerja & internship",
    who: "Semua santri", why: "Fondasi niat & orientasi yang benar sebelum program dimulai",
    when: MONTHS[0], where: "Online / On-site", how: "Sesi refleksi + tanya jawab interaktif",
    speaker: "Psikolog Islam / Ustadz / Mentor Karakter", status: "Planned",
    attendance: 0, totalSantri: TOTAL,
  },
  {
    id: "L02", type: "mandatory", phase: 1, month: 2, quarter: null,
    theme: "Agile Mindset", themeCls: "c-it",
    title: "Sprint Your Life", subtitle: "Agile & Growth Mindset untuk Santri",
    what: "Penerapan metode Agile & growth mindset dalam kehidupan dan kerja santri",
    who: "Semua santri", why: "Santri perlu mindset iteratif & adaptif di era perubahan cepat",
    when: MONTHS[1], where: "Online", how: "Workshop sprint planning mini + diskusi kelompok",
    speaker: "Agile Coach / People Development Coach", status: "Planned",
    attendance: 0, totalSantri: TOTAL,
  },
  {
    id: "L03", type: "mandatory", phase: 2, month: 3, quarter: null,
    theme: "Komunikasi", themeCls: "c-ops",
    title: "Say It Right", subtitle: "Public Speaking & Komunikasi Efektif",
    what: "Teknik berbicara di depan umum, presentasi, & komunikasi interpersonal",
    who: "Semua santri", why: "Komunikasi adalah skill inti semua role",
    when: MONTHS[2], where: "Online / On-site", how: "Latihan langsung + feedback peer",
    speaker: "Communication Trainer / Public Speaking Coach", status: "Planned",
    attendance: 0, totalSantri: TOTAL,
  },
  {
    id: "L04", type: "mandatory", phase: 2, month: 4, quarter: null,
    theme: "Digital Literacy", themeCls: "c-it",
    title: "Navigate the Internet", subtitle: "AI Tools, Literasi Digital & Etika Online",
    what: "Penggunaan AI tools, etika digital, keamanan data, & navigasi internet produktif",
    who: "Semua santri", why: "Literasi digital wajib di era AI",
    when: MONTHS[3], where: "Online", how: "Demo tools + hands-on practice",
    speaker: "Tech Educator / AI Practitioner", status: "Planned",
    attendance: 0, totalSantri: TOTAL,
  },
  {
    id: "L05", type: "mandatory", phase: 2, month: 5, quarter: null,
    theme: "Kreativitas", themeCls: "c-dkv",
    title: "Design Thinking for Real Life", subtitle: "Memecahkan Masalah dengan Kreatif",
    what: "Framework design thinking untuk problem solving di kehidupan nyata & kerja",
    who: "Semua santri", why: "Kreativitas & problem solving dibutuhkan semua divisi",
    when: MONTHS[4], where: "Online / On-site", how: "Workshop studi kasus nyata",
    speaker: "UX Practitioner / Product Designer", status: "Planned",
    attendance: 0, totalSantri: TOTAL,
  },
  {
    id: "L06", type: "mandatory", phase: 3, month: 6, quarter: null,
    theme: "Keuangan Islam", themeCls: "c-deen",
    title: "Halal Wealth", subtitle: "Perencanaan Keuangan & Bisnis Syar'i",
    what: "Prinsip keuangan Islam, mengelola penghasilan halal, & dasar bisnis syariah",
    who: "Semua santri", why: "Santri perlu bekal keuangan islami sebelum mandiri",
    when: MONTHS[5], where: "Online", how: "Sesi materi + studi kasus bisnis syariah",
    speaker: "Financial Planner Syariah", status: "Planned",
    attendance: 0, totalSantri: TOTAL,
  },
  {
    id: "L07", type: "mandatory", phase: 3, month: 7, quarter: null,
    theme: "Freelance & Remote", themeCls: "c-it",
    title: "Work From Anywhere", subtitle: "Freelance, Remote Work, Platform & Kontrak",
    what: "Cara kerja remote, platform freelance, negosiasi kontrak, & manajemen klien",
    who: "Semua santri", why: "Membuka peluang penghasilan halal pasca internship",
    when: MONTHS[6], where: "Online", how: "Panel diskusi + sesi tanya jawab freelancer aktif",
    speaker: "Remote Worker / Muslim Freelancer", status: "Planned",
    attendance: 0, totalSantri: TOTAL,
  },
  {
    id: "L08", type: "mandatory", phase: 3, month: 8, quarter: null,
    theme: "Study Abroad", themeCls: "c-ac",
    title: "Go Global, Stay Muslim", subtitle: "Beasiswa, IELTS, & Campus Life di Luar Negeri",
    what: "Panduan beasiswa luar negeri, persiapan IELTS, & menjaga identitas Islam di LN",
    who: "Semua santri", why: "Membuka wawasan global & mendorong aspirasi pendidikan tinggi",
    when: MONTHS[7], where: "Online", how: "Sharing alumni + sesi Q&A beasiswa",
    speaker: "Alumni Beasiswa / Scholarship Mentor", status: "Planned",
    attendance: 0, totalSantri: TOTAL,
  },
  {
    id: "L09", type: "mandatory", phase: 4, month: 9, quarter: null,
    theme: "Personal Branding", themeCls: "c-dkv",
    title: "You Are Your Portfolio", subtitle: "LinkedIn, GitHub, & Digital Presence",
    what: "Membangun personal brand digital: LinkedIn, GitHub, Behance, atau platform relevan",
    who: "Semua santri", why: "Portfolio digital adalah CV abad 21",
    when: MONTHS[8], where: "Online", how: "Workshop langsung bikin/update profil + review peer",
    speaker: "Career Mentor / Portfolio Reviewer", status: "Planned",
    attendance: 0, totalSantri: TOTAL,
  },
  {
    id: "L10", type: "mandatory", phase: 4, month: 10, quarter: null,
    theme: "Leadership", themeCls: "c-deen",
    title: "Lead Without Title", subtitle: "Kepemimpinan Berbasis Sunnah",
    what: "Prinsip kepemimpinan Islam: amanah, syura, & memimpin tanpa jabatan formal",
    who: "Semua santri", why: "Setiap santri adalah pemimpin",
    when: MONTHS[9], where: "Online / On-site", how: "Studi kasus kepemimpinan + refleksi sirah nabawi",
    speaker: "Leader Pesantren / NGO / Community Builder", status: "Planned",
    attendance: 0, totalSantri: TOTAL,
  },
  {
    id: "L11", type: "mandatory", phase: 4, month: 11, quarter: null,
    theme: "Entrepreneurship", themeCls: "c-ops",
    title: "Start Before You're Ready", subtitle: "Ideasi Bisnis & Validasi Pasar",
    what: "Cara memulai bisnis dari nol: ideasi, validasi, MVP, & mindset entrepreneur",
    who: "Semua santri", why: "Mendorong jiwa wirausaha halal pasca program",
    when: MONTHS[10], where: "Online", how: "Workshop business model canvas + pitch mini",
    speaker: "Founder Muslim / Digital Entrepreneur", status: "Planned",
    attendance: 0, totalSantri: TOTAL,
  },
  {
    id: "L12", type: "mandatory", phase: 5, month: 12, quarter: null,
    theme: "Visi & Legacy", themeCls: "c-deen",
    title: "What Will You Leave?", subtitle: "Ikhtiar Panjang & Kontribusi Umat",
    what: "Refleksi akhir program: warisan, visi jangka panjang, & kontribusi untuk umat",
    who: "Semua santri", why: "Menutup program dengan visi besar & komitmen kontribusi",
    when: MONTHS[11], where: "Online / On-site", how: "Sesi refleksi + presentasi legacy statement",
    speaker: "Mentor Senior / Tokoh Pendidikan / Founder", status: "Planned",
    attendance: 0, totalSantri: TOTAL,
  },
  {
    id: "RS01", type: "rolespec", phase: "rs", month: null, quarter: "Q1",
    theme: "DEEN", themeCls: "c-deen",
    title: "Tarbiyah & Pedagogi Islami", subtitle: "Metode Mengajar & Pembinaan Santri",
    what: "Teknik pengajaran Al-Qur'an, Bahasa Arab, & pembinaan karakter santri",
    who: "Santri DEEN (Tahfidz, Arabic, Musyrif)", why: "Meningkatkan kapasitas pembinaan & pengajaran diniyah",
    when: "Q1 — Jul–Sep 2025", where: "On-site", how: "Workshop metode talaqqi + simulasi mengajar",
    speaker: "Ustadz / Pakar Tarbiyah", status: "Planned",
    attendance: 0, totalSantri: TOTAL,
  },
  {
    id: "RS02", type: "rolespec", phase: "rs", month: null, quarter: "Q2",
    theme: "IT", themeCls: "c-it",
    title: "Build & Ship: Web Dev Internship Bootcamp", subtitle: "Hands-on untuk Developer & IT",
    what: "Praktik langsung membangun web app sederhana & deploy ke server",
    who: "Santri IT (Developer, QA, System Admin, IT Helpdesk)", why: "Mempercepat kesiapan teknis santri IT",
    when: "Q2 — Oct–Dec 2025", where: "Online / Lab", how: "Coding session + code review + deploy workshop",
    speaker: "Senior Developer / Tech Lead", status: "Planned",
    attendance: 0, totalSantri: TOTAL,
  },
  {
    id: "RS03", type: "rolespec", phase: "rs", month: null, quarter: "Q2",
    theme: "DKV", themeCls: "c-dkv",
    title: "Content Creation Masterclass", subtitle: "Produksi Konten Visual & Video untuk Dakwah",
    what: "Workshop intensif desain grafis, editing video, & strategi konten dakwah digital",
    who: "Santri DKV (Designer, Editor, Social Media, Photographer)", why: "Meningkatkan kualitas output konten HSI BS",
    when: "Q2 — Oct–Dec 2025", where: "Online / Studio", how: "Portfolio review + live editing session",
    speaker: "Kreator Konten Muslim Profesional", status: "Planned",
    attendance: 0, totalSantri: TOTAL,
  },
  {
    id: "RS04", type: "rolespec", phase: "rs", month: null, quarter: "Q3",
    theme: "OPS & PKBM", themeCls: "c-ops",
    title: "Operational Excellence", subtitle: "Administrasi, Layanan, & Sistem PKBM",
    what: "SOP administrasi, customer service excellence, & operasional sistem PKBM (BOS/ARKAS)",
    who: "Santri OPS & PKBM", why: "Meningkatkan standar layanan & kepatuhan administrasi unit",
    when: "Q3 — Jan–Mar 2026", where: "On-site", how: "Workshop SOP + simulasi layanan + demo ARKAS",
    speaker: "Praktisi Manajemen Pendidikan", status: "Planned",
    attendance: 0, totalSantri: TOTAL,
  },
];

export function getPhaseName(phase: number | string): string {
  const phases: Record<string, string> = {
    1: "Niyah",
    2: "Fikrah",
    3: "Amaliyah",
    4: "Khidmah",
    5: "Jariyah",
    rs: "Role-Specific",
  };
  return phases[String(phase)] || "";
}
