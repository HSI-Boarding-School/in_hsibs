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
