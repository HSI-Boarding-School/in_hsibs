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


---

# User Flow IN_HSIBS v3.1

## 1. Santri Flow

### 1.1 First Login

```txt
Santri menerima ID + PIN default
→ login
→ ganti PIN
→ confirm profile
→ melihat Unit, Location, Division, Assignment Level, PIC Div, PIC Reg
→ membaca Role & SoW
→ masuk Home
```

### 1.2 Daily Routine

```txt
Pagi:
Home → Reporting → Daily → Foto/GPS → rencana hari ini → submit

Sore:
Reporting → Daily → recap selesai → blocker/kendala → mood → submit
```

### 1.3 Weekly Routine

```txt
Reporting → Weekly
→ isi SoW progress
→ highlight
→ lowlight
→ submit
→ menunggu validasi PIC Div
```

### 1.4 Monthly Routine

```txt
Reporting → Monthly
→ baca auto-summary Learn/Project/Check-in
→ isi refleksi
→ upload file bila diperlukan
→ submit
→ PIC Div draft evaluation
→ PIC Reg finalization
```

### 1.5 Mapping/Profile Exploration

```txt
Mapping
→ pilih view A–Z / Unit / Division / Location
→ tap card santri
→ lihat Unit, Location, Division, Assignment Level, Role, SoW, PIC
```

### 1.6 Ask/Remind Flow

```txt
Santri melihat SoW/assignment tidak jelas
→ klik Ask PIC / Request Clarification
→ tulis pertanyaan
→ PIC Div menerima item follow-up
→ PIC menjawab atau mengajukan adjustment
```

---

## 2. PIC Div Flow

### 2.1 Overview

```txt
Login
→ PIC Overview
→ lihat santri dalam scope division
→ filter warning/need review
→ buka detail santri
```

### 2.2 Weekly Validation

```txt
Validate
→ pilih submitted weekly review
→ baca progress/highlight/lowlight
→ beri catatan
→ Validate atau Revisi
```

### 2.3 Role & SoW Management

```txt
Roles & SoW
→ pilih Division
→ pilih Role
→ edit SoW template
→ publish version
→ assignment santri terdampak diberi version marker
```

### 2.4 Request Placement Change

```txt
Mapping
→ drag card / edit assignment
→ Placement Change Wizard
→ isi before-after + reason
→ submit request
→ menunggu PIC Reg/Admin approval jika cross-unit/location/region
```

---

## 3. PIC Reg Flow

```txt
Login
→ Regional Overview
→ lihat summary region
→ review change request
→ approve/reject
→ finalize monthly evaluation
→ export regional report
```

---

## 4. Admin Flow

```txt
Login
→ System Overview
→ manage master data
→ import/export CSV
→ approve override
→ invite PIC baru
→ audit trail
→ report generation
```

---

## 5. Critical Edge Cases

| Case | Expected Flow |
|---|---|
| Santri remote | Location = Remote; GPS recorded but radius validation exempt |
| ASR PIC belum fixed | PIC Div field can be empty/TBD; Admin/PIC Reg can invite new PIC |
| Santri multi-division | Display Primary, Secondary, Additional separately |
| Santri wants edit mapping | Not allowed; can ask/remind PIC only |
| PIC drag card | Must open change wizard, not direct mutation |
| Cross-region move | PIC Reg/Admin approval required |


---

# Design Spec IN_HSIBS v3.1

## 1. Design Direction

IN_HSIBS memakai gaya dashboard internal yang tenang, premium, dan data-first. Rujukan utama: Linear design system dengan primary color HSI BS Royal Blue.

Prinsip:
- UI tenang, data jelas.
- Karya dan amanah santri adalah pahlawannya.
- Sedikit warna; gunakan status color hanya saat bermakna.
- Semua surface responsive.

---

## 2. Design Tokens

| Token | Value | Usage |
|---|---|---|
| Canvas | #010102 | dark background |
| Surface 1 | #0f1011 | cards |
| Surface 2 | #141516 | panels |
| Surface 3 | #191a1b | lifted tiles |
| Hairline | #23252a | borders/dividers |
| Ink | #f7f8f8 | primary text |
| Ink Subtle | #8a8f98 | secondary text |
| Primary | #1565C0 | CTA, active nav, focus |
| Primary Hover | #1976D2 | hover |
| Primary Focus | #0D47A1 | focus ring |
| Green | #16A34A | on track |
| Yellow | #F59E0B | attention |
| Red | #DC2626 | intervention |
| Gold | #C9A84C | spiritual highlight |

Typography:
- Inter for display/body.
- JetBrains Mono for IDs, codes, tokens.
- Negative tracking for large headings.
- Sentence case.

---

## 3. Main Navigation

### Santri Field App

Bottom dock:
- Home
- Mapping
- Monitoring
- Reporting
- Profile

### Back-Office

Desktop:
- Sidebar navigation.

Mobile/tablet:
- Bottom dock or compact tab bar for PIC.

---

## 4. Screen Specs

### 4.1 Home

Widgets:
- Today action
- Check-in status
- Next Learn session
- Project progress
- SoW progress
- Latest PIC note
- Warning/reminder

### 4.2 Mapping

Views:
- A–Z
- Unit
- Location
- Division
- PIC

Card:
- Avatar/initials
- Full name
- ID
- Unit
- Location
- Primary/Secondary/Side chips
- GYR/status indicator

Drawer:
- Profile
- Unit/Location/Region
- Assignment cards
- Role cards
- SoW cards inline
- PIC Div/PIC Reg
- Ask/clarify button

### 4.3 Monitoring

Calendar month grid:
- Dot blue: daily
- Dot green: weekly
- Dot yellow: learn
- Dot purple: project
- Dot red: overdue/urgent

Monitoring is reminder/timeline only, not input form.

### 4.4 Reporting

Tabs:
- Daily
- Weekly
- Monthly
- Special

Daily:
- Morning: photo/GPS + plan.
- Evening: done + blocker + mood.

Weekly:
- SoW progress + highlight/lowlight.

Monthly:
- Learn/project/check-in summary + reflection + upload.

Special:
- Learn attendance
- Project submission
- Achievement
- Izin/dispensasi

### 4.5 Profile

- Digital ID Card
- Assignment summary
- PIN settings
- Telegram settings
- Portfolio visibility
- Logout

### 4.6 Admin/PIC Mapping

Features:
- Drag & drop kanban.
- Change wizard.
- Before/after comparison.
- Reason required.
- Approval state.
- Audit trail.

---

## 5. Component Library

| Component | Purpose |
|---|---|
| BottomDock | mobile navigation |
| Sidebar | desktop back-office navigation |
| SantriCard | mapping card |
| AssignmentChip | Primary/Secondary/Side badge |
| RoleCard | role display with PIC |
| SoWCard | scope of work item with progress/evidence |
| PICBadge | PIC Div/PIC Reg identity |
| StatusBadge | GYR and workflow status |
| MoodBar | 7-day mood trend |
| CalendarGrid | monitoring timeline |
| ReportForm | daily/weekly/monthly/special |
| ChangeWizard | placement change flow |
| AuditTrail | change history |

---

## 6. Responsive Rules

Desktop:
- Sidebar + table/kanban + drawer.

Tablet:
- Collapsible sidebar + split view.

Mobile:
- Bottom dock + card list + bottom sheet.

All critical review/approval actions must be usable on mobile.

---

## 7. Microcopy

Santri:
- “Amanah utama”
- “Amanah tambahan”
- “Tanyakan ke PIC”
- “Kirim progress”
- “Belum check-in hari ini”

PIC:
- “Butuh validasi”
- “Perlu revisi”
- “Ajukan perubahan”
- “Submit ke PIC Reg”

Admin:
- “Approve perubahan”
- “Invite PIC baru”
- “Lihat audit trail”


---

# Database Spec IN_HSIBS v3.1

## 1. Core Principle

Database IN_HSIBS harus modular. Master data tidak boleh bercampur dengan progress/reporting. Mapping placement harus bisa berubah secara fleksibel, tetapi perubahan harus terekam.

## 2. Database Modules

1. Identity & Auth
2. Master Program
3. Master Placement
4. Division, Role, SoW
5. PIC & Assignment Rules
6. Santri Assignment
7. Reporting
8. Learn & Projects
9. Evaluation & Mukafaah
10. Notifications
11. Audit & Change Requests
12. Public Portfolio
13. AI Gateway

## 3. Essential Tables

### 3.1 `profiles`

| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_code | text | IN_HSIBS_S01 / PIC_xx |
| full_name | text |  |
| unique_name | text | optional |
| role | enum | Santri, PIC_Div, PIC_Reg, Admin, Viewer |
| pin_hash | text | nullable for PIC password auth |
| telegram_chat_id | text | optional |
| photo_url | text | optional |
| status_active | boolean | default true |

### 3.2 `units`

Unit institution.

### 3.3 `locations`

Location + region + GPS radius.

### 3.4 `divisions`

Current codes:
- IT
- DKV
- EN
- DEEN
- ASR
- OPS
- PKBM

### 3.5 `roles`

Roles belong to divisions.

### 3.6 `sow_templates`

SoW belongs to role.

### 3.7 `santri_division_assignments`

| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| santri_id | uuid | FK profiles |
| division_id | uuid | FK divisions |
| assignment_level | enum | Primary, Secondary, Additional |
| status | enum | Active, Proposed, Archived |
| assigned_by | uuid | FK profiles |
| approved_by | uuid | nullable |
| effective_date | date |  |

### 3.8 `santri_role_assignments`

Role assignments under a division assignment.

### 3.9 `santri_sow_assignments`

Personal SoW generated from template.

### 3.10 `pic_assignments`

PIC by division/location/region.

### 3.11 `pic_assignment_rules`

Default PIC rules.

### 3.12 `placement_change_requests`

Tracks proposed mapping changes.

### 3.13 `daily_logs`

Morning/evening check-in.

### 3.14 `weekly_reviews`

Weekly SoW progress.

### 3.15 `monthly_reports`

Santri monthly report.

### 3.16 `monthly_evaluations`

PIC evaluation and GYR.

### 3.17 `learn_sessions` and `learn_attendance`

Mandatory and role-specific learn.

### 3.18 `projects`, `project_members`, `project_evidence`, `project_reviews`

Project output and review.

### 3.19 `special_reports`

Learn proof, project submission, achievement, izin/dispensasi.

### 3.20 `notification_logs`

Telegram reminders.

### 3.21 `audit_logs`

All critical changes.

---

## 4. Enum Recommendations

```sql
assignment_level: Primary, Secondary, Additional
assignment_status: Active, Proposed, Archived
profile_role: Santri, PIC_Div, PIC_Reg, Admin, Viewer
report_status: Draft, Submitted, Validated, Revision, Approved, Rejected
gyr_status: Green, Yellow, Red
mood: Good, Okay, Tough
```

---

## 5. Seed Files Included

The CSV folder contains:
- santri.csv
- units.csv
- locations.csv
- divisions.csv
- roles.csv
- sow_templates.csv
- pic_directory.csv
- pic_assignment_rules.csv
- santri_division_assignments.csv
- learn_sessions.csv
- project_tracks.csv
- report_structures.csv
