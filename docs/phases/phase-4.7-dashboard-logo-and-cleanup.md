# Phase 4.7 — Dashboard Logo (SiteSettings) + Edit/Reset Cleanup

> **Status:** ✅ Code selesai · compile & serve OK · ⏳ screenshot (login)
> **Scope:** UI/UX only — SiteSettings dibaca (read-only), fitur Payload
> disembunyikan (bukan dihapus).
> **Date:** 2026-08-26
> Catatan: dinomori **4.7** karena `phase-4.6` sudah dipakai
> ([dashboard-refinement](phase-4.6-dashboard-refinement.md)) di sesi yang sama.

---

## 1. Dashboard Logo (dari SiteSettings)

**Tujuan:** header dashboard menampilkan logo situs dari global SiteSettings,
supaya jelas CMS ini milik frontend yang mana.

### Field SiteSettings yang dipakai
`globals/SiteSettings.ts` (slug `site-settings`) punya:
- `logo` — `upload` → `media` (varian **light background**).
- `logoDark` — `upload` → `media`, label "Logo (Dark Background)" (varian **dark**).
- (`favicon` juga ada, tidak dipakai di sini.)

### Cara fetch
Pakai **Payload Local API** di komponen server `DashboardStats.tsx`
(pola yang sama dengan counts):
```ts
const ss = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
siteLogo     = ss?.logo?.url || null          // light
siteLogoDark = ss?.logoDark?.url || siteLogo  // dark (fallback ke light)
```
`depth: 1` → field upload ter-populate jadi dokumen media lengkap dengan `url`.

### Render & sizing
- Logo tampil di **header** dashboard, di kiri judul "Overview" (`.dnj-dash__brand`).
- `max-height: 40px; width: auto; object-fit: contain`.
- **Tidak clickable** (murni visual, ini admin bukan situs publik).

### Dark / light mode
- Dua `<img>` dirender (light + dark), di-swap via CSS tema
  (`.dnj-dash__logo-img--light/--dark`, `html[data-theme='dark']`).
- Kalau **hanya `logo`** yang di-set (tanpa `logoDark`): `logoDark` fallback ke
  `logo` → dipakai di kedua mode. (Kalau kontras kurang di dark, bisa tambah
  `filter` di `.dnj-dash__logo-img--dark` — belum diterapkan karena warna logo
  tidak diketahui.)

### Fallback (tidak ada logo)
Kalau `logo` kosong / SiteSettings error → **tidak ada logo**, header hanya
menampilkan teks "Overview" (perilaku sekarang). Tidak pernah error.

---

## 2. Fitur Disembunyikan — "Edit Dashboard" & "Reset Layout"

Dropdown **"Dashboard ▾"** di breadcrumb step-nav (pojok kiri-atas konten)
berisi **Edit Dashboard** & **Reset Layout**. Ini bawaan Payload, **bukan**
komponen kita.

### Di mana dirender
- Payload v3.87 punya **ModularDashboard** (eksperimental) — dashboard berbasis
  widget. Komponennya:
  `@payloadcms/next/dist/views/Dashboard/Default/ModularDashboard/DashboardStepNav.js`.
- Ia menyuntik dropdown ke **step-nav breadcrumb** via `SetStepNav`. Class:
  `.dashboard-breadcrumb-select` (toggler), `.dashboard-breadcrumb-dropdown__actions`
  / `__editing` (isi popup Edit/Reset).

### Apa itu "Edit Dashboard"?
- Sistem **kustomisasi widget** bawaan Payload: masuk edit-mode → drag/resize/
  **Add Widget** (mis. widget "Collections").
- **Kenapa "Add Widget: Collections" kosong / tak berefek:** kita **tidak**
  mengonfigurasi `admin.dashboard.widgets`, DAN body ModularDashboard (tempat
  widget dirender) kita **sembunyikan** via CSS
  (`.dashboard > .dnj-dash ~ * { display:none }`, custom.css) karena kita pakai
  komponen kustom `beforeDashboard` (`DashboardStats`). Jadi target widget tidak
  terlihat → menambah widget tak berdampak.
- **Agar berfungsi di masa depan:** bangun framework widget kustom — either
  konfigurasi `admin.dashboard.widgets` (API eksperimental) ATAU adopsi penuh
  ModularDashboard (lepas komponen `beforeDashboard` kustom, buat widget sendiri).

### Apa itu "Reset Layout"?
- Mengembalikan **layout widget tersimpan** (di **user preferences** Payload) ke
  susunan default.
- Di setup kita (tanpa widget + body modular disembunyikan): klik → mereset
  layout kosong → **tak ada efek visual**. Tapi bisa membingungkan.

### Kenapa keduanya disembunyikan
- **Tidak kompatibel** dengan dashboard kustom kita (widget target disembunyikan).
- **Tidak ada manfaat fungsional** saat ini.
- **Potensi bingung / reset tak sengaja** bagi user.

### Cara HIDE (yang diterapkan)
CSS di `admin/admin-global.css` (section 5) — **hanya sembunyikan, tidak hapus**:
```css
.dashboard-breadcrumb-select { display: none !important; }
```
Bersih, tanpa sisa tombol/ruang kosong.

### Cara RE-ENABLE di masa depan
1. **Unhide:** hapus rule `.dashboard-breadcrumb-select { display:none }` di
   `admin-global.css` (section 5).
2. **Agar fungsional:** perlu framework widget —
   - Konfigurasi `admin.dashboard.widgets` di `payload.config.ts` (API
     eksperimental Payload), dan/atau
   - Lepas/adaptasi `beforeDashboard` kustom + `.dashboard > .dnj-dash ~ *`
     hide-rule supaya area widget kembali terlihat.
3. **Saran fase "Customizable Dashboard" mendatang:** bangun widget kustom
   (stat, quick-access, activity) sebagai widget ModularDashboard resmi,
   menggantikan komponen `beforeDashboard` monolitik — sehingga Edit/Reset jadi
   bermakna.

**Status: HIDDEN (tidak dihapus)** — re-enable saat sistem widget kustom dibangun.

---

## 3. File impact

| File | Aksi | Keterangan |
|------|------|-----------|
| `apps/cms/src/admin/DashboardStats.tsx` | **Modified** | Fetch `site-settings` (logo/logoDark/siteName) via `findGlobal`; render logo di header (`.dnj-dash__brand`) dgn fallback teks. |
| `apps/cms/src/admin/custom.css` | **Modified** | Style `.dnj-dash__brand` + `.dnj-dash__logo-img` (max-height 40px, theme-swap light/dark). |
| `apps/cms/src/admin/admin-global.css` | **Modified** | Section 5: `.dashboard-breadcrumb-select { display:none }` (sembunyikan dropdown Edit/Reset). |
| `globals/SiteSettings.ts` | **TIDAK diubah** | Hanya dibaca. |

## 4. Known limitations
- Logo dark-mode: kalau `logoDark` tidak di-set, logo light dipakai di dark
  (belum ada auto-filter kontras).
- URL logo memakai `media.url` dari Payload; jika storage/CDN berubah, `url`
  tetap mengikuti konfigurasi media.
- Edit/Reset hanya di-hide via CSS (bukan dinonaktifkan di level config) — sesuai
  aturan "jangan hapus core, hanya sembunyikan".
- Butuh login untuk verifikasi visual.
