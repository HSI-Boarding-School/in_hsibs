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
