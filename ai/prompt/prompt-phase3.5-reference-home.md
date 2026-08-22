Baca AGENTS.md, WORKFLOW.md, dan docs/PROGRESS.md dulu sebelum mulai kerja.
Inspect ulang struktur file yang relevan — jangan asumsi dari histori
sebelumnya, karena kode sudah berkembang sejak Phase 3.

## Konteks

Phase 3 (CMS Features & Dynamic Content) sudah selesai dan sudah manual
tested — semua PASS. Sebelum lanjut ke Phase 4 (Polish & Launch), saya
mau terapkan reference layout desain baru dulu, supaya animasi/SEO/
performance di Phase 4 dikerjakan di atas struktur visual yang final,
bukan struktur yang bakal berubah lagi.

Reference desain ada di: `ai/reference/home/`

## Step 0 — Registrasi Task Baru di docs/PROGRESS.md

Sebelum mulai kerja, tambahkan phase baru di antara Phase 3 dan Phase 4.
Insert section ini persis setelah "## Phase 3 — CMS Features & Dynamic
Content" dan sebelum "## Phase 4 — Polish & Launch":

```markdown
## Phase 3.5 — Reference Layout Implementation 🔨 IN PROGRESS

Menerapkan reference desain (ai/reference/home/) ke komponen fixed/reusable
sebelum masuk Phase 4, agar animasi & polish tidak perlu rework kalau
layout berubah.

**Catatan scope:** User menyebutkan akan ada halaman baru "Property & Land
for Sale" di luar 7 service modules awal (Tours, Accommodations, Water
Activities, Yacht, Restaurants, Weddings, Rentals). Ini BELUM ada
collection-nya di CMS — dicatat sebagai future scope, TIDAK dikerjakan
di phase ini. Perlu Collection config baru + akses control + frontend
di phase terpisah nanti.

Urutan halaman yang direncanakan ke depan (referensi, belum tentu
urutan pengerjaan): Home, About, Tour, Villa, Water Activities,
Private Yacht, Restaurant, Wedding & Event Services, Property & Land
for Sale, Contact.

### 3.5.1 Fixed/Reusable Components (dipakai di semua atau banyak halaman)
- [ ] Header — reference diterapkan, styling final
- [ ] Footer — reference diterapkan, styling final
- [ ] Filter & Booking Floating — component reusable untuk halaman
      listing (dipakai di beberapa halaman, bukan semua)
- [ ] CTA Floating (footer/bottom) — component reusable, dipakai di
      hampir semua halaman

### 3.5.2 Home Page
- [ ] Layout Home diterapkan sesuai reference
- [ ] Section-section Home disesuaikan (hero, services, dst — detail
      menyusul sesuai apa yang ada di reference)

**Manual Test Log — Phase 3.5**
(diisi Claude Code setelah setiap step, sama seperti format Phase 3)
```

Update juga "Current Phase" di bagian atas jadi "Phase 3.5 — Reference
Layout Implementation".

## ATURAN ANTI-TIMPA / ANTI-DUPLIKASI (PENTING — sama seperti Phase 3)

1. Selalu inspect folder/file tujuan dulu sebelum edit atau create
2. Header.astro dan Footer.astro SUDAH ADA dari Phase 3 (CMS-driven,
   fetch dari getSiteSettings() + getMenuBySlug()) — JANGAN buat file
   baru, EDIT yang sudah ada. Pertahankan data-fetching logic yang
   sudah CMS-driven, cuma ubah markup/styling/struktur visual sesuai
   reference
3. index.astro (Home) SUDAH ADA dengan hybrid approach (CMS Page 'home'
   → fallback block composition) dari Phase 3 — JANGAN buat file baru
   atau hapus logic hybrid itu. Sesuaikan markup/section di dalam
   struktur yang sudah ada, atau diskusikan dulu ke saya kalau reference
   butuh restructure besar yang bentrok dengan hybrid approach
4. Filter & Booking Floating dan CTA Floating adalah component BARU
   (belum ada dari phase sebelumnya) — cek dulu ke apps/web/src/components/
   untuk pastikan memang belum ada sebelum create
5. Kalau reference menunjukkan struktur yang beda jauh dari component
   cards yang sudah dibangun di Phase 2 (TourCard, dll), JANGAN duplikasi
   card baru — modifikasi card yang sudah ada supaya sesuai reference,
   atau laporkan ke saya dulu kalau butuh keputusan besar (breaking
   change ke semua listing page yang sudah pakai card itu)

## Step 1 — Analisis Reference

Sebelum coding, buka dan pelajari semua file di `ai/reference/home/`.
Laporkan dulu ke saya sebelum lanjut:
- Apa isi reference (screenshot? Figma export? HTML? deskripsi teks?)
- Section apa saja yang teridentifikasi untuk halaman Home
- Pattern visual untuk Header, Footer, Filter & Booking Floating,
  CTA Floating yang bisa diekstrak dari reference
- Kalau ada bagian yang ambigu/tidak jelas dari reference, tanyakan
  ke saya SEBELUM mulai build, jangan asumsi sendiri

**STOP di sini dan tunggu konfirmasi saya sebelum lanjut ke Step 2.**

## Step 2 — Header (Fixed)

- Edit Header.astro yang sudah ada
- Terapkan struktur visual dari reference
- Pertahankan: fetch dari getSiteSettings() + getMenuBySlug() CMS-driven
- Karena ini FIXED (dipakai semua halaman), pastikan tidak ada elemen
  yang hardcode khusus untuk Home saja

**Manual test setelah step ini:**
```
[ ] Header tampil sesuai reference secara visual
[ ] Data (logo, nav items) masih dari CMS, bukan hardcoded
[ ] Responsive check di ~375px tidak rusak
[ ] Cek di 2 halaman berbeda (Home + salah satu listing page) —
    Header konsisten muncul sama di keduanya
```

## Step 3 — Footer (Fixed)

- Edit Footer.astro yang sudah ada
- Terapkan struktur visual dari reference
- Pertahankan: fetch dari getSiteSettings() (contact, social, copyright)

**Manual test setelah step ini:**
```
[ ] Footer tampil sesuai reference secara visual
[ ] Data (contact, social links) masih dari CMS
[ ] Responsive check di ~375px — stack rapi
[ ] Konsisten muncul di minimal 2 halaman berbeda
```

## Step 4 — Filter & Booking Floating (Reusable, bukan Fixed)

- Component baru di apps/web/src/components/common/ atau
  apps/web/src/components/navigation/ (pilih lokasi yang konsisten
  dengan struktur folder existing, laporkan pilihannya)
- Reusable — dirancang untuk dipasang di halaman listing tertentu
  (Tours, Accommodations, dst), BUKAN di semua halaman
- Buat sebagai component yang menerima props secukupnya supaya gampang
  dipasang ulang di halaman lain nanti (misal: props untuk filter
  options, destination list, dsb — sesuaikan dengan apa yang reference
  tunjukkan)
- Belum perlu dipasang ke halaman manapun di step ini — cukup build
  component-nya dan buat 1 halaman test/demo sederhana untuk preview

**Manual test setelah step ini:**
```
[ ] Component tampil sesuai reference di halaman demo
[ ] Filter interaction (kalau ada dropdown/select) berfungsi minimal
    secara UI (belum perlu terhubung ke real filtering logic)
[ ] Floating behavior (sticky/fixed position) bekerja saat scroll
[ ] Responsive di ~375px tidak menutupi konten penting
```

## Step 5 — CTA Floating Footer (Reusable, dipakai hampir semua halaman)

- Component baru, lokasi konsisten dengan Step 4
- Reusable, dirancang gampang dipasang ke banyak halaman (WhatsApp
  floating button pattern kemungkinan besar — sesuaikan dengan reference)
- Pasang di Home sebagai contoh implementasi pertama

**Manual test setelah step ini:**
```
[ ] CTA floating tampil sesuai reference di Home
[ ] Klik CTA membuka WhatsApp real dengan nomor dari CMS Site Settings
[ ] Tidak menutupi konten penting di mobile (~375px)
[ ] Posisi floating konsisten saat scroll naik/turun
```

## Step 6 — Home Page Full Layout

- Edit index.astro (JANGAN buat file baru — pertahankan hybrid
  approach dari Phase 3)
- Terapkan struktur section sesuai reference
- Pasang Filter & Booking Floating di Home HANYA JIKA reference
  menunjukkan itu ada di Home (kalau tidak, skip — ingat ini reusable
  untuk halaman lain, bukan wajib di semua halaman termasuk Home)
- Pasang CTA Floating (dari Step 5)

**Manual test setelah step ini:**
```
[ ] Home tampil lengkap sesuai reference
[ ] Semua data section masih CMS-driven (fetch dari collections/blocks)
[ ] Header + Footer + CTA Floating semua muncul terintegrasi rapi
[ ] Responsive full check ~375px, ~768px, ~1280px
[ ] Tidak ada sisa markup lama/placeholder dari Phase 3 yang menumpuk
```

## Setelah Semua Step Selesai

1. Update docs/PROGRESS.md:
   - Centang checklist Phase 3.5 yang selesai dengan tanggal hari ini
   - Isi "Manual Test Log — Phase 3.5" dengan hasil test tiap step
   - Update "Current Phase" jadi "Phase 4 — Polish & Launch"
   - Tambahkan entry di Decision Log soal lokasi folder component
     baru (Filter & Booking Floating, CTA Floating) dan alasan
     pemilihan lokasinya

2. Laporkan pakai format AGENTS.md Section 14:

```
## Task: Phase 3.5 — Reference Layout Implementation (Home)

### Changed
- file — apa yang berubah (list semua file baru/edited)

### Area
[web] / [docs]

### Impact
- DB: none
- Frontend: [detail]
- Deploy needed: web

### Manual Test Summary
[berapa dari total checklist PASS via automated check, mana yang
perlu saya test manual di browser]

### Next
Phase 4 — Polish & Launch (atau lanjut Phase 3.5 untuk halaman lain
kalau saya putuskan begitu)
```

## Aturan Penting (dari AGENTS.md)

- Jangan install package baru tanpa bilang dulu
- Selalu inspect file existing sebelum edit — JANGAN asumsi kosong
  atau asumsi dari histori chat sebelumnya
- List file yang akan berubah sebelum mulai edit tiap step
- WAJIB stop dan tunggu konfirmasi saya di akhir Step 1 (analisis
  reference) sebelum mulai coding apapun
- Kalau satu step gagal manual test, STOP — jangan lanjut ke step
  berikutnya sebelum saya konfirmasi
- Kalau reference ternyata butuh restructure besar yang bentrok
  dengan arsitektur BlockRenderer/hybrid Home dari Phase 3, STOP dan
  diskusikan dulu — jangan override keputusan arsitektur sebelumnya
  sepihak
