# Hardcoded Pages Audit Report

**Generated**: 2026-08-20
**Dikerjakan oleh**: Claude Code (read-only audit)
**Scope**: `apps/web/src/pages/**` — seluruh route frontend Astro vs sumber data CMS (Payload)

> ⚠️ **Audit read-only.** Tidak ada file kode yang diubah/dihapus. Satu-satunya
> file baru adalah laporan ini. Semua rekomendasi di bawah butuh keputusan +
> implementasi terpisah.

---

## Executive Summary

- **Total route files**: 23
- **Fully CMS-managed** (data + copy dari CMS / block-driven): 2
  (`/` homepage, `/[...slug]` catch-all Pages)
- **CMS-managed data, template presentational di kode** (detail pages): 13
- **HYBRID — data CMS + header/copy hardcoded** (listing pages): 6
- **CMS-hybrid utility** (retain-with-fallback ke Site Settings): 2 (`/404`, `/property`)
- **Fully hardcoded content (murni, tanpa CMS sama sekali)**: **0**
- **Route collisions (laten)**: 1 kelas (static listing vs CMS `[...slug]`)
- **Duplikasi template detail (singular vs plural)**: 6 pasang
- **Route listing yang HILANG**: 1 (`/yacht` — tidak ada `yacht/index.astro`)

### Temuan utama (TL;DR)

1. **Tidak ada halaman yang "murni hardcoded".** Semua route sudah menyentuh
   CMS. Yang user lihat di `/water-activities` sebagai "hardcoded" sebenarnya
   **HYBRID**: daftar item di-fetch dari collection `water-activities`, tapi
   **teks header** (eyebrow, H1, paragraf intro, `<title>` SEO) ditulis
   langsung di file `.astro`.

2. **Sudah ada collection CMS yang seharusnya menampung copy header itu** —
   `ServiceTypes` (punya field `name`, `description`, `coverImage`,
   `metaTitle`, `metaDescription`). Tapi ke-6 listing `index.astro` **tidak
   meng-consume-nya**. Ini gap refactor termudah & paling berdampak.

3. **Duplikasi template detail**: setiap service punya DUA route detail —
   plural (`/tours/[slug]`, layout lama sederhana) dan singular
   (`/tour/[slug]`, layout premium bento). Card default nge-link ke **plural**,
   jadi versi singular premium sebagian besar **orphaned** (kecuali yacht).

4. **`/yacht` listing hilang** — ada `yacht/[slug].astro` tapi tidak ada
   `yacht/index.astro`. Module `yacht` enabled di config tapi tidak punya
   halaman listing.

---

## Full Route Inventory

| # | URL | File Path | Route Type | Data Source | Category |
|---|-----|-----------|-----------|-------------|----------|
| 1 | `/` | [index.astro](../../apps/web/src/pages/index.astro) | static | **CMS-managed** (Page `home` → HomepageContent global + Testimonials → hardcoded safety-net) | CMS ✅ |
| 2 | `/*` (any) | [[...slug].astro](../../apps/web/src/pages/%5B...slug%5D.astro) | catch-all | **CMS-managed** (Pages collection, `BlockRenderer`) | CMS ✅ |
| 3 | `/404` | [404.astro](../../apps/web/src/pages/404.astro) | static | **Hybrid** (`site-settings.errorPages.notFound` + hardcoded fallback) | B — Keep static |
| 4 | `/property` | [property.astro](../../apps/web/src/pages/property.astro) | static | **Hybrid** (`site-settings.errorPages.propertyComingSoon` + fallback) | B — Keep static |
| 5 | `/tours` | [tours/index.astro](../../apps/web/src/pages/tours/index.astro) | static | **Hybrid** — items dari `tours`, header hardcoded | D — Refactor |
| 6 | `/accommodations` | [accommodations/index.astro](../../apps/web/src/pages/accommodations/index.astro) | static | **Hybrid** — items dari `accommodations`, header hardcoded | D — Refactor |
| 7 | `/restaurants` | [restaurants/index.astro](../../apps/web/src/pages/restaurants/index.astro) | static | **Hybrid** — items dari `restaurants`, header hardcoded | D — Refactor |
| 8 | `/rentals` | [rentals/index.astro](../../apps/web/src/pages/rentals/index.astro) | static | **Hybrid** — items dari `rentals`, header hardcoded | D — Refactor |
| 9 | `/weddings` | [weddings/index.astro](../../apps/web/src/pages/weddings/index.astro) | static | **Hybrid** — items dari `venues`, header hardcoded | D — Refactor |
| 10 | `/water-activities` | [water-activities/index.astro](../../apps/web/src/pages/water-activities/index.astro) | static | **Hybrid** — items dari `water-activities`, header hardcoded | D — Refactor |
| 11 | `/tours/[slug]` | [tours/[slug].astro](../../apps/web/src/pages/tours/%5Bslug%5D.astro) | dynamic | **CMS** data, template kode (layout lama) | C — Dedup |
| 12 | `/accommodations/[slug]` | [accommodations/[slug].astro](../../apps/web/src/pages/accommodations/%5Bslug%5D.astro) | dynamic | **CMS** data, template kode (layout lama) | C — Dedup |
| 13 | `/restaurants/[slug]` | [restaurants/[slug].astro](../../apps/web/src/pages/restaurants/%5Bslug%5D.astro) | dynamic | **CMS** data, template kode (layout lama) | C — Dedup |
| 14 | `/rentals/[slug]` | [rentals/[slug].astro](../../apps/web/src/pages/rentals/%5Bslug%5D.astro) | dynamic | **CMS** data, template kode (layout lama) | C — Dedup |
| 15 | `/weddings/[slug]` | [weddings/[slug].astro](../../apps/web/src/pages/weddings/%5Bslug%5D.astro) | dynamic | **CMS** data, template kode (layout lama) | C — Dedup |
| 16 | `/water-activities/[slug]` | [water-activities/[slug].astro](../../apps/web/src/pages/water-activities/%5Bslug%5D.astro) | dynamic | **CMS** data, template kode (layout lama) | C — Dedup |
| 17 | `/tour/[slug]` | [tour/[slug].astro](../../apps/web/src/pages/tour/%5Bslug%5D.astro) | dynamic | **CMS** data, template kode (layout **premium**) | C — Dedup |
| 18 | `/villa/[slug]` | [villa/[slug].astro](../../apps/web/src/pages/villa/%5Bslug%5D.astro) | dynamic | **CMS** data (`accommodations`, filter villa/hotel/resort), premium | C — Dedup |
| 19 | `/restaurant/[slug]` | [restaurant/[slug].astro](../../apps/web/src/pages/restaurant/%5Bslug%5D.astro) | dynamic | **CMS** data, premium | C — Dedup |
| 20 | `/rental/[slug]` | [rental/[slug].astro](../../apps/web/src/pages/rental/%5Bslug%5D.astro) | dynamic | **CMS** data, premium | C — Dedup |
| 21 | `/venue/[slug]` | [venue/[slug].astro](../../apps/web/src/pages/venue/%5Bslug%5D.astro) | dynamic | **CMS** data (`venues`), premium | C — Dedup |
| 22 | `/water-activity/[slug]` | [water-activity/[slug].astro](../../apps/web/src/pages/water-activity/%5Bslug%5D.astro) | dynamic | **CMS** data, premium | C — Dedup |
| 23 | `/yacht/[slug]` | [yacht/[slug].astro](../../apps/web/src/pages/yacht/%5Bslug%5D.astro) | dynamic | **CMS** data (`yachts`), premium — **canonical** (card link `/yacht`) | Keep ✅ |

> **Cara deteksi yang dipakai**: cek import `@lib/payload` (getX/getXBySlug),
> `getStaticPaths` yang query collection, dan `BlockRenderer`. Semua 23 file
> dibuka & dibaca penuh untuk konfirmasi — tidak ada asumsi.

---

## Detail per Kategori

### A. Should Migrate to CMS (konten yang idealnya editable client)

**Tidak ada halaman yang perlu dimigrasi "dari nol"** — karena tidak ada
halaman yang murni hardcoded. Yang ada adalah **sub-bagian copy** di listing
pages (Kategori D) yang perlu di-wire ke CMS. Lihat Kategori D.

### B. Keep as Static (by design)

| Halaman | Alasan |
|---|---|
| `/404` | Utility page. Copy sudah retain-with-fallback ke `site-settings.errorPages.notFound`. Struktur (angka 404, layout) memang harus di kode. Cukup. |
| `/property` | "Coming soon" placeholder. Copy sudah CMS-hybrid (`errorPages.propertyComingSoon`). Tidak perlu jadi full CMS Page. |
| `/[...slug]` (engine) | Ini **bukan konten**, ini mesin render CMS Pages. Wajib tetap di kode. |
| Detail templates (semua) | Layout/markup detail = **design system**, bukan editorial content. Data-nya sudah 100% dari CMS. Tetap di kode (tapi lihat Kategori C soal duplikasi). |

### C. Route Collisions & Duplikasi — Needs Resolution

#### C.1 — Duplikasi template detail (singular vs plural) — **PRIORITAS**

Setiap service vertical punya **dua** file detail yang query collection yang
**sama** tapi render layout **berbeda**:

| Service | Plural (layout lama, **di-link card**) | Singular (layout premium, **orphaned**) | Collection |
|---|---|---|---|
| Tours | `/tours/[slug]` ✅ dilink | `/tour/[slug]` | `tours` |
| Accommodations | `/accommodations/[slug]` ✅ dilink | `/villa/[slug]` (filter villa/hotel/resort) | `accommodations` |
| Restaurants | `/restaurants/[slug]` ✅ dilink | `/restaurant/[slug]` | `restaurants` |
| Rentals | `/rentals/[slug]` ✅ dilink | `/rental/[slug]` | `rentals` |
| Weddings | `/weddings/[slug]` ✅ dilink | `/venue/[slug]` | `venues` |
| Water Activities | `/water-activities/[slug]` ✅ dilink | `/water-activity/[slug]` | `water-activities` |
| Yacht | *(tidak ada plural)* | `/yacht/[slug]` ✅ dilink | `yachts` |

**Bukti "mana yang canonical"** — default `hrefBase` di card components:
`TourCard → /tours`, `AccommodationCard → /accommodations`,
`RestaurantCard → /restaurants`, `RentalCard → /rentals`,
`VenueCard → /weddings`, `WaterActivityCard → /water-activities`,
**tapi** `YachtCard → /yacht`.

➡️ Konsekuensi: user dari listing selalu mendarat di **layout lama (plural)**.
Layout **premium (singular)** yang jauh lebih kaya (bento gallery, sticky
booking form, quick specs, recommended) hanya kelihatan kalau:
(a) URL diketik manual, atau
(b) di-klik dari section "Curated Alternatives" **di dalam** halaman singular
(karena rec-links pakai `/tour/…`, `/villa/…`, dst).

Ini bukan URL collision (URL beda), tapi **konten & effort ganda**: dua
template untuk data yang sama, mudah drift, membingungkan SEO (dua URL per
produk). **Yacht adalah pola yang benar** (satu template, singular).

**Opsi resolusi** → lihat bagian Analisa & Rekomendasi.

#### C.2 — Static listing vs CMS catch-all `[...slug]` (collision laten, by design)

`[...slug].astro` (Pages collection) di-comment eksplisit:

> *"Runs AFTER static routes like /tours, /accommodations, etc., so those
> service module URLs are never overridden by a CMS Page even if a Page with
> that slug exists."*

Artinya: kalau editor bikin CMS Page dengan slug `water-activities`, file
statis `water-activities/index.astro` **menang** — Page CMS-nya jadi tidak
pernah tampil (silent shadow). Ini **by design** dan aman untuk sekarang, tapi
**latent trap**: editor bisa bingung kenapa Page-nya "tidak muncul".

- **Risiko**: rendah (butuh editor sengaja pakai slug yang bentrok).
- **Rekomendasi**: dokumentasikan daftar "reserved slugs" + idealnya validasi
  di CMS (hook `beforeValidate` di Pages menolak slug reserved). Tidak urgent.

### D. Hybrid — Needs Refactor (data CMS, copy header hardcoded)

Ke-6 listing `index.astro` (route #5–#10) punya pola identik:

**Yang sudah CMS** ✅
- Daftar item (`getTours`, `getAccommodations`, dst) — fully dynamic
- Empty-state & error-state (sudah digenericize di phase sebelumnya)
- Gate `isModuleEnabled(...)` (feature toggle CMS)

**Yang masih hardcoded** ❌ (per file, di frontmatter/markup):
- `<PageLayout title="…" description="…">` — SEO title & meta description
- Eyebrow (`<p>Adventure on Water</p>`, `Explore`, `Where to Stay`, dst)
- H1 (`Water Activities`, `Tours & Activities`, dst)
- Paragraf intro deskriptif (2–3 kalimat per halaman)

Contoh konkret `water-activities/index.astro` (yang user tunjuk):
```
eyebrow:   "Adventure on Water"            ← hardcoded
h1:        "Water Activities"              ← hardcoded
intro:     "From gentle snorkeling…"       ← hardcoded
seo title: "Water Activities"             ← hardcoded
seo desc:  "Snorkeling, diving, surfing…"  ← hardcoded
```

**Kunci**: collection **`ServiceTypes` sudah ada** dan punya persis field-field
ini — `name`, `description` (richText, doc-nya bilang *"dipakai di landing page
/ listing header"*), `coverImage`, `metaTitle`, `metaDescription`, di-key oleh
`key` (`tours`, `accommodations`, `water-activities`, `venues`, `restaurants`,
`rentals`, `yachts`). Helper `getResolvedServiceTypes()` /
`getServiceTypeByKey()` juga sudah ada dan sudah dipakai di `[...slug].astro`
untuk SEO fallback. **Tapi listing index pages belum consume-nya.** Jadi copy
header masih beku di kode meski "wadah" CMS-nya sudah siap.

---

## Analisa & Rekomendasi Keputusan

### Keputusan 1 — Listing header copy (Kategori D)

**OPSI 1 — Wire listing header ke `ServiceTypes` (RECOMMENDED)**
- **Pros**:
  - Wadah CMS sudah ada (`ServiceTypes`) — tidak perlu collection/field baru.
  - Helper sudah ada (`getServiceTypeByKey`) — pola sudah terbukti di `[...slug]`.
  - Client bisa edit judul/intro/SEO listing tanpa deploy → sesuai goal CMS-driven.
  - Konsisten: satu sumber metadata untuk nav, footer, card, DAN listing header.
- **Cons**:
  - Perlu sentuh 6 file (+ ideal 1 partial `ListingHeader.astro` biar DRY).
  - Perlu fallback hardcoded (safety-net kalau ServiceType kosong) — tapi
    polanya sudah dipakai di seluruh project.
- **Effort**: **Kecil–Medium** (~½ hari; mekanis, low-risk, additive).
- **Dependency**: tidak ada collection/block baru. Cukup consume field existing.

**OPSI 2 — Biarkan hardcoded**
- **Pros**: nol effort; copy jarang berubah.
- **Cons**: bertentangan dengan goal CMS-driven; client tetap minta developer
  untuk ganti satu kalimat intro; `ServiceTypes.description` jadi field mati
  (ada di admin, tidak berefek — membingungkan editor).

➡️ **Rekomendasi**: **Opsi 1.** Ini quick win dengan rasio dampak/effort
tertinggi di seluruh audit, dan "menutup lingkaran" ServiceTypes yang sudah
dibangun tapi setengah terpakai.

### Keputusan 2 — Duplikasi template detail (Kategori C.1)

**OPSI 1 — Konsolidasi ke SATU template per service, redirect yang lain (RECOMMENDED)**
- Pilih pemenang: **layout premium (singular)** — jelas lebih kaya & sudah jadi
  arah desain terbaru (parity dgn yacht).
- Langkah: jadikan singular canonical → ubah default `hrefBase` card ke
  singular (`/tour`, `/villa`, …) → ubah plural `[slug]` jadi 301 redirect ke
  singular (atau hapus + tambah redirect di config) → update rec-links.
- **Pros**: satu template per produk, satu URL per produk (SEO bersih), hapus
  ~6 file duplikat, hentikan drift.
- **Cons**: perlu redirect map biar URL plural lama (mungkin sudah terindeks)
  tidak mati; `villa` hanya cover villa/hotel/resort (accommodations
  `guesthouse` saat ini tidak punya route premium — perlu diberesin saat konsolidasi).
- **Effort**: **Medium** (perlu hati-hati di redirect + edge case `villa` filter).

**OPSI 2 — Biarkan dua-duanya**
- **Pros**: nol effort sekarang.
- **Cons**: dua URL per produk (duplicate content SEO), dua layout untuk
  di-maintain, user dapat pengalaman "lama" dari listing padahal versi premium
  ada. Utang teknis makin dalam tiap kali salah satu diedit.

➡️ **Rekomendasi**: **Opsi 1**, jadikan **singular = canonical**, tapi kerjakan
**setelah** Keputusan 1 (lebih berisiko, butuh redirect planning).

### Keputusan 3 — `/yacht` listing hilang

- Module `yacht` enabled, `YachtCard` nge-link `/yacht/[slug]`, tapi **tidak
  ada `yacht/index.astro`** → URL `/yacht` jatuh ke `[...slug]` → 404 (kecuali
  ada CMS Page slug `yacht`).
- **Rekomendasi**: tambah `yacht/index.astro` mengikuti pola 6 listing lain
  (dan langsung wire ke `ServiceTypes` key `yachts` sesuai Keputusan 1).
  **Effort: Kecil.**

---

## Recommended Action Plan (urut prioritas)

1. **Wire 6 listing header ke `ServiceTypes`** (Keputusan 1) — *impact tinggi,
   effort kecil, risk rendah, wadah CMS sudah ada.* Bikin partial
   `ListingHeader.astro` + fallback hardcoded. **Mulai dari sini.**
2. **Tambah `yacht/index.astro`** (Keputusan 3) — tutup route yang hilang,
   sekalian pakai pola baru dari langkah 1.
3. **Dokumentaslikan reserved slugs + (opsional) validasi di Pages** (C.2) —
   cegah editor bikin CMS Page yang ke-shadow. Cheap insurance.
4. **Konsolidasi template detail singular vs plural** (Keputusan 2) — pilih
   singular sebagai canonical, siapkan redirect map, beresin edge case
   `guesthouse`/`villa`. *Kerjakan setelah 1–3 karena butuh redirect planning.*
5. **(Opsional) Naikkan `/property` jadi CMS Page** kalau layanan property
   benar-benar diluncurkan — saat itu hapus `property.astro`, buat Page CMS.

---

## Implementation Status (update 2026-08-20)

| # | Langkah | Status | Catatan |
|---|---------|--------|---------|
| 1 | Wire 6 listing header ke ServiceTypes | ✅ **DONE** | Baru: `lib/listingHeader.ts` + `components/common/ListingHeader.astro`. 6 index page (`tours`, `accommodations`, `restaurants`, `rentals`, `weddings`, `water-activities`) consume `resolveListingHeader(key, fallback)`. Verified di browser: intro & `<title>` `/water-activities` sekarang datang dari CMS ServiceType (beda dari fallback kode). |
| 2 | Tambah `yacht/index.astro` | ✅ **DONE** | Route `/yacht` yang sebelumnya 404 kini render listing 5 yacht + header CMS-driven. Verified di browser, no console error. |
| 3 | Reserved-slug guard | ✅ **DONE** | Baru: `apps/cms/src/fields/reservedSlugs.ts` (`RESERVED_PAGE_SLUGS` + `validateReservedSlug`), di-wire ke field `slug` collection `Pages`. Bikin Page dgn slug reserved → ditolak dgn pesan jelas. *Trade-off kecil:* karena field `validate` custom, pre-check "unique" bawaan Payload diganti — keunikan tetap dijamin **DB unique index**, tapi pesan error duplikat jadi kurang ramah. |
| 4 | Konsolidasi detail singular vs plural | ✅ **DONE** | Keputusan user: **singular canonical**. Card default `hrefBase` → singular (`/tour`, `/villa`, `/restaurant`, `/rental`, `/venue`, `/water-activity`; yacht sudah singular). 6 file detail plural **dihapus**, diganti **301** di `apps/web/public/_redirects` (`/tours/* → /tour/:splat`, dst). Edge case `guesthouse` diberesin: `/villa/[slug]` sekarang cover **semua** tipe akomodasi (filter villa/hotel/resort dihapus). Verified di dev: listing cards link singular, `/villa/*` render premium (termasuk tipe hotel), no console error. CMS blocks (ServiceGrid/Editorial/HeroImmersive) memang sudah singular — tidak berubah. |
| 5 | `/property` → CMS Page | ⏭️ **SKIPPED (conditional)** | Plan menandai ini *"kalau layanan property benar-benar diluncurkan"* — kondisi bisnis belum terjadi. Tidak dieksekusi. |

### File yang berubah (langkah 4)

**Baru**
- `apps/web/public/_redirects` — 6 baris 301 plural → singular

**Dihapus** (diganti 301)
- `apps/web/src/pages/{tours,accommodations,restaurants,rentals,weddings,water-activities}/[slug].astro`

**Diubah**
- `apps/web/src/components/cards/{Tour,Accommodation,Restaurant,Rental,Venue,WaterActivity}Card.astro` — default `hrefBase` → singular
- `apps/web/src/pages/villa/[slug].astro` — `getStaticPaths` cover semua tipe akomodasi (guesthouse kini punya halaman premium)
- `apps/web/src/components/blocks/ServiceListingEditorial.astro` — update komentar stale soal guesthouse legacy

> **Catatan verifikasi**: `_redirects` hanya aktif di build Cloudflare Pages
> (bukan `astro dev`). Sintaks splat sudah benar; URL plural lama akan 301 ke
> singular di production. Halaman listing (`/tours`, `/accommodations`, dst)
> **tidak** ke-redirect karena pola `/x/*` hanya match segment setelah slash.

### File yang berubah (langkah 1–3)

**Baru**
- `apps/web/src/lib/listingHeader.ts`
- `apps/web/src/components/common/ListingHeader.astro`
- `apps/web/src/pages/yacht/index.astro`
- `apps/cms/src/fields/reservedSlugs.ts`

**Diubah**
- `apps/web/src/pages/{tours,accommodations,restaurants,rentals,weddings,water-activities}/index.astro` — consume `resolveListingHeader` + pakai `ListingHeader`
- `apps/cms/src/collections/Pages.ts` — field `slug` tambah `validate: validateReservedSlug`

### Catatan operasional
- **Regen types** (opsional): setelah `pnpm --filter @dn-journeys/cms generate:types`, tidak ada perubahan schema baru dari langkah ini (ServiceTypes & Pages field sudah ada) — jadi tidak wajib.
- **Reserved-slug guard hanya untuk Page baru/diedit**; Page reserved yang sudah terlanjur ada (kalau ada) tidak otomatis diblok sampai di-save ulang.

---

## Architecture Recommendation (biar tidak ada lagi hardcoded bocor)

**Prinsip: "Data dari CMS, struktur dari kode, copy dari CMS."**

1. **Satu sumber metadata service = `ServiceTypes`.**
   Nav, footer, cards, listing header, dan SEO listing semua tarik dari
   `ServiceTypes` (via `getResolvedServiceTypes` / `getServiceTypeByKey`).
   Jangan pernah tulis judul/intro/SEO listing langsung di `.astro` lagi —
   selalu `serviceType.field ?? hardcodedFallback`.

2. **Satu template per service vertical.**
   Hindari duplikat singular+plural. Pola **yacht** (satu route singular,
   satu template) adalah standar. Kalau butuh redesign, ganti template
   in-place — jangan bikin route kembar.

3. **Konvensi route untuk halaman baru**:
   - **Konten produk/listing** → collection + `[slug]` detail + `index.astro`
     listing yang consume `ServiceTypes`. Bukan file statis penuh markup.
   - **Halaman editorial custom** (About, Contact, Landing, promo) → **CMS
     Page** via `[...slug]` + blocks. Jangan bikin `about.astro` hardcoded.
   - **Utility** (404, coming-soon) → file statis boleh, tapi copy wajib
     retain-with-fallback ke Site Settings (pola `/404` & `/property` sudah benar).

4. **Route-collision guard**: maintain daftar reserved slugs (semua slug listing
   + utility) dan tolak lewat `beforeValidate` hook di collection `Pages`.
   Alternatif jangka panjang: pindahkan listing ke pola dinamis
   `[service]/index.astro` yang resolve dari `ServiceTypes.key` sehingga urutan
   prioritas route eksplisit dan tidak ada file statis yang diam-diam menang.

5. **Definition of Done untuk halaman baru** (checklist):
   - [ ] Tidak ada string copy > 1 kalimat yang hardcoded tanpa fallback CMS.
   - [ ] SEO `title`/`description` punya sumber CMS (Page.seo / ServiceType / item.seo).
   - [ ] Tidak menduplikasi route yang sudah ada untuk data yang sama.
   - [ ] Kalau URL bisa bentrok dgn CMS Page → slug didaftarkan sebagai reserved.

---

## Lampiran — Ringkasan angka

| Metrik | Nilai |
|---|---|
| Total route files | 23 |
| Fully CMS-managed | 2 |
| CMS data + template kode (detail) | 13 |
| Hybrid (listing, header hardcoded) | 6 |
| CMS-hybrid utility | 2 |
| **Fully hardcoded (murni)** | **0** |
| Duplikasi template detail (pasang) | 6 |
| Listing route hilang | 1 (`/yacht`) |
| Collision laten (kelas) | 1 (static vs `[...slug]`) |
