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
