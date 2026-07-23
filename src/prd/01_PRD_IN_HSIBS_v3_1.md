# PRD IN_HSIBS v3.1 — Mapping, SoW & Operational Dashboard Edition

**Nama Produk:** IN_HSIBS — Internship Navigator · HSI Boarding School  
**Tagline:** From Niyah to Jariyah  
**Status:** Product + Design + Database handoff draft  
**Program:** Internship HSI Boarding School Batch 2 · TA 26/27  
**Periode:** Juli 2026 – Juni 2027  
**Target Peserta:** 21 santri ikhwan Batch 2; struktur disiapkan agar bisa diperluas untuk akhwat/batch berikutnya.

---

## 1. Ringkasan Produk

IN_HSIBS adalah sistem internal untuk memandu, memetakan, memonitor, dan mengevaluasi perjalanan internship santri HSI Boarding School selama 12 bulan. Fokus utama sistem adalah membuat santri memahami amanah penempatan, PIC memahami progres binaan, dan admin memiliki data operasional yang rapi.

Versi v3.1 ini memperbarui PRD v3.0 dengan empat keputusan besar:

1. Taxonomy division diperbarui menjadi 7 division: **IT, DKV, EN, DEEN, ASR, OPS, PKBM**.
2. Mapping santri sekarang memiliki **assignment level**: Primary, Secondary, Additional/Side.
3. **SoW menjadi first-class feature**: Division → Role → SoW Template → Santri SoW Assignment → Progress/Evidence.
4. Penempatan bersifat **customizable**, tetapi harus melewati permission, approval, dan audit trail.

---

## 2. Goals

| Goal | Target |
|---|---|
| Onboarding jelas | ≥ 90% santri memahami Unit, Location, Division, Role, SoW, dan PIC di minggu pertama |
| Amanah kerja jelas | 100% santri memiliki Primary Assignment dan SoW yang dapat dibaca di profile |
| Monitoring aktif | PIC dapat melihat progress, report, warning, dan SoW status secara role-based |
| Reporting rapi | Daily, Weekly, Monthly, dan Special Report terstruktur |
| Evaluasi terukur | GYR status, mukafaah readiness, project progress, dan adab/discipline score tercatat |
| Governance aman | Santri tidak dapat mengubah mapping; perubahan oleh PIC/Admin terekam dengan approval |

---

## 3. User Roles

| Role | Deskripsi | Akses Utama |
|---|---|---|
| Santri | Pelaksana internship | View assignment, SoW, submit report, submit progress/evidence, ask clarification |
| PIC Div | Pembina berdasarkan division | Review report, CRUD role/SoW dalam scope, validate weekly, draft monthly evaluation |
| PIC Reg | Pembina wilayah | Approve placement/region-level changes, finalize monthly evaluation, regional monitoring |
| Admin | System owner | Full CRUD, import/export, user management, override, audit trail |
| Stakeholder/Viewer | Pengamat terbatas | Read-only summary, mapping, progress, outcomes |

---

## 4. Product Surfaces

### 4.1 Admin & PIC Back-Office Portal

Fokus: manajemen data, mapping, monitoring, validation, evaluation, master data, reporting, dan broadcast.

Menu utama:
- System Overview
- Master Data
- Mapping & Placement
- Role & SoW
- Monitoring
- Validation & Evaluation
- Learn & Projects
- Reports & Export
- Settings

### 4.2 Santri Field App

Fokus: mobile-first untuk santri.

Bottom dock:
- Home
- Mapping
- Monitoring
- Reporting
- Profile

---

## 5. Information Architecture

```txt
/
├─ /login
├─ /onboarding
├─ /field
│  ├─ /home
│  ├─ /mapping
│  ├─ /monitoring
│  ├─ /reporting
│  │  ├─ daily
│  │  ├─ weekly
│  │  ├─ monthly
│  │  └─ special
│  └─ /profile
└─ /backoffice
   ├─ /overview
   ├─ /mapping
   ├─ /master-data
   ├─ /roles-sow
   ├─ /monitoring
   ├─ /validation
   ├─ /evaluation
   ├─ /reports
   └─ /settings
```

---

## 6. Mapping Model

### 6.1 Core hierarchy

```txt
Unit → Location → Region → Division → Role → SoW
```

### 6.2 Assignment level

| Level | Makna |
|---|---|
| Primary | Amanah utama santri selama internship |
| Secondary | Amanah kedua yang masih signifikan |
| Additional / Side | Amanah tambahan/side job/support assignment |

Parsing internal:
- Division sebelum tanda `+` = Primary/Secondary.
- Division setelah tanda `+` = Additional/Side.
- Division pertama sebelum `+` = Primary.
- Division berikutnya sebelum `+` = Secondary.

Contoh:

```txt
IT & EN + ASR
Primary: IT
Secondary: EN
Additional/Side: ASR
```

---

## 7. Final Division Taxonomy

| Code | Division | Fungsi |
|---|---|---|
| IT | Information Technology | KBM IT, app/web, jaringan, komputer, tools |
| DKV | Creative & Media | Desain, video, foto, livestream, konten |
| EN | Bahasa Inggris | English area, English dorm, modul, speaking club |
| DEEN | Diniyah | Tahfidz, mutun, imam, muadzin, TPQ/SDIT diniyah support |
| ASR | Keasramaan | Musyrif, kamar, adab, rutinitas asrama, ri’ayah |
| OPS | Operations | Admin, CS, FO, sarpras, logistik, layanan unit |
| PKBM | PKBM | BOS, ARKAS, SIMBOS, data dan administrasi PKBM |

---

## 8. Role-Based SoW

SoW tidak disimpan langsung di santri. SoW melekat pada role. Ketika role diberikan kepada santri, sistem menurunkan SoW template menjadi personal assignment.

```txt
Division
└─ Role
   └─ SoW Template
      └─ Santri SoW Assignment
         └─ Progress/Evidence
```

Santri hanya dapat:
- melihat SoW,
- submit progress/evidence,
- ask/remind/clarify ke PIC Div.

Santri tidak dapat:
- mengubah Unit,
- mengubah Location,
- mengubah Division,
- mengubah Role,
- mengedit master SoW.

---

## 9. Governance

### 9.1 Change flow

```txt
PIC/Admin membuat perubahan
→ Placement Change Wizard
→ before/after impact
→ reason required
→ approval PIC Reg/Admin jika berdampak ke Unit/Location/Region/PIC
→ update active placement
→ audit trail
```

### 9.2 Permission

| Area | Santri | PIC Div | PIC Reg | Admin |
|---|---|---|---|---|
| View own assignment | Yes | Yes | Yes | Yes |
| Edit Unit/Location | No | Request | Approve/Request | Yes |
| Edit Division | No | Request/within scope | Approve | Yes |
| Edit Role | No | Within scope | Approve if cross-scope | Yes |
| Edit SoW template | No | Within division | Review | Yes |
| Submit progress | Yes | Yes | Yes | Yes |
| Final override | No | No | Limited | Yes |

---

## 10. MVP Scope

### P0 — wajib
- Login ID + PIN.
- Mapping santri 21 orang.
- Profile drawer: Unit, Location, Division, Assignment Level, PIC Div, PIC Reg.
- Role → SoW cards inline.
- Daily log.
- Weekly review.
- Monthly report/evaluation.
- Monitoring calendar.
- PIC validation queue.
- Admin import/export CSV.

### P1 — setelah P0 stabil
- GPS + photo check-in.
- Telegram reminder.
- Mukafaah readiness engine.
- Placement change request.
- Audit trail UI.
- Project evidence and review.

### P2 — lanjutan
- Public portfolio/id card.
- PDF rapor pertumbuhan.
- AI agent gateway.
- Advanced analytics.

---

## 11. Success Metrics

| Metric | Target |
|---|---|
| Santri yang bisa membaca assignment | 100% |
| Santri dengan Primary SoW | 100% |
| Weekly review submitted | ≥ 90% per pekan |
| PIC validation SLA | < 48 jam |
| Daily check-in compliance | ≥ 85% MVP, naik ke ≥95% setelah reminder |
| Project approved | ≥ 6 per santri per tahun |
| Data mapping tanpa konflik | 100% Unit/Location/Division/Role valid |

---

## 12. Notes

- WAG tetap boleh dipakai untuk koordinasi manual/onboarding.
- Telegram Bot digunakan untuk notifikasi sistem yang zero-cost.
- Semua surface harus responsive: desktop powerful, mobile usable.
